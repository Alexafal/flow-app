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
        this.selectedIcon = '💧';
        this.selectedEnergy = 3;
        this.calendarView = 'day';
        this.currentDate = new Date();
        this.currentBottomSheetDate = null;
        this.selectedTaskId = null;
        this.selectedHabitId = null;
        this.settings = {};
        this.editingTaskId = null;
        this.editingHabitId = null;
        this.selectedPriority = 'normal';
        this.selectedCategory = '';
        
        console.log('🚀 FlowApp initialized');
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
        // Initialize app logo
        const logoIcon = document.getElementById('app-logo-icon');
        if (logoIcon) {
            logoIcon.innerHTML = FlowIcons.logoMark;
        }
        
        // Initialize navigation icons
        const iconMappings = {
            'icon-today': 'tasks',
            'icon-calendar': 'calendar',
            'icon-habits': 'habits',
            'icon-focus': 'focus',
            'icon-stats': 'stats',
            'icon-reflect': 'reflect',
            'icon-alltasks': 'list'
        };

        Object.entries(iconMappings).forEach(([id, iconName]) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = FlowIcons[iconName];
            }
        });
        
        // Initialize mood icons
        const moodIcons = {
            'mood-icon-1': 'moodVeryLow',
            'mood-icon-2': 'moodLow',
            'mood-icon-3': 'moodNeutral',
            'mood-icon-4': 'moodGood',
            'mood-icon-5': 'moodExcellent'
        };
        
        document.querySelectorAll('[class*="mood-icon-"]').forEach(el => {
            const iconClass = Array.from(el.classList).find(c => c.startsWith('mood-icon-'));
            if (iconClass && moodIcons[iconClass]) {
                el.innerHTML = FlowIcons[moodIcons[iconClass]];
            }
        });
        
        // Initialize energy icons
        const energyIcons = {
            'energy-icon-1': 'moodVeryLow',
            'energy-icon-2': 'moodLow',
            'energy-icon-3': 'moodNeutral',
            'energy-icon-4': 'moodGood',
            'energy-icon-5': 'moodExcellent'
        };
        
        document.querySelectorAll('[class*="energy-icon-"]').forEach(el => {
            const iconClass = Array.from(el.classList).find(c => c.startsWith('energy-icon-'));
            if (iconClass && energyIcons[iconClass]) {
                el.innerHTML = FlowIcons[energyIcons[iconClass]];
            }
        });
        
        // Initialize lightbulb icons for suggestions and insights
        const suggestionIcon = document.getElementById('icon-suggestions');
        if (suggestionIcon) {
            suggestionIcon.innerHTML = FlowIcons.lightbulb;
        }
        
        const insightsIcon = document.getElementById('icon-insights');
        if (insightsIcon) {
            insightsIcon.innerHTML = FlowIcons.lightbulb;
        }
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
        // Onboarding - Use document-level event delegation for maximum reliability
        // This works even if elements are added/removed dynamically
        document.addEventListener('click', (e) => {
            // Check if click is on an option-card or its child
            const card = e.target.closest('.option-card');
            if (!card) return;
            
            // Only handle if we're in onboarding
            const onboarding = document.getElementById('onboarding');
            if (!onboarding || onboarding.classList.contains('hidden')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            console.log('✅ Option card clicked:', card.dataset);
            const mode = card.dataset.mode;
            
            if (mode) {
                console.log('✅ Mode selected:', mode);
                this.selectedGoal = mode;
                
                // Visual feedback
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
                
                // Try to save profile but don't block on it
                api.updateProfile({ mode: mode }).catch(err => {
                    console.warn('Could not save profile:', err);
                });
                
                // Show next step immediately
                setTimeout(() => {
                    this.showOnboardingStep(2);
                }, 200);
            } else {
                // Legacy support
                console.log('Legacy goal mode');
                this.selectedGoal = card.dataset.goal || 'productivity';
                setTimeout(() => {
                    this.showOnboardingStep(2);
                }, 200);
            }
        });
        
        // Also try direct attachment as backup
        setTimeout(() => {
            const cards = document.querySelectorAll('.option-card');
            console.log('Found option cards:', cards.length);
            if (cards.length === 0) {
                console.warn('⚠️ No option cards found in DOM');
            }
        }, 100);

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

        // Edit Habit Modal
        document.getElementById('closeEditHabitModal')?.addEventListener('click', () => {
            this.closeEditHabitModal();
        });

        document.getElementById('saveEditHabitBtn')?.addEventListener('click', () => {
            this.handleSaveEditHabit();
        });

        // Edit habit icon selection
        document.querySelectorAll('#editHabitIconOptions .icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#editHabitIconOptions .icon-option').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
        });

        // Edit habit frequency buttons
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.frequency-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show/hide custom count input
                const countInput = document.getElementById('editHabitFrequencyCount');
                const frequency = e.currentTarget.dataset.frequency;
                if (countInput) {
                    countInput.style.display = frequency === 'custom' ? 'block' : 'none';
                }
            });
        });

        // Edit habit category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
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

        // Add Habit Modal - Icon selection
        document.querySelectorAll('#addHabitModal .icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#addHabitModal .icon-option').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedIcon = e.currentTarget.dataset.icon;
            });
        });

        // Add Habit Modal - Frequency buttons
        document.querySelectorAll('#addHabitModal .frequency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#addHabitModal .frequency-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show/hide custom count input
                const countInput = document.getElementById('habitFrequencyCount');
                const frequency = e.currentTarget.dataset.frequency;
                if (countInput) {
                    countInput.style.display = frequency === 'custom' ? 'block' : 'none';
                }
            });
        });

        // Add Habit Modal - Category buttons
        document.querySelectorAll('#addHabitModal .category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#addHabitModal .category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
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
        console.log('Showing onboarding step:', step);
        
        // Get all steps
        const steps = document.querySelectorAll('.onboarding-step');
        console.log('Found steps:', steps.length);
        
        steps.forEach((s, i) => {
            const stepNumber = i + 1;
            if (stepNumber === step) {
                console.log('Showing step', stepNumber);
                s.classList.remove('hidden');
                s.style.display = ''; // Ensure it's visible
            } else {
                console.log('Hiding step', stepNumber);
                s.classList.add('hidden');
            }
        });

        if (step === 2) {
            console.log('Rendering suggested habits...');
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
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        console.log('🔄 Toggling task:', taskId, 'Current state:', task.completed);

        try {
            const updated = await api.updateTask(taskId, {
                completed: !task.completed
            });
            
            console.log('✅ Task toggled successfully. New state:', updated.completed);
            
            // Update local state in the tasks array
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].completed = updated.completed;
                this.tasks[taskIndex].completed_at = updated.completed_at;
            }
            
            console.log('📊 Updated local task state');
            
            // Re-render CURRENT view
            if (this.currentTab === 'today') {
                this.renderTasks();
                console.log('✅ Today view re-rendered');
            } else if (this.currentTab === 'calendar') {
                await this.renderCalendar();
                console.log('✅ Calendar view re-rendered');
            } else if (this.currentTab === 'alltasks') {
                await this.renderAllTasks();
                console.log('✅ All Tasks view re-rendered');
            }
            
            // Update stats and progress
            this.updateProgress();
            this.updateStats();

            if (updated.completed) {
                // Add premium animation
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    this.animateTaskCompletion(taskElement);
                }
                
                utils.hapticFeedback('success');
                utils.showToast('Task completed! ✅');
                
                if (this.currentTab === 'today' && this.isAllTasksCompleted()) {
                    this.showPerfectDayAnimation();
                    utils.createConfetti();
                    setTimeout(() => {
                        utils.showToast('Perfect day! 🎉');
                    }, 1500);
                }
            } else {
                utils.hapticFeedback('light');
                utils.showToast('Task reopened');
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            utils.showToast('Error updating task', 'error');
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

    async handleToggleHabit(habitId, date = null) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) {
            console.error('Habit not found:', habitId);
            return;
        }

        const targetDate = date || new Date().toISOString().split('T')[0];
        const isCompleted = habit.completions && habit.completions[targetDate];

        console.log('🔄 Toggling habit:', habitId, 'Date:', targetDate, 'Current state:', isCompleted);

        try {
            let updated;
            if (isCompleted) {
                updated = await api.uncompleteHabit(habitId, targetDate);
            } else {
                updated = await api.completeHabit(habitId, targetDate);
            }
            
            console.log('✅ Habit toggled successfully');
            
            // Update local state in the habits array
            const index = this.habits.findIndex(h => h.id === habitId);
            if (index !== -1) {
                this.habits[index] = updated;
                console.log('📊 Updated local habit state');
            }
            
            // Re-render CURRENT view
            if (this.currentTab === 'habits') {
                this.renderHabits();
                console.log('✅ Habits view re-rendered');
            }
            if (this.currentTab === 'calendar') {
                await this.renderCalendar();
                console.log('✅ Calendar view re-rendered');
            }
            this.updateStats();
            
            // Add premium animation (only for today's date)
            if (!isCompleted && !date) {
                const habitCard = document.querySelector(`[data-habit-id="${habitId}"]`);
                if (habitCard) {
                    this.animateHabitCompletion(habitCard);
                }
                utils.hapticFeedback('success');
                utils.showToast(`Great! ${updated.streak} day streak! 🔥`);
            } else {
                utils.hapticFeedback('light');
                utils.showToast('Habit updated');
            }
        } catch (error) {
            console.error('Error toggling habit:', error);
            utils.showToast('Error updating habit', 'error');
        }
    }

    async handleAddHabit() {
        const input = document.getElementById('habitNameInput');
        const frequencyCountInput = document.getElementById('habitFrequencyCount');
        
        if (!input || !input.value.trim()) return;

        // Get selected frequency from button
        const activeFrequencyBtn = document.querySelector('#addHabitModal .frequency-btn.active');
        const frequency = activeFrequencyBtn?.dataset.frequency || 'daily';
        const frequencyCount = frequencyCountInput && frequency === 'custom' ? 
                              parseInt(frequencyCountInput.value) || 1 : 1;

        // Get selected category from button
        const activeCategoryBtn = document.querySelector('#addHabitModal .category-btn.active');
        const category = activeCategoryBtn?.dataset.category || '';

        try {
            const habit = await api.createHabit({
                name: input.value.trim(),
                icon: this.selectedIcon,
                frequency: frequency,
                frequency_count: frequencyCount,
                category: category
            });
            
            this.habits.push(habit);
            this.renderHabits();
            this.hideAddHabitModal();
            
            // Reset form
            input.value = '';
            if (frequencyCountInput) {
                frequencyCountInput.value = '';
                frequencyCountInput.style.display = 'none';
            }
            
            // Reset selections
            document.querySelectorAll('#addHabitModal .frequency-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('#addHabitModal .frequency-btn[data-frequency="daily"]')?.classList.add('active');
            
            document.querySelectorAll('#addHabitModal .category-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('#addHabitModal .category-btn[data-category=""]')?.classList.add('active');
            
            document.querySelectorAll('#addHabitModal .icon-option').forEach(b => b.classList.remove('selected'));
            document.querySelector('#addHabitModal .icon-option[data-icon="💧"]')?.classList.add('selected');
            
            this.selectedIcon = '💧';
            
            utils.hapticFeedback('light');
            utils.showToast('Habit added! 🎉');
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

    async switchTab(tab) {
        console.log('🔄 Switching to tab:', tab);
        this.currentTab = tab;
        
        // Update navigation items
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Tab`);
        });

        // Re-render views to sync with latest data
        if (tab === 'today') {
            this.renderTasks();
            this.renderFocus();
        } else if (tab === 'habits') {
            this.renderHabits();
        } else if (tab === 'stats') {
            this.updateStats();
            this.updateInsights();
        } else if (tab === 'reflect') {
            this.loadReflections();
        } else if (tab === 'calendar') {
            await this.renderCalendar();
        } else if (tab === 'alltasks') {
            await this.renderAllTasks();
        }
        
        console.log('✅ Tab switched and rendered');
    }

    async renderAllTasks() {
        const container = document.getElementById('alltasksList');
        if (!container) return;

        // Get filter values from active pills
        const statusFilter = document.querySelector('.filter-pill[data-filter="status"].active')?.dataset.value || 'all';
        const priorityFilter = document.querySelector('.filter-pill[data-filter="priority"].active')?.dataset.value || 'all';
        const categoryFilter = document.querySelector('.filter-pill[data-filter="category"].active')?.dataset.value || 'all';

        // Filter tasks
        let filteredTasks = [...this.tasks];

        if (statusFilter === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        } else if (statusFilter === 'incomplete') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        }

        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
        }

        if (categoryFilter !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.category === categoryFilter);
        }

        // Sort by due date, then priority
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
            if (a.due_date) return -1;
            if (b.due_date) return 1;
            return 0;
        });

        if (filteredTasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--calm-text-2); padding: 3rem;">No tasks found</p>';
            return;
        }

        container.innerHTML = filteredTasks.map(task => this.renderAllTaskItem(task)).join('');

        // Attach event listeners
        this.attachAllTasksListeners();
    }

    renderAllTaskItem(task) {
        const properties = [];

        // Priority
        if (task.priority && task.priority !== 'normal') {
            properties.push(`<span class="task-property priority-${task.priority}">
                <span class="priority-dot priority-${task.priority}"></span>
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>`);
        }

        // Due date
        if (task.due_date) {
            const today = new Date().toISOString().split('T')[0];
            const dueDate = new Date(task.due_date);
            const todayDate = new Date(today);
            const diffDays = Math.floor((dueDate - todayDate) / (1000 * 60 * 60 * 24));

            let dueDateClass = '';
            let dueDateText = utils.formatDate(task.due_date);

            if (diffDays < 0) {
                dueDateClass = 'overdue';
                dueDateText = `Overdue (${utils.formatDate(task.due_date)})`;
            } else if (diffDays === 0) {
                dueDateClass = 'due-soon';
                dueDateText = 'Due Today';
            } else if (diffDays === 1) {
                dueDateClass = 'due-soon';
                dueDateText = 'Due Tomorrow';
            }

            properties.push(`<span class="task-property ${dueDateClass}">
                📅 ${dueDateText}
                ${task.due_time ? ` at ${utils.formatTime(task.due_time)}` : ''}
            </span>`);
        }

        // Category
        if (task.category) {
            const categoryIcons = {
                'work': '💼',
                'study': '📚',
                'personal': '🏠',
                'health': '💪',
                'errands': '🛒',
                'wellness': '🍃'
            };
            properties.push(`<span class="task-property">
                ${categoryIcons[task.category] || '📌'} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </span>`);
        }

        // Time estimate
        if (task.duration) {
            properties.push(`<span class="task-property">⏱️ ${task.duration} min</span>`);
        }

        return `
            <div class="alltask-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="alltask-header">
                    <div class="alltask-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                        ${task.completed ? '✓' : ''}
                    </div>
                    <div style="flex: 1;">
                        <div class="alltask-title">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="alltask-description">${this.escapeHtml(task.description)}</div>` : ''}
                    </div>
                </div>
                ${properties.length > 0 ? `<div class="alltask-properties">${properties.join('')}</div>` : ''}
                <div class="alltask-actions">
                    <button class="alltask-action-btn alltask-edit" data-task-id="${task.id}">✏️ Edit</button>
                    <button class="alltask-action-btn alltask-duplicate" data-task-id="${task.id}">📋 Duplicate</button>
                    <button class="alltask-action-btn alltask-delete" data-task-id="${task.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    attachAllTasksListeners() {
        console.log('📋 Attaching All Tasks listeners...');
        
        // Checkbox handlers
        const checkboxes = document.querySelectorAll('.alltask-checkbox');
        console.log(`Found ${checkboxes.length} All Tasks checkboxes`);
        
        checkboxes.forEach((checkbox, index) => {
            console.log(`All Tasks checkbox ${index}:`, checkbox.dataset);
            checkbox.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                console.log('✅ All Tasks checkbox clicked!', checkbox.dataset);
                
                const taskId = parseInt(checkbox.dataset.taskId);
                console.log('Toggling task:', taskId);
                
                await this.handleToggleTask(taskId);
                await this.renderAllTasks();
            });
        });

        // Edit buttons
        document.querySelectorAll('.alltask-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                this.openTaskEditor(taskId);
            });
        });

        // Duplicate buttons
        document.querySelectorAll('.alltask-duplicate').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                await this.handleContextMenuAction('duplicate', taskId);
                await this.renderAllTasks();
            });
        });

        // Delete buttons
        document.querySelectorAll('.alltask-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                if (confirm('Delete this task?')) {
                    await api.deleteTask(taskId);
                    this.tasks = this.tasks.filter(t => t.id !== taskId);
                    await this.renderAllTasks();
                    utils.showToast('Task deleted');
                }
            });
        });

        // Right-click context menu
        document.querySelectorAll('.alltask-item').forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const taskId = parseInt(item.dataset.taskId);
                this.showTaskContextMenu(e, taskId);
            });
        });

        // Filter pill handlers
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                const filterType = e.currentTarget.dataset.filter;
                const filterValue = e.currentTarget.dataset.value;
                
                // Deactivate all pills of same type
                document.querySelectorAll(`.filter-pill[data-filter="${filterType}"]`).forEach(p => {
                    p.classList.remove('active');
                });
                
                // Activate clicked pill
                e.currentTarget.classList.add('active');
                
                // Re-render with new filters
                this.renderAllTasks();
                utils.hapticFeedback('light');
            });
        });
    }

    async renderCalendar() {
        const dateStr = this.currentDate.toISOString().split('T')[0];
        
        try {
            const data = await api.getCalendarView(this.calendarView, dateStr);
            const container = document.getElementById('calendarView');
            const title = document.getElementById('calendarTitle');
            
            if (!container || !title) return;

            // Merge local state with API data for day view to ensure UI reflects latest state
            if (this.calendarView === 'day') {
                // Merge habits from local state (which has latest toggles) with API data
                if (data.habits && this.habits) {
                    data.habits = data.habits.map(apiHabit => {
                        const localHabit = this.habits.find(h => h.id === apiHabit.id);
                        if (localHabit) {
                            const dateStr = this.currentDate.toISOString().split('T')[0];
                            const isCompleted = localHabit.completions && localHabit.completions[dateStr];
                            console.log(`🔄 Merging habit ${localHabit.id}: isCompleted=${isCompleted}`, localHabit.completions);
                            // Use local habit if it exists (has latest state), otherwise use API habit
                            return localHabit;
                        }
                        return apiHabit;
                    });
                }
                
                // Merge tasks from local state with API data
                if (data.tasks && this.tasks) {
                    data.tasks = data.tasks.map(apiTask => {
                        const localTask = this.tasks.find(t => t.id === apiTask.id);
                        // Use local task if it exists (has latest state), otherwise use API task
                        return localTask || apiTask;
                    });
                }
                
                title.textContent = this.formatCalendarTitle('day');
                container.innerHTML = this.renderDayView(data);
                // Attach listeners AFTER DOM update
                setTimeout(() => this.attachCalendarListeners(), 0);
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
                const priorityDot = task.priority ? `<span class="priority-dot priority-${task.priority}"></span>` : '';
                html += `
                    <div class="calendar-task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                        <button class="calendar-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}" data-type="task">
                            <span class="checkbox-icon">${task.completed ? '✓' : ''}</span>
                        </button>
                        <div class="task-content">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                ${priorityDot}
                                <span style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(task.title)}</span>
                            </div>
                            ${task.due_time ? `<small>${utils.formatTime(task.due_time)}</small>` : ''}
                        </div>
                        <button class="calendar-task-menu" data-task-id="${task.id}">⋯</button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Habits
        if (data.habits && data.habits.length > 0) {
            html += '<div class="day-section"><h3>Habits</h3>';
            data.habits.forEach(habit => {
                const dateStr = this.currentDate.toISOString().split('T')[0];
                const isCompleted = habit.completions && habit.completions[dateStr];
                html += `
                    <div class="calendar-habit-item ${isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
                        <button class="calendar-checkbox ${isCompleted ? 'checked' : ''}" data-habit-id="${habit.id}" data-type="habit" data-date="${dateStr}">
                            <span class="checkbox-icon">${isCompleted ? '✓' : ''}</span>
                        </button>
                        <span>${habit.icon || '🔥'}</span>
                        <div style="flex: 1; ${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(habit.name)}</div>
                        <button class="calendar-habit-menu" data-habit-id="${habit.id}">⋯</button>
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
                        <div style="${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(item.text)}</div>
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

    attachCalendarListeners() {
        console.log('📌 Attaching calendar listeners...');
        
        // Checkbox handlers
        const checkboxes = document.querySelectorAll('.calendar-checkbox');
        console.log(`Found ${checkboxes.length} calendar checkboxes`);
        
        checkboxes.forEach((btn, index) => {
            console.log(`Checkbox ${index}:`, {
                type: btn.dataset.type,
                taskId: btn.dataset.taskId,
                habitId: btn.dataset.habitId,
                date: btn.dataset.date
            });
            
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                console.log('✅ Checkbox clicked!', btn.dataset);
                
                const type = btn.dataset.type;
                
                if (type === 'task') {
                    const taskId = parseInt(btn.dataset.taskId);
                    console.log('Toggling task:', taskId);
                    await this.handleToggleTask(taskId);
                    await this.renderCalendar();
                } else if (type === 'habit') {
                    const habitId = parseInt(btn.dataset.habitId);
                    const date = btn.dataset.date;
                    console.log('🔥 Toggling habit:', habitId, 'on date:', date);
                    
                    // Immediate visual feedback
                    const isCurrentlyChecked = btn.classList.contains('checked');
                    console.log('Current state:', isCurrentlyChecked ? 'checked' : 'unchecked');
                    
                    await this.handleToggleHabit(habitId, date);
                    
                    console.log('✅ Habit toggled, re-rendering calendar...');
                    await this.renderCalendar();
                    console.log('✅ Calendar re-rendered');
                }
            });
        });

        // Task menu handlers
        document.querySelectorAll('.calendar-task-menu').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.dataset.taskId;
                this.openTaskEditor(taskId);
            });
        });

        // Right-click context menu on tasks
        document.querySelectorAll('.calendar-task-item').forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const taskId = item.dataset.taskId;
                if (taskId) {
                    this.showTaskContextMenu(e, taskId);
                }
            });
        });

        // Habit menu buttons
        document.querySelectorAll('.calendar-habit-menu').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const habitId = parseInt(btn.dataset.habitId);
                this.showHabitContextMenu(e, habitId);
            });
        });

        // Right-click context menu on habits
        document.querySelectorAll('.calendar-habit-item').forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const habitId = item.dataset.habitId;
                if (habitId) {
                    this.showHabitContextMenu(e, parseInt(habitId));
                }
            });
        });
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
            console.log('📅 Opening day details for:', dateString);
            
            // Store the current date for bottom sheet refreshes
            this.currentBottomSheetDate = dateString;
            
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
            
            // Attach event listeners to tasks in bottom sheet
            this.attachBottomSheetTaskListeners();
            
            // Show bottom sheet
            overlay.classList.add('active');
            sheet.classList.add('active');
            
            utils.hapticFeedback('light');
        } catch (error) {
            console.error('Error opening day details:', error);
        }
    }

    attachBottomSheetTaskListeners() {
        console.log('🎯 Attaching bottom sheet listeners...');
        
        // Task checkbox buttons
        const checkboxes = document.querySelectorAll('.bottom-sheet-task .task-checkbox-btn');
        console.log(`Found ${checkboxes.length} bottom sheet checkboxes`);
        
        checkboxes.forEach((btn, index) => {
            console.log(`Bottom sheet checkbox ${index}:`, btn.dataset);
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                console.log('✅ Bottom sheet checkbox clicked!', btn.dataset);
                
                const taskId = parseInt(btn.dataset.taskId);
                console.log('Toggling task:', taskId);
                
                await this.handleToggleTask(taskId);
                
                // Refresh the bottom sheet content with the CURRENT date
                const dateString = this.currentBottomSheetDate || new Date().toISOString().split('T')[0];
                console.log('Refreshing bottom sheet for date:', dateString);
                
                const data = await api.getCalendarView('day', dateString);
                document.getElementById('bottomSheetContent').innerHTML = this.renderDayDetailsContent(data);
                this.attachBottomSheetTaskListeners();
            });
        });

        // Task edit buttons
        document.querySelectorAll('.bottom-sheet-task .task-edit-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                this.openTaskEditor(taskId);
            });
        });

        // Right-click context menu on tasks
        document.querySelectorAll('.bottom-sheet-task').forEach(taskEl => {
            taskEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const taskId = parseInt(taskEl.dataset.taskId);
                this.showTaskContextMenu(e, taskId);
            });
        });

        // Habit checkbox buttons
        document.querySelectorAll('.bottom-sheet-habit .habit-checkbox-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const habitId = parseInt(btn.dataset.habitId);
                const dateString = this.currentBottomSheetDate || new Date().toISOString().split('T')[0];
                
                await this.handleToggleHabit(habitId, dateString);
                
                // Refresh bottom sheet
                const data = await api.getCalendarView('day', dateString);
                document.getElementById('bottomSheetContent').innerHTML = this.renderDayDetailsContent(data);
                this.attachBottomSheetTaskListeners();
            });
        });

        // Habit edit buttons
        document.querySelectorAll('.bottom-sheet-habit .habit-edit-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const habitId = parseInt(btn.dataset.habitId);
                this.openEditHabitModal(habitId);
            });
        });

        // Right-click context menu on habits
        document.querySelectorAll('.bottom-sheet-habit').forEach(habitEl => {
            habitEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const habitId = parseInt(habitEl.dataset.habitId);
                this.showHabitContextMenu(e, habitId);
            });
        });
    }

    showTaskContextMenu(event, taskId) {
        // Remove any existing context menu
        const existing = document.getElementById('taskContextMenu');
        if (existing) existing.remove();

        // Create context menu
        const menu = document.createElement('div');
        menu.id = 'taskContextMenu';
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '10000';

        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        menu.innerHTML = `
            <div class="context-menu-item" data-action="edit">
                <span class="icon icon-xs">${FlowIcons.edit}</span>
                <span>Edit Task</span>
            </div>
            <div class="context-menu-item" data-action="priority-high">
                <span class="priority-dot priority-high"></span>
                <span>High Priority</span>
            </div>
            <div class="context-menu-item" data-action="priority-medium">
                <span class="priority-dot priority-medium"></span>
                <span>Medium Priority</span>
            </div>
            <div class="context-menu-item" data-action="priority-low">
                <span class="priority-dot priority-low"></span>
                <span>Low Priority</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="duplicate">
                <span class="icon icon-xs">${FlowIcons.copy}</span>
                <span>Duplicate</span>
            </div>
            <div class="context-menu-item" data-action="snooze">
                <span class="icon icon-xs">${FlowIcons.clock}</span>
                <span>Snooze</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item context-menu-danger" data-action="delete">
                <span class="icon icon-xs">${FlowIcons.trash}</span>
                <span>Delete</span>
            </div>
        `;

        document.body.appendChild(menu);

        // Position adjustment if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }

        // Handle menu item clicks
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const action = e.currentTarget.dataset.action;
                await this.handleContextMenuAction(action, taskId);
                menu.remove();
            });
        });

        // Close menu on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    }

    async handleContextMenuAction(action, taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            switch (action) {
                case 'edit':
                    this.openTaskEditor(taskId);
                    break;
                case 'priority-high':
                case 'priority-medium':
                case 'priority-low':
                    const priority = action.replace('priority-', '');
                    await api.updateTask(taskId, { priority });
                    task.priority = priority;
                    this.render();
                    utils.showToast(`Priority set to ${priority}`);
                    break;
                case 'duplicate':
                    const newTask = await api.createTask({
                        title: task.title + ' (copy)',
                        due_date: task.due_date,
                        due_time: task.due_time,
                        priority: task.priority,
                        description: task.description,
                        category: task.category
                    });
                    this.tasks.push(newTask);
                    this.render();
                    utils.showToast('Task duplicated');
                    break;
                case 'snooze':
                    this.handleSnoozeTask(taskId);
                    break;
                case 'delete':
                    if (confirm('Delete this task?')) {
                        await api.deleteTask(taskId);
                        this.tasks = this.tasks.filter(t => t.id !== taskId);
                        this.render();
                        utils.showToast('Task deleted');
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling context menu action:', error);
            utils.showToast('Action failed', 'error');
        }
    }

    renderDayDetailsContent(data) {
        let html = '';
        
        // Tasks
        if (data.tasks && data.tasks.length > 0) {
            html += '<div class="day-details-section"><h4 style="margin-bottom: 1rem; font-weight: 600;">Tasks</h4>';
            data.tasks.forEach(task => {
                const priorityClass = task.priority ? `priority-${task.priority}` : '';
                const priorityDot = task.priority ? `<span class="priority-dot priority-${task.priority}"></span>` : '';
                html += `
                    <div class="card card-interactive bottom-sheet-task ${priorityClass}" 
                         data-task-id="${task.id}" 
                         style="padding: 1rem; margin-bottom: 0.75rem; cursor: pointer; position: relative;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <button class="task-checkbox-btn" data-task-id="${task.id}" style="background: none; border: none; cursor: pointer; padding: 0; font-size: 1.5rem;">
                                ${task.completed ? '✓' : '○'}
                            </button>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    ${priorityDot}
                                    <div style="font-weight: 500; ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(task.title)}</div>
                                </div>
                                ${task.due_time ? `<div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${utils.formatTime(task.due_time)}</div>` : ''}
                                ${task.description ? `<div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem; opacity: 0.8;">${this.escapeHtml(task.description).substring(0, 60)}${task.description.length > 60 ? '...' : ''}</div>` : ''}
                            </div>
                            <button class="task-edit-quick-btn" data-task-id="${task.id}" style="background: none; border: none; cursor: pointer; padding: 0.5rem; opacity: 0.6; transition: opacity 0.2s;">
                                <span style="font-size: 1.25rem;">⋯</span>
                            </button>
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
                    <div class="card card-interactive bottom-sheet-habit" data-habit-id="${habit.id}" style="padding: 1rem; margin-bottom: 0.75rem; cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <button class="habit-checkbox-btn" data-habit-id="${habit.id}" style="background: none; border: none; cursor: pointer; padding: 0; font-size: 1.5rem;">
                                ${habit.completed ? '✓' : '○'}
                            </button>
                            <span style="font-size: 1.25rem;">${habit.icon || '🔥'}</span>
                            <div style="flex: 1; font-weight: 500; ${habit.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(habit.name)}</div>
                            <button class="habit-edit-quick-btn" data-habit-id="${habit.id}" style="background: none; border: none; cursor: pointer; padding: 0.5rem; opacity: 0.6; transition: opacity 0.2s;">
                                <span style="font-size: 1.25rem;">⋯</span>
                            </button>
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

        // Right-click context menu
        taskEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTaskContextMenu(e, task.id);
        });

        return taskEl;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

            habitEl.addEventListener('click', (e) => {
                // Only toggle if not clicking on insights button
                if (!e.target.closest('.habit-insights-btn')) {
                    this.handleToggleHabit(habit.id);
                }
            });

            // Right-click context menu
            habitEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showHabitContextMenu(e, habit.id);
            });

            // Load and display habit strength
            this.loadHabitStrength(habit.id, habitEl);

            container.appendChild(habitEl);
        });
    }

    showHabitContextMenu(event, habitId) {
        // Remove any existing context menu
        const existing = document.getElementById('habitContextMenu');
        if (existing) existing.remove();

        // Create context menu
        const menu = document.createElement('div');
        menu.id = 'habitContextMenu';
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '10000';

        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = habit.completions && habit.completions[today];

        menu.innerHTML = `
            <div class="context-menu-item" data-action="edit">
                <span class="icon icon-xs">${FlowIcons.edit}</span>
                <span>Edit Habit</span>
            </div>
            <div class="context-menu-item" data-action="toggle">
                <span class="icon icon-xs">${isCompletedToday ? '○' : '✓'}</span>
                <span>${isCompletedToday ? 'Mark Incomplete' : 'Mark Complete'}</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="insights">
                <span class="icon icon-xs">${FlowIcons.insights}</span>
                <span>View Insights</span>
            </div>
            <div class="context-menu-item" data-action="reset-streak">
                <span class="icon icon-xs">${FlowIcons.flame}</span>
                <span>Reset Streak</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="duplicate">
                <span class="icon icon-xs">${FlowIcons.copy}</span>
                <span>Duplicate Habit</span>
            </div>
            <div class="context-menu-item" data-action="archive">
                <span class="icon icon-xs">${FlowIcons.folder}</span>
                <span>Archive Habit</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item context-menu-danger" data-action="delete">
                <span class="icon icon-xs">${FlowIcons.trash}</span>
                <span>Delete Habit</span>
            </div>
        `;

        document.body.appendChild(menu);

        // Position adjustment if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }

        // Handle menu item clicks
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const action = e.currentTarget.dataset.action;
                await this.handleHabitContextMenuAction(action, habitId);
                menu.remove();
            });
        });

        // Close menu on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    }

    async handleHabitContextMenuAction(action, habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        try {
            switch (action) {
                case 'edit':
                    this.openEditHabitModal(habitId);
                    break;
                    
                case 'toggle':
                    await this.handleToggleHabit(habitId);
                    break;
                    
                case 'insights':
                    this.showHabitInsights(habitId);
                    break;
                    
                case 'reset-streak':
                    if (confirm(`Reset streak for "${habit.name}"? This will set the streak to 0.`)) {
                        await api.updateHabit(habitId, { streak: 0 });
                        habit.streak = 0;
                        this.renderHabits();
                        utils.showToast('Streak reset');
                    }
                    break;
                    
                case 'duplicate':
                    const newHabit = await api.createHabit({
                        name: habit.name + ' (copy)',
                        icon: habit.icon,
                        frequency: habit.frequency,
                        frequency_count: habit.frequency_count,
                        category: habit.category
                    });
                    this.habits.push(newHabit);
                    this.renderHabits();
                    utils.showToast('Habit duplicated');
                    break;
                    
                case 'archive':
                    if (confirm(`Archive "${habit.name}"? You can restore it later.`)) {
                        await api.updateHabit(habitId, { archived: true });
                        this.habits = this.habits.filter(h => h.id !== habitId);
                        this.renderHabits();
                        utils.showToast('Habit archived');
                    }
                    break;
                    
                case 'delete':
                    if (confirm(`Delete "${habit.name}" permanently? This cannot be undone.`)) {
                        await api.deleteHabit(habitId);
                        this.habits = this.habits.filter(h => h.id !== habitId);
                        this.renderHabits();
                        utils.showToast('Habit deleted');
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling habit context menu action:', error);
            utils.showToast('Action failed', 'error');
        }
    }

    openEditHabitModal(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        this.editingHabitId = habitId;

        // Populate form
        document.getElementById('editHabitNameInput').value = habit.name || '';
        
        // Select frequency button
        document.querySelectorAll('.frequency-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.frequency === (habit.frequency || 'daily'));
        });
        
        // Show frequency count if custom
        const countInput = document.getElementById('editHabitFrequencyCount');
        if (habit.frequency === 'custom') {
            countInput.style.display = 'block';
            countInput.value = habit.frequency_count || 1;
        } else {
            countInput.style.display = 'none';
        }

        // Select category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === (habit.category || ''));
        });

        // Select icon
        document.querySelectorAll('#editHabitIconOptions .icon-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === habit.icon);
        });

        // Show modal
        document.getElementById('editHabitModal').classList.add('active');
        utils.hapticFeedback('light');
    }

    closeEditHabitModal() {
        document.getElementById('editHabitModal').classList.remove('active');
        this.editingHabitId = null;
    }

    async handleSaveEditHabit() {
        const name = document.getElementById('editHabitNameInput').value.trim();
        
        if (!name) {
            utils.showToast('Please enter a habit name', 'error');
            return;
        }

        // Get selected frequency
        const selectedFrequencyBtn = document.querySelector('.frequency-btn.active');
        const frequency = selectedFrequencyBtn ? selectedFrequencyBtn.dataset.frequency : 'daily';
        
        const frequencyCount = frequency === 'custom' ? 
            parseInt(document.getElementById('editHabitFrequencyCount').value) || 1 : 1;
        
        // Get selected category
        const selectedCategoryBtn = document.querySelector('.category-btn.active');
        const category = selectedCategoryBtn ? selectedCategoryBtn.dataset.category : '';

        // Get selected icon
        const selectedIconBtn = document.querySelector('#editHabitIconOptions .icon-option.selected');
        const icon = selectedIconBtn ? selectedIconBtn.dataset.icon : '✨';

        try {
            const updated = await api.updateHabit(this.editingHabitId, {
                name,
                icon,
                frequency,
                frequency_count: frequencyCount,
                category
            });

            // Update local state
            const index = this.habits.findIndex(h => h.id === this.editingHabitId);
            if (index !== -1) {
                this.habits[index] = { ...this.habits[index], ...updated };
            }

            this.closeEditHabitModal();
            this.renderHabits();
            utils.showToast('Habit updated!');
            utils.hapticFeedback('success');
        } catch (error) {
            console.error('Error updating habit:', error);
            utils.showToast('Error updating habit', 'error');
        }
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


