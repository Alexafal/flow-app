/**
 * Dashboard Widgets System
 * Configurable widgets for personalized dashboard
 */

class DashboardWidgets {
    constructor(app) {
        this.app = app;
        this.widgets = this.loadWidgets();
        this.init();
    }

    init() {
        this.createDefaultWidgets();
        this.renderWidgets();
    }

    loadWidgets() {
        const saved = localStorage.getItem('dashboard_widgets');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    saveWidgets() {
        localStorage.setItem('dashboard_widgets', JSON.stringify(this.widgets));
    }

    createDefaultWidgets() {
        if (this.widgets.length > 0) return;

        this.widgets = [
            { id: 'tasks', type: 'tasks', enabled: true, order: 1 },
            { id: 'habits', type: 'habits', enabled: true, order: 2 },
            { id: 'upcoming', type: 'upcoming', enabled: true, order: 3 },
            { id: 'weather', type: 'weather', enabled: false, order: 4 },
            { id: 'mood', type: 'mood', enabled: true, order: 5 },
            { id: 'stats', type: 'stats', enabled: false, order: 6 }
        ];

        this.saveWidgets();
    }

    renderWidgets() {
        const container = document.getElementById('dashboardWidgets');
        if (!container) return;

        const enabledWidgets = this.widgets
            .filter(w => w.enabled)
            .sort((a, b) => a.order - b.order);

        let html = '<div class="widgets-grid">';

        enabledWidgets.forEach(widget => {
            html += this.renderWidget(widget);
        });

        html += '</div>';
        container.innerHTML = html;

        // Attach swipe handlers for mobile
        this.setupSwipeHandlers();
    }

    renderWidget(widget) {
        switch (widget.type) {
            case 'tasks':
                return this.renderTasksWidget();
            case 'habits':
                return this.renderHabitsWidget();
            case 'upcoming':
                return this.renderUpcomingWidget();
            case 'weather':
                return this.renderWeatherWidget();
            case 'mood':
                return this.renderMoodWidget();
            case 'stats':
                return this.renderStatsWidget();
            default:
                return '';
        }
    }

    renderTasksWidget() {
        const tasks = this.app.tasks || [];
        const incomplete = tasks.filter(t => !t.completed).slice(0, 5);
        const completed = tasks.filter(t => t.completed).length;

        return `
            <div class="widget widget-tasks">
                <div class="widget-header">
                    <h3>Tasks</h3>
                    <span class="widget-badge">${incomplete.length}</span>
                </div>
                <div class="widget-content">
                    ${incomplete.length > 0 ? `
                        <ul class="widget-task-list">
                            ${incomplete.map(task => `
                                <li>
                                    <input type="checkbox" data-task-id="${task.id}">
                                    <span>${task.title}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="widget-empty">No tasks</p>'}
                    ${completed > 0 ? `<p class="widget-footer">${completed} completed</p>` : ''}
                </div>
            </div>
        `;
    }

    renderHabitsWidget() {
        const habits = this.app.habits || [];
        const activeHabits = habits.filter(h => !h.archived).slice(0, 5);

        return `
            <div class="widget widget-habits">
                <div class="widget-header">
                    <h3>Habits</h3>
                    <span class="widget-badge">${activeHabits.length}</span>
                </div>
                <div class="widget-content">
                    ${activeHabits.length > 0 ? `
                        <div class="widget-habit-grid">
                            ${activeHabits.map(habit => `
                                <div class="widget-habit-item" data-habit-id="${habit.id}">
                                    <div class="widget-habit-icon">${habit.icon || '🔥'}</div>
                                    <div class="widget-habit-name">${habit.name}</div>
                                    <div class="widget-habit-streak">${habit.streak || 0} 🔥</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="widget-empty">No habits</p>'}
                </div>
            </div>
        `;
    }

    renderUpcomingWidget() {
        const tasks = this.app.tasks || [];
        const today = new Date().toISOString().split('T')[0];
        const upcoming = tasks
            .filter(t => t.due_date && t.due_date >= today && !t.completed)
            .sort((a, b) => a.due_date.localeCompare(b.due_date))
            .slice(0, 5);

        return `
            <div class="widget widget-upcoming">
                <div class="widget-header">
                    <h3>Upcoming</h3>
                </div>
                <div class="widget-content">
                    ${upcoming.length > 0 ? `
                        <ul class="widget-upcoming-list">
                            ${upcoming.map(task => `
                                <li>
                                    <span class="widget-date">${this.formatDate(task.due_date)}</span>
                                    <span class="widget-title">${task.title}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="widget-empty">Nothing upcoming</p>'}
                </div>
            </div>
        `;
    }

    renderWeatherWidget() {
        // Weather widget (requires API key)
        return `
            <div class="widget widget-weather">
                <div class="widget-header">
                    <h3>Weather</h3>
                </div>
                <div class="widget-content">
                    <p class="widget-empty">Weather widget requires API key</p>
                </div>
            </div>
        `;
    }

    renderMoodWidget() {
        return `
            <div class="widget widget-mood">
                <div class="widget-header">
                    <h3>How are you?</h3>
                </div>
                <div class="widget-content">
                    <div class="widget-mood-options">
                        <button class="mood-btn" data-mood="1">😢</button>
                        <button class="mood-btn" data-mood="2">😐</button>
                        <button class="mood-btn" data-mood="3">🙂</button>
                        <button class="mood-btn" data-mood="4">😊</button>
                        <button class="mood-btn" data-mood="5">😄</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderStatsWidget() {
        const tasks = this.app.tasks || [];
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
            <div class="widget widget-stats">
                <div class="widget-header">
                    <h3>Stats</h3>
                </div>
                <div class="widget-content">
                    <div class="widget-stat-item">
                        <div class="widget-stat-value">${completionRate}%</div>
                        <div class="widget-stat-label">Completion Rate</div>
                    </div>
                    <div class="widget-stat-item">
                        <div class="widget-stat-value">${completed}</div>
                        <div class="widget-stat-label">Completed</div>
                    </div>
                </div>
            </div>
        `;
    }

    setupSwipeHandlers() {
        // Swipeable panels for mobile
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach(widget => {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            widget.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            });

            widget.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                widget.style.transform = `translateX(${diff}px)`;
            });

            widget.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                widget.style.transform = '';
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateString === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateString === tomorrow.toISOString().split('T')[0]) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    toggleWidget(widgetId) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (widget) {
            widget.enabled = !widget.enabled;
            this.saveWidgets();
            this.renderWidgets();
        }
    }

    reorderWidget(widgetId, newOrder) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (widget) {
            widget.order = newOrder;
            this.saveWidgets();
            this.renderWidgets();
        }
    }
}

window.DashboardWidgets = DashboardWidgets;






