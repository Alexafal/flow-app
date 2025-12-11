/**
 * Calendar UX Improvements
 * Drag-drop event creation, inline editing, multi-view layouts
 */

class CalendarUX {
    constructor(app) {
        this.app = app;
        this.currentView = 'day'; // day, week, month, agenda, heatmap, compact3
        this.draggingEvent = null;
        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupInlineEditing();
        this.setupViewSwitcher();
    }

    setupDragDrop() {
        const calendar = document.getElementById('calendarView');
        if (!calendar) return;

        let dragStartTime = null;
        let isDragging = false;

        calendar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('calendar-time-slot')) {
                dragStartTime = e.target.dataset.time;
                isDragging = true;
                e.preventDefault();
            }
        });

        calendar.addEventListener('mousemove', (e) => {
            if (!isDragging || !dragStartTime) return;

            const timeSlot = e.target.closest('.calendar-time-slot');
            if (timeSlot) {
                const endTime = timeSlot.dataset.time;
                this.showDragPreview(dragStartTime, endTime);
            }
        });

        calendar.addEventListener('mouseup', (e) => {
            if (isDragging && dragStartTime) {
                const timeSlot = e.target.closest('.calendar-time-slot');
                if (timeSlot) {
                    const endTime = timeSlot.dataset.time;
                    this.createEventFromDrag(dragStartTime, endTime);
                }
                this.hideDragPreview();
                isDragging = false;
                dragStartTime = null;
            }
        });
    }

    showDragPreview(startTime, endTime) {
        let preview = document.getElementById('dragPreview');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'dragPreview';
            preview.className = 'calendar-drag-preview';
            document.getElementById('calendarView').appendChild(preview);
        }

        const startSlot = document.querySelector(`[data-time="${startTime}"]`);
        const endSlot = document.querySelector(`[data-time="${endTime}"]`);
        
        if (startSlot && endSlot) {
            const startRect = startSlot.getBoundingClientRect();
            const endRect = endSlot.getBoundingClientRect();
            const calendarRect = document.getElementById('calendarView').getBoundingClientRect();

            preview.style.top = `${startRect.top - calendarRect.top}px`;
            preview.style.left = `${startRect.left - calendarRect.left}px`;
            preview.style.width = `${endRect.right - startRect.left}px`;
            preview.style.height = `${endRect.bottom - startRect.top}px`;
            preview.style.display = 'block';
        }
    }

    hideDragPreview() {
        const preview = document.getElementById('dragPreview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    createEventFromDrag(startTime, endTime) {
        // Show quick create modal
        const modal = document.getElementById('quickEventModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('eventStartTime').value = startTime;
            document.getElementById('eventEndTime').value = endTime;
        } else {
            // Create event directly
            const title = prompt('Event title:');
            if (title) {
                this.createEvent({
                    title,
                    start_time: startTime,
                    end_time: endTime,
                    date: new Date().toISOString().split('T')[0]
                });
            }
        }
    }

    async createEvent(eventData) {
        try {
            const task = await window.api.createTask({
                title: eventData.title,
                due_date: eventData.date,
                due_time: eventData.start_time,
                time_estimate: this.calculateDuration(eventData.start_time, eventData.end_time)
            });

            await this.app.loadData();
            this.app.renderCalendar();
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    }

    calculateDuration(startTime, endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const start = startHour * 60 + startMin;
        const end = endHour * 60 + endMin;
        return Math.max(0, end - start);
    }

    setupInlineEditing() {
        // Click to edit calendar events
        document.addEventListener('click', (e) => {
            const eventElement = e.target.closest('.calendar-event, .calendar-task-item');
            if (eventElement && e.detail === 2) { // Double click
                this.startInlineEdit(eventElement);
            }
        });
    }

    startInlineEdit(element) {
        const taskId = element.dataset.taskId;
        if (!taskId) return;

        const task = this.app.tasks.find(t => t.id === parseInt(taskId));
        if (!task) return;

        // Create inline editor
        const editor = document.createElement('input');
        editor.type = 'text';
        editor.value = task.title;
        editor.className = 'inline-editor';
        editor.style.cssText = `
            position: absolute;
            background: white;
            border: 2px solid var(--calm-primary);
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.9rem;
            z-index: 1000;
        `;

        const rect = element.getBoundingClientRect();
        editor.style.left = `${rect.left}px`;
        editor.style.top = `${rect.top}px`;
        editor.style.width = `${rect.width}px`;

        document.body.appendChild(editor);
        editor.focus();
        editor.select();

        editor.addEventListener('blur', () => {
            this.finishInlineEdit(editor, taskId, editor.value);
        });

        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.finishInlineEdit(editor, taskId, editor.value);
            } else if (e.key === 'Escape') {
                editor.remove();
            }
        });
    }

    async finishInlineEdit(editor, taskId, newTitle) {
        editor.remove();
        
        if (newTitle.trim()) {
            try {
                await window.api.updateTask(taskId, { title: newTitle.trim() });
                await this.app.loadData();
                this.app.renderCalendar();
            } catch (error) {
                console.error('Failed to update task:', error);
            }
        }
    }

    setupViewSwitcher() {
        // Add view switcher buttons
        const viewSwitcher = document.getElementById('calendarViewSwitcher');
        if (!viewSwitcher) return;

        const views = ['day', 'week', 'month', 'agenda', 'compact3', 'heatmap'];
        views.forEach(view => {
            const btn = document.createElement('button');
            btn.className = 'view-switch-btn';
            btn.textContent = this.getViewName(view);
            btn.dataset.view = view;
            btn.addEventListener('click', () => {
                this.switchView(view);
            });
            viewSwitcher.appendChild(btn);
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Render appropriate view
        if (view === 'agenda') {
            this.renderAgendaView();
        } else if (view === 'compact3') {
            this.renderCompact3View();
        } else if (view === 'heatmap') {
            this.renderHeatmapView();
        } else {
            // Use existing calendar renderer
            this.app.renderCalendar();
        }
    }

    renderAgendaView() {
        const container = document.getElementById('calendarView');
        if (!container) return;

        const tasks = this.app.tasks || [];
        const upcoming = tasks
            .filter(t => t.due_date && !t.completed)
            .sort((a, b) => {
                const dateCompare = (a.due_date || '').localeCompare(b.due_date || '');
                if (dateCompare !== 0) return dateCompare;
                return (a.due_time || '').localeCompare(b.due_time || '');
            });

        let html = '<div class="agenda-view">';
        html += '<h3>Upcoming Tasks</h3>';

        let currentDate = null;
        upcoming.forEach(task => {
            if (task.due_date !== currentDate) {
                if (currentDate !== null) html += '</div>';
                currentDate = task.due_date;
                html += `<div class="agenda-day">
                    <h4 class="agenda-date">${this.formatAgendaDate(currentDate)}</h4>
                `;
            }

            html += `
                <div class="agenda-item">
                    <span class="agenda-time">${task.due_time || 'All day'}</span>
                    <span class="agenda-title">${task.title}</span>
                </div>
            `;
        });
        if (currentDate !== null) html += '</div>';
        html += '</div>';

        container.innerHTML = html;
    }

    renderCompact3View() {
        const container = document.getElementById('calendarView');
        if (!container) return;

        const today = new Date();
        const days = [];
        for (let i = -1; i <= 1; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            days.push(date);
        }

        let html = '<div class="compact3-view">';
        days.forEach(day => {
            const dateStr = day.toISOString().split('T')[0];
            const tasks = (this.app.tasks || []).filter(t => t.due_date === dateStr);
            
            html += `
                <div class="compact-day">
                    <h4>${this.formatCompactDate(day)}</h4>
                    <div class="compact-tasks">
                        ${tasks.map(task => `
                            <div class="compact-task" data-task-id="${task.id}">
                                ${task.due_time ? `<span class="compact-time">${task.due_time}</span>` : ''}
                                <span class="compact-title">${task.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    renderHeatmapView() {
        const container = document.getElementById('calendarView');
        if (!container) return;

        // Generate last 30 days
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }

        // Count tasks per day
        const taskCounts = {};
        (this.app.tasks || []).forEach(task => {
            if (task.due_date) {
                taskCounts[task.due_date] = (taskCounts[task.due_date] || 0) + 1;
            }
        });

        let html = '<div class="heatmap-view">';
        html += '<h3>Task Activity Heatmap</h3>';
        html += '<div class="heatmap-grid">';

        days.forEach(day => {
            const dateStr = day.toISOString().split('T')[0];
            const count = taskCounts[dateStr] || 0;
            const intensity = Math.min(count / 5, 1); // Max 5 tasks = full intensity

            html += `
                <div class="heatmap-day" 
                     data-date="${dateStr}"
                     style="background: rgba(169, 198, 255, ${intensity * 0.8})"
                     title="${dateStr}: ${count} tasks">
                </div>
            `;
        });

        html += '</div>';
        html += '<div class="heatmap-legend">
            <span>Less</span>
            <div class="heatmap-legend-gradient"></div>
            <span>More</span>
        </div>';
        html += '</div>';

        container.innerHTML = html;
    }

    formatAgendaDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateString === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateString === tomorrow.toISOString().split('T')[0]) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    formatCompactDate(date) {
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    getViewName(view) {
        const names = {
            'day': 'Day',
            'week': 'Week',
            'month': 'Month',
            'agenda': 'Agenda',
            'compact3': '3-Day',
            'heatmap': 'Heatmap'
        };
        return names[view] || view;
    }
}

window.CalendarUX = CalendarUX;






