/**
 * Authentication System
 * Handles login, OAuth, session management
 */

class AuthSystem {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isSignupMode = false;
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
        const onboarding = document.getElementById('onboarding');
        const app = document.querySelector('.main-content');
        
        // Hide app, show login
        if (onboarding) onboarding.style.display = 'none';
        if (app) app.style.display = 'none';
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
        this.switchToLogin();
    }

    hideLoginScreen() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        // Show the app
        const appContainer = document.getElementById('app');
        const onboarding = document.getElementById('onboarding');
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }
        if (onboarding) {
            onboarding.style.display = 'none';
        }
    }

    async loginWithGoogle() {
        try {
            // HONEST NOTE: Real OAuth requires:
            // 1. Google OAuth credentials (Client ID & Secret)
            // 2. Backend OAuth flow implementation
            // 3. Redirect URI configuration
            // Currently using mock mode for testing UI/UX
            
            this.showInfo('Google OAuth requires backend API keys. Using mock login for testing.');
            
            // Mock login - create user and token
            const mockUser = {
                id: 1,
                email: 'user@gmail.com',
                name: 'Google User',
                provider: 'google',
                onboarding_complete: true
            };
            
            this.saveAuthToken(`google-token-${Date.now()}`);
            this.currentUser = mockUser;
            this.isAuthenticated = true;
            this.hideLoginScreen();
            this.onAuthSuccess();
            this.showSuccess('Logged in with Google! (Mock mode)');
        } catch (error) {
            console.error('Google login failed:', error);
            this.showError('Google login failed. Please try again.');
        }
    }

    async loginWithApple() {
        try {
            // HONEST NOTE: Real Apple Sign In requires:
            // 1. Apple Developer account
            // 2. Service ID configuration
            // 3. Backend implementation
            // Currently using mock mode for testing UI/UX
            
            this.showInfo('Apple Sign In requires Apple Developer setup. Using mock login for testing.');
            
            const mockUser = {
                id: 2,
                email: 'user@icloud.com',
                name: 'Apple User',
                provider: 'apple',
                onboarding_complete: true
            };
            
            this.saveAuthToken(`apple-token-${Date.now()}`);
            this.currentUser = mockUser;
            this.isAuthenticated = true;
            this.hideLoginScreen();
            this.onAuthSuccess();
            this.showSuccess('Logged in with Apple! (Mock mode)');
        } catch (error) {
            console.error('Apple login failed:', error);
            this.showError('Apple login failed. Please try again.');
        }
    }

    async loginWithGitHub() {
        try {
            // HONEST NOTE: Real GitHub OAuth requires:
            // 1. GitHub OAuth App registration
            // 2. Client ID & Secret
            // 3. Backend OAuth flow
            // Currently using mock mode for testing UI/UX
            
            this.showInfo('GitHub OAuth requires OAuth app setup. Using mock login for testing.');
            
            const mockUser = {
                id: 3,
                email: 'user@github.com',
                name: 'GitHub User',
                provider: 'github',
                onboarding_complete: true
            };
            
            this.saveAuthToken(`github-token-${Date.now()}`);
            this.currentUser = mockUser;
            this.isAuthenticated = true;
            this.hideLoginScreen();
            this.onAuthSuccess();
            this.showSuccess('Logged in with GitHub! (Mock mode)');
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
        if (!email || !email.includes('@')) {
            this.showError('Please enter a valid email address.');
            return;
        }

        try {
            // HONEST NOTE: Real OTP requires:
            // 1. Email service (SendGrid, AWS SES, etc.) or SMS service (Twilio)
            // 2. Backend OTP generation & validation
            // 3. Rate limiting to prevent abuse
            // Currently using mock mode for testing UI/UX
            
            const sessionId = `mock-session-${Date.now()}`;
            this.showOTPInput(sessionId, email);
            this.showInfo('OTP requires email service setup. Using mock mode for testing.');
            console.log('Mock OTP code: 123456 (any 6 digits work in mock mode)');
        } catch (error) {
            console.error('OTP failed:', error);
            const sessionId = `mock-session-${Date.now()}`;
            this.showOTPInput(sessionId, email);
            this.showInfo('OTP feature is in development. Using mock mode for testing.');
        }
    }

    async signupWithOTP(email, name) {
        if (!email || !email.includes('@')) {
            this.showError('Please enter a valid email address.');
            return;
        }
        if (!name || name.trim().length < 2) {
            this.showError('Please enter your name.');
            return;
        }

        try {
            // Mock signup OTP
            const sessionId = `mock-signup-session-${Date.now()}`;
            this.showOTPInput(sessionId, email);
            this.showInfo('OTP requires email service setup. Using mock signup for testing.');
            console.log('Mock signup OTP code: 123456 (any 6 digits work in mock mode)');
        } catch (error) {
            console.error('Signup OTP failed:', error);
            const sessionId = `mock-signup-session-${Date.now()}`;
            this.showOTPInput(sessionId, email);
            this.showInfo('Signup OTP feature is in development. Using mock mode for testing.');
        }
    }

    async verifyOTP(sessionId, otp) {
        console.log('🔐 verifyOTP called with:', { sessionId, otp, type: typeof otp, length: otp?.length });
        
        // Clean the OTP (remove spaces, dashes, etc.)
        const cleanOtp = otp?.toString().replace(/\D/g, '') || '';
        
        if (!cleanOtp || cleanOtp.length !== 6) {
            console.error('❌ Invalid OTP length:', cleanOtp.length, 'OTP:', cleanOtp);
            this.showError('Please enter a 6-digit code.');
            return;
        }

        // Disable button to prevent double-click
        const verifyBtn = document.getElementById('verifyOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';
        }

        try {
            // For mock mode, ALWAYS accept any 6-digit code
            const otpModal = document.getElementById('otpModal');
            const email = otpModal?.dataset.email || 'user@example.com';
            
            console.log('✅ Mock OTP verification: Accepting code', cleanOtp, 'for email', email);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Accept ANY 6-digit code for testing (no validation needed)
            this.saveAuthToken(`mock-token-${Date.now()}`);
            this.currentUser = { 
                id: 1, 
                email: email,
                name: email.split('@')[0],
                onboarding_complete: true
            };
            this.isAuthenticated = true;
            
            console.log('✅ Authentication successful, user:', this.currentUser);
            
            // Hide modals
            this.hideOTPModal();
            this.hideLoginScreen();
            
            // Show success
            this.showSuccess('Logged in successfully!');
            
            // Load app data
            if (this.app && this.app.loadData) {
                await this.app.loadData();
            }
            
            // Show the app
            const appContainer = document.getElementById('app');
            const onboarding = document.getElementById('onboarding');
            if (appContainer) {
                appContainer.classList.remove('hidden');
            }
            if (onboarding) {
                onboarding.style.display = 'none';
            }
            
            console.log('✅ App displayed successfully');
            
        } catch (error) {
            console.error('❌ OTP verification error:', error);
            // Even on error, accept for mock mode
            const otpModal = document.getElementById('otpModal');
            const email = otpModal?.dataset.email || 'user@example.com';
            
            console.log('✅ Fallback: Accepting OTP in error handler');
            
            this.saveAuthToken(`mock-token-${Date.now()}`);
            this.currentUser = { 
                id: 1, 
                email: email,
                name: email.split('@')[0],
                onboarding_complete: true
            };
            this.isAuthenticated = true;
            
            this.hideOTPModal();
            this.hideLoginScreen();
            this.showSuccess('Logged in successfully! (Mock mode)');
            
            if (this.app && this.app.loadData) {
                await this.app.loadData();
            }
            
            const appContainer = document.getElementById('app');
            const onboarding = document.getElementById('onboarding');
            if (appContainer) {
                appContainer.classList.remove('hidden');
            }
            if (onboarding) {
                onboarding.style.display = 'none';
            }
        } finally {
            // Re-enable button
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify';
            }
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

    async onAuthSuccess() {
        // Hide all modals
        this.hideLoginScreen();
        this.hideOTPModal();
        
        // Show the app
        const appContainer = document.getElementById('app');
        const onboarding = document.getElementById('onboarding');
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }
        if (onboarding) {
            onboarding.style.display = 'none';
        }
        
        // Check if first login (onboarding)
        if (this.currentUser?.onboarding_complete === false) {
            this.startOnboarding();
        } else {
            // Load app data
            if (this.app && this.app.loadData) {
                await this.app.loadData();
            }
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
            
            // Hide app, show login
            const appContainer = document.getElementById('app');
            const onboarding = document.getElementById('onboarding');
            if (appContainer) {
                appContainer.classList.add('hidden');
            }
            if (onboarding) {
                onboarding.style.display = 'none';
            }
            
            this.showLoginScreen();
            this.showSuccess('Logged out successfully');
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

        // Login/Signup tab switching
        document.getElementById('loginTabBtn')?.addEventListener('click', () => {
            this.switchToLogin();
        });

        document.getElementById('signupTabBtn')?.addEventListener('click', () => {
            this.switchToSignup();
        });

        // Magic link
        document.getElementById('magicLinkBtn')?.addEventListener('click', () => {
            const email = document.getElementById('emailInput')?.value;
            const name = document.getElementById('nameInput')?.value;
            if (email) {
                if (this.isSignupMode && name) {
                    this.signupWithMagicLink(email, name);
                } else {
                    this.loginWithMagicLink(email);
                }
            }
        });

        // OTP
        document.getElementById('otpBtn')?.addEventListener('click', () => {
            const email = document.getElementById('emailInput')?.value;
            const name = document.getElementById('nameInput')?.value;
            if (email) {
                if (this.isSignupMode && name) {
                    this.signupWithOTP(email, name);
                } else {
                    this.loginWithOTP(email);
                }
            } else {
                this.showError('Please enter your email address.');
            }
        });

        // OTP Modal Close Button (only add once)
        const closeOtpBtn = document.getElementById('closeOtpModal');
        if (closeOtpBtn && !closeOtpBtn.dataset.listenerAdded) {
            closeOtpBtn.dataset.listenerAdded = 'true';
            closeOtpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close OTP modal clicked');
                this.hideOTPModal();
            });
        }

        // Verify OTP Button (only add once)
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        if (verifyOtpBtn && !verifyOtpBtn.dataset.listenerAdded) {
            verifyOtpBtn.dataset.listenerAdded = 'true';
            verifyOtpBtn.addEventListener('click', () => {
                const otpInput = document.getElementById('otpInput');
                const otpModal = document.getElementById('otpModal');
                const sessionId = otpModal?.dataset.sessionId || `mock-session-${Date.now()}`;
                const otp = otpInput?.value?.trim() || '';
                
                console.log('Verify button clicked, OTP:', otp, 'Session:', sessionId);
                
                if (otp && otp.length === 6) {
                    this.verifyOTP(sessionId, otp);
                } else {
                    this.showError('Please enter a 6-digit code.');
                }
            });
        }

        // OTP input: Enter key to verify
        document.getElementById('otpInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('verifyOtpBtn')?.click();
            }
        });

        // Resend OTP
        document.getElementById('resendOtpBtn')?.addEventListener('click', () => {
            const otpModal = document.getElementById('otpModal');
            const email = otpModal?.dataset.email;
            if (email) {
                this.loginWithOTP(email);
                this.showInfo('Resending OTP code...');
            }
        });

        // OTP input: Enter key to verify
        document.getElementById('otpInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('verifyOtpBtn')?.click();
            }
        });

        // Resend OTP
        document.getElementById('resendOtpBtn')?.addEventListener('click', () => {
            const otpModal = document.getElementById('otpModal');
            const email = otpModal?.dataset.email;
            if (email) {
                this.loginWithOTP(email);
                this.showInfo('Resending OTP code...');
            }
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    showOTPInput(sessionId, email) {
        // Hide login modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }

        // Show OTP input modal
        const otpModal = document.getElementById('otpModal');
        if (otpModal) {
            otpModal.style.display = 'flex';
            otpModal.dataset.sessionId = sessionId;
            otpModal.dataset.email = email;
            
            // Update email display
            const emailText = otpModal.querySelector('p');
            if (emailText) {
                emailText.textContent = `We sent a code to ${email}`;
            }
            
            // Clear and focus input
            const otpInput = document.getElementById('otpInput');
            if (otpInput) {
                otpInput.value = '';
                otpInput.focus();
                
                // Auto-format: only allow numbers
                otpInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                });
            }
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

