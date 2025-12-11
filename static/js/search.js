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
        // Search bar in header actions container
        const existingSearchBar = document.getElementById('globalSearchBar');
        
        if (existingSearchBar && !existingSearchBar.querySelector('.search-input-wrapper')) {
            // Populate the existing container with search UI
            existingSearchBar.innerHTML = `
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
        } else if (!existingSearchBar) {
            // Fallback: create search bar if container doesn't exist
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
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
                // Insert before the settings button
                const settingsBtn = headerActions.querySelector('.header-settings-btn');
                if (settingsBtn) {
                    headerActions.insertBefore(searchBar, settingsBtn);
                } else {
                    headerActions.appendChild(searchBar);
                }
            }
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
        const searchWrapper = document.querySelector('.search-input-wrapper');
        const searchIcon = document.querySelector('.search-icon');

        // Mobile: Toggle expand/collapse on search icon click
        if (searchWrapper && window.innerWidth <= 768) {
            // Track if user explicitly clicked search button
            let userClickedSearch = false;
            
            // Click on wrapper or icon expands the search
            if (searchIcon) {
                searchIcon.addEventListener('click', (e) => {
                    userClickedSearch = true;
                    if (!searchWrapper.classList.contains('expanded')) {
                        searchWrapper.classList.add('expanded');
                        setTimeout(() => {
                            if (searchInput) {
                                searchInput.focus();
                                // Only open results if user clicked
                                if (userClickedSearch) {
                                    this.openSearch(true);
                                }
                            }
                        }, 100);
                    } else {
                        // If already expanded, clicking again opens results
                        this.openSearch(true);
                    }
                });
            }
            
            searchWrapper.addEventListener('click', (e) => {
                if (!searchWrapper.classList.contains('expanded') && e.target === searchWrapper) {
                    userClickedSearch = true;
                    searchWrapper.classList.add('expanded');
                    setTimeout(() => {
                        if (searchInput) {
                            searchInput.focus();
                                    // Only open results if user clicked
                                    if (userClickedSearch) {
                                        this.openSearch(true);
                                    }
                        }
                    }, 100);
                }
            });
            
            // Close button collapses search
            if (searchClose) {
                searchClose.addEventListener('click', () => {
                    searchWrapper.classList.remove('expanded');
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.blur();
                    }
                    this.handleSearch('');
                });
            }
            
            // Click outside collapses search
            document.addEventListener('click', (e) => {
                if (searchWrapper && searchWrapper.classList.contains('expanded')) {
                    if (!searchWrapper.contains(e.target) && 
                        !document.getElementById('searchResultsSheet')?.contains(e.target)) {
                        // Only collapse if search is empty or losing focus
                        if (!searchInput || !searchInput.value) {
                            searchWrapper.classList.remove('expanded');
                            if (searchInput) searchInput.blur();
                        }
                    }
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
                // Ensure expanded state on input
                if (searchWrapper && window.innerWidth <= 768) {
                    searchWrapper.classList.add('expanded');
                }
                // Only show results when user is actively typing (has focus)
                if (e.target.value.length > 0 && document.activeElement === searchInput) {
                    this.openSearch(true);
                } else if (e.target.value.length === 0) {
                    // Close if cleared
                    this.closeSearch();
                }
            });

            searchInput.addEventListener('focus', (e) => {
                // Don't auto-open search results on focus
                // Only expand the search bar itself
                if (searchWrapper && window.innerWidth <= 768) {
                    searchWrapper.classList.add('expanded');
                }
                // Results will open when user starts typing or clicks search button
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (searchWrapper && window.innerWidth <= 768 && searchWrapper.classList.contains('expanded')) {
                        searchWrapper.classList.remove('expanded');
                        if (searchInput) {
                            searchInput.value = '';
                            searchInput.blur();
                        }
                        this.handleSearch('');
                    } else {
                        this.closeSearch();
                    }
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
                if (searchWrapper && window.innerWidth <= 768) {
                    searchWrapper.classList.remove('expanded');
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.blur();
                    }
                    this.handleSearch('');
                } else {
                    this.closeSearch();
                }
            });
        }

        if (closeSheet) {
            closeSheet.addEventListener('click', () => {
                this.closeSearch();
                if (searchWrapper && window.innerWidth <= 768) {
                    searchWrapper.classList.remove('expanded');
                    if (searchInput) searchInput.blur();
                }
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
                this.openSearch(true);
                document.getElementById('searchInput')?.focus();
            }
        });
    }

    openSearch(forceOpen = false) {
        // Only open if explicitly requested or if user is actively using search
        const searchInput = document.getElementById('searchInput');
        if (!forceOpen && searchInput) {
            // Don't auto-open if input doesn't have focus, is empty, and not explicitly opened
            const hasFocus = document.activeElement === searchInput;
            const hasContent = searchInput.value && searchInput.value.length > 0;
            if (!hasFocus && !hasContent) {
                // Allow opening if there's content to show (recent searches)
                return;
            }
        }
        
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
            // Only show recent searches if search sheet is already open
            if (this.isOpen) {
                this.showRecentSearches();
            }
            return;
        }

        // Don't save to recent searches here - only save on Enter or result click
        // Search through all data
        const results = this.searchData(query);
        this.searchResults = results;
        
        // Only render results if search is open (user has initiated search)
        if (this.isOpen) {
            this.renderResults(results);
        }
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

