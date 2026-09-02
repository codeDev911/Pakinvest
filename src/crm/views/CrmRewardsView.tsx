import React, { useState, useEffect } from 'react';
import { DailyRewardTier } from '../../types';
import { useCrmTheme } from '../context/CrmThemeContext';
import { getApiUrl } from '../../config/api';
import {
  Gift,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface CrmRewardsViewProps {
  onRefresh?: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

interface RewardsStatsBreakdown {
  totalRewardsGiven: number;
  streakRewardsCount: number;
  streakRewardsTotal: number;
  referralBonusesCount: number;
  referralBonusesTotal: number;
  dailyYieldDividendsTotal: number;
  adminBonusesTotal: number;
  dailyTiers: DailyRewardTier[];
}

export const CrmRewardsView: React.FC<CrmRewardsViewProps> = ({ onRefresh, showToast }) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [tiers, setTiers] = useState<DailyRewardTier[]>([]);
  const [stats, setStats] = useState<RewardsStatsBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current tiers and statistics
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tiersRes, breakdownRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/rewards/tiers')),
        fetch(getApiUrl('/api/admin/rewards/breakdown')),
      ]);

      const tiersJson = await tiersRes.json();
      if (tiersJson.success && Array.isArray(tiersJson.tiers)) {
        setTiers(tiersJson.tiers);
      }

      const breakdownJson = await breakdownRes.json();
      if (breakdownJson.success && breakdownJson.data) {
        setStats(breakdownJson.data);
      }
    } catch (err) {
      console.error('Failed to load rewards tiers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTierChange = (day: number, field: keyof DailyRewardTier, value: any) => {
    setTiers((prev) =>
      prev.map((t) => (t.day === day ? { ...t, [field]: value } : t))
    );
    setHasChanges(true);
  };

  const handleSaveTiers = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/rewards/tiers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers }),
      });
      const data = await res.json();
      if (data.success) {
        setHasChanges(false);
        if (showToast) {
          showToast('Reward Tiers Saved', 'Daily check-in streak reward tiers updated successfully!', 'success');
        }
        loadData();
        if (onRefresh) onRefresh();
      } else {
        if (showToast) {
          showToast('Update Failed', data.error || 'Could not save tiers', 'error');
        }
      }
    } catch (err: any) {
      if (showToast) {
        showToast('Error', err?.message || 'Network error saving tiers', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaultTiers: DailyRewardTier[] = [
      { day: 1, reward: 250, title: 'Starter Spark', badge: 'Day 1 Bonus', description: 'Kickstart your daily earning journey in PKR', isActive: true },
      { day: 2, reward: 300, title: 'Bronze Momentum', badge: '+Rs. 50 Jump', description: 'Consistent loyalty pays compounding dividends', isActive: true },
      { day: 3, reward: 350, title: 'Silver Streak', badge: '+Rs. 50 Jump', description: 'Mid-week investor loyalty payout', isActive: true },
      { day: 4, reward: 400, title: 'Gold Tier', badge: '+Rs. 50 Jump', description: 'Four consecutive active days reward', isActive: true },
      { day: 5, reward: 450, title: 'Platinum Velocity', badge: '+Rs. 50 Jump', description: 'Five-day check-in loyalty achievement', isActive: true },
      { day: 6, reward: 500, title: 'Diamond Milestone', badge: '+Rs. 50 Jump', description: 'Almost at weekly grand jackpot!', isActive: true },
      { day: 7, reward: 1000, title: 'Crown Mega Bonus', badge: '🎁 Grand Jackpot', description: 'Complete 7-day streak grand reward!', isActive: true },
    ];
    setTiers(defaultTiers);
    setHasChanges(true);
  };

  const totalCyclePayout = tiers.reduce((sum, t) => sum + (Number(t.reward) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Daily Streak & Loyalty Rewards Engine</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live Configuration
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage Day 1 to Day 7 streak payouts, configure reward amounts in PKR, and audit promo cash disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            type="button"
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSaveTiers}
            disabled={!hasChanges || isSaving}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm ${
              hasChanges && !isSaving
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
                : 'bg-emerald-600/50 cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Tier Config'}
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Rewards Given
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black">
              Rs. {(stats?.totalRewardsGiven ?? 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all streaks, referrals & bonuses</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Check-in Streaks Paid
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black">
              Rs. {(stats?.streakRewardsTotal ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-500">
              ({stats?.streakRewardsCount ?? 0} claims)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Daily login retention disbursements</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Referral Commissions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black">
              Rs. {(stats?.referralBonusesTotal ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-blue-500">
              ({stats?.referralBonusesCount ?? 0} payouts)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tier 1 (10%), Tier 2 (4%), Tier 3 (1%)</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              7-Day Complete Cycle Payout
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-500">
              Rs. {totalCyclePayout.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400">/ user</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Full 7 consecutive days completion sum</p>
        </div>
      </div>

      {/* Main Configuration Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold">7-Day Retention Reward Matrix</h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Automatic daily reset if user misses check-in for &gt; 24h
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                <th className="py-3 px-4 font-semibold w-24">Day</th>
                <th className="py-3 px-4 font-semibold w-36">Reward (PKR)</th>
                <th className="py-3 px-4 font-semibold w-48">Display Title</th>
                <th className="py-3 px-4 font-semibold w-36">Badge Label</th>
                <th className="py-3 px-4 font-semibold">Investor Subtitle / Description</th>
                <th className="py-3 px-4 font-semibold text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tiers.map((tier) => {
                const isJackpot = tier.day === 7;
                return (
                  <tr
                    key={tier.day}
                    className={`transition-colors ${
                      isJackpot
                        ? isDark
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'bg-amber-50/60 hover:bg-amber-100/40'
                        : isDark
                        ? 'hover:bg-slate-800/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isJackpot
                              ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                              : isDark
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          D{tier.day}
                        </span>
                        {isJackpot && <span className="text-[10px] font-black text-amber-500">JACKPOT</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          Rs.
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={tier.reward}
                          onChange={(e) => handleTierChange(tier.day, 'reward', Number(e.target.value))}
                          className={`w-full pl-9 pr-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-emerald-400'
                              : 'bg-white border-slate-300 text-emerald-700'
                          }`}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={tier.title || ''}
                        placeholder={`Day ${tier.day} Title`}
                        onChange={(e) => handleTierChange(tier.day, 'title', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={tier.badge || ''}
                        placeholder="e.g. +Rs. 50 Jump"
                        onChange={(e) => handleTierChange(tier.day, 'badge', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={tier.description || ''}
                        placeholder="Description shown to investors in app"
                        onChange={(e) => handleTierChange(tier.day, 'description', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTierChange(tier.day, 'isActive', tier.isActive === false ? true : false)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                          tier.isActive !== false
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {tier.isActive !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules & Fraud Prevention Summary */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">System Guardrails & Anti-Abuse Logic:</h4>
            <p className="leading-relaxed">
              • <strong>Strict 1-Claim Per Calendar Day</strong>: The API tracks UTC check-in dates per investor. Multiple claims within the same calendar day return HTTP 400.
            </p>
            <p className="leading-relaxed">
              • <strong>Missed Day Reset</strong>: If an investor skips even 1 day between check-ins, their streak automatically resets back to Day 1, ensuring disciplined daily engagement.
            </p>
            <p className="leading-relaxed">
              • <strong>Real Ledger Tracking</strong>: Every claimed bonus automatically creates a completed transaction of type <code className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">streak_reward</code> and sends an in-app notification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
