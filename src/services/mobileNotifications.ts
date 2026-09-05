import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
   * Initializes mobile notifications (Channels, Permissions).
   * 100% crash-safe on both Native Android and Web browsers.
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return this.hasPermission;
    this.isInitialized = true;

    if (!Capacitor.isNativePlatform()) {
      // Browser fallback (Web Notifications API if allowed)
      if (typeof window !== 'undefined' && 'Notification' in window) {
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
      return this.hasPermission;
    }

    try {
      // 1. Create Android Notification Channel
      await LocalNotifications.createChannel({
        id: 'investify_alerts',
        name: 'Investify Alerts & Payouts',
        description: 'Notifications for daily earnings, approval status, and team commissions',
        importance: 5, // High importance (heads-up notification)
        visibility: 1,
        vibration: true,
      });

      // 2. Request Local Notification Permissions
      const localStatus = await LocalNotifications.requestPermissions();
      if (localStatus.display === 'granted') {
        this.hasPermission = true;
      }

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
   * Triggers a mobile notification with heads-up display, sound, and vibration.
   */
  async sendNotification(payload: MobileNotificationPayload): Promise<void> {
    const notifId = payload.id ?? Math.floor(Math.random() * 1000000) + 1;

    // 1. If Native Android (Capacitor)
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: payload.title,
              body: payload.body,
              channelId: 'investify_alerts',
              schedule: payload.scheduleAt ? { at: payload.scheduleAt } : undefined,
              extra: payload.extra,
            },
          ],
        });
        return;
      } catch (err) {
        console.error('[Investify] Failed to schedule local notification on Android:', err);
      }
    }

    // 2. Web browser fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.png',
        });
      } catch {}
    }
  }
}

export const mobileNotifications = new MobileNotificationService();
