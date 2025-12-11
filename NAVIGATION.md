# Flow App - Quick Navigation Guide

**Lost? Start here!** This is your map to finding anything in the Flow App project.

---

## 🎯 I Want To...

### **Get Started**
✅ [Install and run the app](START_HERE.md) → Quick start guide
✅ [Learn all features](QUICK_REFERENCE.md) → Feature cheat sheet
✅ [Learn from versions](docs/learning/LEARNING_GUIDE.md) → Complete learning path

### **Understand the App**
✅ [See what it can do](docs/technical/FEATURES.md) → Complete feature list
✅ [View the timeline](docs/changelog/COMPLETE_EVOLUTION.md) → Development history
✅ [Compare versions](versions/COMPARISON_GUIDE.md) → Before/after analysis

### **Design & UI**
✅ [Design system](docs/technical/COMPLETE_DESIGN_OVERHAUL.md) → Complete overhaul
✅ [Icon system](docs/technical/ICON_SYSTEM_UPGRADE.md) → Custom SVG icons
✅ [Visual changes](docs/technical/BEFORE_AFTER.md) → Screenshots & comparisons

### **Fix Issues**
✅ [Troubleshooting](docs/technical/TROUBLESHOOTING.md) → Common problems
✅ [Debug guide](docs/technical/DEBUGGING_GUIDE.md) → Debug tools
✅ [Known fixes](docs/fixes/MAJOR_FIXES_SUMMARY.md) → Bug fix archive

### **Explore Code**
✅ [Project structure](PROJECT_STRUCTURE.md) → File organization
✅ [Backend](app.py) → Flask server (1,800+ lines)
✅ [Frontend](static/js/main.js) → App logic (4,093 lines)

---

## 📚 Documentation Shortcuts

| Document | Purpose | Location |
|----------|---------|----------|
| **README** | Project overview | `README.md` |
| **Quickstart** | Setup guide | `docs/guides/QUICKSTART.md` |
| **Features** | Feature catalog | `docs/technical/FEATURES.md` |
| **Evolution** | Full history | `docs/changelog/COMPLETE_EVOLUTION.md` |
| **Design** | Design system | `docs/technical/COMPLETE_DESIGN_OVERHAUL.md` |
| **Fixes** | Bug fixes | `docs/fixes/MAJOR_FIXES_SUMMARY.md` |
| **Structure** | File map | `PROJECT_STRUCTURE.md` |

---

## 📁 Folder Guide

```
Flow_App/
│
├── 📄 Core Files
│   ├── README.md              ← Start here!
│   ├── app.py                 ← Backend
│   └── requirements.txt       ← Dependencies
│
├── 📚 docs/                   ← All documentation
│   ├── guides/               ← Getting started
│   ├── changelog/            ← Version history
│   ├── technical/            ← Deep dives
│   └── fixes/                ← Bug logs
│
├── 🎨 static/                 ← Frontend assets
│   ├── css/                  ← Stylesheets
│   ├── js/                   ← JavaScript
│   └── *.png                 ← Icons
│
├── 📱 templates/              ← HTML
│   └── index.html
│
├── 💾 data/                   ← Storage
│   └── flow_data.json
│
└── 🕰 versions/               ← Historical code
    └── batch0-7/             ← 8 versions
```

---

## 🔍 Search Index

### **By Topic:**

**Setup & Installation**
- [QUICKSTART.md](docs/guides/QUICKSTART.md)
- [requirements.txt](requirements.txt)

**Features & Functionality**
- [FEATURES.md](docs/technical/FEATURES.md)
- [QUICK_REFERENCE.md](docs/guides/QUICK_REFERENCE.md)

**Design & UI**
- [COMPLETE_DESIGN_OVERHAUL.md](docs/technical/COMPLETE_DESIGN_OVERHAUL.md)
- [ICON_SYSTEM_UPGRADE.md](docs/technical/ICON_SYSTEM_UPGRADE.md)
- [ADD_HABIT_MODAL_REDESIGN.md](docs/technical/ADD_HABIT_MODAL_REDESIGN.md)

**Development History**
- [COMPLETE_EVOLUTION.md](docs/changelog/COMPLETE_EVOLUTION.md)
- [versions/INDEX.md](versions/INDEX.md)

**Bug Fixes**
- [MAJOR_FIXES_SUMMARY.md](docs/fixes/MAJOR_FIXES_SUMMARY.md)
- [SYNC_FIX.md](docs/fixes/SYNC_FIX.md)
- [CHECKBOX_FIX.md](docs/fixes/CHECKBOX_FIX.md)

**Technical**
- [DEBUGGING_GUIDE.md](docs/technical/DEBUGGING_GUIDE.md)
- [TROUBLESHOOTING.md](docs/technical/TROUBLESHOOTING.md)
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 🎨 Visual Assets

**Icons:**
- Logo: `FlowIcons.logo` (in icons.js)
- Navigation: `FlowIcons.tasks`, `calendar`, etc.
- PWA: `static/icon-192.png`, `icon-512.png`

**Stylesheets (Load Order):**
1. `static/css/main.css`
2. `static/css/design-system.css`
3. `static/css/calm-theme.css`
4. `static/css/calm-enhancements.css`

**JavaScript:**
- `static/js/main.js` - App logic
- `static/js/api.js` - Backend client
- `static/js/utils.js` - Utilities
- `static/js/icons.js` - Icon library

---

## 📊 Statistics

**Project Size:**
- **Code:** ~15,000+ lines
- **Documentation:** 40+ files
- **Versions:** 8 batches (0-7)
- **Features:** 60+ implemented

**Key Files:**
- Longest: `main.js` (4,093 lines)
- Backend: `app.py` (1,800+ lines)
- Most docs: `fixes/` and `versions/` (20+ files)

---

## 🚦 Status Indicators

| Badge | Meaning |
|-------|---------|
| ✅ | Complete & working |
| 🚧 | In progress |
| 📚 | Documentation |
| 🐛 | Bug fix |
| ✨ | New feature |
| 🎨 | Design/UI |

---

## 💡 Tips

1. **New to the project?** → Read [README.md](README.md) first
2. **Want to code?** → See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
3. **Found a bug?** → Check [TROUBLESHOOTING.md](docs/technical/TROUBLESHOOTING.md)
4. **Comparing versions?** → Use [versions/](versions/)
5. **Learning the design?** → Read [COMPLETE_DESIGN_OVERHAUL.md](docs/technical/COMPLETE_DESIGN_OVERHAUL.md)

---

## 🗺 Sitemap

```
ROOT
├─ README.md ..................... Main entry point
├─ NAVIGATION.md ................. This file
├─ PROJECT_STRUCTURE.md .......... File organization
│
├─ docs/
│  ├─ README.md .................. Documentation hub
│  ├─ guides/ .................... Getting started
│  ├─ changelog/ ................. History
│  ├─ technical/ ................. Deep dives
│  └─ fixes/ ..................... Bug logs
│
├─ static/
│  ├─ css/ ....................... Styles
│  └─ js/ ........................ Logic
│
└─ versions/
   └─ batch0-5/ .................. Code snapshots
```

---

## 🔗 External Resources

- **Flask Docs:** https://flask.palletsprojects.com/
- **PWA Guide:** https://web.dev/progressive-web-apps/
- **CSS Variables:** https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

---

## 📞 Need Help?

1. Check [TROUBLESHOOTING.md](docs/technical/TROUBLESHOOTING.md)
2. Review [DEBUGGING_GUIDE.md](docs/technical/DEBUGGING_GUIDE.md)
3. Search [docs/fixes/](docs/fixes/) for similar issues
4. Consult [QUICK_REFERENCE.md](docs/guides/QUICK_REFERENCE.md)

---

**Still lost?** Open [README.md](README.md) and start fresh!

*Last updated: January 2025 (Batch 7 UX Improvements)*

