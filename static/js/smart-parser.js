/**
 * Smart Task Input - Natural Language Parser
 * Parses natural language into structured task data
 * Examples:
 * - "Submit math assignment next Tuesday at 3pm" → task with date/time
 * - "Pay phone bill every month" → recurring task
 */

class SmartTaskParser {
    constructor() {
        this.daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        this.months = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
        this.recurringPatterns = {
            'every day': 'daily',
            'daily': 'daily',
            'every week': 'weekly',
            'weekly': 'weekly',
            'every month': 'monthly',
            'monthly': 'monthly',
            'every year': 'yearly',
            'yearly': 'yearly',
            'every weekday': 'weekdays',
            'weekdays': 'weekdays',
            'every weekend': 'weekends',
            'weekends': 'weekends'
        };
    }

    parse(input) {
        const lowerInput = input.toLowerCase().trim();
        const task = {
            title: input,
            due_date: null,
            due_time: null,
            repeat_frequency: null,
            priority: 'normal',
            tags: [],
            description: null
        };

        // Extract date
        const dateInfo = this.extractDate(lowerInput);
        if (dateInfo.date) {
            task.due_date = dateInfo.date;
            task.title = dateInfo.cleanedTitle;
        }

        // Extract time
        const timeInfo = this.extractTime(lowerInput);
        if (timeInfo.time) {
            task.due_time = timeInfo.time;
            task.title = timeInfo.cleanedTitle;
        }

        // Extract recurring pattern
        const recurringInfo = this.extractRecurring(lowerInput);
        if (recurringInfo.frequency) {
            task.repeat_frequency = recurringInfo.frequency;
            task.title = recurringInfo.cleanedTitle;
        }

        // Extract priority
        const priorityInfo = this.extractPriority(lowerInput);
        if (priorityInfo.priority) {
            task.priority = priorityInfo.priority;
            task.title = priorityInfo.cleanedTitle;
        }

        // Extract tags/categories
        const tagsInfo = this.extractTags(lowerInput);
        if (tagsInfo.tags.length > 0) {
            task.tags = tagsInfo.tags;
            task.title = tagsInfo.cleanedTitle;
        }

        // Clean up title (remove parsed parts)
        task.title = this.cleanTitle(task.title);

        return task;
    }

    extractDate(input) {
        const today = new Date();
        let date = null;
        let cleanedTitle = input;

        // Relative dates
        if (input.includes('today')) {
            date = this.formatDate(today);
            cleanedTitle = cleanedTitle.replace(/\btoday\b/gi, '').trim();
        } else if (input.includes('tomorrow')) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            date = this.formatDate(tomorrow);
            cleanedTitle = cleanedTitle.replace(/\btomorrow\b/gi, '').trim();
        } else if (input.includes('next week')) {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            date = this.formatDate(nextWeek);
            cleanedTitle = cleanedTitle.replace(/\bnext week\b/gi, '').trim();
        } else if (input.includes('next month')) {
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            date = this.formatDate(nextMonth);
            cleanedTitle = cleanedTitle.replace(/\bnext month\b/gi, '').trim();
        }

        // Day of week
        for (let i = 0; i < this.daysOfWeek.length; i++) {
            const dayName = this.daysOfWeek[i];
            if (input.includes(dayName)) {
                const dayIndex = i;
                const currentDay = today.getDay();
                let daysUntil = dayIndex - currentDay;
                
                if (daysUntil <= 0) daysUntil += 7; // Next week
                if (input.includes('next')) {
                    daysUntil += 7; // Week after next
                    cleanedTitle = cleanedTitle.replace(/\bnext\b/gi, '').trim();
                }
                
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + daysUntil);
                date = this.formatDate(targetDate);
                cleanedTitle = cleanedTitle.replace(new RegExp(`\\b${dayName}\\b`, 'gi'), '').trim();
                break;
            }
        }

        // Specific date formats: "December 25", "12/25", "12-25"
        const datePatterns = [
            /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // MM/DD or MM/DD/YYYY
            /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/, // MM-DD or MM-DD-YYYY
            new RegExp(`(${this.months.join('|')})\\s+(\\d{1,2})(?:,\\s*(\\d{4}))?`, 'i') // "December 25" or "December 25, 2024"
        ];

        for (const pattern of datePatterns) {
            const match = input.match(pattern);
            if (match) {
                let year = today.getFullYear();
                let month, day;

                if (pattern === datePatterns[2]) {
                    // Month name format
                    month = this.months.indexOf(match[1].toLowerCase());
                    day = parseInt(match[2]);
                    if (match[3]) year = parseInt(match[3]);
                } else {
                    // Numeric format
                    month = parseInt(match[1]) - 1;
                    day = parseInt(match[2]);
                    if (match[3]) year = parseInt(match[3]);
                }

                const parsedDate = new Date(year, month, day);
                if (!isNaN(parsedDate.getTime())) {
                    date = this.formatDate(parsedDate);
                    cleanedTitle = cleanedTitle.replace(pattern, '').trim();
                }
                break;
            }
        }

        return { date, cleanedTitle };
    }

    extractTime(input) {
        let time = null;
        let cleanedTitle = input;

        // Time patterns: "3pm", "3:30pm", "15:30", "at 3pm"
        const timePatterns = [
            /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
            /at\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i,
            /at\s+(\d{1,2})\s*(am|pm)/i,
            /(\d{1,2})\s*(am|pm)/i
        ];

        for (const pattern of timePatterns) {
            const match = input.match(pattern);
            if (match) {
                let hours = parseInt(match[1] || match[2]);
                const minutes = parseInt(match[2] || 0);
                const period = (match[3] || match[2] || '').toLowerCase();

                if (period === 'pm' && hours !== 12) hours += 12;
                if (period === 'am' && hours === 12) hours = 0;

                time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                cleanedTitle = cleanedTitle.replace(pattern, '').trim();
                break;
            }
        }

        return { time, cleanedTitle };
    }

    extractRecurring(input) {
        let frequency = null;
        let cleanedTitle = input;

        for (const [pattern, freq] of Object.entries(this.recurringPatterns)) {
            if (input.includes(pattern)) {
                frequency = freq;
                cleanedTitle = cleanedTitle.replace(new RegExp(pattern, 'gi'), '').trim();
                break;
            }
        }

        return { frequency, cleanedTitle };
    }

    extractPriority(input) {
        let priority = null;
        let cleanedTitle = input;

        if (input.includes('high priority') || input.includes('urgent') || input.includes('important')) {
            priority = 'high';
            cleanedTitle = cleanedTitle.replace(/\b(high priority|urgent|important)\b/gi, '').trim();
        } else if (input.includes('low priority') || input.includes('optional')) {
            priority = 'low';
            cleanedTitle = cleanedTitle.replace(/\b(low priority|optional)\b/gi, '').trim();
        }

        return { priority, cleanedTitle };
    }

    extractTags(input) {
        const tags = [];
        let cleanedTitle = input;

        // Extract hashtags
        const hashtagPattern = /#(\w+)/g;
        const hashtags = input.match(hashtagPattern);
        if (hashtags) {
            hashtags.forEach(tag => {
                tags.push(tag.substring(1)); // Remove #
            });
            cleanedTitle = cleanedTitle.replace(hashtagPattern, '').trim();
        }

        // Extract category keywords
        const categories = {
            'work': ['work', 'job', 'office', 'meeting', 'project'],
            'study': ['study', 'homework', 'assignment', 'exam', 'test', 'class'],
            'personal': ['personal', 'family', 'friend', 'home'],
            'health': ['gym', 'exercise', 'workout', 'doctor', 'health'],
            'errands': ['buy', 'purchase', 'shop', 'grocery', 'errand']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (input.includes(keyword) && !tags.includes(category)) {
                    tags.push(category);
                    break;
                }
            }
        }

        return { tags, cleanedTitle };
    }

    cleanTitle(title) {
        // Remove extra spaces, clean up
        return title
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ' ')
            .trim();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

window.SmartTaskParser = SmartTaskParser;

