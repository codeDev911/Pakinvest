import React from 'react';
import { CrmNavTab } from '../types';
import {
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { useCrmTheme } from './context/CrmThemeContext';

interface CrmHeaderProps {
  currentTab: CrmNavTab;
  onRefresh: () => void;
  isRefreshing: boolean;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  onNavigate: (tab: CrmNavTab) => void;
  onSwitchToClient: () => void;
  onToggleMobileMenu?: () => void;
}

export const CrmHeader: React.FC<CrmHeaderProps> = ({
  currentTab,
  onRefresh,
  isRefreshing,
  pendingDepositsCount,
  pendingWithdrawalsCount,
  onNavigate,
  onSwitchToClient,
  onToggleMobileMenu,
}) => {
  const { theme, toggleTheme } = useCrmTheme();
  const isDark = theme === 'dark';

  const getTabTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Executive Overview & Financial KPIs';
      case 'deposits':
        return 'Pakistani Gateway Deposit Approvals';
      case 'withdrawals':
        return 'Withdrawal Payout Dispatch Queue';
      case 'active-plans':
        return 'Active Investor Package Contracts';
      case 'plans':
        return 'Investment Packages & Yield Rate Configuration';
      case 'rewards':
        return 'Daily Streak & Loyalty Rewards Engine';
      case 'users':
        return 'Investor Accounts & Balance Adjustments';
      case 'gateways':
        return 'Official Deposit Channels & Till Numbers';
      case 'ledger':
        return 'Master Audit Ledger & Financial Records';
      default:
        return 'Management CRM';
    }
  };

  return (
    <header
      className={`h-16 backdrop-blur-md border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white/90 border-slate-200 shadow-xs'
      }`}
    >
      {/* Tab Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className={`md:hidden p-2 rounded-xl border ${
              isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {getTabTitle()}
          </h1>
          <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            PakInvest Multi-Tier Operations & Real-time Settlement Console
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle in Header */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-colors ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Pending Deposit Alert Badge */}
        {pendingDepositsCount > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('deposits')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs font-bold animate-pulse hover:bg-emerald-900/80 transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pending Deposits:</span>
            <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black text-[11px]">
              {pendingDepositsCount}
            </span>
          </button>
        )}

        {/* Pending Withdrawal Alert Badge */}
        {pendingWithdrawalsCount > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('withdrawals')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-700/60 text-amber-300 text-xs font-bold animate-pulse hover:bg-amber-900/80 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pending Payouts:</span>
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-md font-black text-[11px]">
              {pendingWithdrawalsCount}
            </span>
          </button>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-xl border transition-all ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Refresh CRM Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Quick App Link (Mobile/tablet) */}
        <button
          type="button"
          onClick={onSwitchToClient}
          className="md:hidden p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"
          title="Preview Investor App"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
