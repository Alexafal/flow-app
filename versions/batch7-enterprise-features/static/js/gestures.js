/**
 * Gesture Navigation System
 * iOS-native feel with swipe, long-press, multi-select gestures
 */

class GestureSystem {
    constructor(app) {
        this.app = app;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.longPressTimer = null;
        this.longPressDelay = 500; // 500ms for long press
        this.swipeThreshold = 50; // Minimum swipe distance
        this.multiSelectMode = false;
        this.selectedItems = new Set();
        this.init();
    }

    init() {
        this.attachGestureListeners();
        this.setupKeyboardShortcuts();
    }

    attachGestureListeners() {
        // Swipe down to close modals
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Long press for quick actions
        document.addEventListener('touchstart', (e) => this.handleLongPressStart(e), { passive: true });
        document.addEventListener('touchend', () => this.handleLongPressEnd(), { passive: true });
        document.addEventListener('touchcancel', () => this.handleLongPressEnd(), { passive: true });

        // Two-finger swipe for multi-select
        document.addEventListener('touchstart', (e) => this.handleMultiTouchStart(e), { passive: true });
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
    }

    handleTouchMove(e) {
        // Cancel long press if moved
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        // Swipe detection
        if (Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold) {
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                // Vertical swipe
                if (deltaY > this.swipeThreshold) {
                    this.handleSwipeDown();
                } else if (deltaY < -this.swipeThreshold) {
                    this.handleSwipeUp();
                }
            } else {
                // Horizontal swipe
                if (deltaX > this.swipeThreshold) {
                    this.handleSwipeRight();
                } else if (deltaX < -this.swipeThreshold) {
                    this.handleSwipeLeft();
                }
            }
        }
    }

    handleSwipeDown() {
        // Close modals
        const modals = document.querySelectorAll('.modal.open, .search-results-sheet.open, .bottom-sheet.open');
        modals.forEach(modal => {
            if (modal.id === 'searchResultsSheet' && window.flowApp.globalSearch) {
                window.flowApp.globalSearch.closeSearch();
            } else {
                modal.classList.remove('open');
            }
        });

        // Close focus mode
        if (window.flowApp.focusMode && window.flowApp.focusMode.isActive) {
            window.flowApp.focusMode.close();
        }

        // Haptic feedback
        this.hapticFeedback('light');
    }

    handleSwipeUp() {
        // Open search or pull to refresh
        if (window.flowApp.globalSearch) {
            window.flowApp.globalSearch.openSearch();
        }
    }

    handleSwipeLeft() {
        // Navigate to next day (calendar)
        if (this.app.currentTab === 'calendar') {
            const nextDay = new Date(this.app.currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            this.app.currentDate = nextDay;
            this.app.renderCalendar();
            this.hapticFeedback('light');
        }
    }

    handleSwipeRight() {
        // Navigate to previous day (calendar)
        if (this.app.currentTab === 'calendar') {
            const prevDay = new Date(this.app.currentDate);
            prevDay.setDate(prevDay.getDate() - 1);
            this.app.currentDate = prevDay;
            this.app.renderCalendar();
            this.hapticFeedback('light');
        }
    }

    handleLongPressStart(e) {
        const target = e.target.closest('.task-item, .habit-card, .calendar-task-item, .calendar-habit-item');
        if (!target) return;

        this.longPressTimer = setTimeout(() => {
            this.showQuickActions(target, e.touches[0].clientX, e.touches[0].clientY);
            this.hapticFeedback('medium');
        }, this.longPressDelay);
    }

    handleLongPressEnd() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    handleMultiTouchStart(e) {
        if (e.touches.length === 2) {
            // Two-finger touch - enter multi-select mode
            this.enterMultiSelectMode();
            this.hapticFeedback('medium');
        }
    }

    showQuickActions(element, x, y) {
        // Remove existing quick actions
        const existing = document.getElementById('quickActionsMenu');
        if (existing) {
            existing.remove();
        }

        const menu = document.createElement('div');
        menu.id = 'quickActionsMenu';
        menu.className = 'quick-actions-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const type = element.classList.contains('task-item') || element.classList.contains('calendar-task-item') ? 'task' : 'habit';
        const id = element.dataset.taskId || element.dataset.habitId;

        let html = '';
        if (type === 'task') {
            html = `
                <button class="quick-action" data-action="edit" data-id="${id}">✏️ Edit</button>
                <button class="quick-action" data-action="priority" data-id="${id}">⭐ Priority</button>
                <button class="quick-action" data-action="duplicate" data-id="${id}">📋 Duplicate</button>
                <button class="quick-action" data-action="delete" data-id="${id}">🗑️ Delete</button>
            `;
        } else {
            html = `
                <button class="quick-action" data-action="edit" data-id="${id}">✏️ Edit</button>
                <button class="quick-action" data-action="complete" data-id="${id}">✓ Complete</button>
                <button class="quick-action" data-action="delete" data-id="${id}">🗑️ Delete</button>
            `;
        }

        menu.innerHTML = html;
        document.body.appendChild(menu);

        // Position menu (keep in viewport)
        const rect = menu.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (y + rect.height > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }

        // Attach handlers
        menu.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickAction(btn.dataset.action, btn.dataset.id, type);
                menu.remove();
            });
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    handleQuickAction(action, id, type) {
        if (type === 'task') {
            switch (action) {
                case 'edit':
                    this.app.openTaskEditor(parseInt(id));
                    break;
                case 'priority':
                    // Toggle priority
                    break;
                case 'duplicate':
                    // Duplicate task
                    break;
                case 'delete':
                    this.app.handleDeleteTask(parseInt(id));
                    break;
            }
        } else {
            switch (action) {
                case 'edit':
                    this.app.openEditHabitModal(parseInt(id));
                    break;
                case 'complete':
                    this.app.handleToggleHabit(parseInt(id));
                    break;
                case 'delete':
                    // Delete habit
                    break;
            }
        }
    }

    enterMultiSelectMode() {
        this.multiSelectMode = true;
        this.selectedItems.clear();
        document.body.classList.add('multi-select-mode');

        // Show toolbar
        this.showMultiSelectToolbar();

        // Add selection handlers
        document.querySelectorAll('.task-item, .habit-card').forEach(item => {
            item.addEventListener('click', this.handleMultiSelectClick.bind(this));
        });
    }

    exitMultiSelectMode() {
        this.multiSelectMode = false;
        this.selectedItems.clear();
        document.body.classList.remove('multi-select-mode');

        // Hide toolbar
        const toolbar = document.getElementById('multiSelectToolbar');
        if (toolbar) {
            toolbar.remove();
        }

        // Remove selection classes
        document.querySelectorAll('.selected').forEach(item => {
            item.classList.remove('selected');
        });
    }

    handleMultiSelectClick(e) {
        if (!this.multiSelectMode) return;

        const item = e.currentTarget;
        const id = item.dataset.taskId || item.dataset.habitId;

        if (this.selectedItems.has(id)) {
            this.selectedItems.delete(id);
            item.classList.remove('selected');
        } else {
            this.selectedItems.add(id);
            item.classList.add('selected');
        }

        this.updateMultiSelectToolbar();
        this.hapticFeedback('light');
    }

    showMultiSelectToolbar() {
        if (document.getElementById('multiSelectToolbar')) return;

        const toolbar = document.createElement('div');
        toolbar.id = 'multiSelectToolbar';
        toolbar.className = 'multi-select-toolbar';
        toolbar.innerHTML = `
            <div class="multi-select-count" id="multiSelectCount">0 selected</div>
            <button class="multi-select-btn" id="multiSelectComplete">Complete</button>
            <button class="multi-select-btn" id="multiSelectDelete">Delete</button>
            <button class="multi-select-btn" id="multiSelectCancel">Cancel</button>
        `;
        document.body.appendChild(toolbar);

        toolbar.querySelector('#multiSelectComplete').addEventListener('click', () => {
            this.handleBulkComplete();
        });

        toolbar.querySelector('#multiSelectDelete').addEventListener('click', () => {
            this.handleBulkDelete();
        });

        toolbar.querySelector('#multiSelectCancel').addEventListener('click', () => {
            this.exitMultiSelectMode();
        });
    }

    updateMultiSelectToolbar() {
        const count = document.getElementById('multiSelectCount');
        if (count) {
            count.textContent = `${this.selectedItems.size} selected`;
        }
    }

    async handleBulkComplete() {
        // Complete all selected items
        for (const id of this.selectedItems) {
            // Find and complete task/habit
        }
        this.exitMultiSelectMode();
        utils.showToast(`${this.selectedItems.size} items completed`);
    }

    async handleBulkDelete() {
        if (confirm(`Delete ${this.selectedItems.size} items?`)) {
            // Delete all selected items
            this.exitMultiSelectMode();
            utils.showToast(`${this.selectedItems.size} items deleted`);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to exit multi-select
            if (e.key === 'Escape' && this.multiSelectMode) {
                this.exitMultiSelectMode();
            }
        });
    }

    hapticFeedback(type = 'light') {
        if (!navigator.vibrate) return;

        const patterns = {
            light: 10,
            medium: 20,
            heavy: [50, 30, 50]
        };

        navigator.vibrate(patterns[type] || patterns.light);
    }
}

window.GestureSystem = GestureSystem;

