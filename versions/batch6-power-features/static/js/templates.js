/**
 * Templates System
 * Reusable task sets for recurring activities
 */

class Templates {
    constructor(app) {
        this.app = app;
        this.templates = this.loadTemplates();
        this.init();
    }

    init() {
        this.createDefaultTemplates();
    }

    loadTemplates() {
        const saved = localStorage.getItem('taskTemplates');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    saveTemplates() {
        localStorage.setItem('taskTemplates', JSON.stringify(this.templates));
    }

    createDefaultTemplates() {
        if (this.templates.length > 0) return;

        this.templates = [
            {
                id: 'morning-routine',
                name: 'Morning Routine',
                category: 'health',
                tasks: [
                    { title: 'Drink water', duration: 5 },
                    { title: 'Morning meditation', duration: 10 },
                    { title: 'Exercise', duration: 30 },
                    { title: 'Healthy breakfast', duration: 15 }
                ]
            },
            {
                id: 'gym-day',
                name: 'Gym Day',
                category: 'fitness',
                tasks: [
                    { title: 'Pack gym bag', duration: 5 },
                    { title: 'Warm-up', duration: 10 },
                    { title: 'Workout', duration: 60 },
                    { title: 'Post-workout meal', duration: 20 }
                ]
            },
            {
                id: 'study-session',
                name: 'Study Session',
                category: 'learning',
                tasks: [
                    { title: 'Review notes', duration: 15 },
                    { title: 'Read chapter', duration: 45 },
                    { title: 'Practice problems', duration: 30 },
                    { title: 'Summarize key points', duration: 15 }
                ]
            },
            {
                id: 'cleaning-checklist',
                name: 'Cleaning Checklist',
                category: 'home',
                tasks: [
                    { title: 'Vacuum floors', duration: 20 },
                    { title: 'Clean bathroom', duration: 30 },
                    { title: 'Do laundry', duration: 15 },
                    { title: 'Take out trash', duration: 5 }
                ]
            },
            {
                id: 'travel-prep',
                name: 'Travel Prep',
                category: 'travel',
                tasks: [
                    { title: 'Pack suitcase', duration: 30 },
                    { title: 'Check flight status', duration: 5 },
                    { title: 'Print tickets', duration: 5 },
                    { title: 'Set out-of-office', duration: 10 }
                ]
            }
        ];

        this.saveTemplates();
    }

    createTemplate(name, category, tasks) {
        const template = {
            id: `template-${Date.now()}`,
            name,
            category,
            tasks,
            created_at: new Date().toISOString()
        };
        this.templates.push(template);
        this.saveTemplates();
        return template;
    }

    deleteTemplate(id) {
        this.templates = this.templates.filter(t => t.id !== id);
        this.saveTemplates();
    }

    async applyTemplate(templateId, date = null) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        const targetDate = date || new Date().toISOString().split('T')[0];

        for (const taskData of template.tasks) {
            await this.app.api.createTask({
                title: taskData.title,
                due_date: targetDate,
                time_estimate: taskData.duration,
                tags: [template.category]
            });
        }

        await this.app.loadData();
        this.app.renderTasks();
        utils.showToast(`${template.name} applied!`);
    }

    renderTemplates(container) {
        if (!container) return;

        const categories = [...new Set(this.templates.map(t => t.category))];
        let html = '';

        categories.forEach(category => {
            const categoryTemplates = this.templates.filter(t => t.category === category);
            
            html += `
                <div class="template-category">
                    <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div class="template-grid">
            `;

            categoryTemplates.forEach(template => {
                html += `
                    <div class="template-card" data-template-id="${template.id}">
                        <h5>${template.name}</h5>
                        <p class="template-task-count">${template.tasks.length} tasks</p>
                        <button class="apply-template-btn" data-template="${template.id}">
                            Apply Template
                        </button>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;

        // Attach handlers
        container.querySelectorAll('.apply-template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.template;
                this.applyTemplate(templateId);
            });
        });
    }
}

window.Templates = Templates;

