import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import { X, Flame, Sparkles, Gift, CheckCircle2, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ClaimRewardsModal: React.FC = () => {
  const {
    isStreakModalOpen,
    setIsStreakModalOpen,
    user,
    claimDailyStreak,
    dailyRewardTiers,
    activeInvestments,
    setCurrentTab,
  } = useApp();

  if (!isStreakModalOpen) return null;

  const hasActivePackage = Boolean(
    activeInvestments && activeInvestments.some((inv) => inv.status === 'active')
  );
  const currentStreak = user.dailyStreak;
  const isAlreadyClaimedToday = user.lastCheckInDate === new Date().toISOString().split('T')[0];

  // Use dynamic reward tiers from server/admin, fallback if empty
  const streakDays = (dailyRewardTiers && dailyRewardTiers.length > 0)
    ? dailyRewardTiers
    : [
        { day: 1, reward: 250 },
        { day: 2, reward: 300 },
        { day: 3, reward: 350 },
        { day: 4, reward: 400 },
        { day: 5, reward: 450 },
        { day: 6, reward: 500 },
        { day: 7, reward: 1000 },
      ];

  // Find next tier reward to claim
  const nextStreakDay = currentStreak >= 7 ? 1 : currentStreak + 1;
  const currentTier = streakDays.find((t) => t.day === (isAlreadyClaimedToday ? currentStreak : nextStreakDay))
    || streakDays[0];
  const nextRewardAmount = currentTier ? currentTier.reward : 250;

  const handleNavigateToPlans = () => {
    setIsStreakModalOpen(false);
    setCurrentTab('plans');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsStreakModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Mobile Handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Daily Check-in Loyalty Rewards
              </h3>
            </div>
            <button
              onClick={() => setIsStreakModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 text-center">
            {/* Header Icon & Title */}
            <div className="py-2">
              <div className={`w-16 h-16 rounded-3xl ${
                hasActivePackage
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              } flex items-center justify-center mx-auto mb-2`}>
                {hasActivePackage ? (
                  <Gift className="w-8 h-8 animate-bounce" />
                ) : (
                  <Lock className="w-8 h-8" />
                )}
              </div>

              <h4 className="text-lg font-black text-slate-900 dark:text-white font-display">
                {hasActivePackage ? `${currentStreak}-Day Active Streak! 🔥` : 'Streaks Locked 🔒'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {hasActivePackage
                  ? 'Log in daily to unlock escalating cash bonuses directly credited to your wallet.'
                  : 'Daily streaks and loyalty cash bonuses are reserved exclusively for active package holders.'}
              </p>
            </div>

            {/* Active Package Gate Warning Banner */}
            {!hasActivePackage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-left space-y-2">
                <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-xs">
                    <p className="font-bold">Active Package Required</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                      Streaks work only when you hold at least one active investment package. Activate any package to begin claiming your daily streak cash rewards.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNavigateToPlans}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Activate an Investment Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 7 Day Roadmap */}
            <div className={`grid grid-cols-4 sm:grid-cols-7 gap-2 ${!hasActivePackage ? 'opacity-60 grayscale-[40%]' : ''}`}>
              {streakDays.map((item) => {
                const isPassed = hasActivePackage && item.day <= currentStreak;
                const isCurrent = hasActivePackage && item.day === currentStreak + 1;
                return (
                  <div
                    key={item.day}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-bold block">Day {item.day}</span>
                    <span className="text-xs font-black block mt-1">
                      {item.day === 7 ? 'Rs 1K 🎁' : `Rs ${item.reward}`}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 mx-auto mt-1" />
                    ) : !hasActivePackage ? (
                      <Lock className="w-3 h-3 text-slate-400 mx-auto mt-1" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Claim CTA */}
            <div className="pt-2">
              {hasActivePackage ? (
                <button
                  type="button"
                  disabled={isAlreadyClaimedToday}
                  onClick={() => {
                    claimDailyStreak();
                    setIsStreakModalOpen(false);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isAlreadyClaimedToday
                      ? 'Claimed for Today! Check back tomorrow'
                      : `Claim Today's Bonus (Rs. ${nextRewardAmount})`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNavigateToPlans}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Activate Package to Unlock Streaks</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
