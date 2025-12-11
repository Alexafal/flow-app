/**
 * Activity Log
 * Private history of all user actions
 */

class ActivityLog {
    constructor(app) {
        this.app = app;
        this.activities = this.loadActivities();
        this.maxActivities = 500;
        this.init();
    }

    init() {
        // Start tracking
    }

    loadActivities() {
        const saved = localStorage.getItem('activityLog');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    saveActivities() {
        // Keep only recent activities
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(-this.maxActivities);
        }
        localStorage.setItem('activityLog', JSON.stringify(this.activities));
    }

    logActivity(type, data) {
        const activity = {
            id: `activity-${Date.now()}`,
            type,
            data,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        this.activities.push(activity);
        this.saveActivities();

        // Update UI if activity log is visible
        if (document.getElementById('activityLogContent')) {
            this.renderActivities();
        }
    }

    getActivitiesForDate(date) {
        return this.activities.filter(a => a.date === date);
    }

    getRecentActivities(limit = 50) {
        return this.activities.slice(-limit).reverse();
    }

    getActivityStats() {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const recent = this.activities.filter(a => a.date >= weekAgo);
        
        return {
            total: this.activities.length,
            today: this.activities.filter(a => a.date === today).length,
            thisWeek: recent.length,
            completed: recent.filter(a => a.type === 'task_completed').length,
            habits: recent.filter(a => a.type === 'habit_completed').length,
            streaks: recent.filter(a => a.type === 'streak_milestone').length
        };
    }

    renderActivities(container = null) {
        const target = container || document.getElementById('activityLogContent');
        if (!target) return;

        const activities = this.getRecentActivities(50);
        
        if (activities.length === 0) {
            target.innerHTML = '<div class="empty-state">No activity yet</div>';
            return;
        }

        let html = '<div class="activity-log">';

        activities.forEach(activity => {
            html += this.renderActivityItem(activity);
        });

        html += '</div>';
        target.innerHTML = html;
    }

    renderActivityItem(activity) {
        const time = new Date(activity.timestamp);
        const timeStr = time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });

        let icon = '📝';
        let text = '';

        switch (activity.type) {
            case 'task_completed':
                icon = '✅';
                text = `Completed: ${activity.data.title}`;
                break;
            case 'task_created':
                icon = '➕';
                text = `Created: ${activity.data.title}`;
                break;
            case 'task_edited':
                icon = '✏️';
                text = `Edited: ${activity.data.title}`;
                break;
            case 'task_deleted':
                icon = '🗑️';
                text = `Deleted: ${activity.data.title}`;
                break;
            case 'habit_completed':
                icon = '🔥';
                text = `Completed: ${activity.data.name}`;
                break;
            case 'streak_milestone':
                icon = '⭐';
                text = `${activity.data.streak} day streak! ${activity.data.name}`;
                break;
            case 'focus_session':
                icon = '⏱️';
                text = `Focus session: ${activity.data.duration} minutes`;
                break;
            default:
                text = activity.type;
        }

        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${text}</div>
                    <div class="activity-time">${timeStr}</div>
                </div>
            </div>
        `;
    }

    // Helper methods to log specific activities
    logTaskCompleted(task) {
        this.logActivity('task_completed', { id: task.id, title: task.title });
    }

    logTaskCreated(task) {
        this.logActivity('task_created', { id: task.id, title: task.title });
    }

    logHabitCompleted(habit) {
        this.logActivity('habit_completed', { id: habit.id, name: habit.name });
    }

    logStreakMilestone(habit, streak) {
        this.logActivity('streak_milestone', { 
            id: habit.id, 
            name: habit.name, 
            streak 
        });
    }

    logFocusSession(duration) {
        this.logActivity('focus_session', { duration });
    }
}

window.ActivityLog = ActivityLog;

