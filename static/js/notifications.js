/**
 * Notifications & Reminders System
 * Push notifications, smart reminders, quiet hours
 */

class NotificationsSystem {
    constructor(app) {
        this.app = app;
        this.permission = null;
        this.quietHours = { start: 22, end: 8 }; // 10 PM - 8 AM
        this.init();
    }

    async init() {
        await this.requestPermission();
        this.loadSettings();
        this.setupReminders();
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return;
        }

        this.permission = Notification.permission;

        if (this.permission === 'default') {
            // Request permission on first interaction
            document.addEventListener('click', async () => {
                if (this.permission === 'default') {
                    this.permission = await Notification.requestPermission();
                }
            }, { once: true });
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('notification_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.quietHours = settings.quietHours || this.quietHours;
        }
    }

    saveSettings() {
        localStorage.setItem('notification_settings', JSON.stringify({
            quietHours: this.quietHours
        }));
    }

    async sendNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        // Check quiet hours
        if (this.isQuietHours()) {
            console.log('Quiet hours - notification suppressed');
            return;
        }

        const notification = new Notification(title, {
            icon: '/static/icon-192.png',
            badge: '/static/icon-192.png',
            tag: options.tag || 'flow-notification',
            requireInteraction: options.requireInteraction || false,
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    }

    isQuietHours() {
        const now = new Date();
        const hour = now.getHours();
        const { start, end } = this.quietHours;

        if (start > end) {
            // Quiet hours span midnight (e.g., 22-8)
            return hour >= start || hour < end;
        } else {
            return hour >= start && hour < end;
        }
    }

    setupReminders() {
        // Check for upcoming tasks every minute
        setInterval(() => {
            this.checkUpcomingTasks();
        }, 60000); // 1 minute

        // Check for habit reminders
        setInterval(() => {
            this.checkHabitReminders();
        }, 60000);
    }

    checkUpcomingTasks() {
        const tasks = this.app.tasks || [];
        const now = new Date();
        
        tasks.forEach(task => {
            if (task.completed || !task.due_date || !task.due_time) return;

            const dueDate = new Date(`${task.due_date}T${task.due_time}`);
            const timeUntil = dueDate - now;

            // Remind 15 minutes before
            if (timeUntil > 0 && timeUntil <= 15 * 60 * 1000 && !task.reminded) {
                this.sendNotification(`Task due soon: ${task.title}`, {
                    body: `Due at ${this.formatTime(task.due_time)}`,
                    tag: `task-${task.id}`
                });
                task.reminded = true;
            }
        });
    }

    checkHabitReminders() {
        const habits = this.app.habits || [];
        const now = new Date();
        const hour = now.getHours();

        habits.forEach(habit => {
            if (habit.archived || !habit.reminder_time) return;

            const reminderHour = parseInt(habit.reminder_time.split(':')[0]);
            
            // Remind at the specified hour
            if (hour === reminderHour && now.getMinutes() === 0) {
                this.sendNotification(`Habit reminder: ${habit.name}`, {
                    body: 'Time to complete your habit!',
                    tag: `habit-${habit.id}`
                });
            }
        });
    }

    async scheduleReminder(taskId, minutesBefore = 15) {
        const task = this.app.tasks.find(t => t.id === taskId);
        if (!task || !task.due_date || !task.due_time) return;

        const dueDate = new Date(`${task.due_date}T${task.due_time}`);
        const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);
        const now = new Date();
        const delay = reminderTime - now;

        if (delay > 0) {
            setTimeout(() => {
                this.sendNotification(`Reminder: ${task.title}`, {
                    body: `Due in ${minutesBefore} minutes`,
                    tag: `reminder-${taskId}`
                });
            }, delay);
        }
    }

    async sendTravelTimeReminder(taskId) {
        const task = this.app.tasks.find(t => t.id === taskId);
        if (!task || !task.location) return;

        // Calculate travel time (mock - would use Maps API)
        const travelTime = 15; // minutes

        const dueDate = new Date(`${task.due_date}T${task.due_time}`);
        const leaveTime = new Date(dueDate.getTime() - travelTime * 60 * 1000);
        const now = new Date();
        const delay = leaveTime - now;

        if (delay > 0) {
            setTimeout(() => {
                this.sendNotification(`Time to leave for: ${task.title}`, {
                    body: `Leave now to arrive on time`,
                    tag: `travel-${taskId}`
                });
            }, delay);
        }
    }

    async sendWeeklySummary() {
        const tasks = this.app.tasks || [];
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.sendNotification('Weekly Summary', {
            body: `You completed ${completed} of ${total} tasks (${completionRate}%)`,
            tag: 'weekly-summary',
            requireInteraction: true
        });
    }

    setQuietHours(start, end) {
        this.quietHours = { start, end };
        this.saveSettings();
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    }
}

window.NotificationsSystem = NotificationsSystem;






