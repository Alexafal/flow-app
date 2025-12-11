/**
 * Google Calendar Sync
 * Handles OAuth, sync, and real-time updates
 */

class CalendarSync {
    constructor(app) {
        this.app = app;
        this.isConnected = false;
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.init();
    }

    init() {
        this.checkConnectionStatus();
        this.setupEventListeners();
    }

    async checkConnectionStatus() {
        try {
            const response = await fetch('/api/calendar/status');
            if (response.ok) {
                const data = await response.json();
                this.isConnected = data.connected;
                if (this.isConnected) {
                    this.startBackgroundSync();
                }
            }
        } catch (error) {
            console.error('Failed to check calendar status:', error);
        }
    }

    async connectGoogleCalendar() {
        try {
            // Redirect to Google OAuth
            window.location.href = '/api/calendar/connect';
        } catch (error) {
            console.error('Calendar connection failed:', error);
            this.showError('Failed to connect to Google Calendar.');
        }
    }

    async disconnectGoogleCalendar() {
        try {
            const response = await fetch('/api/calendar/disconnect', {
                method: 'POST'
            });

            if (response.ok) {
                this.isConnected = false;
                this.stopBackgroundSync();
                this.showSuccess('Disconnected from Google Calendar.');
            }
        } catch (error) {
            console.error('Disconnect failed:', error);
            this.showError('Failed to disconnect.');
        }
    }

    async syncCalendar() {
        try {
            const response = await fetch('/api/calendar/sync', {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                this.lastSyncTime = new Date();
                
                // Update calendar view with synced events
                if (this.app && this.app.renderCalendar) {
                    await this.app.loadData();
                    this.app.renderCalendar();
                }

                this.showSuccess(`Synced ${data.events_synced || 0} events.`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
            this.showError('Sync failed. Will retry later.');
        }
    }

    async createCalendarEvent(eventData) {
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const event = await response.json();
                this.showSuccess('Event created in Google Calendar.');
                return event;
            }
        } catch (error) {
            console.error('Failed to create calendar event:', error);
            this.showError('Failed to create calendar event.');
        }
    }

    async updateCalendarEvent(eventId, eventData) {
        try {
            const response = await fetch(`/api/calendar/events/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                this.showSuccess('Event updated in Google Calendar.');
            }
        } catch (error) {
            console.error('Failed to update calendar event:', error);
            this.showError('Failed to update calendar event.');
        }
    }

    async deleteCalendarEvent(eventId) {
        try {
            const response = await fetch(`/api/calendar/events/${eventId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Event deleted from Google Calendar.');
            }
        } catch (error) {
            console.error('Failed to delete calendar event:', error);
            this.showError('Failed to delete calendar event.');
        }
    }

    startBackgroundSync() {
        // Sync every 5-10 minutes
        const syncInterval = 5 * 60 * 1000; // 5 minutes
        
        this.syncInterval = setInterval(() => {
            this.syncCalendar();
        }, syncInterval);

        // Initial sync
        this.syncCalendar();
    }

    stopBackgroundSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    setupEventListeners() {
        // Connect button
        document.getElementById('connectCalendarBtn')?.addEventListener('click', () => {
            this.connectGoogleCalendar();
        });

        // Disconnect button
        document.getElementById('disconnectCalendarBtn')?.addEventListener('click', () => {
            this.disconnectGoogleCalendar();
        });

        // Manual sync button
        document.getElementById('syncCalendarBtn')?.addEventListener('click', () => {
            this.syncCalendar();
        });
    }

    showError(message) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(message, 'error');
        }
    }

    showSuccess(message) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(message, 'success');
        }
    }
}

window.CalendarSync = CalendarSync;

