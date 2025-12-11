/**
 * Utility Functions for Flow App
 * Natural language parsing, animations, haptics, etc.
 */

class FlowUtils {
    /**
     * Parse natural language task input
     * Examples: "Study at 7pm", "Buy milk tomorrow", "Call mom today"
     */
    parseTaskInput(input) {
        const task = {
            title: input,
            due_date: null,
            due_time: null,
            priority: 'normal'
        };

        const lowerInput = input.toLowerCase();

        // Time parsing
        const timePatterns = [
            /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
            /at\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i,
            /at\s+(\d{1,2})\s*(am|pm)/i,
            /(\d{1,2})\s*(am|pm)/i
        ];

        for (const pattern of timePatterns) {
            const match = lowerInput.match(pattern);
            if (match) {
                let hours = parseInt(match[1] || match[2]);
                const minutes = parseInt(match[2] || 0);
                const period = (match[3] || match[2] || '').toLowerCase();

                if (period === 'pm' && hours !== 12) hours += 12;
                if (period === 'am' && hours === 12) hours = 0;

                task.due_time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                
                // Remove time from title
                task.title = input.replace(pattern, '').trim();
                break;
            }
        }

        // Date parsing
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (lowerInput.includes('tomorrow')) {
            task.due_date = tomorrow.toISOString().split('T')[0];
            task.title = input.replace(/tomorrow/gi, '').trim();
        } else if (lowerInput.includes('today')) {
            task.due_date = today.toISOString().split('T')[0];
            task.title = input.replace(/today/gi, '').trim();
        }

        // Priority parsing
        if (lowerInput.includes('urgent') || lowerInput.includes('important')) {
            task.priority = 'high';
        }

        // Clean up title
        task.title = task.title.replace(/\s+/g, ' ').trim();
        if (!task.title) {
            task.title = input; // Fallback to original if parsing removed everything
        }

        return task;
    }

    /**
     * Create confetti animation
     */
    createConfetti() {
        const container = document.getElementById('confettiContainer');
        if (!container) return;

        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    }

    /**
     * Haptic-like feedback (vibration if available)
     */
    hapticFeedback(type = 'light') {
        if ('vibrate' in navigator) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30,
                success: [10, 50, 10]
            };
            navigator.vibrate(patterns[type] || patterns.light);
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    /**
     * Format time for display
     */
    formatTime(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        
        return `${displayHour}:${minutes} ${period}`;
    }

    /**
     * Calculate completion percentage
     */
    calculateCompletion(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    }

    /**
     * Get suggested habits based on goal/mode
     */
    getSuggestedHabits(goal) {
        const suggestions = {
            // Batch 5: Updated for new mode names
            student: [
                { name: 'Review notes', icon: '📚' },
                { name: 'Complete assignments', icon: '✍️' },
                { name: 'Study session', icon: '🎓' }
            ],
            fitness: [
                { name: 'Workout', icon: '🏃' },
                { name: 'Drink water', icon: '💧' },
                { name: 'Track meals', icon: '🥗' }
            ],
            productivity: [
                { name: 'Plan your day', icon: '📝' },
                { name: 'Review goals', icon: '🎯' },
                { name: 'Deep work session', icon: '💼' }
            ],
            minimalist: [
                { name: 'One priority', icon: '✨' }
            ],
            entrepreneur: [
                { name: 'Revenue goals', icon: '💰' },
                { name: 'Networking', icon: '🤝' },
                { name: 'Learn', icon: '📚' }
            ],
            // Legacy support
            health: [
                { name: 'Drink water', icon: '💧' },
                { name: 'Exercise', icon: '🏃' },
                { name: 'Get 8 hours sleep', icon: '😴' }
            ],
            focus: [
                { name: 'Meditation', icon: '🧘' },
                { name: 'No phone morning', icon: '📵' },
                { name: 'Read 30 minutes', icon: '📚' }
            ],
            mood: [
                { name: 'Journal', icon: '✍️' },
                { name: 'Gratitude list', icon: '🙏' },
                { name: 'Connect with someone', icon: '💬' }
            ]
        };

        return suggestions[goal] || suggestions.productivity;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

const utils = new FlowUtils();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


