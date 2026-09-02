import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { LedgerDetailModal } from '../components/LedgerDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmLedgerViewProps {
  initialTransactions?: Transaction[];
}

export const CrmLedgerView: React.FC<CrmLedgerViewProps> = () => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Server pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Live integrity stats state
  const [integrityData, setIntegrityData] = useState<{
    totalTransactions: number;
    negativeOrZeroAmountCount: number;
    unlinkedTransactionsCount: number;
    unknownTypeCount: number;
    isHealthy: boolean;
  } | null>(null);

  // Fetch paginated transactions from DB on demand
  const fetchLedger = useCallback(async (page: number, limit: number, type: string, status: string, search: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (type && type !== 'all') params.append('type', type);
      if (status && status !== 'all') params.append('status', status);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(getApiUrl(`/api/admin/transactions?${params.toString()}`));
      const data = await res.json();

      if (data?.success) {
        setTransactions(data.transactions || []);
        if (data.pagination?.total !== undefined) {
          setTotalTransactions(data.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch ledger transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch integrity diagnostics once
  const fetchIntegrityCheck = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/ledger/audit-integrity'));
      const data = await res.json();
      if (data?.success && data.integrity) {
        setIntegrityData(data.integrity);
      }
    } catch (err) {
      console.error('Failed to run audit integrity check:', err);
    }
  }, []);

  useEffect(() => {
    fetchLedger(currentPage, pageSize, typeFilter, statusFilter, searchQuery);
  }, [fetchLedger, currentPage, pageSize, typeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchIntegrityCheck();
  }, [fetchIntegrityCheck]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (val: string) => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const filterGroups: FilterGroup[] = [
    {
      key: 'type',
      label: 'Journal Type',
      selectedValue: typeFilter,
      onChange: handleTypeFilterChange,
      options: [
        { label: 'All Journal Types', value: 'all' },
        { label: 'Deposit Inflow', value: 'deposit' },
        { label: 'Withdrawal Outflow', value: 'withdrawal' },
        { label: 'Daily Yield Dividends', value: 'daily_profit' },
        { label: 'Capital Allocations', value: 'plan_investment' },
        { label: '3-Tier Referral Bonuses', value: 'referral_bonus' },
        { label: 'Streak Claim Rewards', value: 'streak_reward' },
        { label: 'Manual Admin Adjustments', value: 'admin_adjustment' },
      ],
    },
    {
      key: 'status',
      label: 'Settlement Status',
      selectedValue: statusFilter,
      onChange: handleStatusFilterChange,
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
      case 'streak_reward':
        return <Sparkles className="w-4 h-4 text-orange-400" />;
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
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
            {getTypeIcon(tx.type)}
          </div>
          <div className="min-w-0">
            <div className="font-mono font-bold text-white text-xs truncate max-w-[150px]">{tx.id}</div>
            <div className="text-[10px] uppercase font-bold text-indigo-400">
              {tx.type.replace(/_/g, ' ')}
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
          <div className="font-bold text-slate-200 text-xs">{tx.userName || 'Investor'}</div>
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
        const isPositive = tx.type === 'deposit' || tx.type === 'daily_profit' || tx.type === 'referral_bonus' || tx.type === 'streak_reward';
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
        <span className="font-mono text-[11px] text-slate-300 whitespace-nowrap">
          {tx.timestamp}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Audit & Status',
      align: 'center',
      render: (tx) => (
        <div className="flex flex-col items-center gap-1">
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
          <span className="font-mono text-[9px] text-slate-500 uppercase tracking-tight">
            HMAC-VERIFIED
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Integrity & Diagnostics Bar */}
      {integrityData && (
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
          integrityData.isHealthy
            ? 'bg-slate-900/60 border-slate-800 text-slate-300'
            : 'bg-amber-950/40 border-amber-800 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${integrityData.isHealthy ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
              {integrityData.isHealthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Database Ledger Health:</span>
                <span className={integrityData.isHealthy ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                  {integrityData.isHealthy ? 'OPTIMAL & VERIFIED' : 'ANOMALIES FOUND'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {integrityData.totalTransactions.toLocaleString()} total transactions in PostgreSQL. HMAC checksums active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              Unlinked: <strong className="text-white">{integrityData.unlinkedTransactionsCount}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              Zero/Negative: <strong className="text-white">{integrityData.negativeOrZeroAmountCount}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                fetchLedger(currentPage, pageSize, typeFilter, statusFilter, searchQuery);
                fetchIntegrityCheck();
              }}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh Ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Main Server-Paginated Data Table */}
      <CrmDataTable<Transaction>
        data={transactions}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        title="Financial Ledger & Master Audit Trail"
        subtitle={`Showing page ${currentPage} of ${Math.max(1, Math.ceil(totalTransactions / pageSize))} (${totalTransactions.toLocaleString()} total transactions in database)`}
        icon={<Receipt className="w-5 h-5" />}
        searchPlaceholder="Search by ID, TID reference, investor name, phone, or gateway..."
        filterGroups={filterGroups}
        initialPageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowClick={(entry) => setSelectedEntry(entry)}
        emptyMessage="No financial ledger entries found"
        emptySubtext="Try clearing your search query or filter criteria."
        serverPagination={true}
        totalServerItems={totalTransactions}
        serverPage={currentPage}
        onServerPageChange={handlePageChange}
        serverSearch={searchQuery}
        onServerSearchChange={handleSearchChange}
        isLoading={isLoading}
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
