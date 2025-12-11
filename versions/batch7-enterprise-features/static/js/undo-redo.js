/**
 * Undo/Redo System
 * Snackbar notifications with undo functionality
 */

class UndoRedoSystem {
    constructor(app) {
        this.app = app;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.undoTimeout = 5000; // 5 seconds
        this.currentUndo = null;
        this.init();
    }

    init() {
        this.createSnackbar();
    }

    createSnackbar() {
        if (document.getElementById('undoSnackbar')) return;

        const snackbar = document.createElement('div');
        snackbar.id = 'undoSnackbar';
        snackbar.className = 'undo-snackbar';
        snackbar.style.display = 'none';
        snackbar.innerHTML = `
            <span class="undo-message" id="undoMessage"></span>
            <button class="undo-btn" id="undoActionBtn">Undo</button>
        `;
        document.body.appendChild(snackbar);

        document.getElementById('undoActionBtn').addEventListener('click', () => {
            this.performUndo();
        });
    }

    addAction(action) {
        // Remove any future actions if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add new action
        this.history.push({
            ...action,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        // Show undo snackbar
        this.showUndo(action);
    }

    showUndo(action) {
        const snackbar = document.getElementById('undoSnackbar');
        const message = document.getElementById('undoMessage');
        
        if (!snackbar || !message) return;

        // Set message
        let messageText = '';
        switch (action.type) {
            case 'delete_task':
                messageText = 'Task deleted';
                break;
            case 'complete_task':
                messageText = 'Task completed';
                break;
            case 'delete_habit':
                messageText = 'Habit deleted';
                break;
            case 'move_task':
                messageText = 'Task moved';
                break;
            case 'bulk_delete':
                messageText = `${action.count} items deleted`;
                break;
            default:
                messageText = 'Action completed';
        }

        message.textContent = messageText;
        this.currentUndo = action;

        // Show snackbar
        snackbar.style.display = 'flex';
        snackbar.classList.remove('hide');

        // Auto-hide after timeout
        clearTimeout(this.undoTimeoutId);
        this.undoTimeoutId = setTimeout(() => {
            this.hideUndo();
        }, this.undoTimeout);
    }

    hideUndo() {
        const snackbar = document.getElementById('undoSnackbar');
        if (snackbar) {
            snackbar.classList.add('hide');
            setTimeout(() => {
                snackbar.style.display = 'none';
                snackbar.classList.remove('hide');
                this.currentUndo = null;
            }, 300);
        }
    }

    async performUndo() {
        if (!this.currentUndo) return;

        const action = this.currentUndo;
        this.hideUndo();

        try {
            switch (action.type) {
                case 'delete_task':
                    await this.app.api.createTask(action.data);
                    await this.app.loadData();
                    this.app.renderTasks();
                    utils.showToast('Task restored');
                    break;

                case 'complete_task':
                    await this.app.api.updateTask(action.data.id, { completed: false });
                    await this.app.loadData();
                    this.app.renderTasks();
                    utils.showToast('Task uncompleted');
                    break;

                case 'delete_habit':
                    await this.app.api.createHabit(action.data);
                    await this.app.loadData();
                    this.app.renderHabits();
                    utils.showToast('Habit restored');
                    break;

                case 'move_task':
                    await this.app.api.updateTask(action.data.id, { due_date: action.oldDate });
                    await this.app.loadData();
                    this.app.renderCalendar();
                    utils.showToast('Task moved back');
                    break;

                case 'bulk_delete':
                    // Restore all deleted items
                    for (const item of action.items) {
                        if (item.type === 'task') {
                            await this.app.api.createTask(item.data);
                        } else if (item.type === 'habit') {
                            await this.app.api.createHabit(item.data);
                        }
                    }
                    await this.app.loadData();
                    this.app.renderTasks();
                    this.app.renderHabits();
                    utils.showToast(`${action.count} items restored`);
                    break;
            }

            // Remove from history
            if (this.historyIndex >= 0) {
                this.history.splice(this.historyIndex, 1);
                this.historyIndex--;
            }

        } catch (error) {
            console.error('Undo failed:', error);
            utils.showToast('Could not undo action', 'error');
        }
    }

    canUndo() {
        return this.historyIndex >= 0 && this.history.length > 0;
    }

    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }
}

window.UndoRedoSystem = UndoRedoSystem;

