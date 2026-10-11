import { useState, useEffect } from 'react';

/**
 * Screen Wake Lock Manager
 * Keeps the screen awake using the native Screen Wake Lock API,
 * with an automatic fallback (invisible video loop) for older/unsupported devices.
 * Automatically re-acquires lock when returning to the tab or on user interaction.
 */
class WakeLockManager {
    constructor() {
        this.wakeLock = null;
        this.fallbackVideo = null;
        this.isActive = false;
        this.listeners = new Set();
        this.initialized = false;
    }

    init() {
        if (typeof window === 'undefined' || this.initialized) return;
        this.initialized = true;

        // Auto re-acquire when user returns to this tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isActive) {
                this.request();
            }
        });

        // Browsers may require user activation for the first request
        const onFirstInteraction = () => {
            if (this.isActive && !this.wakeLock) {
                this.request();
            }
            window.removeEventListener('click', onFirstInteraction);
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('keydown', onFirstInteraction);
        };

        window.addEventListener('click', onFirstInteraction, { passive: true });
        window.addEventListener('touchstart', onFirstInteraction, { passive: true });
        window.addEventListener('keydown', onFirstInteraction, { passive: true });
    }

    async request() {
        this.isActive = true;
        this.init();

        // 1. Try native Screen Wake Lock API
        if ('wakeLock' in navigator && navigator.wakeLock?.request) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => {
                    this.wakeLock = null;
                    this.notify(false);
                });
                this.notify(true);
                return true;
            } catch (err) {
                // If rejected (e.g. tab not active yet or low battery mode), fall through to video
                console.warn('Native Wake Lock request postponed or unavailable:', err);
            }
        }

        // 2. Video element fallback (keeps screen active via playback)
        return this.startVideoFallback();
    }

    startVideoFallback() {
        try {
            if (typeof document === 'undefined') return false;

            if (!this.fallbackVideo) {
                const video = document.createElement('video');
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                video.muted = true;
                video.loop = true;
                video.style.position = 'fixed';
                video.style.bottom = '0';
                video.style.right = '0';
                video.style.width = '1px';
                video.style.height = '1px';
                video.style.opacity = '0.001';
                video.style.pointerEvents = 'none';
                video.style.zIndex = '-9999';

                // Create a 2x2 silent canvas stream
                const canvas = document.createElement('canvas');
                canvas.width = 2;
                canvas.height = 2;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, 2, 2);
                }

                if (canvas.captureStream) {
                    video.srcObject = canvas.captureStream(1);
                }

                document.body.appendChild(video);
                this.fallbackVideo = video;
            }

            if (this.fallbackVideo) {
                const playPromise = this.fallbackVideo.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            this.notify(true);
                        })
                        .catch(() => {
                            // Will succeed on first click/touch interaction
                        });
                }
            }
            return true;
        } catch (e) {
            console.warn('Wake Lock video fallback error:', e);
            return false;
        }
    }

    release() {
        this.isActive = false;
        if (this.wakeLock) {
            this.wakeLock.release().catch(() => {});
            this.wakeLock = null;
        }
        if (this.fallbackVideo) {
            try {
                this.fallbackVideo.pause();
                this.fallbackVideo.remove();
                this.fallbackVideo = null;
            } catch (e) {}
        }
        this.notify(false);
    }

    subscribe(callback) {
        this.listeners.add(callback);
        callback(Boolean(this.wakeLock || (this.fallbackVideo && !this.fallbackVideo.paused)));
        return () => this.listeners.delete(callback);
    }

    notify(state) {
        this.listeners.forEach(cb => {
            try {
                cb(state);
            } catch (e) {}
        });
    }
}

export const wakeLockManager = new WakeLockManager();

/**
 * React hook to keep screen awake for the lifecycle of a component or the entire app.
 */
export function useWakeLock(autoRequest = true) {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (autoRequest) {
            wakeLockManager.request();
        }
        const unsubscribe = wakeLockManager.subscribe(setIsLocked);
        return () => {
            unsubscribe();
        };
    }, [autoRequest]);

    return {
        isLocked,
        request: () => wakeLockManager.request(),
        release: () => wakeLockManager.release()
    };
}
