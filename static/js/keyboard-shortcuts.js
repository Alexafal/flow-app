/**
 * Keyboard Shortcuts System
 * Provides keyboard navigation throughout the app
 */

class KeyboardShortcuts {
    constructor(app) {
        this.app = app;
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        this.registerShortcuts();
        this.attachListeners();
    }

    registerShortcuts() {
        // Navigation
        this.shortcuts.set('j', () => this.navigateDown());
        this.shortcuts.set('k', () => this.navigateUp());
        this.shortcuts.set('h', () => this.navigateLeft());
        this.shortcuts.set('l', () => this.navigateRight());
        
        // Actions
        this.shortcuts.set('c', () => this.createNew());
        this.shortcuts.set('n', () => this.createNew());
        this.shortcuts.set('e', () => this.editSelected());
        this.shortcuts.set('d', () => this.deleteSelected());
        this.shortcuts.set('x', () => this.toggleSelected());
        this.shortcuts.set('u', () => this.undo());
        this.shortcuts.set('r', () => this.redo());
        
        // Navigation tabs
        this.shortcuts.set('1', () => this.switchToTab('today'));
        this.shortcuts.set('2', () => this.switchToTab('habits'));
        this.shortcuts.set('3', () => this.switchToTab('calendar'));
        this.shortcuts.set('4', () => this.switchToTab('focus'));
        this.shortcuts.set('5', () => this.switchToTab('stats'));
        this.shortcuts.set('6', () => this.switchToTab('alltasks'));
        
        // Search
        this.shortcuts.set('/', () => this.focusSearch());
        this.shortcuts.set('f', () => this.focusSearch());
        
        // Escape
        this.shortcuts.set('Escape', () => this.closeModals());
    }

    attachListeners() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (this.isTyping(e.target)) return;
            
            // Check for modifier keys
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
            
            // Only handle shortcuts without modifiers (or specific ones)
            if (hasModifier && e.key !== 'k') return;
            
            const key = e.key.toLowerCase();
            const handler = this.shortcuts.get(key);
            
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    isTyping(element) {
        const tagName = element.tagName.toLowerCase();
        const isInput = tagName === 'input' || tagName === 'textarea';
        const isContentEditable = element.contentEditable === 'true';
        return isInput || isContentEditable;
    }

    navigateDown() {
        const selected = document.querySelector('.selected, .task-item:hover, .habit-item:hover');
        if (selected) {
            const next = selected.nextElementSibling;
            if (next) {
                this.selectElement(next);
            }
        } else {
            const first = document.querySelector('.task-item, .habit-item');
            if (first) this.selectElement(first);
        }
    }

    navigateUp() {
        const selected = document.querySelector('.selected');
        if (selected) {
            const prev = selected.previousElementSibling;
            if (prev) {
                this.selectElement(prev);
            }
        }
    }

    navigateLeft() {
        // Switch to previous tab
        const tabs = ['today', 'habits', 'calendar', 'focus', 'stats', 'alltasks'];
        const current = this.app?.currentTab || 'today';
        const currentIndex = tabs.indexOf(current);
        if (currentIndex > 0) {
            this.switchToTab(tabs[currentIndex - 1]);
        }
    }

    navigateRight() {
        // Switch to next tab
        const tabs = ['today', 'habits', 'calendar', 'focus', 'stats', 'alltasks'];
        const current = this.app?.currentTab || 'today';
        const currentIndex = tabs.indexOf(current);
        if (currentIndex < tabs.length - 1) {
            this.switchToTab(tabs[currentIndex + 1]);
        }
    }

    selectElement(element) {
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    createNew() {
        // Focus on task input or open add modal
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.focus();
        } else {
            // Open add task modal
            const addBtn = document.getElementById('addTaskBtn');
            if (addBtn) addBtn.click();
        }
    }

    editSelected() {
        const selected = document.querySelector('.selected');
        if (selected) {
            const editBtn = selected.querySelector('.edit-btn, .task-edit, .habit-edit');
            if (editBtn) editBtn.click();
        }
    }

    deleteSelected() {
        const selected = document.querySelector('.selected');
        if (selected) {
            const deleteBtn = selected.querySelector('.delete-btn, .task-delete, .habit-delete');
            if (deleteBtn) deleteBtn.click();
        }
    }

    toggleSelected() {
        const selected = document.querySelector('.selected');
        if (selected) {
            const checkbox = selected.querySelector('input[type="checkbox"], .task-checkbox, .habit-checkbox');
            if (checkbox) checkbox.click();
        }
    }

    undo() {
        if (this.app?.undoRedo) {
            this.app.undoRedo.undo();
        }
    }

    redo() {
        if (this.app?.undoRedo) {
            this.app.undoRedo.redo();
        }
    }

    switchToTab(tab) {
        if (this.app?.switchTab) {
            this.app.switchTab(tab);
        }
    }

    focusSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        } else if (this.app?.globalSearch) {
            this.app.globalSearch.openSearch();
        }
    }

    closeModals() {
        // Close all open modals
        document.querySelectorAll('.modal[style*="block"], .modal.open').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('open');
        });
        
        // Close bottom sheets
        document.querySelectorAll('.bottom-sheet.open').forEach(sheet => {
            sheet.classList.remove('open');
        });
    }
}

window.KeyboardShortcuts = KeyboardShortcuts;

