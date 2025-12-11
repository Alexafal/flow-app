/**
 * Enhanced Pomodoro with Auto-Time Logging
 * Tracks time and syncs with calendar
 */

class EnhancedPomodoro {
    constructor(app) {
        this.app = app;
        this.isRunning = false;
        this.startTime = null;
        this.duration = 25 * 60; // 25 minutes in seconds
        this.timeRemaining = this.duration;
        this.currentTask = null;
        this.timeLogs = this.loadTimeLogs();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoro_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.duration = (settings.duration || 25) * 60;
            this.timeRemaining = this.duration;
        }
    }

    saveSettings() {
        localStorage.setItem('pomodoro_settings', JSON.stringify({
            duration: this.duration / 60
        }));
    }

    loadTimeLogs() {
        const saved = localStorage.getItem('pomodoro_time_logs');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    saveTimeLogs() {
        localStorage.setItem('pomodoro_time_logs', JSON.stringify(this.timeLogs));
    }

    start(taskId = null) {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startTime = new Date();
        this.currentTask = taskId;
        this.timeRemaining = this.duration;

        // Update UI
        this.updateDisplay();
        this.startTimer();

        // Show focus mode
        this.showFocusMode();

        // Haptic feedback
        if (window.utils) {
            window.utils.hapticFeedback('medium');
        }
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.stopTimer();

        // Haptic feedback
        if (window.utils) {
            window.utils.hapticFeedback('light');
        }
    }

    stop() {
        if (!this.isRunning && !this.startTime) return;

        const endTime = new Date();
        const duration = Math.floor((endTime - this.startTime) / 1000 / 60); // minutes

        // Log time
        if (duration > 0) {
            this.logTime(duration);
        }

        // Reset
        this.isRunning = false;
        this.startTime = null;
        this.timeRemaining = this.duration;
        this.currentTask = null;
        this.stopTimer();

        // Hide focus mode
        this.hideFocusMode();

        // Show completion
        this.showCompletion(duration);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.updateDisplay();
            } else {
                this.onComplete();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    onComplete() {
        this.stop();
        
        // Show break reminder
        if (window.utils) {
            window.utils.showToast('Pomodoro complete! Take a 5-minute break.', 'success');
        }

        // Auto-start break timer (optional)
        // this.startBreak();
    }

    logTime(minutes) {
        const logEntry = {
            id: `log-${Date.now()}`,
            task_id: this.currentTask,
            task_title: this.getTaskTitle(this.currentTask),
            start_time: this.startTime.toISOString(),
            duration: minutes,
            date: new Date().toISOString().split('T')[0]
        };

        this.timeLogs.push(logEntry);
        this.saveTimeLogs();

        // Sync with calendar if enabled
        if (this.app.calendarSync && this.app.calendarSync.isConnected) {
            this.syncToCalendar(logEntry);
        }

        // Update task time estimate if task exists
        if (this.currentTask) {
            this.updateTaskTime(this.currentTask, minutes);
        }
    }

    async syncToCalendar(logEntry) {
        try {
            const eventData = {
                title: `Pomodoro: ${logEntry.task_title || 'Focus Session'}`,
                start: logEntry.start_time,
                duration: logEntry.duration,
                description: `Completed ${logEntry.duration}-minute focus session`
            };

            await this.app.calendarSync.createCalendarEvent(eventData);
        } catch (error) {
            console.error('Failed to sync to calendar:', error);
        }
    }

    async updateTaskTime(taskId, minutes) {
        try {
            const task = this.app.tasks.find(t => t.id === taskId);
            if (task) {
                const currentTime = task.actual_time_spent || 0;
                await window.api.updateTask(taskId, {
                    actual_time_spent: currentTime + minutes
                });
            }
        } catch (error) {
            console.error('Failed to update task time:', error);
        }
    }

    getTaskTitle(taskId) {
        if (!taskId) return 'Focus Session';
        const task = this.app.tasks.find(t => t.id === taskId);
        return task ? task.title : 'Focus Session';
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const timerDisplay = document.getElementById('pomodoroTimer');
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }

        // Update progress
        const progress = ((this.duration - this.timeRemaining) / this.duration) * 100;
        const progressBar = document.getElementById('pomodoroProgress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    showFocusMode() {
        const focusMode = document.getElementById('focusMode');
        if (focusMode) {
            focusMode.style.display = 'block';
            focusMode.classList.add('active');
        }
    }

    hideFocusMode() {
        const focusMode = document.getElementById('focusMode');
        if (focusMode) {
            focusMode.style.display = 'none';
            focusMode.classList.remove('active');
        }
    }

    showCompletion(duration) {
        if (window.utils) {
            window.utils.showToast(`Logged ${duration} minutes of focused work!`, 'success');
        }
    }

    setupEventListeners() {
        // Start button
        document.getElementById('pomodoroStart')?.addEventListener('click', () => {
            this.start();
        });

        // Pause button
        document.getElementById('pomodoroPause')?.addEventListener('click', () => {
            this.pause();
        });

        // Stop button
        document.getElementById('pomodoroStop')?.addEventListener('click', () => {
            this.stop();
        });

        // Duration selector
        document.getElementById('pomodoroDuration')?.addEventListener('change', (e) => {
            this.duration = parseInt(e.target.value) * 60;
            this.timeRemaining = this.duration;
            this.saveSettings();
            this.updateDisplay();
        });
    }

    getTimeLogs(date = null) {
        if (date) {
            return this.timeLogs.filter(log => log.date === date);
        }
        return this.timeLogs;
    }

    getTotalTimeToday() {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = this.getTimeLogs(today);
        return todayLogs.reduce((total, log) => total + log.duration, 0);
    }
}

window.EnhancedPomodoro = EnhancedPomodoro;






