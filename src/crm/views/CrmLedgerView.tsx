import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  Receipt,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CrmLedgerViewProps {
  transactions: Transaction[];
}

export const CrmLedgerView: React.FC<CrmLedgerViewProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.userName?.toLowerCase().includes(q) || tx.accountTitle?.toLowerCase().includes(q);
      const matchPhone = tx.userPhone?.toLowerCase().includes(q) || tx.senderPhone?.toLowerCase().includes(q);
      const matchRef = tx.referenceCode?.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      return matchName || matchPhone || matchRef || matchId;
    }
    return true;
  });

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      case 'daily_profit':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'plan_investment':
        return <Coins className="w-4 h-4 text-indigo-400" />;
      case 'referral_bonus':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'admin_adjustment':
        return <ShieldCheck className="w-4 h-4 text-yellow-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Settled</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold animate-pulse">Pending</span>;
      case 'declined':
        return <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">Declined</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">{st}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <span>Master Financial Ledger & Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable log of all deposits, withdrawals, daily yields and commission distributions
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <span>Entries:</span>
          <strong className="text-white">{filtered.length} of {transactions.length}</strong>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Investor, Phone, or TID reference..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Transaction Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="daily_profit">Daily Yields</option>
              <option value="plan_investment">Plan Investments</option>
              <option value="referral_bonus">Referral Commissions</option>
              <option value="admin_adjustment">Admin Adjustments</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Settled</option>
              <option value="pending">Pending Audit</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Type & Reference</th>
                <th className="p-3.5">Investor</th>
                <th className="p-3.5">Gateway / Details</th>
                <th className="p-3.5">Amount (PKR)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((tx) => {
                const isCredit = ['deposit', 'daily_profit', 'referral_bonus', 'admin_adjustment'].includes(tx.type);
                return (
                  <tr key={tx.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-bold text-white capitalize">{tx.type.replace('_', ' ')}</p>
                          <p className="text-[10px] font-mono text-slate-500">{tx.referenceCode || tx.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-200">{tx.userName || 'Investor'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{tx.userPhone || tx.senderPhone || '—'}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono font-bold">
                        {tx.gateway || 'Internal'}
                      </span>
                      {tx.accountNumber && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                          {tx.accountTitle ? `${tx.accountTitle}: ` : ''}{tx.accountNumber}
                        </p>
                      )}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className={`font-bold text-sm ${isCredit ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isCredit ? '+' : '-'}{formatPKR(tx.amount)}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {getStatusBadge(tx.status)}
                    </td>

                    <td className="p-3.5 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {tx.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
