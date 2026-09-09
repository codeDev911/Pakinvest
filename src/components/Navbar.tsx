import React from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Bell, Headphones, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    user,
    unreadNotificationsCount,
    setIsNotificationModalOpen,
    setIsAuthModalOpen,
    setCurrentTab,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* App Logo & Brand Name */}
        <div
          id="app-header-brand"
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Investify - Click to go to Home"
        >
          {/* Logo Badge */}
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-md shadow-emerald-600/25 border border-emerald-500/30 transition-transform group-hover:scale-105 flex items-center justify-center bg-emerald-600">
              <img
                src="/logo.png"
                alt="Investify"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse" />
          </div>

          {/* App Title & Tagline */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-display group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Investify
              </span>
              <span className="hidden xs:inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                Official
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Daily Profit • Automated Payouts</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Real-time Notification Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5"
            title="Real-time Alerts & Activity"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full bg-emerald-500 text-white shadow-xs animate-bounce">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
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

          {/* Support Helpdesk Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentTab('support')}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs flex items-center gap-1.5"
            title="VIP Helpdesk & FAQs Support"
            aria-label="Help & Support"
          >
            <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline text-xs font-bold">Support</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

