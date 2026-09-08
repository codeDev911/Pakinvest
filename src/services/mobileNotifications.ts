import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { getAppBaseUrl } from '../config/appUrl';

interface BackgroundSyncPluginType {
  configure(options: {
    serverUrl: string;
    token?: string;
    userId?: string;
    lastSeenId?: string;
    intervalSeconds?: number;
  }): Promise<void>;
  syncNow(): Promise<void>;
}

export const BackgroundSync = registerPlugin<BackgroundSyncPluginType>('BackgroundSync');

export interface MobileNotificationPayload {
  id?: number;
  title: string;
  body: string;
  extra?: Record<string, any>;
  scheduleAt?: Date;
}

class MobileNotificationService {
  private isInitialized = false;
  private hasPermission = false;

  /**
   * Initializes mobile notifications (Channels, Permissions, Background Listeners).
   * 100% crash-safe on both Native Android and Web browsers.
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return this.hasPermission;
    this.isInitialized = true;

    if (!Capacitor.isNativePlatform()) {
      // Browser fallback (Web Notifications & ServiceWorker API)
      if (typeof window !== 'undefined') {
        // Register Service Worker for background interaction & Android Chrome compatibility
        if ('serviceWorker' in navigator) {
          try {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          } catch {}
        }

        if ('Notification' in window) {
          try {
            if (Notification.permission === 'granted') {
              this.hasPermission = true;
            } else if (Notification.permission !== 'denied') {
              const perm = await Notification.requestPermission();
              this.hasPermission = perm === 'granted';
            }
          } catch {
            // Ignore browser restriction
          }
        }
      }
      return this.hasPermission;
    }

    try {
      // 1. Check & request permissions on native Android
      const checkStatus = await LocalNotifications.checkPermissions();
      if (checkStatus.display === 'granted') {
        this.hasPermission = true;
      } else {
        const localStatus = await LocalNotifications.requestPermissions();
        this.hasPermission = localStatus.display === 'granted';
      }

      // 2. Create Android Notification Channel with maximum importance and lock screen visibility
      await LocalNotifications.createChannel({
        id: 'investify_alerts',
        name: 'Investify Alerts & Payouts',
        description: 'Notifications for daily earnings, approval status, and team commissions',
        importance: 5, // High importance: heads-up notification and sound
        visibility: 1, // NotificationCompat.VISIBILITY_PUBLIC (visible on secure lock screen)
        vibration: true,
        lights: true,
        lightColor: '#10b981',
      });

      // 3. Listen to app state changes (when user minimizes or closes the app)
      try {
        App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            console.log('[Investify] App transitioned to background/closed state');
            this.configureBackgroundSync().catch(() => {});
            import('./packageRewardNotificationService')
              .then((m) => {
                m.packageRewardNotificationService.ensureAlarmsScheduled();
              })
              .catch(() => {});
          }
        });
      } catch {}

      // 4. Arm native background CRM sync alarm
      this.configureBackgroundSync().catch(() => {});

      return this.hasPermission;
    } catch (err) {
      console.warn('[Investify] Failed to initialize mobile notifications:', err);
      return false;
    }
  }

  /**
   * Request notification permissions explicitly (e.g. from user settings or after login).
   */
  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        this.hasPermission = perm === 'granted';
        return this.hasPermission;
      }
      return false;
    }

    try {
      const status = await LocalNotifications.requestPermissions();
      this.hasPermission = status.display === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  /**
   * Check if notification permission is currently granted.
   */
  async checkPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
    }
    try {
      const status = await LocalNotifications.checkPermissions();
      this.hasPermission = status.display === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  // Debounce & deduplication cache to prevent alert spam
  private lastNotificationHashes = new Map<string, number>();
  private lastChimeTime = 0;

  /**
   * Schedules or displays a mobile notification with heads-up display, sound, and vibration.
   * On Android, scheduled notifications register with AlarmManager (RTC_WAKEUP) to reliably
   * wake the device even when the app is completely swiped away or closed.
   */
  async sendNotification(payload: MobileNotificationPayload): Promise<void> {
    const isFutureSchedule = payload.scheduleAt && payload.scheduleAt.getTime() > Date.now();

    // 1. If Native Android (Capacitor)
    if (Capacitor.isNativePlatform()) {
      try {
        const notifId = payload.id ?? Math.floor(Math.random() * 1000000) + 1;
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: payload.title,
              body: payload.body,
              channelId: 'investify_alerts',
              schedule: payload.scheduleAt
                ? {
                    at: payload.scheduleAt,
                    allowWhileIdle: true, // Wakes phone up even in deep Android Doze mode
                  }
                : undefined,
              smallIcon: 'ic_launcher',
              iconColor: '#10b981',
              extra: payload.extra,
            },
          ],
        });
        return;
      } catch (err) {
        console.error('[Investify] Failed to schedule local notification on Android:', err);
      }
    }

    // If this is a future scheduled alert and we are on the web/browser, delegate to Service Worker
    if (isFutureSchedule) {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const target = reg.active || navigator.serviceWorker.controller;
          if (target) {
            target.postMessage({
              type: 'SCHEDULE_NOTIFICATION',
              payload: {
                id: payload.id ?? Math.floor(Math.random() * 1000000) + 1,
                title: payload.title,
                body: payload.body,
                scheduleTimestamp: payload.scheduleAt!.getTime(),
                extra: payload.extra,
              },
            });
          }
        } catch {}
      }
      return;
    }

    // Deduplication check: prevent identical notifications from firing within 15 seconds
    const hash = `${payload.title}|${payload.body}`;
    const now = Date.now();
    const lastTrigger = this.lastNotificationHashes.get(hash) || 0;
    if (now - lastTrigger < 15000) {
      return; // Suppress duplicate spam
    }
    this.lastNotificationHashes.set(hash, now);

    // 2. Web browser fallback (Supports Service Worker on Android Chrome and Web Notification API)
    if (typeof window !== 'undefined') {
      // Prioritize ServiceWorker showNotification (mandatory on Chrome on Android)
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(payload.title, {
              body: payload.body,
              icon: '/favicon.png',
              badge: '/favicon.png',
              data: payload.extra,
            });
            return;
          }
        } catch {
          // Fallback to standard constructor
        }
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(payload.title, {
            body: payload.body,
            icon: '/favicon.png',
          });
        } catch {}
      }
    }
  }

  /**
   * Configures native Android background sync to fetch CRM announcements & broadcasts
   * even when the application is terminated or phone screen is locked.
   */
  async configureBackgroundSync(token?: string, userId?: string, lastSeenId?: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const activeToken =
        token ||
        (typeof window !== 'undefined' ? localStorage.getItem('investify_auth_token') || localStorage.getItem('token') || '' : '');
      const activeUserId =
        userId ||
        (typeof window !== 'undefined' ? localStorage.getItem('investify_user_id') || '' : '');
      const activeLastId =
        lastSeenId ||
        (typeof window !== 'undefined' ? localStorage.getItem('investify_last_crm_notif_id') || '' : '');

      const serverUrl = getAppBaseUrl();

      await BackgroundSync.configure({
        serverUrl,
        token: activeToken,
        userId: activeUserId,
        lastSeenId: activeLastId,
        intervalSeconds: 60, // Poll every 60 seconds while closed
      });
      console.log('[Investify] BackgroundSync configured successfully for CRM closed-app alerts');
    } catch (e) {
      console.warn('[Investify] BackgroundSync configure warning:', e);
    }
  }

  /**
   * Schedules a quick test notification for X seconds from now (default 5 seconds),
   * allowing the user to minimize or close the app to verify closed-app delivery.
   */
  async scheduleClosedAppTest(delaySeconds: number = 5): Promise<boolean> {
    await this.initialize();
    const hasPerm = await this.checkPermission();
    if (!hasPerm) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    const triggerAt = new Date(Date.now() + delaySeconds * 1000);
    const testId = 777888;

    await this.sendNotification({
      id: testId,
      title: '🔔 Investify Closed-App Alert',
      body: `Success! Notifications are functioning properly while the Investify app is closed.`,
      scheduleAt: triggerAt,
      extra: { test: true },
    });

    return true;
  }

  /**
   * Cancels a scheduled notification by numeric ID.
   */
  async cancelNotification(id: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id }],
        });
      } catch (err) {
        console.warn('[Investify] Failed to cancel local notification:', err);
      }
    } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const target = reg.active || navigator.serviceWorker.controller;
        if (target) {
          target.postMessage({ type: 'CANCEL_NOTIFICATION', id });
        }
      } catch {}
    }
  }

  /**
   * Synthesizes a soft, pleasant coin/reward chime.
   * Crash-safe and fails gracefully if audio context is blocked.
   * Throttled to play at most once every 5 seconds.
   */
  playRewardChime(): void {
    if (typeof window === 'undefined') return;
    const nowTime = Date.now();
    if (nowTime - this.lastChimeTime < 5000) {
      return; // Throttled
    }
    this.lastChimeTime = nowTime;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.55);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.55);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {}
      }, 700);
    } catch {
      // Audio context restricted or unavailable
    }
  }
}

export const mobileNotifications = new MobileNotificationService();
