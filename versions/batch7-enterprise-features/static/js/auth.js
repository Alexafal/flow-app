/**
 * Authentication System
 * Handles login, OAuth, session management
 */

class AuthSystem {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    async checkAuthStatus() {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    this.onAuthSuccess();
                } else {
                    this.logout();
                }
            } else {
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'block';
        }
    }

    hideLoginScreen() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    }

    async loginWithGoogle() {
        try {
            // Redirect to Google OAuth
            window.location.href = '/api/auth/google';
        } catch (error) {
            console.error('Google login failed:', error);
            this.showError('Google login failed. Please try again.');
        }
    }

    async loginWithApple() {
        try {
            // Apple Sign In
            window.location.href = '/api/auth/apple';
        } catch (error) {
            console.error('Apple login failed:', error);
            this.showError('Apple login failed. Please try again.');
        }
    }

    async loginWithGitHub() {
        try {
            // GitHub OAuth
            window.location.href = '/api/auth/github';
        } catch (error) {
            console.error('GitHub login failed:', error);
            this.showError('GitHub login failed. Please try again.');
        }
    }

    async loginWithMagicLink(email) {
        try {
            const response = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                this.showSuccess('Magic link sent! Check your email.');
            } else {
                this.showError('Failed to send magic link.');
            }
        } catch (error) {
            console.error('Magic link failed:', error);
            this.showError('Failed to send magic link.');
        }
    }

    async loginWithOTP(email) {
        try {
            const response = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const data = await response.json();
                // Show OTP input
                this.showOTPInput(data.session_id);
            } else {
                this.showError('Failed to send OTP.');
            }
        } catch (error) {
            console.error('OTP failed:', error);
            this.showError('Failed to send OTP.');
        }
    }

    async verifyOTP(sessionId, otp) {
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, otp })
            });

            if (response.ok) {
                const data = await response.json();
                this.saveAuthToken(data.token);
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.onAuthSuccess();
            } else {
                this.showError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification failed:', error);
            this.showError('OTP verification failed.');
        }
    }

    saveAuthToken(token) {
        localStorage.setItem('auth_token', token);
        // Set remember device option
        const rememberDevice = document.getElementById('rememberDevice')?.checked;
        if (rememberDevice) {
            localStorage.setItem('remember_device', 'true');
        }
    }

    onAuthSuccess() {
        this.hideLoginScreen();
        
        // Check if first login (onboarding)
        if (this.currentUser?.onboarding_complete === false) {
            this.startOnboarding();
        } else {
            this.app.loadData();
        }
    }

    startOnboarding() {
        // Progressive onboarding
        const onboardingStep = this.currentUser?.onboarding_step || 1;
        this.app.showOnboardingStep(onboardingStep);
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('remember_device');
            this.currentUser = null;
            this.isAuthenticated = false;
            this.showLoginScreen();
        }
    }

    async refreshToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.saveAuthToken(data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    setupEventListeners() {
        // Google login
        document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
            this.loginWithGoogle();
        });

        // Apple login
        document.getElementById('appleLoginBtn')?.addEventListener('click', () => {
            this.loginWithApple();
        });

        // GitHub login
        document.getElementById('githubLoginBtn')?.addEventListener('click', () => {
            this.loginWithGitHub();
        });

        // Magic link
        document.getElementById('magicLinkBtn')?.addEventListener('click', () => {
            const email = document.getElementById('emailInput')?.value;
            if (email) {
                this.loginWithMagicLink(email);
            }
        });

        // OTP
        document.getElementById('otpBtn')?.addEventListener('click', () => {
            const email = document.getElementById('emailInput')?.value;
            if (email) {
                this.loginWithOTP(email);
            }
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    showOTPInput(sessionId) {
        // Show OTP input modal
        const otpModal = document.getElementById('otpModal');
        if (otpModal) {
            otpModal.style.display = 'block';
            otpModal.dataset.sessionId = sessionId;
        }
    }

    showError(message) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(message, 'success');
        } else {
            alert(message);
        }
    }
}

window.AuthSystem = AuthSystem;

