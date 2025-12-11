/**
 * Drag and Drop System
 * Reorder tasks, habits, calendar events
 */

class DragDropSystem {
    constructor(app) {
        this.app = app;
        this.draggedElement = null;
        this.dragOverElement = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        // Make tasks draggable
        document.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.task-item, .habit-card, .calendar-task-item');
            if (item && item.draggable) {
                this.handleDragStart(e, item);
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            const item = e.target.closest('.task-item, .habit-card, .drop-zone');
            if (item) {
                this.handleDragOver(e, item);
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const item = e.target.closest('.task-item, .habit-card, .drop-zone');
            if (item) {
                this.handleDrop(e, item);
            }
        });

        document.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });
    }

    makeDraggable(element, data) {
        element.draggable = true;
        element.classList.add('draggable');
        element.dataset.dragData = JSON.stringify(data);
    }

    handleDragStart(e, element) {
        this.draggedElement = element;
        element.classList.add('dragging');
        
        // Set drag data
        const data = {
            id: element.dataset.taskId || element.dataset.habitId,
            type: element.classList.contains('task-item') ? 'task' : 'habit',
            index: Array.from(element.parentNode.children).indexOf(element)
        };
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(data));

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    handleDragOver(e, element) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (element === this.draggedElement) return;

        // Remove previous drag-over
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Add drag-over to current element
        if (element.classList.contains('task-item') || 
            element.classList.contains('habit-card') ||
            element.classList.contains('drop-zone')) {
            element.classList.add('drag-over');
            this.dragOverElement = element;
        }
    }

    async handleDrop(e, element) {
        e.preventDefault();

        if (!this.draggedElement) return;

        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        
        // Remove drag-over classes
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Handle different drop scenarios
        if (element.classList.contains('drop-zone')) {
            // Dropping into a section/folder
            await this.handleDropIntoZone(element, dragData);
        } else {
            // Reordering within same list
            await this.handleReorder(element, dragData);
        }

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    }

    async handleReorder(dropElement, dragData) {
        const dropIndex = Array.from(dropElement.parentNode.children).indexOf(dropElement);
        const dragIndex = dragData.index;

        if (dragIndex === dropIndex) return;

        // Reorder in array
        if (dragData.type === 'task') {
            const tasks = this.app.tasks;
            const [moved] = tasks.splice(dragIndex, 1);
            tasks.splice(dropIndex, 0, moved);
            
            // Update order in backend
            await this.updateTaskOrder(tasks);
            this.app.renderTasks();
        } else if (dragData.type === 'habit') {
            const habits = this.app.habits;
            const [moved] = habits.splice(dragIndex, 1);
            habits.splice(dropIndex, 0, moved);
            
            await this.updateHabitOrder(habits);
            this.app.renderHabits();
        }
    }

    async handleDropIntoZone(zone, dragData) {
        // Handle dropping into task sections or folders
        const sectionId = zone.dataset.sectionId;
        const folderId = zone.dataset.folderId;

        if (dragData.type === 'task') {
            if (sectionId) {
                // Move to section
                await this.app.api.updateTask(dragData.id, { section: sectionId });
            } else if (folderId) {
                // Move to folder
                await this.app.api.updateTask(dragData.id, { folder_id: folderId });
            }
            
            await this.app.loadData();
            this.app.renderTasks();
        }
    }

    handleDragEnd(e) {
        // Clean up
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        this.draggedElement = null;
        this.dragOverElement = null;
    }

    async updateTaskOrder(tasks) {
        // Update order property for each task
        tasks.forEach((task, index) => {
            task.order = index;
        });

        // Save to backend (if order endpoint exists)
        // For now, just update locally
    }

    async updateHabitOrder(habits) {
        habits.forEach((habit, index) => {
            habit.order = index;
        });
    }

    // Calendar drag to different day
    async handleCalendarDrag(taskId, fromDate, toDate) {
        await this.app.api.updateTask(taskId, { due_date: toDate });
        await this.app.loadData();
        this.app.renderCalendar();
        
        utils.showToast('Task moved');
    }
}

window.DragDropSystem = DragDropSystem;

