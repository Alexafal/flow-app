/**
 * Folders System
 * Hierarchical organization for tasks
 */

class Folders {
    constructor(app) {
        this.app = app;
        this.projects = this.loadProjects();
        this.init();
    }

    init() {
        this.createDefaultProjects();
    }

    loadProjects() {
        const saved = localStorage.getItem('projects');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    createDefaultProjects() {
        if (this.projects.length > 0) return;

        this.projects = [
            {
                id: 'school-work',
                name: 'School Work',
                color: '#A9C6FF',
                icon: '📚',
                parent: null
            },
            {
                id: 'personal-projects',
                name: 'Personal Projects',
                color: '#CFF5DC',
                icon: '💡',
                parent: null
            },
            {
                id: 'life-admin',
                name: 'Life Admin',
                color: '#FFF3D6',
                icon: '📋',
                parent: null
            },
            {
                id: 'fitness-plan',
                name: 'Fitness Plan',
                color: '#FFB8C6',
                icon: '💪',
                parent: null
            }
        ];

        this.saveProjects();
    }

    createProject(name, color, icon, parentId = null) {
        const project = {
            id: `project-${Date.now()}`,
            name,
            color: color || '#A9C6FF',
            icon: icon || '📁',
            parent: parentId,
            created_at: new Date().toISOString()
        };
        this.projects.push(project);
        this.saveProjects();
        return project;
    }

    deleteProject(id) {
        // Also delete child projects
        const children = this.projects.filter(p => p.parent === id);
        children.forEach(child => this.deleteProject(child.id));
        
        this.projects = this.projects.filter(p => p.id !== id);
        this.saveProjects();
    }

    getProject(id) {
        return this.projects.find(p => p.id === id);
    }

    getChildren(parentId) {
        return this.projects.filter(p => p.parent === parentId);
    }

    getRootProjects() {
        return this.projects.filter(p => !p.parent);
    }

    async assignTaskToProject(taskId, projectId) {
        const task = this.app.tasks.find(t => t.id === taskId);
        if (task && window.api) {
            task.folder_id = projectId;
            try {
                await window.api.updateTask(taskId, { folder_id: projectId });
                if (window.utils) {
                    window.utils.showToast(`Task moved to folder`, 'success');
                }
            } catch (error) {
                console.error('Error assigning task to folder:', error);
            }
        }
    }

    renderProjects(container) {
        if (!container) return;

        const rootProjects = this.getRootProjects();
        let html = '<div class="projects-list">';

        rootProjects.forEach(project => {
            html += this.renderProject(project, 0);
        });

        html += '</div>';
        container.innerHTML = html;

        // Attach handlers
        container.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', () => {
                const projectId = item.dataset.projectId;
                this.openProject(projectId);
            });
        });
    }

    renderProject(project, depth) {
        const children = this.getChildren(project.id);
        const taskCount = this.app.tasks.filter(t => t.folder_id === project.id).length;
        const indent = depth * 20;

        let html = `
            <div class="project-item" data-project-id="${project.id}" style="padding-left: ${indent}px">
                <div class="project-icon" style="background: ${project.color}20; color: ${project.color}">
                    ${project.icon}
                </div>
                <div class="project-info">
                    <div class="project-name">${project.name}</div>
                    <div class="project-meta">${taskCount} tasks</div>
                </div>
            </div>
        `;

        children.forEach(child => {
            html += this.renderProject(child, depth + 1);
        });

        return html;
    }

    openProject(projectId) {
        const project = this.getProject(projectId);
        if (!project) {
            console.error('Project not found:', projectId);
            return;
        }

        // Store the active folder filter
        if (this.app) {
            this.app.activeFolderFilter = projectId;
            
            // Show clear filter button
            const clearBtn = document.getElementById('clearFolderFilterBtn');
            if (clearBtn) {
                clearBtn.style.display = 'block';
                clearBtn.textContent = `Clear "${project.name}" Filter`;
            }
            
            // Close folders modal
            const foldersModal = document.getElementById('foldersModal');
            if (foldersModal) {
                foldersModal.style.display = 'none';
            }
            
            // Switch to All Tasks tab to show filtered results
            if (this.app.switchTab) {
                this.app.switchTab('alltasks');
            }
            
            // Re-render All Tasks with folder filter
            setTimeout(() => {
                if (this.app.renderAllTasks) {
                    this.app.renderAllTasks();
                }
            }, 100);

            // Show notification
            if (window.utils) {
                const taskCount = this.app.tasks.filter(t => t.folder_id === projectId).length;
                window.utils.showToast(`📁 Showing "${project.name}" folder (${taskCount} tasks)`, 'success');
            }
        }
    }
}

// Keep Projects alias for backward compatibility
window.Projects = Folders;
window.Folders = Folders;

