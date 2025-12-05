/**
 * API Client for Flow App
 * Handles all backend communication
 */

const API_BASE = '';

class FlowAPI {
    // Tasks
    async getTasks() {
        const response = await fetch(`${API_BASE}/api/tasks`);
        return await response.json();
    }

    async createTask(taskData) {
        const response = await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    }

    async updateTask(taskId, taskData) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    }

    async deleteTask(taskId) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async reorderTasks(taskIds) {
        const response = await fetch(`${API_BASE}/api/tasks/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_ids: taskIds })
        });
        return await response.json();
    }

    // Habits
    async getHabits() {
        const response = await fetch(`${API_BASE}/api/habits`);
        return await response.json();
    }

    async createHabit(habitData) {
        const response = await fetch(`${API_BASE}/api/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitData)
        });
        return await response.json();
    }

    async completeHabit(habitId) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}/complete`, {
            method: 'POST'
        });
        return await response.json();
    }

    async uncompleteHabit(habitId) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}/uncomplete`, {
            method: 'POST'
        });
        return await response.json();
    }

    async deleteHabit(habitId) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    // Focus
    async getFocusItems() {
        const response = await fetch(`${API_BASE}/api/focus`);
        return await response.json();
    }

    async setFocusItems(items) {
        const response = await fetch(`${API_BASE}/api/focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        return await response.json();
    }

    async completeFocusItem(focusId) {
        const response = await fetch(`${API_BASE}/api/focus/${focusId}/complete`, {
            method: 'POST'
        });
        return await response.json();
    }

    // Stats
    async getStats() {
        const response = await fetch(`${API_BASE}/api/stats`);
        return await response.json();
    }

    // Onboarding
    async getOnboardingStatus() {
        const response = await fetch(`${API_BASE}/api/onboarding`);
        return await response.json();
    }

    async completeOnboarding() {
        const response = await fetch(`${API_BASE}/api/onboarding/complete`, {
            method: 'POST'
        });
        return await response.json();
    }

    // Motivation & Intelligence
    async getPraise() {
        const response = await fetch(`${API_BASE}/api/praise`);
        return await response.json();
    }

    async getInsights() {
        const response = await fetch(`${API_BASE}/api/insights`);
        return await response.json();
    }

    async snoozeTask(taskId, days = 1) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}/snooze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days })
        });
        return await response.json();
    }

    // Reflection
    async saveReflection(reflectionData) {
        const response = await fetch(`${API_BASE}/api/reflection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reflectionData)
        });
        return await response.json();
    }

    async getReflections() {
        const response = await fetch(`${API_BASE}/api/reflection`);
        return await response.json();
    }

    // Weekly Review
    async getWeeklyReview() {
        const response = await fetch(`${API_BASE}/api/weekly-review`);
        return await response.json();
    }

    // Calendar Views
    async getCalendarView(viewType, date) {
        const dateParam = date ? `?date=${date}` : '';
        const response = await fetch(`${API_BASE}/api/calendar/${viewType}${dateParam}`);
        return await response.json();
    }

    // Smart Rescheduling
    async getRescheduleSuggestions(taskId) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}/reschedule-suggestions`);
        return await response.json();
    }

    async rescheduleTask(taskId, date, time) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}/reschedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, time })
        });
        return await response.json();
    }

    // Task Breakdown
    async getBreakdownSuggestions(taskId) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}/breakdown-suggestions`);
        return await response.json();
    }

    async createTaskBreakdown(taskId, subtasks) {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}/breakdown`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtasks })
        });
        return await response.json();
    }

    // Habit Insights
    async getHabitInsights(habitId) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}/insights`);
        return await response.json();
    }

    // Priority & Aging
    async getAgingTasks() {
        const response = await fetch(`${API_BASE}/api/tasks/aging`);
        return await response.json();
    }

    async autoPrioritizeTasks() {
        const response = await fetch(`${API_BASE}/api/tasks/prioritize`, {
            method: 'POST'
        });
        return await response.json();
    }

    // Settings
    async getSettings() {
        const response = await fetch(`${API_BASE}/api/settings`);
        return await response.json();
    }

    async updateSettings(settings) {
        const response = await fetch(`${API_BASE}/api/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return await response.json();
    }
}

const api = new FlowAPI();


