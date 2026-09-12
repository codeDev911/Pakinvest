import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
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
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Percent,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { WithdrawalDetailModal } from '../components/WithdrawalDetailModal';
import { DispatchPayoutModal } from '../components/DispatchPayoutModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface WithdrawalFeeTier {
  id: string;
  condition: 'lt' | 'lte' | 'gt' | 'gte' | 'always';
  threshold: number;
  feePercent: number;
  flatFee: number;
  label: string;
}

interface DynamicWithdrawalFeeConfig {
  enabled: boolean;
  standardPercent: number;
  standardFlatFee?: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  maxDailyRequests?: number;
  description: string;
  tiers: WithdrawalFeeTier[];
}

interface CrmWithdrawalsViewProps {
  withdrawals?: Transaction[];
  onApproveWithdrawal: (
    txId: string,
    channelId?: string,
    gateway?: string,
    dispatchReference?: string,
    dispatchNotes?: string
  ) => Promise<void>;
  onDeclineWithdrawal: (txId: string, reason: string) => Promise<void>;
}

export const CrmWithdrawalsView: React.FC<CrmWithdrawalsViewProps> = ({
  withdrawals: propWithdrawals,
  onApproveWithdrawal,
  onDeclineWithdrawal,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [withdrawalsList, setWithdrawalsList] = useState<Transaction[]>(propWithdrawals || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Transaction | null>(null);
  const [dispatchTargetTx, setDispatchTargetTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Dynamic Fee Engine State
  const [feeConfig, setFeeConfig] = useState<DynamicWithdrawalFeeConfig>({
    enabled: true,
    standardPercent: 1.0,
    standardFlatFee: 0,
    minWithdrawal: 300,
    maxWithdrawal: 500000,
    maxDailyRequests: 3,
    description: 'Dynamic processing fee tiering for PKR withdrawals',
    tiers: [
      {
        id: 'tier-under-500',
        condition: 'lt',
        threshold: 500,
        feePercent: 0,
        flatFee: 0,
        label: 'Under Rs. 500: Free',
      },
      {
        id: 'tier-500-to-2500',
        condition: 'lte',
        threshold: 2500,
        feePercent: 1.0,
        flatFee: 0,
        label: 'Rs. 500 - Rs. 2,500',
      },
      {
        id: 'tier-above-2500',
        condition: 'gt',
        threshold: 2500,
        feePercent: 1.5,
        flatFee: 0,
        label: 'Above Rs. 2,500',
      },
    ],
  });
  const [isFeePanelOpen, setIsFeePanelOpen] = useState(false);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [feeSaveSuccess, setFeeSaveSuccess] = useState(false);
  const [testAmount, setTestAmount] = useState<number>(450);

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

  // Tab-specific fetch with full pagination and query filters
  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'withdrawal');
      params.append('page', String(serverPage));
      params.append('limit', String(serverPageSize));
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (gatewayFilter !== 'all') params.append('gateway', gatewayFilter);
      if (serverSearch.trim()) params.append('search', serverSearch.trim());

      const res = await fetch(getApiUrl(`/api/admin/transactions?${params.toString()}`));
      const data = await res.json();
      if (data?.success && Array.isArray(data?.transactions)) {
        setWithdrawalsList(data.transactions);
        if (data.pagination) {
          setTotalServerItems(data.pagination.total);
        }
        if (data.typeStats?.withdrawal) {
          setStatsData(data.typeStats.withdrawal);
        }
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [serverPage, serverPageSize, statusFilter, gatewayFilter, serverSearch]);

  // Fetch fee config from server
  const fetchFeeConfig = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/withdrawal-fee-config'));
      const data = await res.json();
      if (data?.success && data?.config) {
        setFeeConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load withdrawal fee config:', err);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
    fetchFeeConfig();
  }, [fetchWithdrawals, fetchFeeConfig]);

  const handleSaveFeeConfig = async () => {
    setIsSavingFee(true);
    setFeeSaveSuccess(false);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getApiUrl('/api/admin/withdrawal-fee-config'), {
        method: 'POST',
        headers,
        body: JSON.stringify(feeConfig),
      });
      const data = await res.json();
      if (data?.success) {
        if (data.config) {
          setFeeConfig(data.config);
        }
        setFeeSaveSuccess(true);
        setTimeout(() => setFeeSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save fee config:', err);
    } finally {
      setIsSavingFee(false);
    }
  };

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickApprove = (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    setDispatchTargetTx(tx);
  };

  const handleModalApprove = async () => {
    if (selectedWithdrawal) {
      setDispatchTargetTx(selectedWithdrawal);
      setSelectedWithdrawal(null);
    }
  };

  const handleConfirmDispatch = async (
    txId: string,
    channelId: string,
    gateway: string,
    dispatchReference: string,
    dispatchNotes: string
  ) => {
    setActionLoadingId(txId);
    await onApproveWithdrawal(txId, channelId, gateway, dispatchReference, dispatchNotes);
    await fetchWithdrawals();
    setActionLoadingId(null);
  };

  const handleModalDecline = async (txId: string, reason: string) => {
    await onDeclineWithdrawal(txId, reason);
    await fetchWithdrawals();
  };

  // Simplified fee calculation: only returns exact Rs. amount
  const calculateTestFee = (amt: number) => {
    if (!feeConfig.enabled) return { fee: 0, net: amt, feeDisplay: 'Rs. 0' };
    for (const t of feeConfig.tiers) {
      let match = false;
      if (t.condition === 'lt' && amt < t.threshold) match = true;
      else if (t.condition === 'lte' && amt <= t.threshold) match = true;
      else if (t.condition === 'gt' && amt > t.threshold) match = true;
      else if (t.condition === 'gte' && amt >= t.threshold) match = true;
      else if (t.condition === 'always') match = true;
      if (match) {
        const fee = Math.max(0, Math.round((amt * (t.feePercent / 100)) + (t.flatFee || 0)));
        return { fee, net: Math.max(0, amt - fee), feeDisplay: formatPKR(fee) };
      }
    }
    const fee = Math.max(0, Math.round((amt * (feeConfig.standardPercent / 100)) + (feeConfig.standardFlatFee || 0)));
    return { fee, net: Math.max(0, amt - fee), feeDisplay: formatPKR(fee) };
  };

  // Only consider withdrawal transactions
  const withdrawalTxs = withdrawalsList.filter((tx) => tx.type === 'withdrawal');

  // Gateways
  const standardGateways = ['JazzCash', 'EasyPaisa', 'Raast', 'SadaPay', 'NayaPay', 'Bank_Transfer', 'USDT_TRC20', 'Direct'];
  const dynamicGateways = Array.from(new Set(withdrawalsList.map((w) => w.gateway).filter((g): g is string => Boolean(g))));
  const allGateways = Array.from(new Set([...standardGateways, ...dynamicGateways]));

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Payout Status',
      selectedValue: statusFilter,
      onChange: (val) => {
        setStatusFilter(val as any);
        setServerPage(1);
      },
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending Payout', value: 'pending' },
        { label: 'Settled / Dispatched', value: 'completed' },
        { label: 'Declined & Refunded', value: 'declined' },
      ],
    },
    {
      key: 'gateway',
      label: 'Payout Channel',
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
      header: 'Net Payout & Fee',
      align: 'right',
      render: (tx) => {
        const fee = tx.fee !== undefined ? tx.fee : (tx.amount < 500 ? 0 : Math.round(tx.amount * 0.01));
        const isFree = fee === 0 || tx.amount < 500;
        return (
          <div>
            <div className="font-black text-amber-400 font-mono text-sm">
              {formatPKR(tx.netAmount || (tx.amount - fee))}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500">Req: {formatPKR(tx.amount)}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                isFree ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'
              }`}>
                Fee: {formatPKR(fee)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Requested Time (PKT)',
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
          {tx.status === 'completed' ? 'DISPATCHED' : tx.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (tx) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {tx.status === 'pending' ? (
            <>
              <button
                type="button"
                disabled={actionLoadingId === tx.id}
                onClick={(e) => handleQuickApprove(e, tx)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
                title="Settle & Dispatch Payout"
              >
                {actionLoadingId === tx.id ? (
                  <RotateCcw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(tx)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Review & Options"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedWithdrawal(tx)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Details
            </button>
          )}
        </div>
      ),
    },
  ];

  // Metrics across entire database
  const pendingCount = statsData.pendingCount || withdrawalsList.filter((w) => w.status === 'pending').length;
  const pendingVolume = statsData.pendingVolume || withdrawalsList
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + (w.netAmount || w.amount), 0);
  const totalSettledVolume = statsData.completedVolume || withdrawalsList
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + (w.netAmount || w.amount), 0);
  const totalSubmissions = statsData.totalCount || totalServerItems || withdrawalsList.length;

  const testResult = calculateTestFee(testAmount);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Summary Cards + Dynamic Fee Engine Toggle Button */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pending Payout Queue
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
            {totalSubmissions.toLocaleString()} Transactions
          </p>
        </div>

        {/* Dynamic Fee Configuration Widget */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all hover:border-amber-500/50 ${
            isFeePanelOpen
              ? 'bg-amber-950/30 border-amber-500/50 ring-2 ring-amber-500/20'
              : isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
          onClick={() => setIsFeePanelOpen(!isFeePanelOpen)}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                Withdrawal Fee Setting
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                feeConfig.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {feeConfig.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-xl font-black text-amber-400 tracking-tight mt-1 font-mono">
              {feeConfig.enabled 
                ? `${feeConfig.standardPercent}%${feeConfig.standardFlatFee ? ` + Rs. ${feeConfig.standardFlatFee}` : ''}`
                : 'Rs. 0'}
            </p>
            <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Adjustable by Admin • {feeConfig.tiers.length} Active Rules
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-400 border-t border-slate-800/40 mt-2">
            <span>{isFeePanelOpen ? 'Close Settings ▲' : 'Adjust Fee Rules ▼'}</span>
            <Sliders className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 2. Expandable Dynamic Fee Rule Configuration Panel */}
      {isFeePanelOpen && (
        <div
          className={`p-6 rounded-3xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-amber-500/40 shadow-xl' : 'bg-white border-amber-300 shadow-lg'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Dynamic Withdrawal Processing Fee Rules
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Live Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set dynamic conditions (e.g. amount &lt; 500 PKR → 0% fee). Automatically applies in investor withdrawals and ledger payouts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveFeeConfig}
                disabled={isSavingFee}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors disabled:opacity-50"
              >
                {isSavingFee ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavingFee ? 'Saving...' : 'Save Rules'}</span>
              </button>
              {feeSaveSuccess && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Saved!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            {/* Left: Global Controls */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Engine Settings</h4>
              
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">Fee Engine Status</span>
                  <input
                    type="checkbox"
                    checked={feeConfig.enabled}
                    onChange={(e) => setFeeConfig({ ...feeConfig, enabled: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  When enabled, withdrawal requests evaluate condition tiers to determine exact fee.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Standard Default Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={feeConfig.standardPercent}
                    onChange={(e) => setFeeConfig({ ...feeConfig, standardPercent: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Fallback percentage when no condition tiers match.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">Standard Flat Fee (Rs.)</label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={feeConfig.standardFlatFee || 0}
                    onChange={(e) => setFeeConfig({ ...feeConfig, standardFlatFee: parseInt(e.target.value, 10) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Optional fixed Rs. amount charged per payout.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">Min Withdrawal Limit (PKR)</label>
                  <input
                    type="number"
                    step="50"
                    min="50"
                    value={feeConfig.minWithdrawal}
                    onChange={(e) => setFeeConfig({ ...feeConfig, minWithdrawal: parseInt(e.target.value, 10) || 300 })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Minimum withdrawal threshold (Rs. 300 default).</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">Max Withdrawal Limit (PKR)</label>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={feeConfig.maxWithdrawal || 500000}
                    onChange={(e) => setFeeConfig({ ...feeConfig, maxWithdrawal: parseInt(e.target.value, 10) || 500000 })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maximum single payout limit (Rs. 500,000 default).</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">Max Daily Requests Limit</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="20"
                    value={feeConfig.maxDailyRequests || 3}
                    onChange={(e) => setFeeConfig({ ...feeConfig, maxDailyRequests: parseInt(e.target.value, 10) || 3 })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maximum payout requests per user per day (Default: 3).</p>
                </div>
              </div>

              {/* Interactive Test Simulator */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Fee Simulator</span>
                </h5>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Test Withdrawal Amount (PKR):</label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(parseInt(e.target.value, 10) || 0)}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-amber-300' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="pt-2 border-t border-slate-800/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Fee:</span>
                    <span className={`font-mono font-bold ${testResult.fee === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatPKR(testResult.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1">
                    <span>Net Receivable:</span>
                    <span className="text-emerald-400 font-mono">{formatPKR(testResult.net)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Rule Tiers */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Condition Tiers</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newId = `tier-${Date.now()}`;
                    setFeeConfig({
                      ...feeConfig,
                      tiers: [
                        ...feeConfig.tiers,
                        {
                          id: newId,
                          condition: 'lte',
                          threshold: 5000,
                          feePercent: 2.0,
                          flatFee: 0,
                          label: 'Custom Tier',
                        },
                      ],
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Condition Tier</span>
                </button>
              </div>

              <div className="space-y-3">
                {feeConfig.tiers.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      tier.threshold === 500 && tier.feePercent === 0
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => {
                            const newTiers = [...feeConfig.tiers];
                            newTiers[idx].label = e.target.value;
                            setFeeConfig({ ...feeConfig, tiers: newTiers });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          } max-w-[260px]`}
                        />
                        {tier.threshold === 500 && tier.feePercent === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            User Requirement Match
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newTiers = feeConfig.tiers.filter((_, i) => i !== idx);
                          setFeeConfig({ ...feeConfig, tiers: newTiers });
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Condition</label>
                        <select
                          value={tier.condition}
                          onChange={(e) => {
                            const newTiers = [...feeConfig.tiers];
                            newTiers[idx].condition = e.target.value as any;
                            setFeeConfig({ ...feeConfig, tiers: newTiers });
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="lt">Amount &lt; (Less than)</option>
                          <option value="lte">Amount &le; (Up to)</option>
                          <option value="gt">Amount &gt; (Greater than)</option>
                          <option value="gte">Amount &ge; (At least)</option>
                          <option value="always">Always Apply</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Threshold Amount (PKR)</label>
                        <input
                          type="number"
                          value={tier.threshold}
                          onChange={(e) => {
                            const newTiers = [...feeConfig.tiers];
                            newTiers[idx].threshold = parseInt(e.target.value, 10) || 0;
                            setFeeConfig({ ...feeConfig, tiers: newTiers });
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                            isDark ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Fee Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={tier.feePercent}
                          onChange={(e) => {
                            const newTiers = [...feeConfig.tiers];
                            newTiers[idx].feePercent = parseFloat(e.target.value) || 0;
                            setFeeConfig({ ...feeConfig, tiers: newTiers });
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Flat Extra (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          value={tier.flatFee}
                          onChange={(e) => {
                            const newTiers = [...feeConfig.tiers];
                            newTiers[idx].flatFee = parseInt(e.target.value, 10) || 0;
                            setFeeConfig({ ...feeConfig, tiers: newTiers });
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Data Table */}
      <CrmDataTable<Transaction>
        data={withdrawalsList}
        columns={columns}
        keyExtractor={(w) => w.id}
        title="Withdrawal Payout Dispatch Queue"
        subtitle="Process payouts to JazzCash, EasyPaisa, and Pakistani 1Link Bank Accounts"
        icon={<ArrowUpRight className="w-5 h-5" />}
        headerRightAction={
          <button
            type="button"
            onClick={() => setIsFeePanelOpen(!isFeePanelOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isFeePanelOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Processing Fee</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono">
              {feeConfig.enabled
                ? `${feeConfig.standardPercent}%${feeConfig.standardFlatFee ? ` + Rs. ${feeConfig.standardFlatFee}` : ''}`
                : 'Disabled'}
            </span>
          </button>
        }
        searchPlaceholder="Search by account title, account number, investor name, or Ref ID..."
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
        onRowClick={(w) => setSelectedWithdrawal(w)}
        emptyMessage="No withdrawal payout records found"
        emptySubtext="When investors request payouts to JazzCash or Bank, they appear here."
      />

      {/* 4. Entity Detail Modal */}
      {selectedWithdrawal && (
        <WithdrawalDetailModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onApprove={handleModalApprove}
          onDecline={handleModalDecline}
        />
      )}

      {/* 5. Channel-linked Dispatch Payout Modal */}
      {dispatchTargetTx && (
        <DispatchPayoutModal
          withdrawal={dispatchTargetTx}
          onClose={() => setDispatchTargetTx(null)}
          onConfirmDispatch={handleConfirmDispatch}
        />
      )}
    </div>
  );
};
