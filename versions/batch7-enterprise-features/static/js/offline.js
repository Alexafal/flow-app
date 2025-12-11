/**
 * Offline-First Architecture
 * Local caching and background sync
 */

class OfflineSystem {
    constructor(app) {
        this.app = app;
        this.isOnline = navigator.onLine;
        this.pendingActions = [];
        this.syncInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCachedData();
        this.startSyncInterval();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingActions();
            utils.showToast('Back online - syncing...');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            utils.showToast('Offline mode - changes saved locally');
        });
    }

    loadCachedData() {
        // Load tasks from cache
        const cachedTasks = localStorage.getItem('cached_tasks');
        if (cachedTasks) {
            try {
                this.app.tasks = JSON.parse(cachedTasks);
            } catch (e) {
                console.error('Failed to load cached tasks:', e);
            }
        }

        // Load habits from cache
        const cachedHabits = localStorage.getItem('cached_habits');
        if (cachedHabits) {
            try {
                this.app.habits = JSON.parse(cachedHabits);
            } catch (e) {
                console.error('Failed to load cached habits:', e);
            }
        }
    }

    cacheData() {
        // Cache tasks
        localStorage.setItem('cached_tasks', JSON.stringify(this.app.tasks));
        localStorage.setItem('cached_tasks_timestamp', Date.now().toString());

        // Cache habits
        localStorage.setItem('cached_habits', JSON.stringify(this.app.habits));
        localStorage.setItem('cached_habits_timestamp', Date.now().toString());
    }

    async syncPendingActions() {
        if (!this.isOnline || this.pendingActions.length === 0) return;

        const actions = [...this.pendingActions];
        this.pendingActions = [];

        for (const action of actions) {
            try {
                await this.executeAction(action);
            } catch (error) {
                console.error('Sync failed for action:', action, error);
                // Re-add to pending if failed
                this.pendingActions.push(action);
            }
        }

        // Reload data after sync
        await this.app.loadData();
        this.cacheData();
    }

    async executeAction(action) {
        switch (action.type) {
            case 'create_task':
                return await this.app.api.createTask(action.data);
            case 'update_task':
                return await this.app.api.updateTask(action.id, action.data);
            case 'delete_task':
                return await this.app.api.deleteTask(action.id);
            case 'create_habit':
                return await this.app.api.createHabit(action.data);
            case 'update_habit':
                return await this.app.api.updateHabit(action.id, action.data);
            case 'delete_habit':
                return await this.app.api.deleteHabit(action.id);
            case 'complete_task':
                return await this.app.api.updateTask(action.id, { completed: true });
            case 'complete_habit':
                return await this.app.api.completeHabit(action.id, action.date);
        }
    }

    queueAction(action) {
        this.pendingActions.push({
            ...action,
            timestamp: Date.now()
        });

        // Execute immediately if online
        if (this.isOnline) {
            this.syncPendingActions();
        } else {
            // Cache locally
            this.cacheData();
        }
    }

    startSyncInterval() {
        // Sync every 30 seconds if online
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.syncPendingActions();
            }
        }, 30000);
    }

    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            pendingActions: this.pendingActions.length,
            lastSync: localStorage.getItem('last_sync') || 'Never'
        };
    }
}

window.OfflineSystem = OfflineSystem;

