import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Smartphone,
  Eye,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { DepositDetailModal } from '../components/DepositDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmDepositsViewProps {
  deposits: Transaction[];
  onApproveDeposit: (txId: string) => Promise<void>;
  onDeclineDeposit: (txId: string, reason: string) => Promise<void>;
}

export const CrmDepositsView: React.FC<CrmDepositsViewProps> = ({
  deposits,
  onApproveDeposit,
  onDeclineDeposit,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
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
    await onApproveDeposit(txId);
    setActionLoadingId(null);
  };

  // Only consider deposit transactions
  const depositTxs = deposits.filter((tx) => tx.type === 'deposit');

  // Unique gateways list
  const gateways: string[] = Array.from(new Set(depositTxs.map((d) => d.gateway).filter((g): g is string => Boolean(g))));

  const filteredDeposits = depositTxs.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (gatewayFilter !== 'all' && tx.gateway !== gatewayFilter) return false;
    return true;
  });

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Approval Status',
      selectedValue: statusFilter,
      onChange: (val) => setStatusFilter(val as any),
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Approved / Credited', value: 'completed' },
        { label: 'Declined / Rejected', value: 'declined' },
      ],
    },
    ...(gateways.length > 0
      ? [
          {
            key: 'gateway',
            label: 'Payment Gateway',
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
      key: 'referenceCode',
      header: 'Gateway TID Proof',
      render: (tx) => (
        <div className="flex items-center gap-2">
          <div className="font-mono font-black text-amber-400 text-xs tracking-wider">
            {tx.referenceCode || 'NO-REF'}
          </div>
          <button
            type="button"
            onClick={(e) => handleCopy(e, tx.referenceCode, `tid-${tx.id}`)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy TID"
          >
            {copiedId === `tid-${tx.id}` ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'Investor Profile',
      render: (tx) => (
        <div>
          <div className="font-bold text-white tracking-tight">{tx.userName || 'Investor'}</div>
          <div className="font-mono text-[10px] text-slate-400">{tx.userPhone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'gateway',
      header: 'Channel / Sender',
      render: (tx) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{tx.gateway || 'Direct'}</span>
          </span>
          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
            {tx.senderTitle || tx.senderPhone || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Deposit Amount',
      align: 'right',
      render: (tx) => (
        <div className="font-black text-emerald-400 font-mono text-sm">
          {formatPKR(tx.amount)}
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Submitted Time',
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
      header: 'Quick Action',
      align: 'right',
      sortable: false,
      render: (tx) => {
        if (tx.status !== 'pending') {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDeposit(tx);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
            >
              View Log
            </button>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => handleQuickApprove(e, tx.id)}
              disabled={actionLoadingId === tx.id}
              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{actionLoadingId === tx.id ? 'Approving...' : 'Approve'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDeposit(tx);
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
  const pendingCount = depositTxs.filter((d) => d.status === 'pending').length;
  const pendingVolume = depositTxs
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalApprovedVolume = depositTxs
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

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
            Pending Approval Queue
          </span>
          <p className="text-2xl font-black text-amber-400 tracking-tight mt-1">
            {pendingCount} Deposits ({formatPKR(pendingVolume)})
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Settled Inflow
          </span>
          <p className="text-2xl font-black text-emerald-500 tracking-tight mt-1">
            {formatPKR(totalApprovedVolume)}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Submissions
          </span>
          <p className="text-2xl font-black text-indigo-400 tracking-tight mt-1">
            {depositTxs.length} Transactions
          </p>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <CrmDataTable<Transaction>
        data={filteredDeposits}
        columns={columns}
        keyExtractor={(d) => d.id}
        title="Pakistani Deposit Verification Queue"
        subtitle="Review JazzCash, EasyPaisa, Raast & Bank IBFT transaction IDs and credit investor wallets"
        icon={<ArrowDownLeft className="w-5 h-5" />}
        searchPlaceholder="Search by TID, investor name, phone, or Ref ID..."
        searchFields={[
          (d) => d.referenceCode,
          (d) => d.userName,
          (d) => d.userPhone,
          (d) => d.senderPhone,
          (d) => d.id,
          (d) => d.gateway,
        ]}
        filterGroups={filterGroups}
        initialPageSize={10}
        onRowClick={(deposit) => setSelectedDeposit(deposit)}
        emptyMessage="No deposit transaction records found"
        emptySubtext="When users deposit via JazzCash or EasyPaisa, they will appear here for verification."
      />

      {/* 3. Entity Detail Modal */}
      {selectedDeposit && (
        <DepositDetailModal
          deposit={selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          onApprove={onApproveDeposit}
          onDecline={onDeclineDeposit}
        />
      )}
    </div>
  );
};
