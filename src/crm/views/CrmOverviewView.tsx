import React from 'react';
import { CrmStats, Transaction, CrmNavTab } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Users,
  Package,
  Coins,
  CheckCircle2,
  Clock,
  ChevronRight,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmOverviewViewProps {
  stats: CrmStats;
  pendingTransactions: Transaction[];
  onApproveDeposit: (txId: string) => Promise<void>;
  onDeclineDeposit: (txId: string) => void;
  onApproveWithdrawal: (txId: string) => Promise<void>;
  onDeclineWithdrawal: (txId: string) => void;
  onNavigate: (tab: CrmNavTab) => void;
}

export const CrmOverviewView: React.FC<CrmOverviewViewProps> = ({
  stats,
  pendingTransactions,
  onApproveDeposit,
  onDeclineDeposit,
  onApproveWithdrawal,
  onDeclineWithdrawal,
  onNavigate,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const pendingDeposits = pendingTransactions.filter((t) => t.type === 'deposit');
  const pendingWithdrawals = pendingTransactions.filter((t) => t.type === 'withdrawal');

  const getGatewayBadge = (gw?: string) => {
    switch (gw) {
      case 'JazzCash':
        return <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">JazzCash</span>;
      case 'EasyPaisa':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">EasyPaisa</span>;
      case 'Raast':
        return <span className="px-2 py-0.5 rounded-md bg-orange-950 text-orange-300 border border-orange-800 text-[10px] font-bold">Raast</span>;
      case 'Bank_Transfer':
        return <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">Bank IBFT</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">{gw || 'Direct'}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top High-Level Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflows */}
        <div
          className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Deposits Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatPKR(stats.totalDeposited)}
            </h3>
            <p className="text-[11px] text-emerald-500 mt-0.5 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              Verified Inflow Volume
            </p>
          </div>
        </div>

        {/* Total Outflows */}
        <div
          className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Payouts Settled
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatPKR(stats.totalWithdrawn)}
            </h3>
            <p className="text-[11px] text-amber-500 mt-0.5 font-semibold">
              Completed JazzCash / EasyPaisa payouts
            </p>
          </div>
        </div>

        {/* Locked Capital */}
        <div
          className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Invested Capital
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatPKR(stats.totalLockedCapital)}
            </h3>
            <p className="text-[11px] text-indigo-400 mt-0.5 font-semibold">
              {stats.activeInvestmentsCount} Running Package Contracts
            </p>
          </div>
        </div>

        {/* Total Channel Reserves */}
        <div
          onClick={() => onNavigate('gateways')}
          className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all cursor-pointer group ${
            isDark ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Payment Channels Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-emerald-400">
              {formatPKR(stats.totalChannelsBalance !== undefined ? stats.totalChannelsBalance : stats.totalDeposited)}
            </h3>
            <p className="text-[11px] text-teal-400 mt-0.5 font-semibold flex items-center justify-between">
              <span>{stats.channelBalances?.length || 4} Receiving Gateways</span>
              <span className="text-[10px] underline group-hover:text-emerald-300">Manage & Adjust →</span>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Channels Live Balance Breakdown */}
      {stats.channelBalances && stats.channelBalances.length > 0 && (
        <div
          className={`p-5 rounded-3xl border space-y-3.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Payment Channels Money & Receiving Till Balances
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Real-time funds accumulated per payment channel from approved deposits (with manual adjustment support)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gateways')}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1"
            >
              <span>Adjust Channels</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.channelBalances.map((cb) => (
              <div
                key={cb.gateway}
                onClick={() => onNavigate('gateways')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                  isDark
                    ? 'bg-slate-950 border-slate-800/80 hover:border-amber-500/40'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {cb.gateway === 'JazzCash' && <Smartphone className="w-3.5 h-3.5" />}
                      {cb.gateway === 'EasyPaisa' && <CreditCard className="w-3.5 h-3.5" />}
                      {cb.gateway === 'Raast' && <Sparkles className="w-3.5 h-3.5" />}
                      {cb.gateway === 'Bank_Transfer' && <Building2 className="w-3.5 h-3.5" />}
                      {!['JazzCash', 'EasyPaisa', 'Raast', 'Bank_Transfer'].includes(cb.gateway) && <Coins className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {cb.gateway}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        {cb.accountNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      cb.isActive !== false
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {cb.isActive !== false ? 'LIVE' : 'OFF'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Current Money:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {formatPKR(cb.balance)}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{cb.completedCount} deposits</span>
                  {cb.manualAdjustment !== 0 && (
                    <span className={cb.manualAdjustment > 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                      Adj: {cb.manualAdjustment > 0 ? '+' : ''}{formatPKR(cb.manualAdjustment)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Action Required Queues (Deposits & Withdrawals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deposit Approvals */}
        <div
          className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Deposit Approvals Pending
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stats.pendingDepositsCount} pending ({formatPKR(stats.pendingDepositsVolume)})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('deposits')}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1"
            >
              <span>View Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingDeposits.length === 0 ? (
              <div
                className={`p-8 rounded-2xl border text-center space-y-1 ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Queue is clear!
                </p>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No deposits awaiting TID verification.
                </p>
              </div>
            ) : (
              pendingDeposits.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{d.userName || 'Investor'}</span>
                      {getGatewayBadge(d.gateway)}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                      <span className="text-amber-400 font-bold">TID: {d.referenceCode}</span>
                      <span>•</span>
                      <span>{formatPakistanDateTime(d.timestamp || d.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black font-mono text-emerald-400 text-xs">
                      {formatPKR(d.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onApproveDeposit(d.id)}
                      className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Withdrawal Payouts */}
        <div
          className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Withdrawal Dispatch Queue
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stats.pendingWithdrawalsCount} pending ({formatPKR(stats.pendingWithdrawalsVolume)})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('withdrawals')}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1"
            >
              <span>View Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingWithdrawals.length === 0 ? (
              <div
                className={`p-8 rounded-2xl border text-center space-y-1 ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  All payouts dispatched!
                </p>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No investor withdrawal requests waiting.
                </p>
              </div>
            ) : (
              pendingWithdrawals.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{w.userName || 'Investor'}</span>
                      {getGatewayBadge(w.gateway)}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                      <span className="text-amber-300">{w.accountNumber || w.userPhone}</span>
                      <span>•</span>
                      <span>{formatPakistanDateTime(w.timestamp || w.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black font-mono text-amber-400 text-xs">
                      {formatPKR(w.netAmount || w.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onApproveWithdrawal(w.id)}
                      className="py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition-all shadow-xs"
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Quick Navigation Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('deposits')}
          className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
          }`}
        >
          <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Deposits Table</h4>
          <p className="text-[10px] text-slate-400">{stats.pendingDepositsCount} pending</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('withdrawals')}
          className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
          }`}
        >
          <ArrowUpRight className="w-5 h-5 text-amber-500" />
          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Payouts Table</h4>
          <p className="text-[10px] text-slate-400">{stats.pendingWithdrawalsCount} pending</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('active-plans')}
          className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
          }`}
        >
          <Package className="w-5 h-5 text-indigo-400" />
          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Contracts</h4>
          <p className="text-[10px] text-slate-400">{stats.activeInvestmentsCount} contracts</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('users')}
          className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
          }`}
        >
          <Users className="w-5 h-5 text-purple-400" />
          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Investors</h4>
          <p className="text-[10px] text-slate-400">{stats.totalUsersCount} accounts</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('gateways')}
          className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
          }`}
        >
          <CreditCard className="w-5 h-5 text-teal-400" />
          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tills & Accounts</h4>
          <p className="text-[10px] text-slate-400">Payment channels</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('ledger')}
          className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
          }`}
        >
          <Receipt className="w-5 h-5 text-cyan-400" />
          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Financial Ledger</h4>
          <p className="text-[10px] text-slate-400">Audit trail</p>
        </button>
      </div>
    </div>
  );
};
