import React from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import {
  Home,
  TrendingUp,
  ReceiptText,
  Wallet,
  Users,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, user, activeInvestments } = useApp();

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plans', label: 'Plans', icon: TrendingUp, badge: activeInvestments.length > 0 ? `${activeInvestments.length}` : undefined },
    { id: 'transactions', label: 'History', icon: ReceiptText },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'referral', label: 'Referral', icon: Users, badge: user.unclaimedReferralEarnings > 0 ? 'Rs' : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="max-w-md sm:max-w-lg mx-auto px-2">
        <div className="grid grid-cols-6 items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl -z-10 border border-emerald-200/60 dark:border-emerald-800/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  
                  {/* Notification / Badge */}
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
