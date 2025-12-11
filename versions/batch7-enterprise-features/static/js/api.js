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

    async completeHabit(habitId, date = null) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
        });
        return await response.json();
    }

    async uncompleteHabit(habitId, date = null) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}/uncomplete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
        });
        return await response.json();
    }

    async updateHabit(habitId, habitData) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitData)
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

    // Smart Suggestions
    async getSmartSuggestions() {
        const response = await fetch(`${API_BASE}/api/smart-suggestions`);
        return await response.json();
    }

    async applySuggestion(suggestionId, action, data) {
        const response = await fetch(`${API_BASE}/api/suggestions/${suggestionId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data })
        });
        return await response.json();
    }

    // Mood Tracking
    async saveMood(moodLevel, note = '') {
        const response = await fetch(`${API_BASE}/api/mood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: moodLevel, note })
        });
        return await response.json();
    }

    async getMoodHistory() {
        const response = await fetch(`${API_BASE}/api/mood`);
        return await response.json();
    }

    async getMoodPatterns() {
        const response = await fetch(`${API_BASE}/api/mood/patterns`);
        return await response.json();
    }

    // User Profile
    async getProfile() {
        const response = await fetch(`${API_BASE}/api/profile`);
        return await response.json();
    }

    async updateProfile(profileData) {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        return await response.json();
    }

    // Analytics 2.0
    async getProductivityAnalytics() {
        const response = await fetch(`${API_BASE}/api/analytics/productivity`);
        return await response.json();
    }

    async getHabitStrength(habitId) {
        const response = await fetch(`${API_BASE}/api/habits/${habitId}/strength`);
        return await response.json();
    }

    // Achievements
    async getAchievements() {
        const response = await fetch(`${API_BASE}/api/achievements`);
        return await response.json();
    }
}

const api = new FlowAPI();
window.api = api; // Make available globally


