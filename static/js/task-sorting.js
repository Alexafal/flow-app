/**
 * Task Sorting and Filtering Utility
 * Provides reusable sorting and filtering functions for tasks across all pages
 */

class TaskSorter {
    constructor() {
        this.sortOptions = {
            'date-asc': { label: 'Date (Earliest First)', key: 'date', order: 'asc' },
            'date-desc': { label: 'Date (Latest First)', key: 'date', order: 'desc' },
            'priority-asc': { label: 'Priority (Low to High)', key: 'priority', order: 'asc' },
            'priority-desc': { label: 'Priority (High to Low)', key: 'priority', order: 'desc' },
            'name-asc': { label: 'Name (A-Z)', key: 'name', order: 'asc' },
            'name-desc': { label: 'Name (Z-A)', key: 'name', order: 'desc' },
            'created-asc': { label: 'Created (Oldest First)', key: 'created', order: 'asc' },
            'created-desc': { label: 'Created (Newest First)', key: 'created', order: 'desc' },
            'completed-asc': { label: 'Completed (Oldest First)', key: 'completed', order: 'asc' },
            'completed-desc': { label: 'Completed (Newest First)', key: 'completed', order: 'desc' }
        };
    }

    /**
     * Sort tasks based on sort option
     */
    sortTasks(tasks, sortOption = 'date-asc') {
        if (!tasks || tasks.length === 0) return tasks;
        
        const config = this.sortOptions[sortOption] || this.sortOptions['date-asc'];
        const sortedTasks = [...tasks];

        sortedTasks.sort((a, b) => {
            let result = 0;

            switch (config.key) {
                case 'date':
                    // Sort by due date
                    if (!a.due_date && !b.due_date) result = 0;
                    else if (!a.due_date) result = 1; // No due date goes to end
                    else if (!b.due_date) result = -1;
                    else result = a.due_date.localeCompare(b.due_date);
                    break;

                case 'priority':
                    // Sort by priority (high > medium > low > normal)
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'normal': 0 };
                    const aPriority = priorityOrder[a.priority] || 0;
                    const bPriority = priorityOrder[b.priority] || 0;
                    result = aPriority - bPriority;
                    break;

                case 'name':
                    // Sort alphabetically by title
                    result = (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
                    break;

                case 'created':
                    // Sort by creation date (id can be used as proxy if created_at not available)
                    if (a.created_at && b.created_at) {
                        result = a.created_at.localeCompare(b.created_at);
                    } else if (a.id && b.id) {
                        result = (a.id || 0) - (b.id || 0);
                    } else {
                        result = 0;
                    }
                    break;

                case 'completed':
                    // Sort by completion date
                    if (a.completed_at && b.completed_at) {
                        result = a.completed_at.localeCompare(b.completed_at);
                    } else if (a.completed_at) result = -1;
                    else if (b.completed_at) result = 1;
                    else result = 0;
                    break;

                default:
                    result = 0;
            }

            // Apply order (asc/desc)
            if (config.order === 'desc') {
                result = -result;
            }

            // Secondary sort: If equal, sort by priority, then by name
            if (result === 0) {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'normal': 0 };
                const aPriority = priorityOrder[a.priority] || 0;
                const bPriority = priorityOrder[b.priority] || 0;
                if (aPriority !== bPriority) {
                    return bPriority - aPriority; // Higher priority first
                }
                // If priority also equal, sort by name
                return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
            }

            return result;
        });

        return sortedTasks;
    }

    /**
     * Get default sort option for a page
     */
    getDefaultSort(page) {
        const saved = localStorage.getItem(`flow_sort_${page}`);
        return saved || (page === 'today' ? 'priority-desc' : 'date-asc');
    }

    /**
     * Save sort preference for a page
     */
    saveSortPreference(page, sortOption) {
        localStorage.setItem(`flow_sort_${page}`, sortOption);
    }

    /**
     * Create sort dropdown UI element
     */
    createSortDropdown(page, currentSort = null) {
        if (!currentSort) {
            currentSort = this.getDefaultSort(page);
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'sort-control';
        dropdown.innerHTML = `
            <button class="sort-dropdown-btn" id="sortBtn_${page}" aria-label="Sort tasks">
                <span class="sort-icon">🔀</span>
                <span class="sort-label">${this.sortOptions[currentSort]?.label || 'Sort'}</span>
                <span class="sort-arrow">▼</span>
            </button>
            <div class="sort-dropdown-menu" id="sortMenu_${page}" style="display: none;">
                ${Object.entries(this.sortOptions).map(([key, option]) => `
                    <button class="sort-option ${currentSort === key ? 'active' : ''}" 
                            data-sort="${key}" 
                            data-page="${page}">
                        ${option.label}
                        ${currentSort === key ? '<span class="check-icon">✓</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;

        // Add click handlers
        const btn = dropdown.querySelector(`#sortBtn_${page}`);
        const menu = dropdown.querySelector(`#sortMenu_${page}`);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = menu.style.display !== 'none';
            // Close all other menus
            document.querySelectorAll('.sort-dropdown-menu').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            menu.style.display = isVisible ? 'none' : 'block';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                menu.style.display = 'none';
            }
        });

        // Handle sort option selection
        dropdown.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const sortKey = e.currentTarget.dataset.sort;
                const pageName = e.currentTarget.dataset.page;
                
                // Update active state
                dropdown.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Update button label
                btn.querySelector('.sort-label').textContent = this.sortOptions[sortKey].label;
                
                // Save preference
                this.saveSortPreference(pageName, sortKey);
                
                // Hide menu
                menu.style.display = 'none';
                
                // Dispatch custom event to trigger re-render
                window.dispatchEvent(new CustomEvent('sortChanged', { 
                    detail: { page: pageName, sort: sortKey } 
                }));
            });
        });

        return dropdown;
    }
}

// Export singleton instance
window.taskSorter = new TaskSorter();
