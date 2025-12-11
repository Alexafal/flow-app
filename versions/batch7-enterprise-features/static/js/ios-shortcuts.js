/**
 * iOS Shortcuts / Quick Actions
 * Home screen long-press shortcuts
 */

class IOSShortcuts {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.setupShortcuts();
        this.registerServiceWorkerActions();
    }

    setupShortcuts() {
        // This would work with iOS Shortcuts app
        // For web, we'll use URL parameters and service worker

        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.enablePWAFeatures();
        }
    }

    enablePWAFeatures() {
        // Add quick action buttons in header
        this.addQuickActionButtons();
    }

    addQuickActionButtons() {
        const header = document.querySelector('.header-content');
        if (!header || document.getElementById('quickActions')) return;

        const quickActions = document.createElement('div');
        quickActions.id = 'quickActions';
        quickActions.className = 'quick-actions';
        quickActions.innerHTML = `
            <button class="quick-action-btn" data-action="add-task" title="Add Task">
                <span class="icon icon-sm">➕</span>
            </button>
            <button class="quick-action-btn" data-action="add-habit" title="Add Habit">
                <span class="icon icon-sm">🔥</span>
            </button>
            <button class="quick-action-btn" data-action="focus-mode" title="Focus Mode">
                <span class="icon icon-sm">⏱️</span>
            </button>
        `;

        header.appendChild(quickActions);

        // Attach handlers
        quickActions.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickAction(btn.dataset.action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-task':
                // Focus task input
                const taskInput = document.querySelector('.task-input');
                if (taskInput) {
                    taskInput.focus();
                } else {
                    this.app.switchTab('today');
                    setTimeout(() => {
                        document.querySelector('.task-input')?.focus();
                    }, 300);
                }
                break;

            case 'add-habit':
                // Open add habit modal
                this.app.showAddHabitModal();
                break;

            case 'focus-mode':
                // Open focus mode
                if (window.flowApp.focusMode) {
                    window.flowApp.focusMode.open();
                }
                break;
        }

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    registerServiceWorkerActions() {
        // Register actions with service worker for background execution
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                // Actions would be registered here
                // This is a placeholder for future implementation
            });
        }
    }

    // Handle URL parameters for deep linking
    handleURLParams() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');

        if (action) {
            this.handleQuickAction(action);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

window.IOSShortcuts = IOSShortcuts;

