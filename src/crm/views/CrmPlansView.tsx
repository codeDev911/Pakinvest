import React, { useState, useEffect, useCallback } from 'react';
import { InvestmentPlan } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Coins,
  ShieldCheck,
  Zap,
  LayoutGrid,
  List,
  RotateCcw,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { PlanDetailModal } from '../components/PlanDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmPlansViewProps {
  plans?: InvestmentPlan[];
  onSavePlan: (plan: InvestmentPlan) => Promise<boolean>;
  onDeletePlan: (planId: string) => Promise<boolean>;
}

export const CrmPlansView: React.FC<CrmPlansViewProps> = ({
  plans: propPlans,
  onSavePlan,
  onDeletePlan,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [plansList, setPlansList] = useState<InvestmentPlan[]>(propPlans || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Independent fetch on mount
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/plans'));
      const data = await res.json();
      if (data?.success && Array.isArray(data?.plans)) {
        setPlansList(data.plans);
      }
    } catch (err) {
      console.error('Failed to fetch investment plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Modal Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<InvestmentPlan>>({
    id: '',
    name: '',
    category: 'Starter',
    badge: 'Popular Tier',
    minAmount: 1500,
    maxAmount: 1500,
    fixedAmount: 1500,
    dailyProfitPercent: 5.0,
    dailyProfitAmount: 75,
    durationDays: 30,
    totalRoiPercent: 150,
    totalReturnAmount: 3750,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'High-yield commercial asset backed investment package.',
    highlights: ['Earn guaranteed profit daily', 'Fast 24/7 JazzCash withdrawal', 'Instant activation'],
    popular: false,
    accentColor: '#10b981',
  });
  const [highlightsInput, setHighlightsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categories: string[] = Array.from(new Set(plansList.map((p) => p.category).filter((c): c is NonNullable<typeof c> => Boolean(c))));

  const filteredPlans = plansList.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  });

  const filterGroups: FilterGroup[] = categories.length > 0
    ? [
        {
          key: 'category',
          label: 'Category',
          selectedValue: categoryFilter,
          onChange: setCategoryFilter,
          options: [
            { label: 'All Categories', value: 'all' },
            ...categories.map((c: string) => ({ label: c, value: c })),
          ],
        },
      ]
    : [];

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingPlan({
      id: `plan-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Starter',
      badge: 'Popular Tier',
      minAmount: 2000,
      maxAmount: 2000,
      fixedAmount: 2000,
      dailyProfitPercent: 5.0,
      dailyProfitAmount: 100,
      durationDays: 30,
      totalRoiPercent: 150,
      totalReturnAmount: 5000,
      payoutFrequency: 'daily',
      capitalReturnPolicy: 'Capital returned on maturity',
      description: 'Reliable Pakistani daily dividend yield investment package.',
      highlights: ['Guaranteed daily profit credit', '100% principal returned', 'Instant withdrawal'],
      popular: false,
      accentColor: '#10b981',
    });
    setHighlightsInput('Guaranteed daily profit credit\n100% principal returned\nInstant withdrawal');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: InvestmentPlan) => {
    setIsEditing(true);
    setEditingPlan({ ...plan });
    setHighlightsInput((plan.highlights || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan.name || !editingPlan.fixedAmount) return;

    setIsSaving(true);
    const amount = Number(editingPlan.fixedAmount || editingPlan.minAmount || 1000);
    const dailyRate = Number(editingPlan.dailyProfitPercent || 5.0);
    const duration = Number(editingPlan.durationDays || 30);
    const dailyAmount = Math.round((amount * dailyRate) / 100);
    const totalProfit = dailyAmount * duration;
    const totalReturn = amount + totalProfit;
    const totalRoi = Math.round((totalProfit / amount) * 100);

    const highlightsList = highlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const completePlan: InvestmentPlan = {
      id: editingPlan.id || `plan-${Date.now().toString().slice(-4)}`,
      name: editingPlan.name,
      category: (editingPlan.category as any) || 'Starter',
      icon: editingPlan.icon || 'TrendingUp',
      badge: editingPlan.badge || '',
      minAmount: amount,
      maxAmount: amount,
      fixedAmount: amount,
      dailyProfitPercent: dailyRate,
      dailyProfitAmount: dailyAmount,
      durationDays: duration,
      totalRoiPercent: totalRoi,
      totalReturnAmount: totalReturn,
      payoutFrequency: 'daily',
      capitalReturnPolicy: editingPlan.capitalReturnPolicy || 'Capital returned on maturity',
      description: editingPlan.description || '',
      highlights: highlightsList.length > 0 ? highlightsList : ['Guaranteed daily payout'],
      popular: !!editingPlan.popular,
      accentColor: editingPlan.accentColor || '#10b981',
    };

    const success = await onSavePlan(completePlan);
    setIsSaving(false);
    if (success) {
      setIsModalOpen(false);
      await fetchPlans();
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const success = await onDeletePlan(planId);
    if (success) {
      await fetchPlans();
    }
  };

  const columns: Column<InvestmentPlan>[] = [
    {
      key: 'name',
      header: 'Package Name',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
            style={{ backgroundColor: p.accentColor || '#10b981' }}
          >
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{p.name}</span>
              {p.popular && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                  Featured
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              {p.category} • ID: {p.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'fixedAmount',
      header: 'Fixed Capital',
      align: 'right',
      render: (p) => (
        <div className="font-black text-emerald-400 font-mono text-sm">
          {formatPKR(p.fixedAmount || p.minAmount)}
        </div>
      ),
    },
    {
      key: 'dailyProfitPercent',
      header: 'Daily Profit ROI',
      align: 'right',
      render: (p) => (
        <div>
          <div className="font-bold text-amber-400 text-xs">
            +{formatPKR(p.dailyProfitAmount || ((p.fixedAmount || p.minAmount) * p.dailyProfitPercent) / 100)} / day
          </div>
          <div className="text-[10px] text-slate-500">{p.dailyProfitPercent}% daily</div>
        </div>
      ),
    },
    {
      key: 'durationDays',
      header: 'Tenure',
      align: 'center',
      render: (p) => (
        <span className="font-bold text-slate-200 text-xs">
          {p.durationDays} Days
        </span>
      ),
    },
    {
      key: 'totalReturnAmount',
      header: 'Total Expected Return',
      align: 'right',
      render: (p) => (
        <div>
          <div className="font-black text-purple-400 font-mono text-xs">
            {formatPKR(p.totalReturnAmount || (p.minAmount * (100 + p.totalRoiPercent)) / 100)}
          </div>
          <div className="text-[10px] text-slate-500">{p.totalRoiPercent}% Total ROI</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      sortable: false,
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit Package"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePlan(p.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Delete Package"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Create Plan and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Investment Packages Catalog</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure ROI rates, fixed capital tiers, tenure duration and investor highlights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <CrmDataTable<InvestmentPlan>
          data={filteredPlans}
          columns={columns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search by package name, category, or ID..."
          searchFields={[(p) => p.name, (p) => p.category, (p) => p.id, (p) => p.description]}
          filterGroups={filterGroups}
          initialPageSize={10}
          onRowClick={(p) => setSelectedPlan(p)}
          emptyMessage="No investment packages found"
          emptySubtext="Create a package using the 'Add Package' button above."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p)}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md"
                    style={{ backgroundColor: p.accentColor || '#10b981' }}
                  >
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <p className="text-[10px] text-slate-400">{p.category}</p>
                  </div>
                </div>
                {p.popular && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    Featured
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Capital</span>
                  <p className="font-black text-emerald-400 font-mono text-sm">{formatPKR(p.fixedAmount || p.minAmount)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Daily Return</span>
                  <p className="font-bold text-amber-400">{p.dailyProfitPercent}% / day</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Tenure</span>
                  <p className="font-bold text-indigo-400">{p.durationDays} Days</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Return</span>
                  <p className="font-bold text-purple-400 font-mono">{formatPKR(p.totalReturnAmount || 0)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">
                  Click to inspect details →
                </span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Entity Detail Modal */}
      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onEdit={(p) => handleOpenEdit(p)}
          onDelete={(id) => handleDeletePlan(id)}
        />
      )}

      {/* 4. Create / Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>{isEditing ? 'Edit Investment Package' : 'Create New Investment Package'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Package Name</label>
                  <input
                    type="text"
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="e.g. Bluechip Gold Spark"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <input
                    type="text"
                    value={editingPlan.category || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value as any })}
                    placeholder="e.g. Solar Energy, Agro Yield..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Fixed Capital (PKR)</label>
                  <input
                    type="number"
                    min="500"
                    value={editingPlan.fixedAmount || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, fixedAmount: Number(e.target.value) })}
                    placeholder="e.g. 5000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Daily Return (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editingPlan.dailyProfitPercent || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyProfitPercent: Number(e.target.value) })}
                    placeholder="e.g. 6.0"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingPlan.durationDays || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                    placeholder="e.g. 30"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Accent Color</label>
                  <input
                    type="color"
                    value={editingPlan.accentColor || '#10b981'}
                    onChange={(e) => setEditingPlan({ ...editingPlan, accentColor: e.target.value })}
                    className="w-full h-10 p-1 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Package Description</label>
                <textarea
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  placeholder="Overview of business backing and yield generation..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Bullet Highlights (1 per line)</label>
                <textarea
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder="Guaranteed daily return&#10;Fast JazzCash withdrawal&#10;Principal refund"
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={!!editingPlan.popular}
                  onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <label htmlFor="popularCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Mark as Featured / Popular Package
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  {isSaving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
