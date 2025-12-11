/**
 * Cross-Device Syncing with Conflict Resolution
 * Syncs tasks, habits, preferences across devices
 */

class CrossDeviceSync {
    constructor(app) {
        this.app = app;
        this.deviceId = this.getDeviceId();
        this.lastSyncTime = null;
        this.syncInterval = null;
        this.conflictQueue = [];
        this.init();
    }

    init() {
        this.startAutoSync();
        this.setupConflictHandlers();
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    async sync() {
        try {
            // Get server state
            const serverState = await this.getServerState();
            
            // Get local state
            const localState = this.getLocalState();

            // Detect conflicts
            const conflicts = this.detectConflicts(serverState, localState);

            if (conflicts.length > 0) {
                // Queue conflicts for user resolution
                this.queueConflicts(conflicts);
                return { conflicts: conflicts.length };
            }

            // Merge changes
            const merged = this.mergeStates(serverState, localState);

            // Push to server
            await this.pushToServer(merged);

            // Update local state
            this.updateLocalState(merged);

            this.lastSyncTime = new Date();
            return { success: true };
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    }

    getServerState() {
        // Fetch from server
        return Promise.all([
            fetch('/api/tasks').then(r => r.json()),
            fetch('/api/habits').then(r => r.json()),
            fetch('/api/settings').then(r => r.json())
        ]).then(([tasks, habits, settings]) => ({
            tasks,
            habits,
            settings,
            timestamp: new Date().toISOString()
        }));
    }

    getLocalState() {
        return {
            tasks: this.app.tasks || [],
            habits: this.app.habits || [],
            settings: this.app.settings || {},
            deviceId: this.deviceId,
            timestamp: new Date().toISOString()
        };
    }

    detectConflicts(serverState, localState) {
        const conflicts = [];

        // Check tasks for conflicts
        serverState.tasks.forEach(serverTask => {
            const localTask = localState.tasks.find(t => t.id === serverTask.id);
            if (localTask && this.isModified(localTask, serverTask)) {
                conflicts.push({
                    type: 'task',
                    id: serverTask.id,
                    server: serverTask,
                    local: localTask
                });
            }
        });

        // Check habits for conflicts
        serverState.habits.forEach(serverHabit => {
            const localHabit = localState.habits.find(h => h.id === serverHabit.id);
            if (localHabit && this.isModified(localHabit, serverHabit)) {
                conflicts.push({
                    type: 'habit',
                    id: serverHabit.id,
                    server: serverHabit,
                    local: localHabit
                });
            }
        });

        return conflicts;
    }

    isModified(local, server) {
        // Check if item was modified on both devices
        const localModified = new Date(local.updated_at || local.created_at);
        const serverModified = new Date(server.updated_at || server.created_at);
        
        // If both were modified and timestamps differ significantly
        return Math.abs(localModified - serverModified) > 1000; // 1 second threshold
    }

    queueConflicts(conflicts) {
        this.conflictQueue.push(...conflicts);
        this.showConflictDialog();
    }

    showConflictDialog() {
        if (this.conflictQueue.length === 0) return;

        const conflict = this.conflictQueue[0];
        const dialog = document.getElementById('conflictDialog');
        if (!dialog) {
            this.createConflictDialog();
        }

        // Show conflict resolution UI
        this.renderConflict(conflict);
    }

    createConflictDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'conflictDialog';
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sync Conflict</h3>
                </div>
                <div class="modal-body" id="conflictContent">
                    <!-- Conflict details rendered here -->
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="keepServer">Keep Server Version</button>
                    <button class="btn-secondary" id="keepLocal">Keep Local Version</button>
                    <button class="btn-primary" id="mergeConflict">Merge Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    renderConflict(conflict) {
        const content = document.getElementById('conflictContent');
        if (!content) return;

        const { type, server, local } = conflict;

        content.innerHTML = `
            <p>This ${type} was modified on another device.</p>
            <div class="conflict-comparison">
                <div class="conflict-version">
                    <h4>Server Version</h4>
                    <pre>${JSON.stringify(server, null, 2)}</pre>
                </div>
                <div class="conflict-version">
                    <h4>Local Version</h4>
                    <pre>${JSON.stringify(local, null, 2)}</pre>
                </div>
            </div>
        `;

        // Attach handlers
        document.getElementById('keepServer').onclick = () => {
            this.resolveConflict(conflict, 'server');
        };
        document.getElementById('keepLocal').onclick = () => {
            this.resolveConflict(conflict, 'local');
        };
        document.getElementById('mergeConflict').onclick = () => {
            this.resolveConflict(conflict, 'merge');
        };
    }

    async resolveConflict(conflict, resolution) {
        let resolved;

        switch (resolution) {
            case 'server':
                resolved = conflict.server;
                break;
            case 'local':
                resolved = conflict.local;
                break;
            case 'merge':
                resolved = this.mergeItems(conflict.server, conflict.local);
                break;
        }

        // Update based on type
        if (conflict.type === 'task') {
            await window.api.updateTask(conflict.id, resolved);
            const index = this.app.tasks.findIndex(t => t.id === conflict.id);
            if (index !== -1) {
                this.app.tasks[index] = resolved;
            }
        } else if (conflict.type === 'habit') {
            await window.api.updateHabit(conflict.id, resolved);
            const index = this.app.habits.findIndex(h => h.id === conflict.id);
            if (index !== -1) {
                this.app.habits[index] = resolved;
            }
        }

        // Remove from queue
        this.conflictQueue = this.conflictQueue.filter(c => c.id !== conflict.id);

        // Show next conflict or close
        if (this.conflictQueue.length > 0) {
            this.showConflictDialog();
        } else {
            document.getElementById('conflictDialog').style.display = 'none';
        }
    }

    mergeItems(server, local) {
        // Smart merge: combine non-conflicting fields
        const merged = { ...server };

        // Prefer local for certain fields if they're more recent
        if (local.title && local.updated_at > server.updated_at) {
            merged.title = local.title;
        }

        // Merge tags
        if (local.tags && server.tags) {
            merged.tags = [...new Set([...server.tags, ...local.tags])];
        }

        // Use most recent updated_at
        merged.updated_at = new Date(Math.max(
            new Date(server.updated_at || 0),
            new Date(local.updated_at || 0)
        )).toISOString();

        return merged;
    }

    mergeStates(serverState, localState) {
        // Merge tasks
        const taskMap = new Map();
        [...serverState.tasks, ...localState.tasks].forEach(task => {
            const existing = taskMap.get(task.id);
            if (!existing || new Date(task.updated_at || 0) > new Date(existing.updated_at || 0)) {
                taskMap.set(task.id, task);
            }
        });

        // Merge habits
        const habitMap = new Map();
        [...serverState.habits, ...localState.habits].forEach(habit => {
            const existing = habitMap.get(habit.id);
            if (!existing || new Date(habit.updated_at || 0) > new Date(existing.updated_at || 0)) {
                habitMap.set(habit.id, habit);
            }
        });

        return {
            tasks: Array.from(taskMap.values()),
            habits: Array.from(habitMap.values()),
            settings: { ...serverState.settings, ...localState.settings }
        };
    }

    async pushToServer(state) {
        // Update tasks
        for (const task of state.tasks) {
            try {
                await window.api.updateTask(task.id, task);
            } catch (error) {
                // Task might not exist, create it
                if (error.status === 404) {
                    await window.api.createTask(task);
                }
            }
        }

        // Update habits
        for (const habit of state.habits) {
            try {
                await window.api.updateHabit(habit.id, habit);
            } catch (error) {
                if (error.status === 404) {
                    await window.api.createHabit(habit);
                }
            }
        }
    }

    updateLocalState(state) {
        this.app.tasks = state.tasks;
        this.app.habits = state.habits;
        this.app.settings = state.settings;

        // Re-render
        if (this.app.renderTasks) this.app.renderTasks();
        if (this.app.renderHabits) this.app.renderHabits();
    }

    startAutoSync() {
        // Sync every 30 seconds when online
        this.syncInterval = setInterval(async () => {
            if (navigator.onLine) {
                try {
                    await this.sync();
                } catch (error) {
                    console.error('Auto-sync failed:', error);
                }
            }
        }, 30000); // 30 seconds
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    setupConflictHandlers() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.sync();
        });
    }
}

window.CrossDeviceSync = CrossDeviceSync;






