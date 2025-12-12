/**
 * Custom Icon System for Flow App
 * Premium SVG icons with consistent design language
 */

const FlowIcons = {
    // App Logo
    logo: `
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Circular waves representing flow -->
            <circle cx="60" cy="60" r="50" stroke="url(#logoGradient)" stroke-width="3" fill="none" opacity="0.2"/>
            <circle cx="60" cy="60" r="40" stroke="url(#logoGradient)" stroke-width="3" fill="none" opacity="0.4"/>
            <circle cx="60" cy="60" r="30" stroke="url(#logoGradient)" stroke-width="3" fill="none" opacity="0.6"/>
            <!-- Central droplet/water shape -->
            <path d="M60 30 C70 40, 75 50, 75 60 C75 72, 68 80, 60 80 C52 80, 45 72, 45 60 C45 50, 50 40, 60 30 Z" 
                  fill="url(#logoGradient)" opacity="0.9"/>
            <!-- Sparkle accent -->
            <path d="M85 35 L88 38 L85 41 L82 38 Z" fill="#FFF3D6" opacity="0.8"/>
            <path d="M35 85 L38 88 L35 91 L32 88 Z" fill="#CFF5DC" opacity="0.8"/>
            <!-- Gradient definitions -->
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#A9C6FF;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#C3D7FF;stop-opacity:1" />
                </linearGradient>
            </defs>
        </svg>
    `,
    
    // Logo Mark (simplified for small sizes) - Dynamic color based on theme
    logoMark: `
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="var(--theme-primary, #A9C6FF)"/>
            <path d="M20 10 C24 14, 26 17, 26 20 C26 24.5, 23 28, 20 28 C17 28, 14 24.5, 14 20 C14 17, 16 14, 20 10 Z" 
                  fill="white" opacity="0.9"/>
        </svg>
    `,
    
    // Navigation Icons
    tasks: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
    `,
    
    calendar: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <circle cx="8" cy="14" r="1" fill="currentColor"></circle>
            <circle cx="12" cy="14" r="1" fill="currentColor"></circle>
            <circle cx="16" cy="14" r="1" fill="currentColor"></circle>
        </svg>
    `,
    
    habits: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </svg>
    `,
    
    focus: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
        </svg>
    `,
    
    stats: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
    `,
    
    graph: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="5" r="2"></circle>
            <circle cx="19" cy="5" r="2"></circle>
            <circle cx="5" cy="19" r="2"></circle>
            <circle cx="19" cy="19" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <line x1="5" y1="5" x2="12" y2="12"></line>
            <line x1="19" y1="5" x2="12" y2="12"></line>
            <line x1="5" y1="19" x2="12" y2="12"></line>
            <line x1="19" y1="19" x2="12" y2="12"></line>
        </svg>
    `,
    
    settings: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
        </svg>
    `,
    
    reflect: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
        </svg>
    `,

    // Action Icons
    plus: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    `,

    check: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `,

    snooze: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="13" r="8"></circle>
            <path d="M12 9v4l2 2"></path>
            <path d="M5 3L3 5M19 3l2 2"></path>
        </svg>
    `,

    reschedule: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10H3M21 6H3M21 14h-5M21 18h-5"></path>
            <circle cx="17" cy="16" r="4"></circle>
            <path d="M19 15.5L17 17l-1-1"></path>
        </svg>
    `,

    breakdown: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
    `,

    insights: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M18 17V9M13 17V5M8 17v-3"></path>
        </svg>
    `,

    // Habit Category Icons
    water: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"></path>
        </svg>
    `,

    book: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path>
        </svg>
    `,

    exercise: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3l4 4-4 4M3 7l4-4 4 4"></path>
            <path d="M7 7v10M17 7v10"></path>
            <path d="M3 17l4 4 4-4M17 17l4 4-4 4"></path>
        </svg>
    `,

    meditation: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    `,

    write: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
        </svg>
    `,

    sparkles: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
            <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"></path>
        </svg>
    `,

    // Status Icons
    flame: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c-1.5 4-4 6-7 6 3 4 4 8 4 12 0 2-1 3-2 3h10c-1 0-2-1-2-3 0-4 1-8 4-12-3 0-5.5-2-7-6z"></path>
        </svg>
    `,

    alert: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    `,

    // Navigation arrows
    chevronLeft: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `,

    chevronRight: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    `,

    close: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `,

    // Batch 5: Category Icons (Calm Style)
    briefcase: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
        </svg>
    `,

    laptop: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
    `,

    shoppingBag: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
    `,

    home: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    `,

    wallet: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12V7H5a2 2 0 010-4h14v4"></path>
            <path d="M3 5v14a2 2 0 002 2h16v-5"></path>
            <path d="M18 12a2 2 0 012 2 2 2 0 01-2 2h-2v-4h2z"></path>
        </svg>
    `,

    leaf: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
    `,

    bell: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
    `,

    clock: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    `,

    tag: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
    `,

    folder: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
        </svg>
    `,

    filter: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    `,

    grid: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
    `,

    list: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
    `,

    moreVertical: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
        </svg>
    `,

    heart: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
        </svg>
    `,

    moon: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
        </svg>
    `,

    sun: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    `,

    edit: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    `,

    repeat: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 014-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 01-4 4H3"></path>
        </svg>
    `,

    // Priority indicators
    priorityHigh: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    `,

    priorityMedium: `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    `,

    priorityLow: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `,

    copy: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
    `,

    trash: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
        </svg>
    `,
    
    // Mood & Energy Icons
    moodVeryLow: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    `,
    
    moodLow: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="15" x2="16" y2="15"></line>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    `,
    
    moodNeutral: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    `,
    
    moodGood: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <circle cx="9" cy="9" r="1" fill="currentColor"></circle>
            <circle cx="15" cy="9" r="1" fill="currentColor"></circle>
        </svg>
    `,
    
    moodExcellent: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" fill="none"></circle>
            <path d="M8 13s1.5 3 4 3 4-3 4-3"></path>
            <circle cx="9" cy="9" r="1.5" fill="currentColor"></circle>
            <circle cx="15" cy="9" r="1.5" fill="currentColor"></circle>
            <path d="M12 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor" opacity="0.6"></path>
        </svg>
    `,
    
    // Lightbulb for insights
    lightbulb: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8a6 6 0 00-12 0c0 1.36.46 2.58 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
            <circle cx="12" cy="8" r="1" fill="currentColor"></circle>
        </svg>
    `
};

/**
 * Helper function to create icon element
 */
function createIcon(iconName, className = 'icon icon-calm') {
    const wrapper = document.createElement('span');
    wrapper.className = className;
    wrapper.innerHTML = FlowIcons[iconName] || FlowIcons.sparkles;
    return wrapper;
}

/**
 * Helper function to get icon HTML
 */
function getIconHTML(iconName) {
    return FlowIcons[iconName] || FlowIcons.sparkles;
}

// Export for use in main app
window.FlowIcons = FlowIcons;
window.createIcon = createIcon;
window.getIconHTML = getIconHTML;

