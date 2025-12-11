/**
 * Focus Mode - Pomodoro Timer
 * Minimalist timer with ambient sounds
 */

class FocusMode {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.timeRemaining = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.interval = null;
        this.ambientSound = null;
        this.soundPlaying = false;
        this.init();
    }

    init() {
        this.createUI();
        this.setupSounds();
    }

    createUI() {
        if (document.getElementById('focusModeOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'focusModeOverlay';
        overlay.className = 'focus-mode-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div class="focus-timer">
                <div class="timer-display" id="timerDisplay">25:00</div>
                <div class="timer-label" id="timerLabel">Focus Session</div>
            </div>
            <div class="focus-controls">
                <button class="focus-btn" id="startFocusBtn">Start</button>
                <button class="focus-btn" id="pauseFocusBtn" style="display: none;">Pause</button>
                <button class="focus-btn" id="resetFocusBtn">Reset</button>
                <button class="focus-btn" id="closeFocusBtn">Exit</button>
            </div>
            <div class="ambient-sound-controls">
                <button class="sound-btn" data-sound="rain" title="Rain">🌧️</button>
                <button class="sound-btn" data-sound="wind" title="Wind">🌬️</button>
                <button class="sound-btn" data-sound="piano" title="Piano">🎹</button>
                <button class="sound-btn" data-sound="none" title="No sound">🔇</button>
            </div>
            <div class="focus-task" id="focusTask" style="display: none;">
                <h4>Focusing on:</h4>
                <p id="focusTaskTitle"></p>
            </div>
        `;
        document.body.appendChild(overlay);

        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('startFocusBtn')?.addEventListener('click', () => this.start());
        document.getElementById('pauseFocusBtn')?.addEventListener('click', () => this.pause());
        document.getElementById('resetFocusBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('closeFocusBtn')?.addEventListener('click', () => this.close());

        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sound = btn.dataset.sound;
                this.setAmbientSound(sound);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                if (this.interval) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    setupSounds() {
        // Ambient sounds would be loaded here
        // For now, we'll use Web Audio API or HTML5 audio
        // This is a placeholder - actual sound files would be added
    }

    open(task = null) {
        const overlay = document.getElementById('focusModeOverlay');
        if (!overlay) return;

        this.isActive = true;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (task) {
            document.getElementById('focusTask').style.display = 'block';
            document.getElementById('focusTaskTitle').textContent = task.title;
        }

        // Set default timer (25 min Pomodoro)
        this.timeRemaining = 25 * 60;
        this.totalTime = 25 * 60;
        this.updateDisplay();
    }

    close() {
        this.pause();
        this.stopSound();
        
        const overlay = document.getElementById('focusModeOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        document.body.style.overflow = '';
        this.isActive = false;
    }

    start() {
        if (this.interval) return;

        document.getElementById('startFocusBtn').style.display = 'none';
        document.getElementById('pauseFocusBtn').style.display = 'block';

        this.interval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.complete();
            } else {
                this.updateDisplay();
            }
        }, 1000);

        this.updateDisplay();
        this.playSound();
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        document.getElementById('startFocusBtn').style.display = 'block';
        document.getElementById('pauseFocusBtn').style.display = 'none';
        this.pauseSound();
    }

    reset() {
        this.pause();
        this.timeRemaining = this.totalTime;
        this.updateDisplay();
    }

    complete() {
        this.pause();
        this.stopSound();

        // Show completion message
        const display = document.getElementById('timerDisplay');
        display.textContent = 'Done!';
        display.style.color = 'var(--calm-success)';

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        // Show notification
        utils.showToast('Focus session complete! 🎉');

        // Auto-close after 3 seconds
        setTimeout(() => {
            this.close();
        }, 3000);
    }

    updateDisplay() {
        const display = document.getElementById('timerDisplay');
        if (!display) return;

        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        display.style.color = 'var(--calm-text-1)';

        // Update label
        const label = document.getElementById('timerLabel');
        if (this.timeRemaining === this.totalTime) {
            label.textContent = 'Focus Session';
        } else if (this.timeRemaining < 60) {
            label.textContent = 'Almost there!';
        } else {
            label.textContent = 'Stay focused';
        }
    }

    setAmbientSound(sound) {
        this.stopSound();

        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (sound === 'none') {
            return;
        }

        document.querySelector(`[data-sound="${sound}"]`)?.classList.add('active');

        // Play sound (placeholder - would load actual audio files)
        this.currentSound = sound;
        this.playSound();
    }

    playSound() {
        if (!this.currentSound || this.currentSound === 'none') return;
        // Sound playback would be implemented here
        this.soundPlaying = true;
    }

    pauseSound() {
        // Pause sound
        this.soundPlaying = false;
    }

    stopSound() {
        // Stop sound
        this.soundPlaying = false;
        this.currentSound = null;
    }
}

window.FocusMode = FocusMode;

