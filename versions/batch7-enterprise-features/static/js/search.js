/**
 * Global Search Bar - Spotlight-style search
 * Searches tasks, habits, notes, tags, dates
 */

class GlobalSearch {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.searchResults = [];
        this.recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        this.init();
    }

    init() {
        this.createSearchUI();
        this.attachEventListeners();
        this.setupKeyboardShortcut();
    }

    createSearchUI() {
        // Search bar in header
        const header = document.querySelector('.header-content');
        if (header && !document.getElementById('globalSearchBar')) {
            const searchBar = document.createElement('div');
            searchBar.id = 'globalSearchBar';
            searchBar.className = 'global-search-bar';
            searchBar.innerHTML = `
                <div class="search-input-wrapper">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        id="searchInput" 
                        class="search-input" 
                        placeholder="Search tasks, habits, tags..."
                        autocomplete="off"
                    >
                    <button class="search-close" id="searchClose" style="display: none;">×</button>
                </div>
            `;
            header.appendChild(searchBar);
        }

        // Results sheet
        if (!document.getElementById('searchResultsSheet')) {
            const sheet = document.createElement('div');
            sheet.id = 'searchResultsSheet';
            sheet.className = 'search-results-sheet';
            sheet.innerHTML = `
                <div class="search-results-header">
                    <h3>Search Results</h3>
                    <button class="close-sheet" id="closeSearchSheet">×</button>
                </div>
                <div class="search-results-content" id="searchResultsContent">
                    <div class="search-empty-state">
                        <p>Start typing to search...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(sheet);
        }
    }

    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');
        const closeSheet = document.getElementById('closeSearchSheet');
        const searchBar = document.getElementById('globalSearchBar');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('focus', () => {
                this.openSearch();
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSearch();
                } else if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query.length >= 2) {
                        this.saveToRecentSearches(query);
                    }
                    if (this.searchResults.length > 0) {
                        this.navigateToFirstResult();
                    }
                }
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                this.closeSearch();
            });
        }

        if (closeSheet) {
            closeSheet.addEventListener('click', () => {
                this.closeSearch();
            });
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen && !searchBar?.contains(e.target) && 
                !document.getElementById('searchResultsSheet')?.contains(e.target)) {
                this.closeSearch();
            }
        });
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Cmd+K or Ctrl+K to open search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
                document.getElementById('searchInput')?.focus();
            }
        });
    }

    openSearch() {
        this.isOpen = true;
        const sheet = document.getElementById('searchResultsSheet');
        const searchClose = document.getElementById('searchClose');
        
        if (sheet) {
            sheet.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        
        if (searchClose) {
            searchClose.style.display = 'block';
        }

        // Show recent searches if no query
        const query = document.getElementById('searchInput')?.value || '';
        if (!query) {
            this.showRecentSearches();
        }
    }

    closeSearch() {
        this.isOpen = false;
        const sheet = document.getElementById('searchResultsSheet');
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');
        
        if (sheet) {
            sheet.classList.remove('open');
            document.body.style.overflow = '';
        }
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (searchClose) {
            searchClose.style.display = 'none';
        }

        this.searchResults = [];
        this.renderResults([]);
    }

    async handleSearch(query) {
        if (!query || query.length < 1) {
            this.showRecentSearches();
            return;
        }

        // Don't save to recent searches here - only save on Enter or result click
        // Search through all data
        const results = this.searchData(query);
        this.searchResults = results;
        this.renderResults(results);
    }

    saveToRecentSearches(query) {
        // Only save complete searches (not every keystroke)
        if (!query || query.trim().length < 2) return;
        
        const trimmedQuery = query.trim();
        if (!this.recentSearches.includes(trimmedQuery)) {
            this.recentSearches.unshift(trimmedQuery);
            this.recentSearches = this.recentSearches.slice(0, 10);
            localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
        }
    }

    searchData(query) {
        const lowerQuery = query.toLowerCase();
        const results = {
            tasks: [],
            habits: [],
            tags: [],
            dates: []
        };

        // Search tasks
        this.app.tasks.forEach(task => {
            let match = false;
            const reasons = [];

            if (task.title?.toLowerCase().includes(lowerQuery)) {
                match = true;
                reasons.push('title');
            }
            if (task.description?.toLowerCase().includes(lowerQuery)) {
                match = true;
                reasons.push('description');
            }
            if (task.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
                match = true;
                reasons.push('tag');
            }
            if (task.due_date?.includes(lowerQuery)) {
                match = true;
                reasons.push('date');
            }

            if (match) {
                results.tasks.push({ ...task, matchReasons: reasons });
            }
        });

        // Search habits
        this.app.habits.forEach(habit => {
            let match = false;
            const reasons = [];

            if (habit.name?.toLowerCase().includes(lowerQuery)) {
                match = true;
                reasons.push('name');
            }
            if (habit.category?.toLowerCase().includes(lowerQuery)) {
                match = true;
                reasons.push('category');
            }

            if (match) {
                results.habits.push({ ...habit, matchReasons: reasons });
            }
        });

        // Search tags
        const allTags = new Set();
        this.app.tasks.forEach(task => {
            task.tags?.forEach(tag => {
                if (tag.toLowerCase().includes(lowerQuery)) {
                    allTags.add(tag);
                }
            });
        });
        results.tags = Array.from(allTags);

        // Search dates
        const dateMatches = [];
        this.app.tasks.forEach(task => {
            if (task.due_date && task.due_date.includes(lowerQuery)) {
                dateMatches.push(task.due_date);
            }
        });
        results.dates = [...new Set(dateMatches)];

        return results;
    }

    renderResults(results) {
        const content = document.getElementById('searchResultsContent');
        if (!content) return;

        const totalResults = results.tasks.length + results.habits.length + 
                           results.tags.length + results.dates.length;

        if (totalResults === 0) {
            content.innerHTML = `
                <div class="search-empty-state">
                    <p>No results found</p>
                    <small>Try different keywords</small>
                </div>
            `;
            return;
        }

        let html = '';

        // Tasks
        if (results.tasks.length > 0) {
            html += `<div class="search-section">
                <h4>Tasks (${results.tasks.length})</h4>
                <div class="search-results-list">`;
            
            results.tasks.forEach(task => {
                const reasons = task.matchReasons.join(', ');
                html += `
                    <div class="search-result-item" data-type="task" data-id="${task.id}">
                        <div class="result-icon">✓</div>
                        <div class="result-content">
                            <div class="result-title">${this.highlightMatch(task.title, document.getElementById('searchInput')?.value)}</div>
                            <div class="result-meta">Matched in: ${reasons}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }

        // Habits
        if (results.habits.length > 0) {
            html += `<div class="search-section">
                <h4>Habits (${results.habits.length})</h4>
                <div class="search-results-list">`;
            
            results.habits.forEach(habit => {
                html += `
                    <div class="search-result-item" data-type="habit" data-id="${habit.id}">
                        <div class="result-icon">${habit.icon || '🔥'}</div>
                        <div class="result-content">
                            <div class="result-title">${this.highlightMatch(habit.name, document.getElementById('searchInput')?.value)}</div>
                            <div class="result-meta">${habit.category || 'No category'}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }

        // Tags
        if (results.tags.length > 0) {
            html += `<div class="search-section">
                <h4>Tags (${results.tags.length})</h4>
                <div class="search-results-list">`;
            
            results.tags.forEach(tag => {
                html += `
                    <div class="search-result-item" data-type="tag" data-tag="${tag}">
                        <div class="result-icon">#</div>
                        <div class="result-content">
                            <div class="result-title">${tag}</div>
                            <div class="result-meta">Click to filter by tag</div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }

        content.innerHTML = html;

        // Attach click handlers
        content.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleResultClick(item);
            });
        });
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    handleResultClick(item) {
        const type = item.dataset.type;
        const id = item.dataset.id;
        const tag = item.dataset.tag;
        const query = item.dataset.query;

        // Save search query when clicking a result
        if (query) {
            this.saveToRecentSearches(query);
        } else {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim().length >= 2) {
                this.saveToRecentSearches(searchInput.value);
            }
        }

        if (type === 'task') {
            this.app.switchTab('today');
            setTimeout(() => {
                const taskElement = document.querySelector(`[data-task-id="${id}"]`);
                if (taskElement) {
                    taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    taskElement.style.animation = 'pulse 0.5s';
                }
            }, 300);
        } else if (type === 'habit') {
            this.app.switchTab('habits');
            setTimeout(() => {
                const habitElement = document.querySelector(`[data-habit-id="${id}"]`);
                if (habitElement) {
                    habitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    habitElement.style.animation = 'pulse 0.5s';
                }
            }, 300);
        } else if (type === 'tag') {
            this.app.switchTab('alltasks');
            // Filter by tag (implement filter system)
        }

        this.closeSearch();
    }

    navigateToFirstResult() {
        const firstResult = document.querySelector('.search-result-item');
        if (firstResult) {
            firstResult.click();
        }
    }

    showRecentSearches() {
        const content = document.getElementById('searchResultsContent');
        if (!content || this.recentSearches.length === 0) return;

        let html = `
            <div class="search-section">
                <h4>Recent Searches</h4>
                <div class="search-results-list">
        `;

        this.recentSearches.forEach(search => {
            html += `
                <div class="search-result-item recent-search" data-query="${search}">
                    <div class="result-icon">🕐</div>
                    <div class="result-content">
                        <div class="result-title">${search}</div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        content.innerHTML = html;

        // Click to search again
        content.querySelectorAll('.recent-search').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                document.getElementById('searchInput').value = query;
                this.handleSearch(query);
            });
        });
    }
}

// Export for use in main.js
window.GlobalSearch = GlobalSearch;

