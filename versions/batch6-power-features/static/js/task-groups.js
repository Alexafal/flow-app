/**
 * Task Groups/Sections System
 * Notion-style task grouping with collapsible sections
 */

class TaskGroups {
    constructor(app) {
        this.app = app;
        this.sections = [
            { id: 'morning', name: 'Morning', color: '#FFF3D6', collapsed: false },
            { id: 'afternoon', name: 'Afternoon', color: '#A9C6FF', collapsed: false },
            { id: 'night', name: 'Night', color: '#CFF5DC', collapsed: false }
        ];
        this.customSections = JSON.parse(localStorage.getItem('customSections') || '[]');
        this.init();
    }

    init() {
        this.loadSections();
    }

    loadSections() {
        const saved = localStorage.getItem('taskSections');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.sections = parsed.sections || this.sections;
            this.customSections = parsed.custom || this.customSections;
        }
    }

    saveSections() {
        localStorage.setItem('taskSections', JSON.stringify({
            sections: this.sections,
            custom: this.customSections
        }));
    }

    getAllSections() {
        return [...this.sections, ...this.customSections];
    }

    getSection(id) {
        return this.getAllSections().find(s => s.id === id);
    }

    createSection(name, color) {
        const section = {
            id: `custom-${Date.now()}`,
            name,
            color,
            collapsed: false
        };
        this.customSections.push(section);
        this.saveSections();
        return section;
    }

    deleteSection(id) {
        this.customSections = this.customSections.filter(s => s.id !== id);
        this.saveSections();
    }

    toggleSection(id) {
        const section = this.getSection(id);
        if (section) {
            section.collapsed = !section.collapsed;
            this.saveSections();
        }
    }

    assignTaskToSection(taskId, sectionId) {
        const task = this.app.tasks.find(t => t.id === taskId);
        if (task) {
            task.section = sectionId;
            this.app.api.updateTask(taskId, { section: sectionId });
        }
    }

    renderSections(container, tasks) {
        if (!container) return;

        const allSections = this.getAllSections();
        let html = '';

        allSections.forEach(section => {
            const sectionTasks = tasks.filter(t => t.section === section.id);
            const completedCount = sectionTasks.filter(t => t.completed).length;
            const totalCount = sectionTasks.length;

            html += `
                <div class="task-section" data-section-id="${section.id}">
                    <div class="section-header" data-section-toggle="${section.id}">
                        <h3>
                            <span class="section-color" style="background: ${section.color}"></span>
                            ${section.name}
                            <span class="section-count">${totalCount} tasks</span>
                        </h3>
                        <button class="section-toggle ${section.collapsed ? 'collapsed' : ''}" data-section="${section.id}">
                            ▼
                        </button>
                    </div>
                    <div class="section-content ${section.collapsed ? 'collapsed' : ''}">
                        ${this.renderSectionTasks(sectionTasks)}
                    </div>
                </div>
            `;
        });

        // Unassigned tasks
        const unassigned = tasks.filter(t => !t.section);
        if (unassigned.length > 0) {
            html += `
                <div class="task-section" data-section-id="unassigned">
                    <div class="section-header">
                        <h3>
                            <span class="section-color" style="background: #E4E4E6"></span>
                            Unassigned
                            <span class="section-count">${unassigned.length} tasks</span>
                        </h3>
                    </div>
                    <div class="section-content">
                        ${this.renderSectionTasks(unassigned)}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Attach event listeners
        container.querySelectorAll('[data-section-toggle]').forEach(header => {
            header.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.sectionToggle;
                this.toggleSection(sectionId);
                this.renderSections(container, tasks);
            });
        });
    }

    renderSectionTasks(tasks) {
        if (tasks.length === 0) {
            return '<div class="empty-section">No tasks in this section</div>';
        }

        // This would integrate with existing task rendering
        // For now, return placeholder
        return tasks.map(task => `
            <div class="task-item" data-task-id="${task.id}" data-section="${task.section}">
                <!-- Task content rendered by main.js -->
            </div>
        `).join('');
    }
}

window.TaskGroups = TaskGroups;

