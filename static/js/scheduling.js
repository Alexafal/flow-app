/**
 * AI-Assisted Scheduling
 * Rule-based task scheduling optimization
 */

class SmartScheduling {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        // Initialize scheduling rules
    }

    async suggestSchedule(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const tasks = this.app.tasks.filter(t => 
            !t.completed && 
            (!t.due_date || t.due_date === targetDate)
        );

        if (tasks.length === 0) {
            return { message: 'No tasks to schedule', schedule: [] };
        }

        // Analyze tasks
        const analyzed = tasks.map(task => ({
            ...task,
            priorityScore: this.getPriorityScore(task),
            duration: task.time_estimate || 30,
            bestTime: this.suggestBestTime(task)
        }));

        // Sort by priority
        analyzed.sort((a, b) => b.priorityScore - a.priorityScore);

        // Create time blocks
        const schedule = this.createTimeBlocks(analyzed);

        return {
            message: `Suggested schedule for ${targetDate}`,
            schedule,
            totalTime: schedule.reduce((sum, block) => sum + block.duration, 0)
        };
    }

    getPriorityScore(task) {
        let score = 0;

        // Priority weight
        const priorityWeights = {
            high: 10,
            medium: 5,
            low: 1,
            normal: 3
        };
        score += priorityWeights[task.priority] || 3;

        // Due date urgency
        if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const today = new Date();
            const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntil < 0) score += 15; // Overdue
            else if (daysUntil === 0) score += 10; // Due today
            else if (daysUntil === 1) score += 5; // Due tomorrow
        }

        // Tags (work tasks get higher priority in morning)
        if (task.tags?.includes('work') || task.tags?.includes('urgent')) {
            score += 3;
        }

        return score;
    }

    suggestBestTime(task) {
        const priority = task.priority || 'normal';
        const tags = task.tags || [];
        const duration = task.time_estimate || 30;

        // High priority → morning
        if (priority === 'high') {
            return { start: '09:00', end: '12:00', period: 'morning' };
        }

        // Work tasks → morning
        if (tags.includes('work') || tags.includes('important')) {
            return { start: '09:00', end: '12:00', period: 'morning' };
        }

        // Medium priority → afternoon
        if (priority === 'medium') {
            return { start: '13:00', end: '17:00', period: 'afternoon' };
        }

        // Low priority → evening
        if (priority === 'low') {
            return { start: '18:00', end: '21:00', period: 'evening' };
        }

        // Long tasks → morning (more energy)
        if (duration > 60) {
            return { start: '09:00', end: '12:00', period: 'morning' };
        }

        // Default: afternoon
        return { start: '14:00', end: '16:00', period: 'afternoon' };
    }

    createTimeBlocks(tasks) {
        const blocks = [];
        const morningStart = 9;
        const afternoonStart = 13;
        const eveningStart = 18;

        let morningTime = morningStart * 60; // 9:00 in minutes
        let afternoonTime = afternoonStart * 60; // 13:00
        let eveningTime = eveningStart * 60; // 18:00

        tasks.forEach(task => {
            const bestTime = task.bestTime;
            let startTime, endTime;

            if (bestTime.period === 'morning') {
                startTime = morningTime;
                morningTime += task.duration;
                endTime = morningTime;
            } else if (bestTime.period === 'afternoon') {
                startTime = afternoonTime;
                afternoonTime += task.duration;
                endTime = afternoonTime;
            } else {
                startTime = eveningTime;
                eveningTime += task.duration;
                endTime = eveningTime;
            }

            blocks.push({
                task: task.title,
                taskId: task.id,
                start: this.minutesToTime(startTime),
                end: this.minutesToTime(endTime),
                duration: task.duration,
                priority: task.priority,
                period: bestTime.period
            });
        });

        return blocks;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    async applySchedule(schedule) {
        // Update tasks with suggested times
        for (const block of schedule) {
            await this.app.api.updateTask(block.taskId, {
                due_time: block.start
            });
        }

        await this.app.loadData();
        this.app.renderTasks();
        utils.showToast('Schedule applied!');
    }

    renderSchedule(schedule) {
        if (!schedule || schedule.length === 0) {
            return '<div class="empty-state">No schedule suggestions</div>';
        }

        let html = '<div class="schedule-suggestions">';

        schedule.forEach(block => {
            html += `
                <div class="schedule-block" data-task-id="${block.taskId}">
                    <div class="schedule-time">${block.start} - ${block.end}</div>
                    <div class="schedule-task">${block.task}</div>
                    <div class="schedule-meta">
                        <span class="priority-badge priority-${block.priority}">${block.priority}</span>
                        <span class="duration-badge">${block.duration} min</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
}

window.SmartScheduling = SmartScheduling;

