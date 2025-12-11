# Flow App - Changelog

## [Batch 7 UX Improvements] - January 2025

### Major Features Added

#### Task Management
- ✅ **Completed Tasks Separation**: Separated completed tasks into collapsible section on Today page
- ✅ **Task Sorting System**: Comprehensive sorting by date, priority, name, creation/completion dates
- ✅ **Filter Improvements**: Better contrast for filter pills, integrated sort control into filter groups
- ✅ **Today-only Completed Tasks**: Only shows tasks completed today (not from previous days)

#### Mobile Optimization
- ✅ **Navigation Bar Redesign**: Mobile-first design with 4 primary tabs + "More" menu
- ✅ **Compact Search Button**: Circular search button on mobile that expands on click
- ✅ **Rounded Nav Bar**: Reduces awkward gap from Safari search bar
- ✅ **Safe Area Support**: Proper iOS safe area insets for notched devices
- ✅ **Touch Targets**: Minimum 44px touch targets for all interactive elements

#### UI/UX Polish
- ✅ **Button Contrast Fixes**: White text on theme-colored buttons for better readability
- ✅ **Theme Integration**: All buttons and UI elements now use theme colors dynamically
- ✅ **Light Theme Restoration**: Fixed dark backgrounds appearing unexpectedly
- ✅ **Calendar Drag-to-Close**: Bottom sheet can be closed by dragging down
- ✅ **Search UX**: Results only appear on explicit search button press (no accidental popups)

#### Header & Navigation
- ✅ **Settings Button**: Moved to top right, custom SVG icon
- ✅ **Header Cleanup**: Removed task/habit stat badges for cleaner design
- ✅ **Settings Removal**: Removed from bottom nav (now only in header)

### Files Added

#### CSS
- `static/css/mobile-optimization.css` - Mobile-specific optimizations
- `static/css/spacing-optimization.css` - Global spacing improvements
- `static/css/mobile-nav-redesign.css` - Mobile navigation redesign
- `static/css/search-compact.css` - Compact search button styles
- `static/css/light-theme-fix.css` - Light theme restoration
- `static/css/task-sorting.css` - Task sorting UI styles

#### JavaScript
- `static/js/task-sorting.js` - Task sorting functionality
- `static/js/search.js` - Enhanced search with mobile optimizations

#### Documentation
- `BATCH7_UX_IMPROVEMENTS.md` - Complete documentation of UX improvements

### Files Modified

- `static/css/main.css` - Button contrast, theme integration, completed tasks styles
- `static/css/calm-theme.css` - Filter pill colors, button theme integration
- `static/css/design-system.css` - Bottom sheet drag handle, habit icons
- `static/js/main.js` - Task separation, sorting integration, mobile menu, drag-to-close
- `templates/index.html` - Header structure, nav structure, sort controls
- `app.py` - Removed affirmation from day view API

### Bug Fixes

1. Search results popping up on scroll - Fixed
2. Text overlapping with boxes in Add Habit - Fixed
3. Button text blending with backgrounds - Fixed
4. Dark backgrounds appearing unexpectedly - Fixed
5. Sort button awkward positioning - Fixed
6. Calendar popup can't be closed by dragging - Fixed
7. Completed tasks showing past days - Fixed

### Technical Improvements

- localStorage persistence for sort preferences
- Event-driven architecture with custom events
- Modular CSS organization
- Reusable JavaScript classes (TaskSorter)
- Proper cleanup of event listeners
- iOS-specific optimizations

---

## [Batch 7 Enterprise Features] - December 2024

### Features Added

#### Authentication & Security
- Social logins (Google, Apple, GitHub)
- Passwordless login (magic links/OTP)
- 2FA support (TOTP)
- Session persistence

#### Calendar Integration
- Google Calendar sync
- Multi-view calendar (Agenda, 3-day, Heatmap)
- Drag-and-drop event creation
- Inline editing

#### Offline & Sync
- Offline mode with local caching
- Cross-device sync
- Conflict resolution
- Sync queue management

#### Productivity Tools
- Natural language task parser
- Pomodoro with auto time logging
- Keyboard shortcuts
- Widgets system

#### Data Portability
- Export/Import (CSV, ICS, Markdown)
- Automatic backups
- Error recovery

### Files Added

- `static/js/auth.js`
- `static/js/calendar-sync.js`
- `static/js/calendar-ux.js`
- `static/js/cross-device-sync.js`
- `static/js/enhanced-offline.js`
- `static/js/enhanced-pomodoro.js`
- `static/js/export-import.js`
- `static/js/keyboard-shortcuts.js`
- `static/js/smart-parser.js`
- `static/js/widgets.js`
- `static/js/notifications.js`
- `static/css/batch7-features.css`

---

## [Previous Batches]

See individual batch documentation in `versions/` directory:
- Batch 0: MVP
- Batch 1: Smart Features
- Batch 2: Intelligence
- Batch 3: Design Premium
- Batch 4: Intelligent Companion
- Batch 5: Calm Design
- Batch 6: Power Features
