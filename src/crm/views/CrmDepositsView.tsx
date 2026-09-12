import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
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
  RefreshCw,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { DepositDetailModal } from '../components/DepositDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmDepositsViewProps {
  deposits?: Transaction[];
  onApproveDeposit: (txId: string) => Promise<void>;
  onDeclineDeposit: (txId: string, reason: string) => Promise<void>;
}

export const CrmDepositsView: React.FC<CrmDepositsViewProps> = ({
  deposits: propDeposits,
  onApproveDeposit,
  onDeclineDeposit,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [depositsList, setDepositsList] = useState<Transaction[]>(propDeposits || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Server-side pagination state
  const [serverPage, setServerPage] = useState<number>(1);
  const [serverPageSize, setServerPageSize] = useState<number>(25);
  const [serverSearch, setServerSearch] = useState<string>('');
  const [totalServerItems, setTotalServerItems] = useState<number>(0);
  const [statsData, setStatsData] = useState<{
    pendingCount: number;
    pendingVolume: number;
    completedCount: number;
    completedVolume: number;
    totalCount: number;
  }>({
    pendingCount: 0,
    pendingVolume: 0,
    completedCount: 0,
    completedVolume: 0,
    totalCount: 0,
  });

  // Tab-specific fetch with full pagination and filters
  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'deposit');
      params.append('page', String(serverPage));
      params.append('limit', String(serverPageSize));
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (gatewayFilter !== 'all') params.append('gateway', gatewayFilter);
      if (serverSearch.trim()) params.append('search', serverSearch.trim());

      const res = await fetch(getApiUrl(`/api/admin/transactions?${params.toString()}`));
      const data = await res.json();
      if (data?.success && Array.isArray(data?.transactions)) {
        setDepositsList(data.transactions);
        if (data.pagination) {
          setTotalServerItems(data.pagination.total);
        }
        if (data.typeStats?.deposit) {
          setStatsData(data.typeStats.deposit);
        }
      }
    } catch (err) {
      console.error('Failed to fetch deposits list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [serverPage, serverPageSize, statusFilter, gatewayFilter, serverSearch]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

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
    await fetchDeposits();
    setActionLoadingId(null);
  };

  const handleModalApprove = async (txId: string) => {
    await onApproveDeposit(txId);
    await fetchDeposits();
  };

  const handleModalDecline = async (txId: string, reason: string) => {
    await onDeclineDeposit(txId, reason);
    await fetchDeposits();
  };

  // Unique gateways list
  const standardGateways = ['JazzCash', 'EasyPaisa', 'Raast', 'SadaPay', 'NayaPay', 'Bank_Transfer', 'USDT_TRC20', 'Direct'];
  const dynamicGateways = Array.from(new Set(depositsList.map((d) => d.gateway).filter((g): g is NonNullable<typeof g> => Boolean(g))));
  const allGateways = Array.from(new Set([...standardGateways, ...dynamicGateways]));

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Approval Status',
      selectedValue: statusFilter,
      onChange: (val) => {
        setStatusFilter(val as any);
        setServerPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Approved / Credited', value: 'completed' },
        { label: 'Declined / Rejected', value: 'declined' },
      ],
    },
    {
      key: 'gateway',
      label: 'Payment Gateway',
      selectedValue: gatewayFilter,
      onChange: (val) => {
        setGatewayFilter(val);
        setServerPage(1);
      },
      options: [
        { label: 'All Gateways', value: 'all' },
        ...allGateways.map((g: string) => ({ label: g, value: g })),
      ],
    },
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
      header: 'Submitted Time (PKT)',
      render: (tx) => (
        <span className="font-mono text-[11px] text-slate-300">
          {formatPakistanDateTime(tx.timestamp || tx.createdAt)}
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

  // Metrics across entire database
  const pendingCount = statsData.pendingCount || depositsList.filter((d) => d.status === 'pending').length;
  const pendingVolume = statsData.pendingVolume || depositsList
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalApprovedVolume = statsData.completedVolume || depositsList
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalSubmissions = statsData.totalCount || totalServerItems || depositsList.length;

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
            {totalSubmissions.toLocaleString()} Transactions
          </p>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <CrmDataTable<Transaction>
        data={depositsList}
        columns={columns}
        keyExtractor={(d) => d.id}
        title="Pakistani Deposit Verification Queue"
        subtitle="Review JazzCash, EasyPaisa, Raast & Bank IBFT transaction IDs and credit investor wallets"
        icon={<ArrowDownLeft className="w-5 h-5" />}
        searchPlaceholder="Search by TID, investor name, phone, or Ref ID..."
        filterGroups={filterGroups}
        initialPageSize={serverPageSize}
        serverPagination={true}
        totalServerItems={totalServerItems}
        serverPage={serverPage}
        onServerPageChange={setServerPage}
        serverSearch={serverSearch}
        onServerSearchChange={(val) => {
          setServerSearch(val);
          setServerPage(1);
        }}
        serverPageSize={serverPageSize}
        onServerPageSizeChange={(newSize) => {
          setServerPageSize(newSize);
          setServerPage(1);
        }}
        isLoading={isLoading}
        onRowClick={(deposit) => setSelectedDeposit(deposit)}
        emptyMessage="No deposit transaction records found"
        emptySubtext="When users deposit via JazzCash or EasyPaisa, they will appear here for verification."
      />

      {/* 3. Entity Detail Modal */}
      {selectedDeposit && (
        <DepositDetailModal
          deposit={selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          onApprove={handleModalApprove}
          onDecline={handleModalDecline}
        />
      )}
    </div>
  );
};
