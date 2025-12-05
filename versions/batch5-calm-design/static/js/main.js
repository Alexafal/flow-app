/**
 * Main App Logic for Flow
 * Handles UI interactions, state management, and user flows
 */

class FlowApp {
    constructor() {
        this.tasks = [];
        this.habits = [];
        this.focusItems = [];
        this.currentTab = 'today';
        this.selectedGoal = null;
        this.selectedIcon = '✨';
        this.selectedEnergy = 3;
        this.calendarView = 'day';
        this.currentDate = new Date();
        this.selectedTaskId = null;
        this.selectedHabitId = null;
        this.settings = {};
        this.editingTaskId = null;
        this.selectedPriority = 'normal';
        this.selectedCategory = '';
        
        this.init();
    }

    async init() {
        // Initialize icon system
        this.initializeIcons();
        
        // Check onboarding status
        const onboardingStatus = await api.getOnboardingStatus();
        
        if (!onboardingStatus.complete) {
            this.showOnboarding();
        } else {
            this.showApp();
            await this.loadData();
        }

        this.setupEventListeners();
        this.setupSwipeGestures();
        this.setupBottomSheet();
    }

    initializeIcons() {
        // Initialize navigation icons
        const iconMappings = {
            'icon-today': 'tasks',
            'icon-calendar': 'calendar',
            'icon-habits': 'habits',
            'icon-focus': 'focus',
            'icon-stats': 'stats',
            'icon-reflect': 'reflect'
        };

        Object.entries(iconMappings).forEach(([id, iconName]) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = FlowIcons[iconName];
            }
        });
    }

    showOnboarding() {
        document.getElementById('onboarding').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('onboarding').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    async loadData() {
        try {
            this.tasks = await api.getTasks();
            this.habits = await api.getHabits();
            this.focusItems = await api.getFocusItems();
            this.settings = await api.getSettings();
            
            this.render();
            this.updateStats();
            this.updatePraise();
            this.updateInsights();
            this.checkAgingTasks();
            this.applyTheme();
            
            // Batch 4 features
            this.loadSmartSuggestions();
            this.checkMoodCheckIn();
            this.loadAchievements();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadSmartSuggestions() {
        try {
            const data = await api.getSmartSuggestions();
            const panel = document.getElementById('smartSuggestionsPanel');
            const list = document.getElementById('suggestionsList');
            
            if (!panel || !list) return;
            
            if (data.suggestions.length > 0) {
                panel.style.display = 'block';
                list.innerHTML = '';
                
                data.suggestions.forEach((suggestion, index) => {
                    const card = document.createElement('div');
                    card.className = 'suggestion-card';
                    card.innerHTML = `
                        <div class="suggestion-content">
                            <div class="suggestion-message">${this.escapeHtml(suggestion.message)}</div>
                            <span class="suggestion-priority ${suggestion.priority}">${suggestion.priority}</span>
                        </div>
                        <button class="suggestion-action-btn" data-index="${index}">Apply</button>
                    `;
                    
                    card.querySelector('.suggestion-action-btn').addEventListener('click', () => {
                        this.applySuggestion(suggestion);
                    });
                    
                    list.appendChild(card);
                });
            } else {
                panel.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    async applySuggestion(suggestion) {
        try {
            await api.applySuggestion('temp', suggestion.action, suggestion.data);
            await this.loadData();
            utils.showToast('Suggestion applied!');
            utils.hapticFeedback('success');
        } catch (error) {
            console.error('Error applying suggestion:', error);
            utils.showToast('Error applying suggestion', 'error');
        }
    }

    async checkMoodCheckIn() {
        try {
            const moodHistory = await api.getMoodHistory();
            const today = new Date().toISOString().split('T')[0];
            const card = document.getElementById('moodCheckCard');
            
            if (!card) return;
            
            // Show mood check-in if not done today
            if (!moodHistory[today]) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking mood:', error);
        }
    }

    async handleMoodSelect(level) {
        try {
            await api.saveMood(level);
            document.getElementById('moodCheckCard').style.display = 'none';
            utils.showToast('Mood saved! 💭');
            utils.hapticFeedback('light');
        } catch (error) {
            console.error('Error saving mood:', error);
        }
    }

    async loadAchievements() {
        try {
            const data = await api.getAchievements();
            const grid = document.getElementById('achievementsGrid');
            
            if (!grid) return;
            
            if (data.achievements.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 1rem;">Complete tasks and habits to earn achievements!</p>';
                return;
            }
            
            grid.innerHTML = '';
            data.achievements.forEach(achievement => {
                const badge = document.createElement('div');
                badge.className = 'achievement-badge earned';
                badge.innerHTML = `
                    <span class="achievement-icon">${this.getAchievementIcon(achievement.icon)}</span>
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                `;
                grid.appendChild(badge);
            });
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    getAchievementIcon(iconName) {
        const iconMap = {
            'flame': '🔥',
            'sparkles': '✨',
            'check': '✅',
            'star': '⭐',
            'trophy': '🏆'
        };
        return iconMap[iconName] || '🏆';
    }

    applyTheme() {
        const theme = this.settings.theme || 'auto';
        const hour = new Date().getHours();
        
        document.body.classList.remove('morning-theme', 'evening-theme', 'night-theme');
        
        if (theme === 'auto') {
            if (hour >= 5 && hour < 12) {
                document.body.classList.add('morning-theme');
            } else if (hour >= 12 && hour < 18) {
                // Default theme
            } else if (hour >= 18 && hour < 22) {
                document.body.classList.add('evening-theme');
            } else {
                document.body.classList.add('night-theme');
            }
        } else if (theme !== 'default') {
            document.body.classList.add(theme + '-theme');
        }
    }

    async checkAgingTasks() {
        try {
            const data = await api.getAgingTasks();
            const agingTasks = data.aging_tasks || [];
            
            if (agingTasks.length > 0) {
                const alert = document.getElementById('agingAlert');
                const message = document.getElementById('agingAlertMessage');
                
                if (alert && message) {
                    const taskCount = agingTasks.length;
                    const oldestDays = Math.max(...agingTasks.map(t => t.days_old));
                    message.textContent = `${taskCount} task${taskCount > 1 ? 's' : ''} pending for ${oldestDays}+ days. Consider breaking them down or rescheduling.`;
                    alert.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error checking aging tasks:', error);
        }
    }

    async updatePraise() {
        try {
            const praise = await api.getPraise();
            const banner = document.getElementById('praiseMessage');
            if (banner) {
                banner.textContent = praise.message;
            }
        } catch (error) {
            console.error('Error loading praise:', error);
        }
    }

    async updateInsights() {
        try {
            const insights = await api.getInsights();
            const container = document.getElementById('insightsList');
            if (!container) return;

            if (insights.insights.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No insights yet. Keep building your habits!</p>';
                return;
            }

            container.innerHTML = '';
            insights.insights.forEach(insight => {
                const card = document.createElement('div');
                card.className = `insight-card ${insight.type}`;
                
                const icon = insight.type === 'celebration' ? '🎉' : '💡';
                
                card.innerHTML = `
                    <div class="insight-icon">${icon}</div>
                    <div class="insight-message">${this.escapeHtml(insight.message)}</div>
                `;
                
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading insights:', error);
        }
    }

    setupEventListeners() {
        // Onboarding
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                const mode = e.currentTarget.dataset.mode;
                if (mode) {
                    // Batch 4: Set user mode profile
                    try {
                        await api.updateProfile({ mode: mode });
                        this.selectedGoal = mode;
                        this.showOnboardingStep(2);
                    } catch (error) {
                        console.error('Error setting profile:', error);
                        this.selectedGoal = mode;
                        this.showOnboardingStep(2);
                    }
                } else {
                    // Legacy support
                    this.selectedGoal = e.currentTarget.dataset.goal || 'productivity';
                    this.showOnboardingStep(2);
                }
            });
        });

        document.getElementById('skipHabits')?.addEventListener('click', () => {
            this.showOnboardingStep(3);
        });

        document.getElementById('addFirstTask')?.addEventListener('click', () => {
            const input = document.getElementById('firstTaskInput');
            if (input.value.trim()) {
                this.handleAddFirstTask(input.value);
            }
        });

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Add task
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        
        taskInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTask();
            }
        });
        
        addTaskBtn?.addEventListener('click', () => {
            this.handleAddTask();
        });

        // Add habit modal
        document.getElementById('addHabitBtn')?.addEventListener('click', () => {
            this.showAddHabitModal();
        });

        document.getElementById('closeHabitModal')?.addEventListener('click', () => {
            this.hideAddHabitModal();
        });

        document.getElementById('saveHabitBtn')?.addEventListener('click', () => {
            this.handleAddHabit();
        });

        // Icon selection
        document.querySelectorAll('.icon-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedIcon = e.currentTarget.dataset.icon;
            });
        });

        // Focus mode
        document.getElementById('setFocusBtn')?.addEventListener('click', () => {
            this.handleSetFocus();
        });

        // Reflection
        document.querySelectorAll('.energy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedEnergy = parseInt(e.currentTarget.dataset.level);
            });
        });

        document.getElementById('saveReflection')?.addEventListener('click', () => {
            this.handleSaveReflection();
        });

        // Weekly Review
        document.getElementById('showWeeklyReview')?.addEventListener('click', () => {
            this.handleShowWeeklyReview();
        });

        // Calendar navigation
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.calendarView = e.currentTarget.dataset.view;
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.renderCalendar();
            });
        });

        document.getElementById('prevPeriod')?.addEventListener('click', () => {
            this.navigateCalendar(-1);
        });

        document.getElementById('nextPeriod')?.addEventListener('click', () => {
            this.navigateCalendar(1);
        });

        document.getElementById('goToToday')?.addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        // Reschedule modal
        document.getElementById('closeRescheduleModal')?.addEventListener('click', () => {
            this.hideRescheduleModal();
        });

        document.getElementById('manualRescheduleBtn')?.addEventListener('click', () => {
            this.handleManualReschedule();
        });

        // Breakdown modal
        document.getElementById('closeBreakdownModal')?.addEventListener('click', () => {
            this.hideBreakdownModal();
        });

        document.getElementById('addSubtaskInput')?.addEventListener('click', () => {
            this.addSubtaskInput();
        });

        document.getElementById('useBreakdownSuggestions')?.addEventListener('click', () => {
            this.useBreakdownSuggestions();
        });

        document.getElementById('saveBreakdownBtn')?.addEventListener('click', () => {
            this.handleSaveBreakdown();
        });

        // Habit insights modal
        document.getElementById('closeInsightsModal')?.addEventListener('click', () => {
            this.hideInsightsModal();
        });

        // Aging alert close
        document.getElementById('closeAgingAlert')?.addEventListener('click', () => {
            document.getElementById('agingAlert').style.display = 'none';
        });

        // Habit frequency selector
        document.getElementById('habitFrequency')?.addEventListener('change', (e) => {
            const countInput = document.getElementById('habitFrequencyCount');
            if (countInput) {
                countInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
            }
        });

        // Smart suggestions
        document.getElementById('dismissSuggestions')?.addEventListener('click', () => {
            document.getElementById('smartSuggestionsPanel').style.display = 'none';
        });

        // Mood check-in
        document.querySelectorAll('.mood-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                const level = parseInt(e.currentTarget.dataset.mood);
                this.handleMoodSelect(level);
            });
        });

        document.getElementById('closeMoodCheck')?.addEventListener('click', () => {
            document.getElementById('moodCheckCard').style.display = 'none';
        });

        // Task Editor
        document.getElementById('closeTaskEditor')?.addEventListener('click', () => {
            this.closeTaskEditor();
        });

        document.getElementById('taskEditorOverlay')?.addEventListener('click', () => {
            this.closeTaskEditor();
        });

        document.getElementById('saveTaskEditor')?.addEventListener('click', () => {
            this.handleSaveTaskEdit();
        });

        // Priority selection
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedPriority = e.currentTarget.dataset.priority;
            });
        });

        // Category selection
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedCategory = e.currentTarget.dataset.category;
            });
        });

        // Theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                const theme = e.currentTarget.dataset.theme;
                await this.applyCalmTheme(theme);
            });
        });
    }

    showOnboardingStep(step) {
        document.querySelectorAll('.onboarding-step').forEach((s, i) => {
            if (i + 1 === step) {
                s.classList.remove('hidden');
            } else {
                s.classList.add('hidden');
            }
        });

        if (step === 2) {
            this.renderSuggestedHabits();
        }
    }

    renderSuggestedHabits() {
        const container = document.getElementById('suggestedHabits');
        if (!container) return;

        const habits = utils.getSuggestedHabits(this.selectedGoal);
        container.innerHTML = '';

        habits.forEach(habit => {
            const habitEl = document.createElement('div');
            habitEl.className = 'suggested-habit';
            habitEl.innerHTML = `
                <span>${habit.icon}</span>
                <span>${habit.name}</span>
            `;
            habitEl.addEventListener('click', () => {
                this.handleAddSuggestedHabit(habit);
            });
            container.appendChild(habitEl);
        });
    }

    async handleAddSuggestedHabit(habit) {
        try {
            await api.createHabit({
                name: habit.name,
                icon: habit.icon
            });
            utils.showToast(`${habit.name} added!`);
        } catch (error) {
            console.error('Error adding habit:', error);
        }
    }

    async handleAddFirstTask(taskText) {
        try {
            const taskData = utils.parseTaskInput(taskText);
            await api.createTask(taskData);
            await api.completeOnboarding();
            this.showApp();
            await this.loadData();
        } catch (error) {
            console.error('Error adding first task:', error);
        }
    }

    async handleAddTask() {
        const input = document.getElementById('taskInput');
        if (!input || !input.value.trim()) return;

        try {
            const taskData = utils.parseTaskInput(input.value);
            const task = await api.createTask(taskData);
            
            this.tasks.push(task);
            this.renderTasks();
            input.value = '';
            
            utils.hapticFeedback('light');
            utils.showToast('Task added!');
        } catch (error) {
            console.error('Error adding task:', error);
            utils.showToast('Error adding task', 'error');
        }
    }

    async handleToggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            const updated = await api.updateTask(taskId, {
                completed: !task.completed
            });
            
            task.completed = updated.completed;
            task.completed_at = updated.completed_at;
            
            this.renderTasks();
            this.updateProgress();
            this.updateStats();

            if (updated.completed) {
                // Add premium animation
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    this.animateTaskCompletion(taskElement);
                }
                
                utils.hapticFeedback('success');
                if (this.isAllTasksCompleted()) {
                    this.showPerfectDayAnimation();
                    utils.createConfetti();
                    setTimeout(() => {
                        utils.showToast('Perfect day! 🎉');
                    }, 1500);
                }
            } else {
                utils.hapticFeedback('light');
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    }

    async handleDeleteTask(taskId) {
        try {
            await api.deleteTask(taskId);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.renderTasks();
            this.updateProgress();
            this.updateStats();
            utils.hapticFeedback('medium');
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    async handleToggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const isCompleted = habit.completions && habit.completions[today];

        try {
            let updated;
            if (isCompleted) {
                updated = await api.uncompleteHabit(habitId);
            } else {
                updated = await api.completeHabit(habitId);
            }
            
            const index = this.habits.findIndex(h => h.id === habitId);
            this.habits[index] = updated;
            
            this.renderHabits();
            this.updateStats();
            
            // Add premium animation
            if (!isCompleted) {
                const habitCard = document.querySelector(`[data-habit-id="${habitId}"]`);
                if (habitCard) {
                    this.animateHabitCompletion(habitCard);
                }
                utils.hapticFeedback('success');
                utils.showToast(`Great! ${updated.streak} day streak! 🔥`);
            } else {
                utils.hapticFeedback('light');
            }
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    }

    async handleAddHabit() {
        const input = document.getElementById('habitNameInput');
        const frequencySelect = document.getElementById('habitFrequency');
        const frequencyCountInput = document.getElementById('habitFrequencyCount');
        
        if (!input || !input.value.trim()) return;

        const frequency = frequencySelect?.value || 'daily';
        const frequencyCount = frequencyCountInput && frequency === 'custom' ? 
                              parseInt(frequencyCountInput.value) || 1 : 1;

        try {
            const habit = await api.createHabit({
                name: input.value.trim(),
                icon: this.selectedIcon,
                frequency: frequency,
                frequency_count: frequencyCount
            });
            
            this.habits.push(habit);
            this.renderHabits();
            this.hideAddHabitModal();
            input.value = '';
            if (frequencySelect) frequencySelect.value = 'daily';
            if (frequencyCountInput) {
                frequencyCountInput.value = '';
                frequencyCountInput.style.display = 'none';
            }
            this.selectedIcon = '✨';
            
            utils.hapticFeedback('light');
            utils.showToast('Habit added!');
        } catch (error) {
            console.error('Error adding habit:', error);
            utils.showToast('Error adding habit', 'error');
        }
    }

    async handleSetFocus() {
        const inputs = document.querySelectorAll('.focus-input');
        const items = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(item => item.length > 0);

        if (items.length === 0) {
            utils.showToast('Add at least one focus item', 'error');
            return;
        }

        try {
            const focusItems = await api.setFocusItems(items);
            this.focusItems = focusItems;
            this.renderFocus();
            utils.hapticFeedback('success');
            utils.showToast('Focus set for today!');
        } catch (error) {
            console.error('Error setting focus:', error);
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update navigation items
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Tab`);
        });

        if (tab === 'stats') {
            this.updateStats();
            this.updateInsights();
        } else if (tab === 'reflect') {
            this.loadReflections();
        } else if (tab === 'calendar') {
            this.renderCalendar();
        }
    }

    async renderCalendar() {
        const dateStr = this.currentDate.toISOString().split('T')[0];
        
        try {
            const data = await api.getCalendarView(this.calendarView, dateStr);
            const container = document.getElementById('calendarView');
            const title = document.getElementById('calendarTitle');
            
            if (!container || !title) return;

            // Update title
            if (this.calendarView === 'day') {
                title.textContent = this.formatCalendarTitle('day');
                container.innerHTML = this.renderDayView(data);
            } else if (this.calendarView === 'week') {
                title.textContent = this.formatCalendarTitle('week');
                container.innerHTML = this.renderWeekView(data);
            } else if (this.calendarView === 'month') {
                title.textContent = this.formatCalendarTitle('month');
                container.innerHTML = this.renderMonthView(data);
            }
        } catch (error) {
            console.error('Error rendering calendar:', error);
        }
    }

    formatCalendarTitle(view) {
        const date = this.currentDate;
        
        if (view === 'day') {
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString()) {
                return 'Tomorrow';
            } else if (date.toDateString() === new Date(today.setDate(today.getDate() - 2)).toDateString()) {
                return 'Yesterday';
            }
            return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        } else if (view === 'week') {
            const monday = new Date(date);
            monday.setDate(date.getDate() - date.getDay() + 1);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            
            return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    }

    renderDayView(data) {
        let html = '<div class="day-view">';
        
        // Tasks
        if (data.tasks && data.tasks.length > 0) {
            html += '<div class="day-section"><h3>Tasks</h3>';
            data.tasks.forEach(task => {
                html += `
                    <div class="calendar-task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                        <span>${task.completed ? '✓' : '○'}</span>
                        <div class="task-content">
                            <div>${this.escapeHtml(task.title)}</div>
                            ${task.due_time ? `<small>${utils.formatTime(task.due_time)}</small>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Habits
        if (data.habits && data.habits.length > 0) {
            html += '<div class="day-section"><h3>Habits</h3>';
            data.habits.forEach(habit => {
                html += `
                    <div class="calendar-habit-item ${habit.completed ? 'completed' : ''}" data-habit-id="${habit.id}">
                        <span>${habit.icon}</span>
                        <div>${this.escapeHtml(habit.name)}</div>
                        <span>${habit.completed ? '✓' : '○'}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Focus items
        if (data.focus_items && data.focus_items.length > 0) {
            html += '<div class="day-section"><h3>Focus</h3>';
            data.focus_items.forEach(item => {
                html += `
                    <div class="calendar-task-item ${item.completed ? 'completed' : ''}">
                        <span>🎯</span>
                        <div>${this.escapeHtml(item.text)}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (!data.tasks?.length && !data.habits?.length && !data.focus_items?.length) {
            html += '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">Nothing scheduled for this day</p>';
        }
        
        html += '</div>';
        return html;
    }

    renderWeekView(data) {
        let html = '<div class="week-view">';
        
        const today = new Date().toISOString().split('T')[0];
        
        data.days.forEach(day => {
            const isToday = day.date === today;
            html += `
                <div class="week-day ${isToday ? 'today' : ''}" data-date="${day.date}">
                    <div class="week-day-header">${day.day_name.substring(0, 3)}</div>
                    <div class="week-task-count">📋 ${day.task_count} tasks</div>
                    <div class="week-habit-count">🔥 ${day.habit_count} habits</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    renderMonthView(data) {
        let html = '<div class="month-view">';
        
        const today = new Date().toISOString().split('T')[0];
        
        data.days.forEach(day => {
            const isToday = day.date === today;
            const dots = Math.min(day.task_count + day.habit_completions, 5);
            
            html += `
                <div class="month-day ${isToday ? 'today' : ''}" data-date="${day.date}">
                    <div class="month-day-number">${day.day}</div>
                    <div class="month-day-dots">
                        ${Array(dots).fill('<div class="dot"></div>').join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    navigateCalendar(direction) {
        const days = this.calendarView === 'day' ? 1 : this.calendarView === 'week' ? 7 : 30;
        
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + (days * direction));
        this.currentDate = newDate;
        
        this.renderCalendar();
    }

    // Bottom Sheet for Calendar Day View
    setupBottomSheet() {
        const overlay = document.getElementById('bottomSheetOverlay');
        const sheet = document.getElementById('bottomSheet');
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeBottomSheet();
            });
        }

        // Add click handlers to calendar days
        document.addEventListener('click', (e) => {
            const monthDay = e.target.closest('.month-day');
            const weekDay = e.target.closest('.week-day');
            
            if (monthDay) {
                const date = monthDay.dataset.date;
                this.openDayDetails(date);
            } else if (weekDay) {
                const date = weekDay.dataset.date;
                this.openDayDetails(date);
            }
        });
    }

    async openDayDetails(dateString) {
        try {
            const data = await api.getCalendarView('day', dateString);
            const overlay = document.getElementById('bottomSheetOverlay');
            const sheet = document.getElementById('bottomSheet');
            const title = document.getElementById('bottomSheetTitle');
            const subtitle = document.getElementById('bottomSheetSubtitle');
            const content = document.getElementById('bottomSheetContent');
            
            if (!sheet || !overlay) return;

            // Format date nicely
            const date = new Date(dateString);
            title.textContent = utils.formatDate(dateString);
            subtitle.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            
            // Render content
            content.innerHTML = this.renderDayDetailsContent(data);
            
            // Show bottom sheet
            overlay.classList.add('active');
            sheet.classList.add('active');
            
            utils.hapticFeedback('light');
        } catch (error) {
            console.error('Error opening day details:', error);
        }
    }

    renderDayDetailsContent(data) {
        let html = '';
        
        // Tasks
        if (data.tasks && data.tasks.length > 0) {
            html += '<div class="day-details-section"><h4 style="margin-bottom: 1rem; font-weight: 600;">Tasks</h4>';
            data.tasks.forEach(task => {
                html += `
                    <div class="card card-interactive" style="padding: 1rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 1.25rem;">${task.completed ? '✓' : '○'}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(task.title)}</div>
                                ${task.due_time ? `<div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${utils.formatTime(task.due_time)}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Habits
        if (data.habits && data.habits.length > 0) {
            html += '<div class="day-details-section" style="margin-top: 1.5rem;"><h4 style="margin-bottom: 1rem; font-weight: 600;">Habits</h4>';
            data.habits.forEach(habit => {
                html += `
                    <div class="card card-interactive" style="padding: 1rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 1.25rem;">${habit.completed ? '✓' : '○'}</span>
                            <div style="flex: 1; font-weight: 500;">${this.escapeHtml(habit.name)}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Focus items
        if (data.focus_items && data.focus_items.length > 0) {
            html += '<div class="day-details-section" style="margin-top: 1.5rem;"><h4 style="margin-bottom: 1rem; font-weight: 600;">Focus</h4>';
            data.focus_items.forEach(item => {
                html += `
                    <div class="card" style="padding: 1rem; margin-bottom: 0.75rem; ${item.completed ? 'opacity: 0.6;' : ''}">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span>🎯</span>
                            <div style="flex: 1; ${item.completed ? 'text-decoration: line-through;' : ''}">${this.escapeHtml(item.text)}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (!data.tasks?.length && !data.habits?.length && !data.focus_items?.length) {
            html = `
                <div class="empty-state">
                    <div class="empty-state-illustration">
                        <span style="font-size: 4rem; opacity: 0.5;">📅</span>
                    </div>
                    <h3>Nothing scheduled</h3>
                    <p>This day is wide open. Add tasks or habits to fill it up!</p>
                </div>
            `;
        }
        
        return html;
    }

    closeBottomSheet() {
        const overlay = document.getElementById('bottomSheetOverlay');
        const sheet = document.getElementById('bottomSheet');
        
        if (overlay) overlay.classList.remove('active');
        if (sheet) sheet.classList.remove('active');
    }

    // Premium Completion Animations
    animateTaskCompletion(taskElement) {
        // Add glow effect
        taskElement.classList.add('completed-glow');
        
        // Checkmark pop animation
        const checkbox = taskElement.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.classList.add('completed-check');
        }
        
        // Remove animation classes after completion
        setTimeout(() => {
            taskElement.classList.remove('completed-glow');
            if (checkbox) checkbox.classList.remove('completed-check');
        }, 600);
    }

    animateHabitCompletion(habitCard) {
        // Create splash effect
        const splash = document.createElement('div');
        splash.className = 'splash-effect';
        habitCard.style.position = 'relative';
        habitCard.appendChild(splash);
        
        // Remove splash after animation
        setTimeout(() => {
            splash.remove();
        }, 600);
        
        // Animate icon container
        const iconContainer = habitCard.querySelector('.habit-icon-container');
        if (iconContainer) {
            iconContainer.style.animation = 'checkPop 0.4s var(--ease-spring)';
            setTimeout(() => {
                iconContainer.style.animation = '';
            }, 400);
        }
    }

    async handleSaveReflection() {
        const wentWell = document.getElementById('wentWell')?.value.trim();
        const grateful = document.getElementById('grateful')?.value.trim();

        if (!wentWell && !grateful) {
            utils.showToast('Add at least one reflection', 'error');
            return;
        }

        try {
            await api.saveReflection({
                what_went_well: wentWell,
                grateful_for: grateful,
                energy_level: this.selectedEnergy
            });

            // Clear form
            if (document.getElementById('wentWell')) document.getElementById('wentWell').value = '';
            if (document.getElementById('grateful')) document.getElementById('grateful').value = '';
            
            // Reset energy
            document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
            document.querySelector('.energy-btn[data-level="3"]')?.classList.add('selected');
            this.selectedEnergy = 3;

            utils.showToast('Reflection saved! 🌟');
            utils.hapticFeedback('success');
            this.loadReflections();
        } catch (error) {
            console.error('Error saving reflection:', error);
            utils.showToast('Error saving reflection', 'error');
        }
    }

    async loadReflections() {
        try {
            const reflections = await api.getReflections();
            const container = document.getElementById('reflectionsList');
            if (!container) return;

            const dates = Object.keys(reflections).sort().reverse();
            
            if (dates.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No reflections yet. Start your first one above!</p>';
                return;
            }

            container.innerHTML = '';
            dates.forEach(date => {
                const reflection = reflections[date];
                const itemEl = document.createElement('div');
                itemEl.className = 'reflection-item';
                
                const energyEmojis = ['😴', '😐', '🙂', '😊', '🚀'];
                const energyEmoji = energyEmojis[reflection.energy_level - 1] || '🙂';

                itemEl.innerHTML = `
                    <div class="reflection-date">${utils.formatDate(date)}</div>
                    ${reflection.what_went_well ? `<div class="reflection-text"><strong>What went well:</strong> ${this.escapeHtml(reflection.what_went_well)}</div>` : ''}
                    ${reflection.grateful_for ? `<div class="reflection-text"><strong>Grateful for:</strong> ${this.escapeHtml(reflection.grateful_for)}</div>` : ''}
                    <div class="reflection-energy">Energy: ${energyEmoji}</div>
                `;
                
                container.appendChild(itemEl);
            });
        } catch (error) {
            console.error('Error loading reflections:', error);
        }
    }

    async handleShowWeeklyReview() {
        try {
            const review = await api.getWeeklyReview();
            const container = document.getElementById('weeklyReviewContent');
            if (!container) return;

            container.innerHTML = `
                <div class="weekly-review-content">
                    <div class="review-stat">
                        <span class="review-stat-label">Tasks Completed</span>
                        <span class="review-stat-value">${review.tasks_completed}</span>
                    </div>
                    <div class="review-stat">
                        <span class="review-stat-label">Habits Completed</span>
                        <span class="review-stat-value">${review.habits_completed}</span>
                    </div>
                    <div class="review-stat">
                        <span class="review-stat-label">Longest Streak</span>
                        <span class="review-stat-value">${review.longest_streak} days 🔥</span>
                    </div>
                    <div class="review-stat">
                        <span class="review-stat-label">Perfect Days</span>
                        <span class="review-stat-value">${review.perfect_days}</span>
                    </div>
                    <div class="review-motivation">${this.escapeHtml(review.motivation_message)}</div>
                </div>
            `;

            utils.hapticFeedback('light');
        } catch (error) {
            console.error('Error loading weekly review:', error);
        }
    }

    async handleSnoozeTask(taskId) {
        try {
            const task = await api.snoozeTask(taskId, 1);
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks[index] = task;
            }
            this.renderTasks();
            utils.showToast('Task snoozed to tomorrow');
            utils.hapticFeedback('light');
        } catch (error) {
            console.error('Error snoozing task:', error);
            utils.showToast('Error snoozing task', 'error');
        }
    }

    render() {
        this.renderTasks();
        this.renderHabits();
        this.renderFocus();
        this.updateProgress();
        this.updateHeaderStats();
    }

    renderTasks() {
        const container = document.getElementById('tasksList');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(t => 
            !t.due_date || t.due_date <= today
        ).sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return (b.id || 0) - (a.id || 0);
        });

        container.innerHTML = '';

        if (todayTasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No tasks for today. Add one above! ✨</p>';
            return;
        }

        todayTasks.forEach(task => {
            const taskEl = this.createTaskElement(task);
            container.appendChild(taskEl);
        });

        // Re-setup swipe gestures
        this.setupSwipeGestures();
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        const priorityClass = task.priority !== 'normal' ? `priority-${task.priority}` : '';
        taskEl.className = `task-item-calm ${task.completed ? 'completed' : ''} ${priorityClass}`;
        taskEl.dataset.taskId = task.id;

        const meta = [];
        if (task.due_date) {
            meta.push(utils.formatDate(task.due_date));
        }
        if (task.due_time) {
            meta.push(utils.formatTime(task.due_time));
        }
        if (task.category) {
            const categoryIcons = {
                'work': '💼',
                'study': '📚',
                'personal': '🏠',
                'health': '💪',
                'errands': '🛒',
                'wellness': '🍃'
            };
            meta.push(`${categoryIcons[task.category] || ''} ${task.category}`);
        }
        if (task.postponed_count > 0) {
            meta.push(`⏰ ${task.postponed_count}x`);
        }

        // Priority indicator
        const priorityHTML = task.priority !== 'normal' ? `
            <span class="priority-indicator priority-${task.priority}">
                <span class="priority-icon">${task.priority === 'high' ? '▲' : task.priority === 'medium' ? '●' : '▽'}</span>
                ${task.priority}
            </span>
        ` : '';

        taskEl.innerHTML = `
            <div class="checkbox-calm ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                <span class="icon icon-xs">${task.completed ? FlowIcons.check : ''}</span>
            </div>
            <div class="task-content" style="flex: 1;">
                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
                    <div class="task-title" style="flex: 1;">${this.escapeHtml(task.title)}</div>
                    ${priorityHTML}
                </div>
                ${task.description ? `<div style="font-size: 0.875rem; color: var(--calm-text-2); margin-bottom: var(--space-xs);">${this.escapeHtml(task.description)}</div>` : ''}
                ${meta.length > 0 ? `<div class="task-meta">${meta.join(' • ')}</div>` : ''}
                ${task.subtasks && task.subtasks.length > 0 ? `
                    <div class="task-subtasks">
                        ${task.subtasks.map(st => `
                            <div class="subtask ${st.completed ? 'completed' : ''}">
                                <span>${st.completed ? '✓' : '○'}</span> ${this.escapeHtml(st.text)}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            ${!task.completed ? `
                <div class="task-actions">
                    <button class="task-action-btn edit" data-task-id="${task.id}" title="Edit task">
                        <span class="icon icon-xs">${FlowIcons.edit}</span>
                    </button>
                    <button class="task-action-btn snooze" data-task-id="${task.id}" title="Snooze">
                        <span class="icon icon-xs">${FlowIcons.snooze}</span>
                    </button>
                    <button class="task-action-btn reschedule" data-task-id="${task.id}" title="Reschedule">
                        <span class="icon icon-xs">${FlowIcons.reschedule}</span>
                    </button>
                    <button class="task-action-btn breakdown" data-task-id="${task.id}" title="Breakdown">
                        <span class="icon icon-xs">${FlowIcons.breakdown}</span>
                    </button>
                </div>
            ` : ''}
        `;

        taskEl.querySelector('.checkbox-calm').addEventListener('click', () => {
            this.handleToggleTask(task.id);
        });

        const editBtn = taskEl.querySelector('.task-action-btn.edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openTaskEditor(task.id);
            });
        }

        const snoozeBtn = taskEl.querySelector('.task-action-btn.snooze');
        if (snoozeBtn) {
            snoozeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSnoozeTask(task.id);
            });
        }

        const rescheduleBtn = taskEl.querySelector('.task-action-btn.reschedule');
        if (rescheduleBtn) {
            rescheduleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showRescheduleModal(task.id);
            });
        }

        const breakdownBtn = taskEl.querySelector('.task-action-btn.breakdown');
        if (breakdownBtn) {
            breakdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showBreakdownModal(task.id);
            });
        }

        return taskEl;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.flowApp = new FlowApp();
});

    renderHabits() {
        const container = document.getElementById('habitsGrid');
        if (!container) return;

        container.innerHTML = '';

        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-illustration">
                        <span class="icon icon-xl" style="opacity: 0.5;">${FlowIcons.habits}</span>
                    </div>
                    <h3>No habits yet</h3>
                    <p>Start building consistency. Add your first habit!</p>
                    <button class="empty-state-action" onclick="document.getElementById('addHabitBtn').click()">
                        <span class="icon icon-sm">${FlowIcons.plus}</span>
                        <span>Add Habit</span>
                    </button>
                </div>
            `;
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        this.habits.forEach(habit => {
            const isCompleted = habit.completions && habit.completions[today];
            const habitEl = document.createElement('div');
            
            // Determine habit category for color
            const habitType = this.getHabitType(habit.name);
            habitEl.className = `habit-card-premium habit-${habitType} ${isCompleted ? 'completed' : ''}`;
            habitEl.dataset.habitId = habit.id;

            // Calculate weekly completion
            const weekDates = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                weekDates.push(date.toISOString().split('T')[0]);
            }
            const weekCompletions = weekDates.filter(date => habit.completions && habit.completions[date]).length;
            const completionPercent = Math.round((weekCompletions / 7) * 100);

            const frequencyText = habit.frequency === 'daily' ? 'Daily' : 
                                habit.frequency === 'weekly' ? 'Weekly' :
                                `${habit.frequency_count || 1}x/week`;

            // Get appropriate icon
            const iconHTML = this.getHabitIcon(habit.name, habit.icon);

            habitEl.innerHTML = `
                <div class="habit-icon-container">
                    <span class="icon">${iconHTML}</span>
                </div>
                <div class="habit-name" style="font-weight: 600; margin-bottom: 0.25rem;">${this.escapeHtml(habit.name)}</div>
                <div class="habit-frequency" style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${frequencyText}</div>
                <div class="habit-streak" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                    <span class="icon icon-xs" style="color: #f59e0b;">${FlowIcons.flame}</span>
                    <span style="font-weight: 600;">${habit.streak} days</span>
                </div>
                <div class="habit-progress" style="height: 6px; background: var(--border-color); border-radius: var(--radius-pill); margin-top: 0.75rem; overflow: hidden;">
                    <div class="habit-progress-fill" style="height: 100%; background: var(--habit-color); width: ${completionPercent}%; transition: width 0.3s var(--ease-smooth);"></div>
                </div>
                <button class="habit-insights-btn" data-habit-id="${habit.id}" title="View insights">
                    <span class="icon icon-xs">${FlowIcons.insights}</span>
                </button>
            `;

            habitEl.querySelector('.habit-insights-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showHabitInsights(habit.id);
            });

            habitEl.addEventListener('click', () => {
                this.handleToggleHabit(habit.id);
            });

            // Load and display habit strength
            this.loadHabitStrength(habit.id, habitEl);

            container.appendChild(habitEl);
        });
    }

    async loadHabitStrength(habitId, habitElement) {
        try {
            const strength = await api.getHabitStrength(habitId);
            
            // Add strength bar if not exists
            if (!habitElement.querySelector('.habit-strength-bar')) {
                const strengthContainer = document.createElement('div');
                strengthContainer.style.marginTop = '0.75rem';
                
                strengthContainer.innerHTML = `
                    <div class="habit-strength-bar">
                        <div class="habit-strength-fill strength-${strength.level.toLowerCase()}" 
                             style="width: ${strength.score}%"></div>
                    </div>
                    <div class="habit-strength-label" style="color: ${strength.color}">
                        ${strength.level}
                    </div>
                `;
                
                habitElement.appendChild(strengthContainer);
            }
        } catch (error) {
            // Silently fail
        }
    }

    getHabitType(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('water') || lowerName.includes('drink')) return 'water';
        if (lowerName.includes('read') || lowerName.includes('book')) return 'book';
        if (lowerName.includes('exercise') || lowerName.includes('workout') || lowerName.includes('run')) return 'exercise';
        if (lowerName.includes('meditat') || lowerName.includes('yoga')) return 'meditation';
        if (lowerName.includes('write') || lowerName.includes('journal')) return 'write';
        return 'default';
    }

    getHabitIcon(name, fallbackIcon) {
        const type = this.getHabitType(name);
        const iconMap = {
            water: FlowIcons.water,
            book: FlowIcons.book,
            exercise: FlowIcons.exercise,
            meditation: FlowIcons.meditation,
            write: FlowIcons.write,
            default: FlowIcons.sparkles
        };
        return iconMap[type] || iconMap.default;
    }

    renderFocus() {
        const previewContainer = document.getElementById('focusItemsMini');
        const focusContainer = document.getElementById('currentFocus');

        // Render preview
        if (previewContainer) {
            if (this.focusItems.length === 0) {
                previewContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">No focus items set for today</p>';
            } else {
                previewContainer.innerHTML = '';
                this.focusItems.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = `focus-item-mini ${item.completed ? 'completed' : ''}`;
                    itemEl.innerHTML = `
                        <span>${item.completed ? '✓' : '○'}</span>
                        <span>${this.escapeHtml(item.text)}</span>
                    `;
                    itemEl.addEventListener('click', () => {
                        this.handleToggleFocusItem(item.id);
                    });
                    previewContainer.appendChild(itemEl);
                });
            }
        }

        // Render focus tab
        if (focusContainer) {
            if (this.focusItems.length === 0) {
                focusContainer.innerHTML = '';
            } else {
                focusContainer.innerHTML = '<h3 style="margin-bottom: 1rem;">Current Focus</h3>';
                this.focusItems.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = `focus-item-large ${item.completed ? 'completed' : ''}`;
                    itemEl.innerHTML = `
                        <span>${item.completed ? '✓' : '○'}</span>
                        <span>${this.escapeHtml(item.text)}</span>
                    `;
                    itemEl.addEventListener('click', () => {
                        this.handleToggleFocusItem(item.id);
                    });
                    focusContainer.appendChild(itemEl);
                });
            }
        }
    }

    async handleToggleFocusItem(focusId) {
        try {
            await api.completeFocusItem(focusId);
            const item = this.focusItems.find(f => f.id === focusId);
            if (item) {
                item.completed = !item.completed;
                this.renderFocus();
                utils.hapticFeedback('light');
            }
        } catch (error) {
            console.error('Error toggling focus item:', error);
        }
    }

    updateProgress() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(t => 
            !t.due_date || t.due_date <= today
        );
        const percent = utils.calculateCompletion(todayTasks);
        
        const fill = document.getElementById('progressFill');
        const text = document.getElementById('progressText');
        
        if (fill) fill.style.width = percent + '%';
        if (text) text.textContent = percent + '%';
    }

    updateHeaderStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(t => 
            !t.due_date || t.due_date <= today
        );
        const todayHabits = this.habits.filter(h => 
            h.completions && h.completions[today]
        );

        const tasksCount = document.getElementById('tasksCount');
        const habitsCount = document.getElementById('habitsCount');
        
        if (tasksCount) tasksCount.textContent = `${todayTasks.length} tasks`;
        if (habitsCount) habitsCount.textContent = `${todayHabits.length} habits`;
    }

    async updateStats() {
        try {
            const stats = await api.getStats();
            
            document.getElementById('tasksCompleted').textContent = stats.total_tasks_completed || 0;
            document.getElementById('longestStreak').textContent = stats.longest_streak || 0;
            document.getElementById('perfectDays').textContent = stats.perfect_days || 0;

            // Render heatmap
            const heatmap = document.getElementById('heatmapGrid');
            if (heatmap && stats.weekly_completion) {
                heatmap.innerHTML = '';
                stats.weekly_completion.forEach(day => {
                    const dayEl = document.createElement('div');
                    dayEl.className = `heatmap-day level-${Math.min(Math.floor(day.total / 2), 4)}`;
                    dayEl.textContent = new Date(day.date).getDate();
                    dayEl.title = `${day.tasks} tasks, ${day.habits} habits on ${utils.formatDate(day.date)}`;
                    heatmap.appendChild(dayEl);
                });
            }

            // Load productivity analytics
            await this.loadProductivityAnalytics();
            
            // Load mood patterns
            await this.loadMoodPatterns();
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    async loadProductivityAnalytics() {
        try {
            const analytics = await api.getProductivityAnalytics();
            const container = document.getElementById('analyticsContent');
            const scoreCircle = document.getElementById('scoreCircle');
            const scoreText = document.getElementById('scoreText');
            
            if (!container) return;
            
            // Update productivity score circle
            if (scoreText) {
                scoreText.textContent = analytics.productivity_score || 0;
            }
            if (scoreCircle) {
                const circumference = 283;
                const progress = ((analytics.productivity_score || 0) / 100) * circumference;
                scoreCircle.style.strokeDashoffset = circumference - progress;
                scoreCircle.style.transition = 'stroke-dashoffset 1s ease';
            }
            
            // Render analytics
            let html = '';
            
            if (analytics.best_hours && analytics.best_hours.length > 0) {
                html += '<div class="analytics-metric">';
                html += '<div class="analytics-label">Your most productive hours</div>';
                html += '<div class="best-hours-list">';
                analytics.best_hours.forEach(h => {
                    html += `<span class="hour-badge">${h.hour}:00</span>`;
                });
                html += '</div></div>';
            }
            
            html += `
                <div class="analytics-metric">
                    <div class="analytics-label">Completion Rate</div>
                    <div class="analytics-value">${analytics.completion_rate || 0}%</div>
                </div>
                <div class="analytics-metric">
                    <div class="analytics-label">Avg. Days to Complete</div>
                    <div class="analytics-value">${analytics.avg_completion_days || 0} days</div>
                </div>
            `;
            
            // Habit consistency
            if (analytics.habit_consistency && analytics.habit_consistency.length > 0) {
                html += '<div style="margin-top: 1rem;"><strong>Habit Consistency:</strong></div>';
                analytics.habit_consistency.forEach(habit => {
                    html += `
                        <div class="analytics-metric">
                            <div class="analytics-label">${this.escapeHtml(habit.name)}</div>
                            <div class="analytics-value">${habit.consistency}% (${habit.streak}d streak)</div>
                        </div>
                    `;
                });
            }
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    async loadMoodPatterns() {
        try {
            const patterns = await api.getMoodPatterns();
            const container = document.getElementById('moodPatternsContent');
            
            if (!container) return;
            
            if (!patterns.patterns || patterns.patterns.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary);">Track your mood daily to see patterns!</p>';
                return;
            }
            
            let html = '';
            
            if (patterns.average_mood) {
                const moodEmojis = ['😢', '😐', '🙂', '😊', '🚀'];
                const moodIndex = Math.round(patterns.average_mood) - 1;
                html += `
                    <div class="analytics-metric">
                        <div class="analytics-label">Average Mood (30 days)</div>
                        <div class="analytics-value">${moodEmojis[moodIndex] || '🙂'} ${patterns.average_mood}</div>
                    </div>
                `;
            }
            
            if (patterns.insight) {
                html += `
                    <div class="insight-card" style="margin-top: 1rem;">
                        <div class="insight-icon">💭</div>
                        <div class="insight-message">${this.escapeHtml(patterns.insight)}</div>
                    </div>
                `;
            }
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading mood patterns:', error);
        }
    }

    setupSwipeGestures() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            item.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            });

            item.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX - startX;
                
                if (Math.abs(currentX) > 10) {
                    item.style.transform = `translateX(${currentX}px)`;
                    item.classList.add('swiping');
                    
                    if (currentX > 50) {
                        item.classList.add('swipe-right');
                        item.classList.remove('swipe-left');
                    } else if (currentX < -50) {
                        item.classList.add('swipe-left');
                        item.classList.remove('swipe-right');
                    } else {
                        item.classList.remove('swipe-right', 'swipe-left');
                    }
                }
            });

            item.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                
                const taskId = parseInt(item.dataset.taskId);
                
                if (currentX > 100) {
                    // Swipe right - complete
                    this.handleToggleTask(taskId);
                } else if (currentX < -100) {
                    // Swipe left - delete
                    if (confirm('Delete this task?')) {
                        this.handleDeleteTask(taskId);
                    }
                }
                
                item.style.transform = '';
                item.classList.remove('swiping', 'swipe-right', 'swipe-left');
                currentX = 0;
            });
        });
    }

    showAddHabitModal() {
        document.getElementById('addHabitModal').classList.add('active');
    }

    hideAddHabitModal() {
        document.getElementById('addHabitModal').classList.remove('active');
    }

    isAllTasksCompleted() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(t => 
            !t.due_date || t.due_date <= today
        );
        return todayTasks.length > 0 && todayTasks.every(t => t.completed);
    }

    // Smart Rescheduling
    async showRescheduleModal(taskId) {
        this.selectedTaskId = taskId;
        const modal = document.getElementById('rescheduleModal');
        if (!modal) return;

        try {
            const data = await api.getRescheduleSuggestions(taskId);
            const container = document.getElementById('rescheduleSuggestions');
            
            if (container) {
                container.innerHTML = '';
                data.suggestions.forEach(suggestion => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.innerHTML = `
                        <div class="suggestion-label">${suggestion.label}</div>
                        <div class="suggestion-reason">${suggestion.reason}</div>
                    `;
                    item.addEventListener('click', () => {
                        this.handleQuickReschedule(suggestion.date, suggestion.time);
                    });
                    container.appendChild(item);
                });
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error('Error showing reschedule modal:', error);
        }
    }

    async handleQuickReschedule(date, time) {
        try {
            await api.rescheduleTask(this.selectedTaskId, date, time);
            await this.loadData();
            this.hideRescheduleModal();
            utils.showToast('Task rescheduled successfully');
        } catch (error) {
            console.error('Error rescheduling task:', error);
            utils.showToast('Error rescheduling task', 'error');
        }
    }

    async handleManualReschedule() {
        const dateInput = document.getElementById('manualDate');
        const timeInput = document.getElementById('manualTime');
        
        if (!dateInput?.value) {
            utils.showToast('Please select a date', 'error');
            return;
        }
        
        try {
            await api.rescheduleTask(this.selectedTaskId, dateInput.value, timeInput?.value || null);
            await this.loadData();
            this.hideRescheduleModal();
            utils.showToast('Task rescheduled successfully');
        } catch (error) {
            console.error('Error rescheduling task:', error);
            utils.showToast('Error rescheduling task', 'error');
        }
    }

    hideRescheduleModal() {
        document.getElementById('rescheduleModal')?.classList.remove('active');
    }

    // Task Breakdown
    async showBreakdownModal(taskId) {
        this.selectedTaskId = taskId;
        const modal = document.getElementById('breakdownModal');
        if (!modal) return;

        try {
            const data = await api.getBreakdownSuggestions(taskId);
            const container = document.getElementById('breakdownSuggestions');
            
            if (container) {
                container.innerHTML = '';
                data.suggestions.forEach((suggestion, i) => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.innerHTML = `${i + 1}. ${this.escapeHtml(suggestion)}`;
                    container.appendChild(item);
                });
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error('Error showing breakdown modal:', error);
        }
    }

    useBreakdownSuggestions() {
        const suggestions = document.querySelectorAll('#breakdownSuggestions .suggestion-item');
        const inputs = document.querySelectorAll('.subtask-input');
        
        suggestions.forEach((sugg, i) => {
            if (inputs[i]) {
                inputs[i].value = sugg.textContent;
            }
        });
    }

    addSubtaskInput() {
        const container = document.getElementById('customSubtasks');
        if (!container) return;
        
        const count = container.querySelectorAll('.subtask-input').length + 1;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-field subtask-input';
        input.placeholder = `Subtask ${count}`;
        container.appendChild(input);
    }

    async handleSaveBreakdown() {
        const inputs = document.querySelectorAll('.subtask-input');
        const subtasks = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(text => text.length > 0);
        
        if (subtasks.length === 0) {
            utils.showToast('Add at least one subtask', 'error');
            return;
        }
        
        try {
            await api.createTaskBreakdown(this.selectedTaskId, subtasks);
            await this.loadData();
            this.hideBreakdownModal();
            utils.showToast('Task breakdown created!');
        } catch (error) {
            console.error('Error saving breakdown:', error);
            utils.showToast('Error saving breakdown', 'error');
        }
    }

    hideBreakdownModal() {
        document.getElementById('breakdownModal')?.classList.remove('active');
        // Reset inputs
        document.querySelectorAll('.subtask-input').forEach(input => input.value = '');
    }

    // Habit Insights
    async showHabitInsights(habitId) {
        this.selectedHabitId = habitId;
        const modal = document.getElementById('habitInsightsModal');
        if (!modal) return;

        try {
            const insights = await api.getHabitInsights(habitId);
            const container = document.getElementById('habitInsightsContent');
            
            if (container) {
                container.innerHTML = this.renderHabitInsights(insights);
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error('Error showing habit insights:', error);
        }
    }

    renderHabitInsights(insights) {
        if (insights.message) {
            return `<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${insights.message}</p>`;
        }

        let html = '<div class="insights-grid">';
        
        html += `
            <div class="insight-stat-card">
                <div class="insight-stat-value">${insights.total_completions}</div>
                <div class="insight-stat-label">Total Completions</div>
            </div>
            <div class="insight-stat-card">
                <div class="insight-stat-value">${insights.current_streak}</div>
                <div class="insight-stat-label">Current Streak</div>
            </div>
            <div class="insight-stat-card">
                <div class="insight-stat-value">${insights.longest_streak}</div>
                <div class="insight-stat-label">Longest Streak</div>
            </div>
            <div class="insight-stat-card">
                <div class="insight-stat-value">${insights.recent_percentage}%</div>
                <div class="insight-stat-label">Last 7 Days</div>
            </div>
        `;
        
        html += '</div>';
        
        // Insights messages
        if (insights.insights && insights.insights.length > 0) {
            insights.insights.forEach(insight => {
                const icon = insight.type === 'success' ? '🎉' : insight.type === 'celebration' ? '🔥' : insight.type === 'pattern' ? '📊' : '💪';
                html += `
                    <div class="insight-card ${insight.type}">
                        <div class="insight-icon">${icon}</div>
                        <div class="insight-message">${this.escapeHtml(insight.message)}</div>
                    </div>
                `;
            });
        }
        
        // Weekday breakdown
        if (insights.weekday_breakdown) {
            html += '<div class="weekday-chart"><h4>Completion by Day of Week</h4>';
            
            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const maxCount = Math.max(...Object.values(insights.weekday_breakdown));
            
            weekdays.forEach(day => {
                const count = insights.weekday_breakdown[day] || 0;
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                html += `
                    <div class="weekday-bar">
                        <div class="weekday-name">${day}</div>
                        <div class="weekday-bar-fill">
                            <div class="weekday-bar-inner" style="width: ${percentage}%"></div>
                        </div>
                        <div class="weekday-count">${count}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        return html;
    }

    hideInsightsModal() {
        document.getElementById('habitInsightsModal')?.classList.remove('active');
    }

    showPerfectDayAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'perfect-day-overlay';
        overlay.innerHTML = `
            <div class="perfect-day-message">
                Perfect Day!<br>
                You're on fire! 🔥
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 3000);
    }

    // Task Editor (Notion-Style)
    openTaskEditor(taskId = null) {
        const overlay = document.getElementById('taskEditorOverlay');
        const sheet = document.getElementById('taskEditorSheet');
        const title = document.getElementById('taskEditorTitle');
        
        if (!overlay || !sheet) return;
        
        this.editingTaskId = taskId;
        
        if (taskId) {
            // Edit existing task
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Edit Task';
                document.getElementById('editorTitle').value = task.title || '';
                document.getElementById('editorDescription').value = task.description || '';
                document.getElementById('editorDate').value = task.due_date || '';
                document.getElementById('editorTime').value = task.due_time || '';
                document.getElementById('editorDuration').value = task.duration || 30;
                
                this.selectedPriority = task.priority || 'normal';
                this.selectedCategory = task.category || '';
                
                // Select priority button
                document.querySelectorAll('.priority-btn').forEach(btn => {
                    btn.classList.toggle('selected', btn.dataset.priority === this.selectedPriority);
                });
                
                // Select category
                document.querySelectorAll('.category-tag').forEach(tag => {
                    tag.classList.toggle('selected', tag.dataset.category === this.selectedCategory);
                });
            }
        } else {
            // New task
            title.textContent = 'New Task';
            this.clearTaskEditor();
        }
        
        // Initialize priority icons
        const priorityBtns = document.querySelectorAll('.priority-btn');
        priorityBtns[0].querySelector('.icon').innerHTML = FlowIcons.priorityHigh;
        priorityBtns[1].querySelector('.icon').innerHTML = FlowIcons.priorityMedium;
        priorityBtns[2].querySelector('.icon').innerHTML = FlowIcons.priorityLow;
        
        // Initialize close icon
        document.querySelector('.task-editor-close .icon').innerHTML = FlowIcons.close;
        
        overlay.classList.add('active');
        sheet.classList.add('active');
        
        utils.hapticFeedback('light');
    }

    closeTaskEditor() {
        const overlay = document.getElementById('taskEditorOverlay');
        const sheet = document.getElementById('taskEditorSheet');
        
        if (overlay) overlay.classList.remove('active');
        if (sheet) sheet.classList.remove('active');
        
        this.editingTaskId = null;
    }

    clearTaskEditor() {
        document.getElementById('editorTitle').value = '';
        document.getElementById('editorDescription').value = '';
        document.getElementById('editorDate').value = '';
        document.getElementById('editorTime').value = '';
        document.getElementById('editorDuration').value = '30';
        
        document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.category-tag').forEach(tag => tag.classList.remove('selected'));
        
        this.selectedPriority = 'normal';
        this.selectedCategory = '';
    }

    async handleSaveTaskEdit() {
        const title = document.getElementById('editorTitle').value.trim();
        
        if (!title) {
            utils.showToast('Please enter a task title', 'error');
            return;
        }
        
        const taskData = {
            title: title,
            description: document.getElementById('editorDescription').value.trim(),
            due_date: document.getElementById('editorDate').value || null,
            due_time: document.getElementById('editorTime').value || null,
            duration: parseInt(document.getElementById('editorDuration').value) || 30,
            priority: this.selectedPriority,
            category: this.selectedCategory
        };
        
        try {
            if (this.editingTaskId) {
                // Update existing task
                await api.updateTask(this.editingTaskId, taskData);
                utils.showToast('Task updated!');
            } else {
                // Create new task
                await api.createTask(taskData);
                utils.showToast('Task created!');
            }
            
            await this.loadData();
            this.closeTaskEditor();
            utils.hapticFeedback('success');
        } catch (error) {
            console.error('Error saving task:', error);
            utils.showToast('Error saving task', 'error');
        }
    }

    async applyCalmTheme(theme) {
        try {
            // Remove all theme classes
            document.body.classList.remove('theme-morning-sky', 'theme-mint-garden', 'theme-warm-sand');
            
            // Add selected theme
            document.body.classList.add(`theme-${theme}`);
            
            // Save to settings
            await api.updateSettings({ theme_color: theme });
            
            // Update selected state
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.theme === theme);
            });
            
            utils.showToast('Theme updated!');
            utils.hapticFeedback('light');
        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.flowApp = new FlowApp();
});


