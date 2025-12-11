/**
 * Data Portability - Export/Import System
 * Supports CSV (tasks), ICS (calendar), Markdown (notes)
 */

class ExportImport {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    // Export Tasks to CSV
    async exportTasksCSV() {
        try {
            const tasks = this.app.tasks || [];
            
            // CSV header
            const headers = ['Title', 'Due Date', 'Due Time', 'Priority', 'Status', 'Tags', 'Description'];
            const rows = [headers.join(',')];

            // CSV rows
            tasks.forEach(task => {
                const row = [
                    this.escapeCSV(task.title || ''),
                    task.due_date || '',
                    task.due_time || '',
                    task.priority || 'normal',
                    task.completed ? 'Completed' : 'Incomplete',
                    (task.tags || []).join(';'),
                    this.escapeCSV(task.description || '')
                ];
                rows.push(row.join(','));
            });

            const csvContent = rows.join('\n');
            this.downloadFile(csvContent, 'flow-tasks.csv', 'text/csv');
            
            if (window.utils) {
                window.utils.showToast('Tasks exported to CSV!', 'success');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Failed to export tasks.');
        }
    }

    // Export Calendar to ICS
    async exportCalendarICS() {
        try {
            const tasks = this.app.tasks || [];
            const habits = this.app.habits || [];
            
            let icsContent = 'BEGIN:VCALENDAR\n';
            icsContent += 'VERSION:2.0\n';
            icsContent += 'PRODID:-//Flow App//EN\n';
            icsContent += 'CALSCALE:GREGORIAN\n';
            icsContent += 'METHOD:PUBLISH\n';

            // Add tasks as events
            tasks.forEach(task => {
                if (task.due_date) {
                    icsContent += this.taskToICS(task);
                }
            });

            // Add habits as recurring events
            habits.forEach(habit => {
                if (habit.frequency) {
                    icsContent += this.habitToICS(habit);
                }
            });

            icsContent += 'END:VCALENDAR\n';

            this.downloadFile(icsContent, 'flow-calendar.ics', 'text/calendar');
            
            if (window.utils) {
                window.utils.showToast('Calendar exported to ICS!', 'success');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Failed to export calendar.');
        }
    }

    // Export Notes to Markdown
    async exportNotesMarkdown() {
        try {
            // Get all notes/reflections
            const reflections = await fetch('/api/reflections').then(r => r.json()).catch(() => []);
            
            let markdown = '# Flow App Notes\n\n';
            markdown += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;
            markdown += '---\n\n';

            reflections.forEach((reflection, index) => {
                markdown += `## Note ${index + 1}\n\n`;
                markdown += `**Date:** ${reflection.date || 'Unknown'}\n\n`;
                if (reflection.mood) {
                    markdown += `**Mood:** ${reflection.mood}/5\n\n`;
                }
                if (reflection.energy) {
                    markdown += `**Energy:** ${reflection.energy}/5\n\n`;
                }
                if (reflection.notes) {
                    markdown += `**Notes:**\n\n${reflection.notes}\n\n`;
                }
                markdown += '---\n\n';
            });

            this.downloadFile(markdown, 'flow-notes.md', 'text/markdown');
            
            if (window.utils) {
                window.utils.showToast('Notes exported to Markdown!', 'success');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Failed to export notes.');
        }
    }

    // Import Tasks from CSV
    async importTasksCSV(file) {
        try {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const tasks = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = this.parseCSVLine(lines[i]);
                const task = {
                    title: values[0] || '',
                    due_date: values[1] || null,
                    due_time: values[2] || null,
                    priority: values[3] || 'normal',
                    completed: values[4]?.toLowerCase() === 'completed',
                    tags: values[5] ? values[5].split(';').map(t => t.trim()) : [],
                    description: values[6] || ''
                };
                
                tasks.push(task);
            }

            // Import tasks
            for (const task of tasks) {
                await window.api.createTask(task);
            }

            // Reload data
            await this.app.loadData();
            this.app.renderTasks();
            
            if (window.utils) {
                window.utils.showToast(`Imported ${tasks.length} tasks!`, 'success');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showError('Failed to import tasks. Please check CSV format.');
        }
    }

    // Import Calendar from ICS
    async importCalendarICS(file) {
        try {
            const text = await file.text();
            const events = this.parseICS(text);
            
            for (const event of events) {
                const task = {
                    title: event.summary || 'Imported Event',
                    due_date: event.startDate,
                    due_time: event.startTime,
                    description: event.description || '',
                    tags: ['imported', 'calendar']
                };
                
                await window.api.createTask(task);
            }

            await this.app.loadData();
            this.app.renderCalendar();
            
            if (window.utils) {
                window.utils.showToast(`Imported ${events.length} events!`, 'success');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showError('Failed to import calendar. Please check ICS format.');
        }
    }

    // Helper methods
    taskToICS(task) {
        const startDate = task.due_date || new Date().toISOString().split('T')[0];
        const startTime = task.due_time || '00:00';
        const dtStart = `${startDate.replace(/-/g, '')}T${startTime.replace(':', '')}00`;
        
        let ics = 'BEGIN:VEVENT\n';
        ics += `UID:${task.id}@flow-app\n`;
        ics += `DTSTART:${dtStart}\n`;
        ics += `DTEND:${dtStart}\n`;
        ics += `SUMMARY:${this.escapeICS(task.title)}\n`;
        if (task.description) {
            ics += `DESCRIPTION:${this.escapeICS(task.description)}\n`;
        }
        ics += 'END:VEVENT\n';
        
        return ics;
    }

    habitToICS(habit) {
        // Convert habit to recurring event
        let ics = 'BEGIN:VEVENT\n';
        ics += `UID:habit-${habit.id}@flow-app\n`;
        ics += `SUMMARY:${this.escapeICS(habit.name)}\n`;
        
        // Add recurrence rule based on frequency
        if (habit.frequency === 'daily') {
            ics += 'RRULE:FREQ=DAILY\n';
        } else if (habit.frequency === 'weekly') {
            ics += 'RRULE:FREQ=WEEKLY\n';
        } else if (habit.frequency === 'monthly') {
            ics += 'RRULE:FREQ=MONTHLY\n';
        }
        
        ics += 'END:VEVENT\n';
        return ics;
    }

    parseICS(icsText) {
        const events = [];
        const eventBlocks = icsText.split('BEGIN:VEVENT');
        
        for (let i = 1; i < eventBlocks.length; i++) {
            const block = eventBlocks[i];
            const event = {};
            
            // Extract summary
            const summaryMatch = block.match(/SUMMARY:(.+)/);
            if (summaryMatch) event.summary = summaryMatch[1].trim();
            
            // Extract date/time
            const dtStartMatch = block.match(/DTSTART[^:]*:(\d{8})T?(\d{6})?/);
            if (dtStartMatch) {
                const dateStr = dtStartMatch[1];
                event.startDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
                if (dtStartMatch[2]) {
                    const timeStr = dtStartMatch[2];
                    event.startTime = `${timeStr.substring(0,2)}:${timeStr.substring(2,4)}`;
                }
            }
            
            // Extract description
            const descMatch = block.match(/DESCRIPTION:(.+)/);
            if (descMatch) event.description = descMatch[1].trim();
            
            events.push(event);
        }
        
        return events;
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        
        return values;
    }

    escapeCSV(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    escapeICS(value) {
        return value.replace(/\n/g, '\\n').replace(/,/g, '\\,');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    setupEventListeners() {
        // Export buttons
        document.getElementById('exportTasksCSV')?.addEventListener('click', () => {
            this.exportTasksCSV();
        });

        document.getElementById('exportCalendarICS')?.addEventListener('click', () => {
            this.exportCalendarICS();
        });

        document.getElementById('exportNotesMD')?.addEventListener('click', () => {
            this.exportNotesMarkdown();
        });

        // Import buttons
        document.getElementById('importTasksCSV')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importTasksCSV(e.target.files[0]);
            }
        });

        document.getElementById('importCalendarICS')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importCalendarICS(e.target.files[0]);
            }
        });
    }

    showError(message) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(message, 'error');
        }
    }
}

window.ExportImport = ExportImport;

