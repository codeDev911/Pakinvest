import React from 'react';
import { CrmStats, Transaction, CrmNavTab } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Users,
  Package,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

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
      {/* 1. Top High-Level Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflows */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Deposits Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatPKR(stats.totalDeposited)}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Verified Inflow Volume
            </p>
          </div>
        </div>

        {/* Total Outflows */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Payouts Settled</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatPKR(stats.totalWithdrawn)}
            </h3>
            <p className="text-[11px] text-amber-400 mt-0.5">
              Completed JazzCash / EasyPaisa payouts
            </p>
          </div>
        </div>

        {/* Pending Queue Volume */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Actions Queue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {stats.pendingDepositsCount + stats.pendingWithdrawalsCount} Requests
            </h3>
            <p className="text-[11px] text-rose-400 mt-0.5">
              Rs. {(stats.pendingDepositsVolume + stats.pendingWithdrawalsVolume).toLocaleString()} in queue
            </p>
          </div>
        </div>

        {/* Active Capital Under Management */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Capital (AUM)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatPKR(stats.totalLockedCapital)}
            </h3>
            <p className="text-[11px] text-blue-400 mt-0.5">
              {stats.activeInvestmentsCount} Running yield packages
            </p>
          </div>
        </div>
      </div>

      {/* 2. Urgent Pending Deposits Approval Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pending Deposit Approvals</h2>
              <p className="text-xs text-slate-400">
                Review investor TID proofs & credit user wallets instantly with 3-tier commission distribution
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('deposits')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All ({pendingDeposits.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {pendingDeposits.length === 0 ? (
          <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-300">All Deposit Requests are Cleared!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">No pending deposit verification tickets in queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingDeposits.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.userName || 'Investor'}</span>
                      {getGatewayBadge(tx.gateway)}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.userPhone || tx.senderPhone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">{formatPKR(tx.amount)}</span>
                    <p className="text-[10px] text-slate-500 font-mono">{tx.timestamp}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">TID / Ref:</span>
                  <span className="font-bold text-amber-300">{tx.referenceCode}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onApproveDeposit(tx.id)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Credit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeclineDeposit(tx.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Urgent Pending Withdrawals Payout Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pending Withdrawal Payouts</h2>
              <p className="text-xs text-slate-400">
                Dispatch funds to investor JazzCash / EasyPaisa / Bank accounts and mark settled
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('withdrawals')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All ({pendingWithdrawals.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {pendingWithdrawals.length === 0 ? (
          <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-300">No Pending Payouts!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">All investor withdrawal requests have been dispatched.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingWithdrawals.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.userName || 'Investor'}</span>
                      {getGatewayBadge(tx.gateway)}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {tx.accountTitle} • <strong className="text-slate-200">{tx.accountNumber}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-400">{formatPKR(tx.netAmount || tx.amount)}</span>
                    <p className="text-[10px] text-slate-500 font-mono">Req: {formatPKR(tx.amount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onApproveWithdrawal(tx.id)}
                    className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Dispatched</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeclineWithdrawal(tx.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline & Refund</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Operations Fast Quick-Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('plans')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Investment Plans</p>
              <p className="text-[11px] text-slate-400">Edit ROI % & durations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('gateways')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Payment Accounts</p>
              <p className="text-[11px] text-slate-400">Configure JazzCash / Banks</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('users')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">User Accounts</p>
              <p className="text-[11px] text-slate-400">Adjust balances & PINs</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
