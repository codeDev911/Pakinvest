import React from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Flame, LogIn, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    user,
    setIsStreakModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Brand & User Profile */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="relative cursor-pointer group"
            title="Click to Switch User / Login"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ring-2 ring-emerald-500/30 dark:ring-emerald-500/50 p-0.5 overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-left"
              >
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{user.name}</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>PakInvest Live • {user.phone}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Daily Streak Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsStreakModalOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
            title="Daily Check-in Streak Reward"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{user.dailyStreak}d</span>
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </motion.button>

          {/* Login / Switch Account Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Account Sign-in / Register"
          >
            <LogIn className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

