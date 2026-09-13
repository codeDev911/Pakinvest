import React from 'react';
import { CrmNavTab } from '../types';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Users,
  CreditCard,
  Receipt,
  LogOut,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Zap,
  Gift,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useCrmTheme } from './context/CrmThemeContext';

interface CrmSidebarProps {
  currentTab: CrmNavTab;
  onTabChange: (tab: CrmNavTab) => void;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  adminName: string;
  onLogout: () => void;
  onSwitchToClient: () => void;
}

export const CrmSidebar: React.FC<CrmSidebarProps> = ({
  currentTab,
  onTabChange,
  pendingDepositsCount,
  pendingWithdrawalsCount,
  adminName,
  onLogout,
  onSwitchToClient,
}) => {
  const { theme, toggleTheme } = useCrmTheme();
  const isDark = theme === 'dark';

  const navItems: { id: CrmNavTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Dashboard & KPIs',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'deposits',
      label: 'Deposit Approvals',
      icon: <ArrowDownLeft className="w-4 h-4" />,
      badge: pendingDepositsCount,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'withdrawals',
      label: 'Withdrawal Payouts',
      icon: <ArrowUpRight className="w-4 h-4" />,
      badge: pendingWithdrawalsCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'active-plans',
      label: 'Active Contracts',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'plans',
      label: 'Investment Packages',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'rewards',
      label: 'Rewards & Streaks',
      icon: <Gift className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: 'Push & Broadcasts',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Investors Directory',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'gateways',
      label: 'Payment Channels',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'faqs',
      label: 'Helpdesk & FAQs',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'ledger',
      label: 'Financial Ledger',
      icon: <Receipt className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      className={`w-64 border-r flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-5 border-b space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-600/20 border border-emerald-500/30 flex items-center justify-center bg-emerald-600">
              <img src="/logo.png" alt="Investify" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Investify
                </h2>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-500">
                  CRM
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Operations & Ledger Console
              </p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick link to preview client app */}
        <button
          type="button"
          onClick={onSwitchToClient}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isDark
              ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-500" />
          <span>Open Investor App View</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-emerald-700' : item.badgeColor || 'bg-slate-800 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className={`p-4 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
              {adminName ? adminName.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <p className={`text-xs font-bold truncate max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {adminName || 'Administrator'}
              </p>
              <p className="text-[10px] text-emerald-500 font-semibold">Super Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
