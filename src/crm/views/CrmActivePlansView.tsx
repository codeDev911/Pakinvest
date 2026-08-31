import React, { useState } from 'react';
import { ActiveInvestment } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Coins,
  ShieldCheck,
  Zap,
  Eye,
  Filter,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { ActivePlanDetailModal } from '../components/ActivePlanDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmActivePlansViewProps {
  activeInvestments: ActiveInvestment[];
  onCancelInvestment?: (invId: string, reason: string, refundPrincipal: boolean) => Promise<boolean>;
}

export const CrmActivePlansView: React.FC<CrmActivePlansViewProps> = ({
  activeInvestments,
  onCancelInvestment,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [selectedInvestment, setSelectedInvestment] = useState<ActiveInvestment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter data
  const filteredInvestments = activeInvestments.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && inv.planCategory !== categoryFilter) return false;
    return true;
  });

  const categories: string[] = Array.from(new Set(activeInvestments.map((i) => i.planCategory).filter((c): c is string => Boolean(c))));

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Status',
      selectedValue: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Running Active', value: 'active' },
        { label: 'Completed / Matured', value: 'completed' },
      ],
    },
    ...(categories.length > 0
      ? [
          {
            key: 'category',
            label: 'Category',
            selectedValue: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'all' },
              ...categories.map((cat: string) => ({ label: cat, value: cat })),
            ],
          },
        ]
      : []),
  ];

  const columns: Column<ActiveInvestment>[] = [
    {
      key: 'planName',
      header: 'Investment Package',
      render: (inv) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
            style={{ backgroundColor: inv.accentColor || '#10b981' }}
          >
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight">{inv.planName}</div>
            <div className="text-[10px] text-slate-400">
              {inv.planCategory} • {inv.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'Investor Account',
      render: (inv) => (
        <div>
          <div className="font-semibold text-slate-200">{inv.userName || 'Investor'}</div>
          <div className="font-mono text-[10px] text-slate-400">{inv.userPhone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'investedAmount',
      header: 'Invested Capital',
      align: 'right',
      render: (inv) => (
        <div className="font-black text-emerald-400 font-mono text-sm">
          {formatPKR(inv.investedAmount)}
        </div>
      ),
    },
    {
      key: 'dailyProfitAmount',
      header: 'Daily Dividend',
      align: 'right',
      render: (inv) => (
        <div>
          <div className="font-bold text-amber-400 text-xs">+{formatPKR(inv.dailyProfitAmount)}</div>
          <div className="text-[10px] text-slate-500">{inv.dailyProfitPercent}% ROI / day</div>
        </div>
      ),
    },
    {
      key: 'earnedSoFar',
      header: 'Accumulated Earned',
      align: 'right',
      render: (inv) => (
        <div>
          <div className="font-bold text-indigo-400 text-xs">{formatPKR(inv.earnedSoFar)}</div>
          <div className="text-[10px] text-slate-500">Max: {formatPKR(inv.totalExpectedReturn)}</div>
        </div>
      ),
    },
    {
      key: 'daysRemaining',
      header: 'Timeline & Maturity',
      render: (inv) => {
        const progress = Math.min(
          100,
          Math.round(((inv.durationDays - inv.daysRemaining) / inv.durationDays) * 100)
        );
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-300">
              <span>{inv.daysRemaining} days left</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (inv) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            inv.status === 'active'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {inv.status.toUpperCase()}
        </span>
      ),
    },
  ];

  // Summary Metrics
  const totalActiveCapital = activeInvestments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.investedAmount, 0);
  const totalDailyCommittedProfit = activeInvestments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.dailyProfitAmount, 0);

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
            Total Active Subscriptions
          </span>
          <p className="text-2xl font-black text-emerald-500 tracking-tight mt-1">
            {activeInvestments.filter((i) => i.status === 'active').length} Contracts
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Locked Active Capital
          </span>
          <p className="text-2xl font-black text-indigo-400 tracking-tight mt-1">
            {formatPKR(totalActiveCapital)}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Daily Dividend Obligations
          </span>
          <p className="text-2xl font-black text-amber-400 tracking-tight mt-1">
            {formatPKR(totalDailyCommittedProfit)} / day
          </p>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <CrmDataTable<ActiveInvestment>
        data={filteredInvestments}
        columns={columns}
        keyExtractor={(inv) => inv.id}
        title="Live Investor Package Contracts"
        subtitle="Paginated ledger of all active and matured capital contracts"
        icon={<Package className="w-5 h-5" />}
        searchPlaceholder="Search by package name, investor name, phone, or contract ID..."
        searchFields={[
          (i) => i.planName,
          (i) => i.userName,
          (i) => i.userPhone,
          (i) => i.id,
          (i) => i.planCategory,
        ]}
        filterGroups={filterGroups}
        initialPageSize={10}
        onRowClick={(inv) => setSelectedInvestment(inv)}
        emptyMessage="No active investment contracts found"
        emptySubtext="When investors activate packages from the catalog, they appear here."
      />

      {/* 3. Detail Modal */}
      {selectedInvestment && (
        <ActivePlanDetailModal
          investment={selectedInvestment}
          onClose={() => setSelectedInvestment(null)}
          onCancelInvestment={onCancelInvestment}
        />
      )}
    </div>
  );
};
