# Flow App - Project Structure

Complete guide to the project organization and file locations.

---

## 📁 Root Directory

```
Flow_App/
├── README.md                   # Main project documentation
├── PROJECT_STRUCTURE.md        # This file
├── app.py                      # Flask backend server
├── requirements.txt            # Python dependencies
│
├── data/                       # Application data
│   └── flow_data.json         # Tasks, habits, settings
│
├── templates/                  # HTML templates
│   └── index.html             # Main app interface
│
├── static/                     # Frontend assets
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript
│   ├── *.png                  # PWA icons
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
│
├── docs/                       # 📚 Documentation hub
│   ├── README.md              # Documentation index
│   ├── guides/                # User guides
│   ├── changelog/             # Version history
│   ├── technical/             # Technical docs
│   └── fixes/                 # Bug fix logs
│
└── versions/                   # Historical snapshots
    ├── batch0-mvp/
    ├── batch1-smart-features/
    ├── batch2-intelligence/
    ├── batch3-design-premium/
    ├── batch4-intelligent-companion/
    ├── batch5-calm-design/
    ├── batch6-power-features/
    ├── batch7-enterprise-features/
    ├── COMPARISON_GUIDE.md
    ├── INDEX.md
    └── README.md
```

---

## 🎨 Static Assets (`/static`)

### **CSS Files** (`/static/css/`)
```
css/
├── main.css                    # Base styles, layout, legacy
├── design-system.css           # Premium components, glassmorphism
├── calm-theme.css              # Color system, typography
├── batch6-features.css         # Batch 6 feature styles
├── batch7-features.css         # Batch 7 enterprise features
├── mobile-optimization.css     # Mobile responsiveness
├── mobile-nav-redesign.css     # Mobile navigation
├── search-compact.css          # Compact search styles
├── spacing-optimization.css    # Layout spacing
├── task-sorting.css            # Task sorting UI
├── light-theme-fix.css         # Theme fixes
└── themes.css                  # Theme system
```

**Load Order:** main.css → design-system.css → calm-theme.css → batch6-features.css → batch7-features.css → mobile-optimization.css → spacing-optimization.css → others

### **JavaScript Files** (`/static/js/`)
```
js/
├── main.js                     # App logic, UI interactions (4,093 lines)
├── api.js                      # Backend API client
├── utils.js                    # Utility functions, parsers
├── icons.js                    # SVG icon library (50+ icons)
├── search.js                   # Global search functionality
├── task-sorting.js             # Task sorting system
├── auth.js                     # Authentication system
├── calendar-sync.js            # Calendar synchronization
├── calendar-ux.js              # Calendar UX enhancements
├── enhanced-offline.js         # Offline mode
├── notifications.js            # Push notifications
├── keyboard-shortcuts.js       # Keyboard navigation
├── smart-parser.js             # Natural language parsing
├── export-import.js            # Data portability
├── widgets.js                  # Dashboard widgets
├── focus-mode.js               # Focus mode
├── dragdrop.js                 # Drag and drop
├── gestures.js                 # Touch gestures
├── templates.js                # Task templates
├── undo-redo.js                # Undo/redo system
├── projects.js                 # Project management
├── scheduling.js               # Smart scheduling
├── task-groups.js              # Task grouping
├── activity-log.js             # Activity logging
├── enhanced-pomodoro.js        # Pomodoro timer
├── cross-device-sync.js        # Cross-device sync
├── ios-shortcuts.js            # iOS shortcuts
└── offline.js                  # Offline support
```

### **PWA Files**
```
static/
├── manifest.json               # PWA configuration
├── sw.js                       # Service worker (offline support)
├── icon-192.png               # PWA icon (192×192)
└── icon-512.png               # PWA icon (512×512)
```

---

## 📚 Documentation (`/docs`)

### **User Guides** (`/docs/guides/`)
Perfect for new users and quick reference:
```
guides/
├── QUICKSTART.md               # 5-minute setup guide
├── START_HERE.md               # First-time user walkthrough
├── QUICK_REFERENCE.md          # Feature cheat sheet
└── START.md                    # Alternative start guide
```

### **Changelog** (`/docs/changelog/`)
Complete version history:
```
changelog/
├── COMPLETE_EVOLUTION.md       # Full development timeline
├── IMPROVEMENTS.md             # Batch 1: Smart Features
├── BATCH2_IMPROVEMENTS.md      # Batch 2: Intelligence & Personalization
├── BATCH3_DESIGN_UPGRADE.md    # Batch 3: Premium Design
├── BATCH4_SUMMARY.md           # Batch 4: Behavior Engine
├── BATCH5_SUMMARY.md           # Batch 5: Calm Theme
├── FINAL_SUMMARY.md            # Final comprehensive summary
└── UPGRADE_SUMMARY.md          # Upgrade highlights
```

### **Technical Docs** (`/docs/technical/`)
Deep technical documentation:
```
technical/
├── COMPLETE_DESIGN_OVERHAUL.md # Full design system refresh
├── ICON_SYSTEM_UPGRADE.md      # Custom SVG icon implementation
├── ADD_HABIT_MODAL_REDESIGN.md # Habit modal upgrade
├── FEATURES.md                 # Complete feature catalog
├── BEFORE_AFTER.md             # Visual comparisons
├── DEBUGGING_GUIDE.md          # Debug tools & techniques
└── TROUBLESHOOTING.md          # Common issues & solutions
```

### **Bug Fixes** (`/docs/fixes/`)
Detailed fix documentation:
```
fixes/
├── MAJOR_FIXES_SUMMARY.md      # Overview of all major fixes
├── BUGFIXES_TICKING_SYSTEM.md  # Task/habit toggling fixes
├── SYNC_FIX.md                 # Cross-view synchronization
├── CHECKBOX_FIX.md             # Checkbox display issues
├── CALENDAR_CHECKBOX_FINAL_FIX.md # Calendar-specific fixes
├── STYLING_IMPROVEMENTS.md     # Visual refinements
├── HABIT_CONTEXT_MENU.md       # Right-click menu implementation
├── SYNTAX_ERROR_FIX.md         # JavaScript syntax fixes
├── BATCH5_FIXES.md             # Batch 5 specific fixes
├── FINAL_BUGFIX.md             # Latest fixes
├── HABIT_CHECKBOX_DEBUG.md     # Debugging documentation
└── TEST_HABITS_NOW.md          # Testing instructions
```

---

## 🕰 Version History (`/versions`)

Snapshots of each development batch:

```
versions/
├── README.md                   # Versions overview
├── INDEX.md                    # Detailed version index
├── COMPARISON_GUIDE.md         # Compare versions
│
├── batch0-mvp/                 # Initial MVP
│   ├── CHANGES.md
│   ├── static/, templates/
│   └── [complete snapshot]
│
├── batch1-smart-features/      # Smart suggestions, insights
│   ├── CHANGES.md, IMPROVEMENTS.md
│   ├── static/, templates/
│   └── [complete snapshot]
│
├── batch2-intelligence/        # Calendar, personalization
│   ├── BATCH2_IMPROVEMENTS.md, CHANGES.md
│   ├── static/, templates/
│   └── [complete snapshot]
│
├── batch3-design-premium/      # Custom icons, premium UI
│   ├── BATCH3_DESIGN_UPGRADE.md, CHANGES.md
│   ├── app.py, requirements.txt
│   ├── static/, templates/
│   └── [complete snapshot]
│
├── batch4-intelligent-companion/ # Behavior engine
│   ├── CHANGES.md, NOTE.txt
│   ├── app.py, requirements.txt
│   ├── data/, static/, templates/
│   └── [complete snapshot]
│
└── batch5-calm-design/         # Calm theme overhaul
    ├── CHANGES.md, NOTE.txt
    ├── app.py, requirements.txt
    ├── static/, templates/
    └── [complete snapshot]
```

---

## 🗺 Navigation Map

### **"I want to..."**

#### **Set up the app**
→ [`docs/guides/QUICKSTART.md`](docs/guides/QUICKSTART.md)

#### **Learn all features**
→ [`docs/guides/QUICK_REFERENCE.md`](docs/guides/QUICK_REFERENCE.md)
→ [`docs/technical/FEATURES.md`](docs/technical/FEATURES.md)

#### **Understand the design**
→ [`docs/technical/COMPLETE_DESIGN_OVERHAUL.md`](docs/technical/COMPLETE_DESIGN_OVERHAUL.md)
→ [`docs/technical/ICON_SYSTEM_UPGRADE.md`](docs/technical/ICON_SYSTEM_UPGRADE.md)

#### **See the development history**
→ [`docs/changelog/COMPLETE_EVOLUTION.md`](docs/changelog/COMPLETE_EVOLUTION.md)
→ [`versions/INDEX.md`](versions/INDEX.md)

#### **Fix a bug or issue**
→ [`docs/technical/TROUBLESHOOTING.md`](docs/technical/TROUBLESHOOTING.md)
→ [`docs/fixes/MAJOR_FIXES_SUMMARY.md`](docs/fixes/MAJOR_FIXES_SUMMARY.md)

#### **Compare versions**
→ [`versions/COMPARISON_GUIDE.md`](versions/COMPARISON_GUIDE.md)
→ [`docs/technical/BEFORE_AFTER.md`](docs/technical/BEFORE_AFTER.md)

#### **Debug the code**
→ [`docs/technical/DEBUGGING_GUIDE.md`](docs/technical/DEBUGGING_GUIDE.md)

---

## 📊 File Statistics

### **Code Files:**
- **Python:** 1 file (1,800+ lines)
- **JavaScript:** 30+ files (15,000+ lines total)
- **CSS:** 12+ files (5,000+ lines total)
- **HTML:** 1 file (1,000+ lines)

### **Documentation:**
- **Total Docs:** 40+ markdown files
- **User Guides:** 4 files
- **Changelogs:** 10+ files
- **Technical:** 7 files
- **Fixes:** 12 files
- **Version Docs:** 8 batches (0-7)

### **Assets:**
- **Icons:** 2 PNG files (PWA)
- **SVG Icons:** 50+ in icons.js
- **Images:** Logo embedded in SVG

---

## 🔍 Quick File Finder

### **Main Files:**
| Purpose | File Location |
|---------|--------------|
| Backend | `app.py` |
| Frontend HTML | `templates/index.html` |
| Main JavaScript | `static/js/main.js` |
| Main Styles | `static/css/main.css` |
| Data Storage | `data/flow_data.json` |

### **Documentation:**
| Topic | File Location |
|-------|--------------|
| Getting Started | `docs/guides/QUICKSTART.md` |
| Features | `docs/technical/FEATURES.md` |
| Design System | `docs/technical/COMPLETE_DESIGN_OVERHAUL.md` |
| Full History | `docs/changelog/COMPLETE_EVOLUTION.md` |
| Bug Fixes | `docs/fixes/MAJOR_FIXES_SUMMARY.md` |
| Troubleshooting | `docs/technical/TROUBLESHOOTING.md` |

---

## 🎯 Key Concepts

### **Progressive Enhancement**
Files build on each other:
1. `main.css` - Base
2. `design-system.css` - Premium components
3. `calm-theme.css` - Color system
4. `calm-enhancements.css` - Final polish

### **Version Snapshots**
Each batch preserves:
- Complete working code
- Documentation
- Change logs
- Notes

### **Documentation Organization**
- **guides/** - User-facing
- **changelog/** - Historical
- **technical/** - Developer-facing
- **fixes/** - Issue tracking

---

## 📝 File Naming Conventions

- `README.md` - Overview/index files
- `BATCH*.md` - Version-specific docs
- `*_FIX.md` - Bug fix documentation
- `*_SUMMARY.md` - Summary/overview docs
- `*_GUIDE.md` - Instructional content
- `*_UPGRADE.md` - Update/migration guides

---

## 🚀 Deployment Structure

For production:
```
production/
├── app.py
├── requirements.txt
├── data/
├── static/
├── templates/
└── README.md
```

Everything in `docs/` and `versions/` is for development reference only.

---

*Last updated: January 2025 (Batch 7 UX Improvements)*

For questions about file locations, consult this document or the [main README](README.md).

