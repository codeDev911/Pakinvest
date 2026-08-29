import React from 'react';
import { CrmNavTab } from '../types';
import {
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Menu,
} from 'lucide-react';

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
  const getTabTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Executive Overview & Financial KPIs';
      case 'deposits':
        return 'Pakistani Gateway Deposit Approvals';
      case 'withdrawals':
        return 'Withdrawal Payout Dispatch Queue';
      case 'plans':
        return 'Investment Packages & Yield Rate Configuration';
      case 'users':
        return 'Investor Accounts & Balance Adjustments';
      case 'gateways':
        return 'Official Deposit Channels & Till Numbers';
      case 'ledger':
        return 'Master Audit Ledger & Transaction Records';
      default:
        return 'Management CRM';
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Tab Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {getTabTitle()}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            PakInvest Multi-Tier Operations & Real-time Settlement Console
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
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
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          title="Refresh CRM Data from Database"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Switch to Client App */}
        <button
          type="button"
          onClick={onSwitchToClient}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Switch to Client App</span>
          <span className="sm:hidden">Client</span>
        </button>
      </div>
    </header>
  );
};

