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
  Plus,
  Trash2,
  X,
  Layers,
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

  // New Streak Day Modal / Inline Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDayNum, setNewDayNum] = useState<number>(8);
  const [newRewardAmount, setNewRewardAmount] = useState<number>(600);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBadge, setNewBadge] = useState<string>('+Rs. 100 Jump');
  const [newDescription, setNewDescription] = useState<string>('Daily loyalty reward payout');

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

  // Update default new day number when tiers change
  useEffect(() => {
    if (tiers.length > 0) {
      const maxDay = Math.max(...tiers.map((t) => t.day), 0);
      setNewDayNum(maxDay + 1);
      setNewTitle(`Day ${maxDay + 1} Milestone Bonus`);
    } else {
      setNewDayNum(1);
      setNewTitle('Day 1 Starter Bonus');
    }
  }, [tiers]);

  const handleTierChange = (day: number, field: keyof DailyRewardTier, value: any) => {
    setTiers((prev) =>
      prev.map((t) => (t.day === day ? { ...t, [field]: value } : t))
    );
    setHasChanges(true);
  };

  const handleRemoveStreakDay = async (dayToRemove: number) => {
    if (tiers.length <= 1) {
      if (showToast) {
        showToast('Cannot Remove', 'You must have at least one streak day configured.', 'error');
      }
      return;
    }

    // Filter out the day
    const updated = tiers.filter((t) => t.day !== dayToRemove);
    setTiers(updated);
    setHasChanges(true);

    if (showToast) {
      showToast('Streak Day Removed', `Day ${dayToRemove} removed from matrix. Click "Save Tier Config" to commit changes to database.`, 'info');
    }
  };

  const handleAddStreakDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const day = Number(newDayNum);
    const reward = Number(newRewardAmount);

    if (isNaN(day) || day < 1) {
      if (showToast) showToast('Invalid Day', 'Please enter a valid day number (1 or greater)', 'error');
      return;
    }

    if (isNaN(reward) || reward < 0) {
      if (showToast) showToast('Invalid Bonus', 'Please enter a valid reward amount in PKR', 'error');
      return;
    }

    // Check if day already exists
    if (tiers.some((t) => t.day === day)) {
      if (showToast) showToast('Day Exists', `Day ${day} is already in the matrix. Please choose a different day or edit the existing row.`, 'error');
      return;
    }

    const newTier: DailyRewardTier = {
      day,
      reward,
      title: newTitle.trim() || `Day ${day} Milestone Bonus`,
      badge: newBadge.trim() || `Day ${day}`,
      description: newDescription.trim() || `Daily loyalty reward payout for Day ${day}`,
      isActive: true,
    };

    const updated = [...tiers, newTier].sort((a, b) => a.day - b.day);
    setTiers(updated);
    setHasChanges(true);
    setIsAddModalOpen(false);

    if (showToast) {
      showToast('Streak Day Added', `Day ${day} (Rs. ${reward.toLocaleString()}) added! Click "Save Tier Config" to apply.`, 'success');
    }
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
          showToast('Streak Tiers Saved', `${tiers.length} Daily check-in streak reward tiers updated successfully!`, 'success');
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
    if (showToast) {
      showToast('Defaults Restored', 'Restored 7-day standard streak preset. Click "Save Tier Config" to apply.', 'info');
    }
  };

  const handleApplyPreset = (daysCount: number) => {
    const presetTiers: DailyRewardTier[] = [];
    let currentReward = 250;

    for (let d = 1; d <= daysCount; d++) {
      if (d === 1) {
        currentReward = 250;
      } else if (d === daysCount) {
        currentReward = Math.round(currentReward * 1.8 / 50) * 50; // Mega jackpot
      } else {
        currentReward += 50;
      }

      presetTiers.push({
        day: d,
        reward: currentReward,
        title: d === daysCount ? `Day ${d} Mega Crown Jackpot` : `Day ${d} Milestone`,
        badge: d === daysCount ? '🎁 Grand Jackpot' : `+Rs. 50 Jump`,
        description: d === daysCount ? `Complete full ${daysCount}-day cycle reward!` : `Day ${d} consecutive login bonus`,
        isActive: true,
      });
    }

    setTiers(presetTiers);
    setHasChanges(true);
    if (showToast) {
      showToast('Preset Loaded', `Generated ${daysCount}-day streak progression. Click "Save Tier Config" to apply.`, 'info');
    }
  };

  const totalCyclePayout = tiers
    .filter((t) => t.isActive !== false)
    .reduce((sum, t) => sum + (Number(t.reward) || 0), 0);

  const maxConfiguredDay = tiers.length > 0 ? Math.max(...tiers.map((t) => t.day)) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Daily Streak & Loyalty Rewards Engine</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {tiers.length} Days Configured
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Add, remove, or customize streak days with custom bonuses in PKR, badges, and automated daily payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Presets */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px]">
            <span className="px-2 text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" /> Presets:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset(7)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-semibold"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(14)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-semibold"
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(30)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-semibold"
            >
              30 Days
            </button>
          </div>

          {/* Reset Defaults */}
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
            Reset 7-Day
          </button>

          {/* Add Streak Day Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Streak Day
          </button>

          {/* Save Tier Config */}
          <button
            onClick={handleSaveTiers}
            disabled={!hasChanges || isSaving}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm ${
              hasChanges && !isSaving
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-emerald-600/20'
                : 'bg-emerald-600/50 cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving Changes...' : hasChanges ? 'Save Tier Config *' : 'Saved to Server'}
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
              Active Streak Days
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-blue-400">
              {tiers.filter((t) => t.isActive !== false).length} Days
            </span>
            <span className="text-xs font-medium text-slate-400">
              (Max Day: D{maxConfiguredDay})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cycle length before auto-wrapping</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Full Cycle Payout Sum
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
          <p className="text-[11px] text-slate-400 mt-1">Full streak consecutive completion sum</p>
        </div>
      </div>

      {/* Main Configuration Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold">
              {tiers.length}-Day Daily Check-in Streak & Bonus Matrix
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Wraps to Day 1 after reaching Day {maxConfiguredDay}
            </span>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Day
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                <th className="py-3 px-4 font-semibold w-24">Day</th>
                <th className="py-3 px-4 font-semibold w-36">Bonus Reward (PKR)</th>
                <th className="py-3 px-4 font-semibold w-48">Display Title</th>
                <th className="py-3 px-4 font-semibold w-36">Badge Label</th>
                <th className="py-3 px-4 font-semibold">Investor Subtitle / Description</th>
                <th className="py-3 px-4 font-semibold text-center w-24">Status</th>
                <th className="py-3 px-4 font-semibold text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tiers.map((tier) => {
                const isJackpot = tier.day === maxConfiguredDay && tiers.length > 1;
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

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveStreakDay(tier.day)}
                        title={`Remove Day ${tier.day}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Streak Day Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden p-6 space-y-5 transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add Streak Day</h3>
                  <p className="text-[11px] text-slate-400">Configure new check-in milestone & cash bonus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStreakDaySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Day Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newDayNum}
                    onChange={(e) => setNewDayNum(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Bonus Amount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newRewardAmount}
                    onChange={(e) => setNewRewardAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Quick Bonus Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Quick Bonus:</span>
                {[300, 500, 750, 1000, 1500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNewRewardAmount(amt)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                  >
                    Rs. {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Display Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`e.g. Day ${newDayNum} Elite Horizon`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Badge Label</label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="e.g. +Rs. 100 Jump or 🎁 Grand Bonus"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Investor Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Shown to investors in mobile streak roadmap"
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/30"
                >
                  Add Day {newDayNum} to Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules & Fraud Prevention Summary */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">System Guardrails & Dynamic Streak Engine:</h4>
            <p className="leading-relaxed">
              • <strong>Dynamic Cycle Wrapping</strong>: Users advance from Day 1 up to Day {maxConfiguredDay}. Upon claiming the final day, their cycle automatically loops back to Day 1 so active investors keep earning compounding rewards continuously.
            </p>
            <p className="leading-relaxed">
              • <strong>Strict 1-Claim Per Calendar Day</strong>: The API tracks check-in dates per investor. Multiple claims within the same calendar day are prevented.
            </p>
            <p className="leading-relaxed">
              • <strong>Missed Day Reset</strong>: If an investor skips even 1 day between check-ins, their streak automatically resets back to Day 1, ensuring disciplined daily engagement.
            </p>
            <p className="leading-relaxed">
              • <strong>Real Ledger Tracking</strong>: Every claimed bonus automatically creates a completed transaction of type <code className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">streak_reward</code> and credits their withdrawable balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

