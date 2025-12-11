/**
 * Enhanced Offline Mode & Sync Queue
 * Handles offline operations and syncs when connection resumes
 */

class EnhancedOffline {
    constructor(app) {
        this.app = app;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.loadSyncQueue();
        this.setupOnlineOfflineListeners();
        this.startSyncCheck();
    }

    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectionRestored();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectionLost();
        });
    }

    onConnectionLost() {
        if (window.utils) {
            window.utils.showToast('You\'re offline. Changes will sync when connection is restored.', 'warning');
        }
    }

    async onConnectionRestored() {
        if (window.utils) {
            window.utils.showToast('Connection restored. Syncing changes...', 'success');
        }
        
        await this.processSyncQueue();
    }

    // Add operation to sync queue
    queueOperation(operation) {
        const queueItem = {
            id: `sync-${Date.now()}-${Math.random()}`,
            operation: operation.type,
            data: operation.data,
            timestamp: new Date().toISOString(),
            retries: 0
        };

        this.syncQueue.push(queueItem);
        this.saveSyncQueue();

        if (this.isOnline) {
            // Try to sync immediately
            this.processSyncQueue();
        }
    }

    // Process sync queue
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        const itemsToSync = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of itemsToSync) {
            try {
                await this.executeOperation(item);
            } catch (error) {
                console.error('Sync failed for item:', item, error);
                // Re-queue if retries < 3
                if (item.retries < 3) {
                    item.retries++;
                    this.syncQueue.push(item);
                }
            }
        }

        this.saveSyncQueue();
    }

    async executeOperation(item) {
        const { operation, data } = item;

        switch (operation) {
            case 'create_task':
                await window.api.createTask(data);
                break;
            case 'update_task':
                await window.api.updateTask(data.id, data);
                break;
            case 'delete_task':
                await window.api.deleteTask(data.id);
                break;
            case 'create_habit':
                await window.api.createHabit(data);
                break;
            case 'update_habit':
                await window.api.updateHabit(data.id, data);
                break;
            case 'delete_habit':
                await window.api.deleteHabit(data.id);
                break;
            case 'complete_task':
                await window.api.updateTask(data.id, { completed: true });
                break;
            case 'complete_habit':
                await window.api.completeHabit(data.id, data.date);
                break;
            default:
                console.warn('Unknown operation:', operation);
        }
    }

    // Cache data locally for offline access
    cacheData() {
        const cache = {
            tasks: this.app.tasks || [],
            habits: this.app.habits || [],
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('flow_offline_cache', JSON.stringify(cache));
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    }

    // Load cached data
    loadCachedData() {
        try {
            const cached = localStorage.getItem('flow_offline_cache');
            if (cached) {
                const cache = JSON.parse(cached);
                // Use cached data if online data fails
                if (this.app) {
                    if (!this.app.tasks || this.app.tasks.length === 0) {
                        this.app.tasks = cache.tasks || [];
                    }
                    if (!this.app.habits || this.app.habits.length === 0) {
                        this.app.habits = cache.habits || [];
                    }
                }
                return cache;
            }
        } catch (error) {
            console.error('Failed to load cached data:', error);
        }
        return null;
    }

    saveSyncQueue() {
        try {
            localStorage.setItem('flow_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Failed to save sync queue:', error);
        }
    }

    loadSyncQueue() {
        try {
            const saved = localStorage.getItem('flow_sync_queue');
            if (saved) {
                this.syncQueue = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load sync queue:', error);
            this.syncQueue = [];
        }
    }

    startSyncCheck() {
        // Check connection every 30 seconds
        setInterval(() => {
            if (this.isOnline && this.syncQueue.length > 0) {
                this.processSyncQueue();
            }
        }, 30000);

        // Cache data every 5 minutes
        setInterval(() => {
            this.cacheData();
        }, 5 * 60 * 1000);
    }

    // Wrapper methods for API calls that queue when offline
    async createTaskOffline(taskData) {
        if (this.isOnline) {
            try {
                return await window.api.createTask(taskData);
            } catch (error) {
                // If online but request fails, queue it
                this.queueOperation({ type: 'create_task', data: taskData });
                throw error;
            }
        } else {
            // Offline: queue and use local ID
            const localTask = {
                ...taskData,
                id: `local-${Date.now()}`,
                synced: false
            };
            this.app.tasks.push(localTask);
            this.queueOperation({ type: 'create_task', data: taskData });
            this.cacheData();
            return localTask;
        }
    }

    async updateTaskOffline(taskId, taskData) {
        if (this.isOnline) {
            try {
                return await window.api.updateTask(taskId, taskData);
            } catch (error) {
                this.queueOperation({ type: 'update_task', data: { id: taskId, ...taskData } });
                throw error;
            }
        } else {
            // Update locally
            const task = this.app.tasks.find(t => t.id === taskId);
            if (task) {
                Object.assign(task, taskData);
                task.synced = false;
            }
            this.queueOperation({ type: 'update_task', data: { id: taskId, ...taskData } });
            this.cacheData();
        }
    }

    getSyncQueueSize() {
        return this.syncQueue.length;
    }

    getIsOnline() {
        return this.isOnline;
    }
}

window.EnhancedOffline = EnhancedOffline;

