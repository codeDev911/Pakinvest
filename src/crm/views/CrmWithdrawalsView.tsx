import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Building2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { WithdrawalDetailModal } from '../components/WithdrawalDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmWithdrawalsViewProps {
  withdrawals: Transaction[];
  onApproveWithdrawal: (txId: string) => Promise<void>;
  onDeclineWithdrawal: (txId: string, reason: string) => Promise<void>;
}

export const CrmWithdrawalsView: React.FC<CrmWithdrawalsViewProps> = ({
  withdrawals,
  onApproveWithdrawal,
  onDeclineWithdrawal,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickApprove = async (e: React.MouseEvent, txId: string) => {
    e.stopPropagation();
    setActionLoadingId(txId);
    await onApproveWithdrawal(txId);
    setActionLoadingId(null);
  };

  // Only consider withdrawal transactions
  const withdrawalTxs = withdrawals.filter((tx) => tx.type === 'withdrawal');

  // Gateways
  const gateways: string[] = Array.from(new Set(withdrawalTxs.map((w) => w.gateway).filter((g): g is string => Boolean(g))));

  const filteredWithdrawals = withdrawalTxs.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (gatewayFilter !== 'all' && tx.gateway !== gatewayFilter) return false;
    return true;
  });

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Payout Status',
      selectedValue: statusFilter,
      onChange: (val) => setStatusFilter(val as any),
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending Payout', value: 'pending' },
        { label: 'Settled / Dispatched', value: 'completed' },
        { label: 'Declined & Refunded', value: 'declined' },
      ],
    },
    ...(gateways.length > 0
      ? [
          {
            key: 'gateway',
            label: 'Payout Channel',
            selectedValue: gatewayFilter,
            onChange: setGatewayFilter,
            options: [
              { label: 'All Gateways', value: 'all' },
              ...gateways.map((g: string) => ({ label: g, value: g })),
            ],
          },
        ]
      : []),
  ];

  const columns: Column<Transaction>[] = [
    {
      key: 'userName',
      header: 'Investor Account',
      render: (tx) => (
        <div>
          <div className="font-bold text-white tracking-tight">{tx.userName || 'Investor'}</div>
          <div className="font-mono text-[10px] text-slate-400">{tx.userPhone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'accountNumber',
      header: 'Beneficiary Account',
      render: (tx) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-amber-400 text-xs">
              {tx.accountNumber || tx.userPhone || '—'}
            </span>
            {tx.accountNumber && (
              <button
                type="button"
                onClick={(e) => handleCopy(e, tx.accountNumber || '', `acc-${tx.id}`)}
                className="p-0.5 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy Account Number"
              >
                {copiedId === `acc-${tx.id}` ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
            {tx.accountTitle || tx.userName}
          </div>
        </div>
      ),
    },
    {
      key: 'gateway',
      header: 'Destination Channel',
      render: (tx) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{tx.gateway || 'Direct'}</span>
          </span>
          {tx.bankName && (
            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{tx.bankName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'netAmount',
      header: 'Net Payout (0% Fee)',
      align: 'right',
      render: (tx) => (
        <div>
          <div className="font-black text-amber-400 font-mono text-sm">
            {formatPKR(tx.netAmount || tx.amount)}
          </div>
          <div className="text-[10px] text-slate-500">Requested: {formatPKR(tx.amount)}</div>
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Requested Time',
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
    {
      key: 'actions',
      header: 'Payout Action',
      align: 'right',
      sortable: false,
      render: (tx) => {
        if (tx.status !== 'pending') {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWithdrawal(tx);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
            >
              View Record
            </button>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => handleQuickApprove(e, tx.id)}
              disabled={actionLoadingId === tx.id}
              className="py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{actionLoadingId === tx.id ? 'Dispatching...' : 'Dispatch'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWithdrawal(tx);
              }}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
            >
              Details
            </button>
          </div>
        );
      },
    },
  ];

  // Metrics
  const pendingCount = withdrawalTxs.filter((w) => w.status === 'pending').length;
  const pendingVolume = withdrawalTxs
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + (w.netAmount || w.amount), 0);
  const totalSettledVolume = withdrawalTxs
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + (w.netAmount || w.amount), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pending Payout Dispatch Queue
          </span>
          <p className="text-2xl font-black text-amber-400 tracking-tight mt-1">
            {pendingCount} Requests ({formatPKR(pendingVolume)})
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Dispatched to Investors
          </span>
          <p className="text-2xl font-black text-emerald-500 tracking-tight mt-1">
            {formatPKR(totalSettledVolume)}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Payout Requests
          </span>
          <p className="text-2xl font-black text-indigo-400 tracking-tight mt-1">
            {withdrawalTxs.length} Transactions
          </p>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <CrmDataTable<Transaction>
        data={filteredWithdrawals}
        columns={columns}
        keyExtractor={(w) => w.id}
        title="Withdrawal Payout Dispatch Queue"
        subtitle="Process payouts to JazzCash, EasyPaisa, and Pakistani 1Link Bank Accounts"
        icon={<ArrowUpRight className="w-5 h-5" />}
        searchPlaceholder="Search by account title, account number, investor name, or Ref ID..."
        searchFields={[
          (w) => w.userName,
          (w) => w.accountTitle,
          (w) => w.accountNumber,
          (w) => w.userPhone,
          (w) => w.id,
          (w) => w.gateway,
        ]}
        filterGroups={filterGroups}
        initialPageSize={10}
        onRowClick={(w) => setSelectedWithdrawal(w)}
        emptyMessage="No withdrawal payout records found"
        emptySubtext="When investors request payouts to JazzCash or Bank, they appear here."
      />

      {/* 3. Entity Detail Modal */}
      {selectedWithdrawal && (
        <WithdrawalDetailModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onApprove={onApproveWithdrawal}
          onDecline={onDeclineWithdrawal}
        />
      )}
    </div>
  );
};
