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

    /**
     * Smart duration estimation based on task title
     * Returns duration in minutes
     */
    estimateDuration(taskTitle) {
        const title = taskTitle.toLowerCase();
        
        // Quick tasks (1-5 minutes)
        if (title.match(/\b(drink|eat|call|text|email|reply|check|review|print|pack|grab|pick|drop)\b/)) {
            return 5;
        }
        
        // Short tasks (5-15 minutes)
        if (title.match(/\b(warm-up|stretch|shower|breakfast|lunch|dinner|snack|coffee|tea|meditation|breathing|journal|quick|brief|short)\b/)) {
            return 10;
        }
        
        // Medium tasks (15-30 minutes)
        if (title.match(/\b(clean|organize|tidy|sort|arrange|plan|prepare|cook|meal|exercise|walk|run|bike|read|study|review|practice|work|meeting|call|call|discuss)\b/)) {
            return 25;
        }
        
        // Long tasks (30-60 minutes)
        if (title.match(/\b(workout|gym|session|class|lesson|deep|thorough|complete|finish|project|assignment|essay|paper|presentation|workshop|seminar)\b/)) {
            return 45;
        }
        
        // Very long tasks (60+ minutes)
        if (title.match(/\b(marathon|extended|full|comprehensive|all-day|intensive|deep-dive|research|analysis)\b/)) {
            return 90;
        }
        
        // Default based on word count (more words = longer task)
        const wordCount = taskTitle.split(/\s+/).length;
        if (wordCount <= 2) return 10;
        if (wordCount <= 4) return 25;
        if (wordCount <= 6) return 45;
        return 60;
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
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }

        const targetDate = date || new Date().toISOString().split('T')[0];

        try {
            // Use the api module directly
            const apiClient = window.api;
            if (!apiClient) {
                console.error('API client not available');
                if (window.utils) {
                    window.utils.showToast('API not available', 'error');
                }
                return;
            }

            for (const taskData of template.tasks) {
                // Use provided duration or estimate smartly
                const duration = taskData.duration || this.estimateDuration(taskData.title);
                
                // Create task with category tag and duration
                const task = await apiClient.createTask({
                    title: taskData.title,
                    due_date: targetDate,
                    time_estimate: duration,
                    category: template.category, // Set category property
                    tags: [template.category] // Also add as tag for filtering
                });
                
                // Add to app's tasks array
                if (this.app && this.app.tasks) {
                    this.app.tasks.push(task);
                }
            }

            // Reload and re-render
            if (this.app) {
                await this.app.loadData();
                this.app.renderTasks();
            }

            // Show enhanced notification with task count
            const taskCount = template.tasks.length;
            
            // Show notification - try multiple methods
            const message = `✅ "${template.name}" applied! ${taskCount} task${taskCount !== 1 ? 's' : ''} created.`;
            
            // Method 1: Use utils.showToast if available
            if (typeof utils !== 'undefined' && utils.showToast) {
                utils.showToast(message, 'success');
            }
            // Method 2: Use window.utils.showToast
            else if (window.utils && window.utils.showToast) {
                window.utils.showToast(message, 'success');
            }
            // Method 3: Create custom notification element
            else {
                // Remove any existing notifications
                const existing = document.querySelector('.template-notification');
                if (existing) existing.remove();
                
                const notification = document.createElement('div');
                notification.className = 'template-notification toast success';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    padding: 1rem 1.5rem;
                    background: #10b981;
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-weight: 500;
                    animation: slideInRight 0.3s ease;
                `;
                notification.textContent = message;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOutRight 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }, 4000);
            }

            // Close templates modal
            const templatesModal = document.getElementById('templatesModal');
            if (templatesModal) {
                templatesModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error applying template:', error);
            if (window.utils) {
                window.utils.showToast('Error applying template', 'error');
            }
        }
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

