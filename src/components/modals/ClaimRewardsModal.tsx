import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import { X, Flame, Sparkles, Gift, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ClaimRewardsModal: React.FC = () => {
  const { isStreakModalOpen, setIsStreakModalOpen, user, claimDailyStreak } = useApp();

  if (!isStreakModalOpen) return null;

  const currentStreak = user.dailyStreak;
  const isAlreadyClaimedToday = user.lastCheckInDate === new Date().toISOString().split('T')[0];

  const streakDays = [
    { day: 1, reward: 250 },
    { day: 2, reward: 300 },
    { day: 3, reward: 350 },
    { day: 4, reward: 400 },
    { day: 5, reward: 450 },
    { day: 6, reward: 500 },
    { day: 7, reward: 1000 },
  ];

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
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden z-10"
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
            <div className="py-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-2 text-amber-500">
                <Gift className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white font-display">
                {currentStreak}-Day Active Streak! 🔥
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Log in daily to unlock escalating cash bonuses directly credited to your wallet in Rs.
              </p>
            </div>

            {/* 7 Day Roadmap */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {streakDays.map((item) => {
                const isPassed = item.day <= currentStreak;
                const isCurrent = item.day === currentStreak + 1;
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
                    {isPassed && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 mx-auto mt-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Claim CTA */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isAlreadyClaimedToday}
                onClick={() => {
                  claimDailyStreak();
                  setIsStreakModalOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isAlreadyClaimedToday
                    ? 'Claimed for Today! Check back tomorrow'
                    : `Claim Today's Bonus (Rs. ${200 + currentStreak * 50})`}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
