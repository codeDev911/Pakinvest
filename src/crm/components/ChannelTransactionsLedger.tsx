import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OfficialDepositChannel, Transaction } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  RefreshCw,
  Smartphone,
  Building2,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Coins,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface ChannelTransactionsLedgerProps {
  channels: OfficialDepositChannel[];
  initialChannelId?: string;
  onRefreshChannels?: () => void;
}

export const ChannelTransactionsLedger: React.FC<ChannelTransactionsLedgerProps> = ({
  channels,
  initialChannelId = 'all',
  onRefreshChannels,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [selectedChannelId, setSelectedChannelId] = useState<string>(initialChannelId);
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });

  const fetchLedger = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', String(currentPage));
      params.append('limit', String(pageSize));

      const url = getApiUrl(
        `/api/admin/deposit-channels/${encodeURIComponent(selectedChannelId)}/transactions?${params.toString()}`
      );
      const res = await fetch(url);
      const data = await res.json();
      if (data?.success && Array.isArray(data?.transactions)) {
        setTransactions(data.transactions);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch channel transactions ledger:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannelId, typeFilter, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleSelectChannel = (chId: string) => {
    setSelectedChannelId(chId);
    setCurrentPage(1);
  };

  const handleTypeChange = (t: 'all' | 'deposit' | 'withdrawal') => {
    setTypeFilter(t);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, pagination.totalPages || Math.ceil(pagination.total / pageSize) || 1);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPageInput('');
    }
  };

  // Selected channel object (if not 'all')
  const activeChannel = channels.find((c) => c.id === selectedChannelId || c.gateway === selectedChannelId);

  // Compute live aggregates from currently viewed transactions
  const totalInflow = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + (t.netAmount || t.amount || 0), 0);

  const netFlow = totalInflow - totalOutflow;

  const getGatewayIcon = (gateway: string) => {
    const gw = (gateway || '').toLowerCase();
    if (gw.includes('jazz') || gw.includes('easy')) {
      return <Smartphone className="w-4 h-4" />;
    }
    if (gw.includes('bank') || gw.includes('hbl') || gw.includes('meezan')) {
      return <Building2 className="w-4 h-4" />;
    }
    return <CreditCard className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Channel Switcher */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Payment Channels Ledger & Balance Audit
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Track every verified deposit increment and dispatched payout deduction across all financial gateways
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchLedger();
                if (onRefreshChannels) onRefreshChannels();
              }}
              disabled={isLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Channel Selection Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => handleSelectChannel('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              selectedChannelId === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : isDark
                ? 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Channels Consolidated</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedChannelId === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {channels.length}
            </span>
          </button>

          {channels.map((ch) => {
            const isSelected = selectedChannelId === ch.id || selectedChannelId === ch.gateway;
            const bal = ch.currentBalance || 0;
            return (
              <button
                key={ch.id || ch.gateway}
                type="button"
                onClick={() => handleSelectChannel(ch.id || ch.gateway)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {getGatewayIcon(ch.gateway)}
                <span>{ch.gateway}</span>
                <span className="font-mono text-[11px] opacity-80">
                  ({ch.accountTitle || ch.accountNumber.slice(-4)})
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400'
                      : bal >= 0
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}
                >
                  {formatPKR(bal)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Channel Metrics Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Float */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">
              {activeChannel ? `${activeChannel.gateway} Float` : 'Total Consolidated Float'}
            </span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-amber-400">
              {formatPKR(
                activeChannel
                  ? activeChannel.currentBalance || 0
                  : channels.reduce((acc, c) => acc + (c.currentBalance || 0), 0)
              )}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {activeChannel ? `Account: ${activeChannel.accountNumber}` : 'Vault cash across all active channels'}
          </span>
        </div>

        {/* Metric 2: Total Inflows (Deposits) */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Total Inflow (Deposits)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-400">
              {formatPKR(
                activeChannel
                  ? activeChannel.totalDeposited || totalInflow
                  : channels.reduce((acc, c) => acc + (c.totalDeposited || 0), totalInflow)
              )}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Incremental deposits credited to channel
          </span>
        </div>

        {/* Metric 3: Total Outflows (Withdrawals) */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Total Outflow (Dispatches)</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-rose-400">
              {formatPKR(
                activeChannel
                  ? activeChannel.totalWithdrawn || totalOutflow
                  : channels.reduce((acc, c) => acc + (c.totalWithdrawn || 0), totalOutflow)
              )}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Payout amounts deducted from channel float
          </span>
        </div>

        {/* Metric 4: Ledger Activity Count */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Transactions Count</span>
            <ArrowUpDown className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-sky-400">
              {pagination.total}
            </span>
            <span className="text-xs text-slate-500">settled records</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Audited financial movements
          </span>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Type Toggle Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleTypeChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              typeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-black'
                : isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Movements
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('deposit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              typeFilter === 'deposit'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deposits (Inflow)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('withdrawal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              typeFilter === 'withdrawal'
                ? 'bg-rose-500 text-slate-950 font-black'
                : isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Withdrawals (Outflow)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by TID, phone, name, notes..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* 4. Transactions Ledger Table */}
      <div
        className={`rounded-3xl border overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ledger Journal Entries
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
              {pagination.total > 0
                ? `${pagination.total.toLocaleString()} total entries recorded`
                : `${transactions.length} entries shown`}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Page {currentPage} of {totalPages} • Pakistan Standard Time (PKT)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading channel transaction entries...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No transactions found for this channel</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Approved deposits and dispatched withdrawals routed through this payment channel will record here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Channel / Gateway</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Investor / Contact</th>
                  <th className="py-3 px-4">TID / Reference</th>
                  <th className="py-3 px-4 text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Ledger Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit';
                  const effectiveAmount = isDeposit
                    ? tx.amount
                    : tx.netAmount || tx.amount;

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formatPakistanDateTime(tx.timestamp || tx.createdAt)}
                      </td>

                      {/* Gateway / Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {getGatewayIcon(tx.gateway)}
                          <span>{tx.gateway}</span>
                        </span>
                        {tx.accountNumber && (
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {tx.accountNumber}
                          </span>
                        )}
                      </td>

                      {/* Movement Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeposit
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-amber-400" />
                          )}
                          <span>{isDeposit ? 'DEPOSIT CREDIT' : 'PAYOUT DISPATCH'}</span>
                        </span>
                      </td>

                      {/* Investor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white block">{tx.userName || 'Investor'}</span>
                        <span className="font-mono text-[10px] text-slate-400">{tx.userPhone || '—'}</span>
                      </td>

                      {/* Reference Code / TID */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-amber-400 font-bold text-[11px]">
                          {tx.referenceCode || tx.id.slice(0, 10)}
                        </span>
                      </td>

                      {/* Amount with colored sign */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-black text-sm ${
                            isDeposit ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isDeposit ? '+' : '-'}
                          {formatPKR(effectiveAmount)}
                        </span>
                        {!isDeposit && tx.fee > 0 && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            Fee: {formatPKR(tx.fee)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>SETTLED</span>
                        </span>
                      </td>

                      {/* Ledger Notes */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                        {tx.notes || (isDeposit ? 'Deposit verified' : 'Dispatched')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer Controls */}
        {pagination.total > 0 && (
          <div
            className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Showing{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                  {(currentPage - 1) * pageSize + 1}
                </strong>{' '}
                to{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                  {Math.min(currentPage * pageSize, pagination.total)}
                </strong>{' '}
                of{' '}
                <strong className="text-amber-400 font-mono">
                  {pagination.total.toLocaleString()}
                </strong>{' '}
                entries
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className={`py-1 px-2 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border border-slate-700 text-slate-200'
                      : 'bg-white border border-slate-300 text-slate-800'
                  }`}
                >
                  {[10, 25, 50, 100, 200].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 mx-1">
                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-500 font-bold">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      disabled={isLoading}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all ${
                        currentPage === p
                          ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800 border border-slate-800'
                          : 'text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>

              {/* Jump to page */}
              {totalPages > 5 && (
                <form onSubmit={handleJumpPage} className="flex items-center gap-1 ml-2">
                  <span className="text-[11px] text-slate-500">Go:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    placeholder="#"
                    className={`w-11 py-1 px-1.5 rounded-lg text-center font-mono text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
