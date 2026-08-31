import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Sparkles,
  Eye,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { LedgerDetailModal } from '../components/LedgerDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmLedgerViewProps {
  transactions: Transaction[];
}

export const CrmLedgerView: React.FC<CrmLedgerViewProps> = ({ transactions }) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [selectedEntry, setSelectedEntry] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    return true;
  });

  const filterGroups: FilterGroup[] = [
    {
      key: 'type',
      label: 'Journal Type',
      selectedValue: typeFilter,
      onChange: setTypeFilter,
      options: [
        { label: 'All Journal Types', value: 'all' },
        { label: 'Deposit Inflow', value: 'deposit' },
        { label: 'Withdrawal Outflow', value: 'withdrawal' },
        { label: 'Daily Yield Dividends', value: 'daily_profit' },
        { label: 'Capital Allocations', value: 'plan_investment' },
        { label: '3-Tier Referral Bonuses', value: 'referral_bonus' },
        { label: 'Manual Admin Adjustments', value: 'admin_adjustment' },
      ],
    },
    {
      key: 'status',
      label: 'Settlement Status',
      selectedValue: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Settled / Reconciled', value: 'completed' },
        { label: 'Pending Processing', value: 'pending' },
        { label: 'Declined / Reverted', value: 'declined' },
      ],
    },
  ];

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

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Journal Sequence / ID',
      render: (tx) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
            {getTypeIcon(tx.type)}
          </div>
          <div>
            <div className="font-mono font-bold text-white text-xs">{tx.id}</div>
            <div className="text-[10px] uppercase font-bold text-indigo-400">
              {tx.type.replace('_', ' ')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'Investor Account',
      render: (tx) => (
        <div>
          <div className="font-bold text-slate-200">{tx.userName || 'Investor'}</div>
          <div className="font-mono text-[10px] text-slate-400">{tx.userPhone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'referenceCode',
      header: 'Channel & Reference Proof',
      render: (tx) => (
        <div>
          <div className="font-mono font-bold text-amber-400 text-xs truncate max-w-[140px]">
            {tx.referenceCode || 'SYSTEM-RECONCILED'}
          </div>
          <div className="text-[10px] text-slate-400">{tx.gateway || 'System_Reserve'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Journal Amount',
      align: 'right',
      render: (tx) => {
        const isPositive = tx.type === 'deposit' || tx.type === 'daily_profit' || tx.type === 'referral_bonus';
        return (
          <div
            className={`font-mono font-black text-sm ${
              isPositive ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isPositive ? '+' : '-'}
            {formatPKR(tx.amount)}
          </div>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (tx) => (
        <span className="font-mono text-[11px] text-slate-300">
          {tx.timestamp}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (tx) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            tx.status === 'completed'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : tx.status === 'pending'
              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
              : 'bg-rose-950 text-rose-300 border border-rose-800'
          }`}
        >
          {tx.status.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Main Data Table */}
      <CrmDataTable<Transaction>
        data={filtered}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        title="Financial Ledger & Master Audit Trail"
        subtitle="Cryptographically verified and double-deduction locked ledger logs"
        icon={<Receipt className="w-5 h-5" />}
        searchPlaceholder="Search by ID, TID reference, investor name, phone, or gateway..."
        searchFields={[
          (t) => t.id,
          (t) => t.referenceCode,
          (t) => t.userName,
          (t) => t.userPhone,
          (t) => t.gateway,
          (t) => t.notes,
        ]}
        filterGroups={filterGroups}
        initialPageSize={10}
        onRowClick={(entry) => setSelectedEntry(entry)}
        emptyMessage="No financial ledger entries found"
        emptySubtext="All incoming deposits, outgoing payouts, and yield dividends will be logged here."
      />

      {/* Entity Detail Modal */}
      {selectedEntry && (
        <LedgerDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};
