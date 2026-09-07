import { Capacitor } from '@capacitor/core';
import { ActiveInvestment, UserProfile, DailyRewardTier } from '../types';
import { mobileNotifications } from './mobileNotifications';

export interface StoredPackageSchedule {
  id: string;
  planName: string;
  dailyProfitAmount: number;
  nextClaimTimestamp: number;
  durationDays: number;
  status: 'active' | 'completed';
  lastNotifiedCycleTimestamp?: number;
}

export interface StoredStreakSchedule {
  currentStreak: number;
  nextStreakDay: number;
  nextRewardAmount: number;
  lastCheckInDate?: string;
  lastNotifiedDate?: string;
}

const STORAGE_KEY_PACKAGES = 'pakinvest_package_schedules';
const STORAGE_KEY_STREAK = 'pakinvest_streak_reward_schedule';
const STORAGE_KEY_NOTIFIED_CYCLES = 'pakinvest_notified_reward_cycles_v2';

function getNotifiedCycles(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFIED_CYCLES);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedCycle(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getNotifiedCycles();
    set.add(key);
    const arr = Array.from(set).slice(-100);
    localStorage.setItem(STORAGE_KEY_NOTIFIED_CYCLES, JSON.stringify(arr));
  } catch {}
}

/**
 * Deterministically generates a safe 32-bit positive integer hash for Capacitor local notifications.
 */
function getNumericId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) % 10000000 + 1000;
}

class PackageRewardNotificationService {
  private isInitialized = false;
  private checkInterval: any = null;
  private onPackageReadyCallback: ((pkg: StoredPackageSchedule) => void) | null = null;
  private onStreakReadyCallback: ((streak: StoredStreakSchedule) => void) | null = null;

  /**
   * Initializes background/offline checking listeners (visibility, online, focus, and timer).
   */
  initialize(options: {
    onPackageReady?: (pkg: StoredPackageSchedule) => void;
    onStreakReady?: (streak: StoredStreakSchedule) => void;
  }): void {
    if (this.isInitialized) {
      if (options.onPackageReady) this.onPackageReadyCallback = options.onPackageReady;
      if (options.onStreakReady) this.onStreakReadyCallback = options.onStreakReady;
      return;
    }

    this.isInitialized = true;
    this.onPackageReadyCallback = options.onPackageReady || null;
    this.onStreakReadyCallback = options.onStreakReady || null;

    // Check on initialization
    this.checkReadyRewards();

    // 1. Listen when tab becomes visible (user unlocks device or returns from another app)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkReadyRewards();
        }
      });
    }

    // 2. Listen when connection is restored after offline mode
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.checkReadyRewards();
      });

      window.addEventListener('focus', () => {
        this.checkReadyRewards();
      });
    }

    // 3. Periodic background pulse check (calm 30-second interval, avoids battery/alert churn)
    if (typeof window !== 'undefined') {
      this.checkInterval = setInterval(() => {
        this.checkReadyRewards();
      }, 30000);
    }
  }

  /**
   * Reads stored package schedules from localStorage.
   */
  getStoredPackageSchedules(): StoredPackageSchedule[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PACKAGES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves package schedules to localStorage.
   */
  private savePackageSchedules(schedules: StoredPackageSchedule[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(schedules));
    } catch {}
  }

  /**
   * Reads stored daily streak schedule from localStorage.
   */
  getStoredStreakSchedule(): StoredStreakSchedule | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STREAK);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Saves daily streak schedule to localStorage.
   */
  private saveStreakSchedule(schedule: StoredStreakSchedule): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(schedule));
    } catch {}
  }

  /**
   * Syncs active investments with local storage and schedules native offline notifications.
   */
  async syncActiveInvestments(investments: ActiveInvestment[]): Promise<void> {
    const existing = this.getStoredPackageSchedules();
    const existingMap = new Map<string, StoredPackageSchedule>(existing.map((p) => [p.id, p]));
    const notifiedSet = getNotifiedCycles();

    const updated: StoredPackageSchedule[] = [];

    for (const inv of investments) {
      const nextClaim = Number(inv.nextClaimTimestamp) || (Number(inv.lastClaimTimestamp) + 86400000);
      const prev = existingMap.get(inv.id);

      // Preserve notified state only if nextClaimTimestamp hasn't changed
      const lastNotified =
        prev && prev.nextClaimTimestamp === nextClaim ? prev.lastNotifiedCycleTimestamp : undefined;

      const scheduleItem: StoredPackageSchedule = {
        id: inv.id,
        planName: inv.planName,
        dailyProfitAmount: Number(inv.dailyProfitAmount) || 0,
        nextClaimTimestamp: nextClaim,
        durationDays: inv.durationDays,
        status: inv.status,
        lastNotifiedCycleTimestamp: lastNotified,
      };

      updated.push(scheduleItem);

      // Schedule background notification (Native AlarmManager on Android, Service Worker in browser)
      if (inv.status === 'active' && nextClaim > Date.now()) {
        const scheduleCycleKey = `sched_cycle_${inv.id}_${nextClaim}`;
        if (!notifiedSet.has(scheduleCycleKey)) {
          saveNotifiedCycle(scheduleCycleKey);
          const notifId = getNumericId(`pkg-${inv.id}`);
          mobileNotifications.sendNotification({
            id: notifId,
            title: '🎁 Time to Collect Daily Profit!',
            body: `Your ${inv.planName} package has generated Rs. ${Math.round(inv.dailyProfitAmount).toLocaleString()}. Collect your reward now!`,
            scheduleAt: new Date(nextClaim),
            extra: {
              actionTab: 'plans',
              investmentId: inv.id,
            },
          });
        }
      }
    }

    this.savePackageSchedules(updated);
  }

  /**
   * Syncs daily streak reward schedule in localStorage and schedules future reminder.
   */
  syncStreakReward(user: UserProfile, tiers?: DailyRewardTier[]): void {
    const streakDays =
      tiers && tiers.length > 0
        ? tiers
        : [
            { day: 1, reward: 250 },
            { day: 2, reward: 300 },
            { day: 3, reward: 350 },
            { day: 4, reward: 400 },
            { day: 5, reward: 450 },
            { day: 6, reward: 500 },
            { day: 7, reward: 1000 },
          ];

    const currentStreak = user.dailyStreak || 0;
    const nextStreakDay = currentStreak >= 7 ? 1 : currentStreak + 1;
    const currentTier = streakDays.find((t) => t.day === nextStreakDay) || streakDays[0];
    const nextReward = currentTier ? currentTier.reward : 250;

    const prev = this.getStoredStreakSchedule();

    const streakSchedule: StoredStreakSchedule = {
      currentStreak,
      nextStreakDay,
      nextRewardAmount: nextReward,
      lastCheckInDate: user.lastCheckInDate,
      lastNotifiedDate: prev?.lastNotifiedDate,
    };

    this.saveStreakSchedule(streakSchedule);

    // Schedule next daily streak reward notification (e.g. tomorrow at 9:00 AM or 24h cycle)
    if (user.lastCheckInDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (user.lastCheckInDate === todayStr) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
        if (tomorrow.getTime() > Date.now()) {
          const streakCycleKey = `streak_sched_${tomorrow.toISOString().split('T')[0]}`;
          const notifiedSet = getNotifiedCycles();
          if (!notifiedSet.has(streakCycleKey)) {
            saveNotifiedCycle(streakCycleKey);
            mobileNotifications.sendNotification({
              id: 999999,
              title: '🔥 Daily Streak Reward Ready!',
              body: `Day ${nextStreakDay} streak reward of Rs. ${nextReward.toLocaleString()} is waiting for you. Tap to claim!`,
              scheduleAt: tomorrow,
              extra: {
                actionTab: 'home',
                openStreakModal: true,
              },
            });
          }
        }
      }
    }
  }

  /**
   * Core inspection loop:
   * Inspects localStorage schedules, checks if collection time has arrived,
   * fires notifications (even when returning offline), and notifies subscribers.
   */
  checkReadyRewards(): {
    readyPackages: StoredPackageSchedule[];
    streakReady: boolean;
  } {
    const now = Date.now();
    const schedules = this.getStoredPackageSchedules();
    const notifiedSet = getNotifiedCycles();
    let hasScheduleChanges = false;
    const readyPackages: StoredPackageSchedule[] = [];

    for (const pkg of schedules) {
      if (pkg.status !== 'active') continue;

      const isReady = now >= pkg.nextClaimTimestamp;
      if (isReady) {
        readyPackages.push(pkg);

        const cycleKey = `ready_${pkg.id}_${pkg.nextClaimTimestamp}`;

        // Check if we haven't notified for this specific cycle yet
        if (!notifiedSet.has(cycleKey) && pkg.lastNotifiedCycleTimestamp !== pkg.nextClaimTimestamp) {
          pkg.lastNotifiedCycleTimestamp = pkg.nextClaimTimestamp;
          hasScheduleChanges = true;
          saveNotifiedCycle(cycleKey);

          // 1. Deliver System / Mobile / Push Notification
          const notifId = getNumericId(`ready-${pkg.id}-${pkg.nextClaimTimestamp}`);
          mobileNotifications.sendNotification({
            id: notifId,
            title: '🎁 Profit Ready to Collect!',
            body: `Your "${pkg.planName}" daily yield of Rs. ${Math.round(pkg.dailyProfitAmount).toLocaleString()} is ready to collect!`,
            extra: {
              actionTab: 'plans',
              investmentId: pkg.id,
              amount: pkg.dailyProfitAmount,
            },
          });

          // 2. Play reward chime
          mobileNotifications.playRewardChime();

          // 3. Inform AppContext / UI callbacks
          if (this.onPackageReadyCallback) {
            this.onPackageReadyCallback(pkg);
          }
        }
      }
    }

    if (hasScheduleChanges) {
      this.savePackageSchedules(schedules);
    }

    // Check daily streak reward status
    const streakSchedule = this.getStoredStreakSchedule();
    let streakReady = false;

    if (streakSchedule) {
      const today = new Date().toISOString().split('T')[0];
      const isAlreadyClaimedToday = streakSchedule.lastCheckInDate === today;

      if (!isAlreadyClaimedToday) {
        streakReady = true;

        const streakKey = `streak_${today}`;

        // Notify once per calendar day
        if (!notifiedSet.has(streakKey) && streakSchedule.lastNotifiedDate !== today) {
          streakSchedule.lastNotifiedDate = today;
          this.saveStreakSchedule(streakSchedule);
          saveNotifiedCycle(streakKey);

          mobileNotifications.sendNotification({
            id: getNumericId(`streak-${today}`),
            title: '🔥 Daily Reward Bonus Ready!',
            body: `Claim your Day ${streakSchedule.nextStreakDay} streak reward of Rs. ${streakSchedule.nextRewardAmount.toLocaleString()} today!`,
            extra: {
              actionTab: 'rewards',
            },
          });

          mobileNotifications.playRewardChime();

          if (this.onStreakReadyCallback) {
            this.onStreakReadyCallback(streakSchedule);
          }
        }
      }
    }

    return { readyPackages, streakReady };
  }

  /**
   * Called immediately when a package profit is claimed to reset notification lock
   * and update local storage.
   */
  markPackageClaimed(investmentId: string, nextClaimTimestamp: number): void {
    const schedules = this.getStoredPackageSchedules();
    const updated = schedules.map((pkg) => {
      if (pkg.id === investmentId) {
        return {
          ...pkg,
          nextClaimTimestamp,
          lastNotifiedCycleTimestamp: undefined, // Clear lock so next cycle will notify
        };
      }
      return pkg;
    });

    this.savePackageSchedules(updated);

    // Cancel old notification and schedule new one
    const notifId = getNumericId(`pkg-${investmentId}`);
    mobileNotifications.cancelNotification(notifId);

    if (nextClaimTimestamp > Date.now()) {
      const target = updated.find((p) => p.id === investmentId);
      if (target) {
        mobileNotifications.sendNotification({
          id: notifId,
          title: '🎁 Time to Collect Daily Profit!',
          body: `Your ${target.planName} package has generated Rs. ${Math.round(target.dailyProfitAmount).toLocaleString()}. Collect your reward now!`,
          scheduleAt: new Date(nextClaimTimestamp),
          extra: {
            actionTab: 'plans',
            investmentId: target.id,
          },
        });
      }
    }
  }

  /**
   * Called immediately when all package profits are claimed.
   */
  markAllPackagesClaimed(nextClaimTimestamp: number): void {
    const schedules = this.getStoredPackageSchedules();
    const updated = schedules.map((pkg) => ({
      ...pkg,
      nextClaimTimestamp,
      lastNotifiedCycleTimestamp: undefined,
    }));
    this.savePackageSchedules(updated);
  }

  /**
   * Called immediately when daily streak is claimed.
   */
  markStreakClaimed(todayDate: string, newStreak: number, nextRewardAmount: number): void {
    const prev = this.getStoredStreakSchedule();
    const updated: StoredStreakSchedule = {
      currentStreak: newStreak,
      nextStreakDay: newStreak >= 7 ? 1 : newStreak + 1,
      nextRewardAmount,
      lastCheckInDate: todayDate,
      lastNotifiedDate: todayDate,
    };
    this.saveStreakSchedule(updated);
  }
}

export const packageRewardNotificationService = new PackageRewardNotificationService();
