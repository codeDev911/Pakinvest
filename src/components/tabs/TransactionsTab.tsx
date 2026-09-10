import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ReceiptText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  Coins,
  ChevronRight,
  Download,
} from 'lucide-react';

export const TransactionsTab: React.FC = () => {
  const { transactions, setSelectedTransactionReceipt, user } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', label: 'All History' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'withdrawal', label: 'Withdrawals' },
    { id: 'daily_profit', label: 'Daily Profit' },
    { id: 'referral_bonus', label: 'Referral Bonus' },
    { id: 'plan_investment', label: 'Investments' },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = activeFilter === 'all' || tx.type === activeFilter;
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.planName && tx.planName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.gateway && tx.gateway.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-amber-500" />;
      case 'daily_profit':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'referral_bonus':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'plan_investment':
        return <ReceiptText className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const totalInflow = transactions
    .filter((t) => t.type === 'deposit' || t.type === 'daily_profit' || t.type === 'referral_bonus' || t.type === 'streak_reward')
    .reduce((acc, t) => acc + t.netAmount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'withdrawal' || t.type === 'plan_investment')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Transaction Ledger
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Complete verified records of deposits, withdrawals, daily profits, and referral bonuses in Rs.
        </p>
      </div>

      {/* Summary Inflow / Outflow Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Total Inflow (Credits)</span>
          </div>
          <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-display">
            +{formatPKR(totalInflow)}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
            <span>Total Outflow (Debits)</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white font-display">
            -{formatPKR(totalOutflow)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Transaction ID, Reference, or Gateway..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === tab.id
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40">
            <ReceiptText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No transactions match your search</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = tx.type === 'deposit' || tx.type === 'daily_profit' || tx.type === 'referral_bonus' || tx.type === 'streak_reward';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransactionReceipt(tx)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tx.type.replace('_', ' ')}
                      </h4>
                      {tx.gateway && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                          {tx.gateway === 'Bank_Transfer' ? 'Meezan' : tx.gateway}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Ref: {tx.referenceCode} • {formatPakistanDateTime(tx.timestamp || tx.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span
                      className={`text-sm font-black font-display block ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatPKR(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium capitalize">
                      {tx.status}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
