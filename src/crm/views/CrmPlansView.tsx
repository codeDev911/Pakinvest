import React, { useState } from 'react';
import { InvestmentPlan } from '../../types';
import { formatPKR } from '../../utils/formatters';
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
  Sun,
  Truck,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface CrmPlansViewProps {
  plans: InvestmentPlan[];
  onSavePlan: (plan: InvestmentPlan) => Promise<boolean>;
  onDeletePlan: (planId: string) => Promise<boolean>;
}

export const CrmPlansView: React.FC<CrmPlansViewProps> = ({
  plans,
  onSavePlan,
  onDeletePlan,
}) => {
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

  const handleOpenCreate = () => {
    setIsEditing(false);
    const newId = `plan_${Date.now()}`;
    setEditingPlan({
      id: newId,
      name: '',
      category: 'Starter',
      badge: 'Verified Package',
      minAmount: 3000,
      maxAmount: 3000,
      fixedAmount: 3000,
      dailyProfitPercent: 6.0,
      dailyProfitAmount: 180,
      durationDays: 30,
      totalRoiPercent: 180,
      totalReturnAmount: 8400,
      payoutFrequency: 'daily',
      capitalReturnPolicy: 'Capital returned on maturity',
      description: 'Investment package delivering daily cash dividends.',
      highlights: ['Daily profit credited every 24h', '0% withdrawal fee', 'Principal returned on expiry'],
      popular: false,
      accentColor: '#10b981',
    });
    setHighlightsInput('Daily profit credited every 24h\n0% withdrawal fee\nPrincipal returned on expiry');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: InvestmentPlan) => {
    setIsEditing(true);
    setEditingPlan({ ...plan });
    setHighlightsInput(plan.highlights.join('\n'));
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan.name || !editingPlan.minAmount || !editingPlan.dailyProfitPercent) {
      alert('Please fill in package name, investment amount, and daily ROI %.');
      return;
    }

    const hlArray = highlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const minAmt = Number(editingPlan.minAmount) || 1000;
    const dailyPct = Number(editingPlan.dailyProfitPercent) || 5;
    const durDays = Number(editingPlan.durationDays) || 30;
    const dailyProfit = (minAmt * dailyPct) / 100;
    const totalRoi = dailyPct * durDays;
    const totalReturn = dailyProfit * durDays + minAmt;

    const fullPlan: InvestmentPlan = {
      id: editingPlan.id || `plan_${Date.now()}`,
      name: editingPlan.name,
      category: editingPlan.category || 'Starter',
      icon: editingPlan.icon || 'ShieldCheck',
      badge: editingPlan.badge || '',
      minAmount: minAmt,
      maxAmount: Number(editingPlan.maxAmount) || minAmt,
      fixedAmount: minAmt,
      dailyProfitPercent: dailyPct,
      dailyProfitAmount: dailyProfit,
      durationDays: durDays,
      totalRoiPercent: totalRoi,
      totalReturnAmount: totalReturn,
      payoutFrequency: editingPlan.payoutFrequency || 'daily',
      capitalReturnPolicy: editingPlan.capitalReturnPolicy || 'Capital returned on maturity',
      description: editingPlan.description || '',
      highlights: hlArray.length > 0 ? hlArray : ['Guaranteed daily return', 'Instant withdrawals'],
      popular: Boolean(editingPlan.popular),
      accentColor: editingPlan.accentColor || '#10b981',
    };

    setIsSaving(true);
    const success = await onSavePlan(fullPlan);
    setIsSaving(false);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (planId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the plan "${name}"?`)) {
      await onDeletePlan(planId);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Investment Plans & Yield Rate Administration</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create, update daily profit % and manage investment packages in real time
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all relative overflow-hidden"
          >
            {/* Accent Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: plan.accentColor || '#10b981' }}
            />

            <div className="space-y-3 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {plan.category}
                  </span>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                </div>
                {plan.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Price & Daily Profit Metrics */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Investment:</span>
                  <p className="text-sm font-black text-white">{formatPKR(plan.fixedAmount || plan.minAmount)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Daily Return:</span>
                  <p className="text-sm font-black text-emerald-400">
                    +{plan.dailyProfitPercent}% ({formatPKR(plan.dailyProfitAmount)}/d)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Duration:</span>
                  <p className="text-xs font-bold text-slate-300">{plan.durationDays} Days</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Total Return:</span>
                  <p className="text-xs font-bold text-indigo-400">{formatPKR(plan.totalReturnAmount)}</p>
                </div>
              </div>

              {/* Highlights */}
              <ul className="space-y-1 text-xs text-slate-300">
                {plan.highlights.slice(0, 3).map((h, i) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleOpenEdit(plan)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Plan</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(plan.id, plan.name)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Package className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {isEditing ? `Edit Plan: ${editingPlan.name}` : 'Create New Investment Package'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Package Name</label>
                  <input
                    type="text"
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="e.g. Solar Energy Commercial Grid"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={editingPlan.category || 'Starter'}
                    onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Starter">Starter Package</option>
                    <option value="Solar Energy">Solar Energy</option>
                    <option value="Agro Yield">Agro Yield</option>
                    <option value="CPEC Logistics">CPEC Logistics</option>
                    <option value="Real Estate">Commercial Real Estate</option>
                    <option value="VIP Bluechip">VIP Bluechip Institutional</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Investment Capital (Rs.)</label>
                  <input
                    type="number"
                    value={editingPlan.minAmount || 1500}
                    onChange={(e) => setEditingPlan({ ...editingPlan, minAmount: Number(e.target.value), fixedAmount: Number(e.target.value), maxAmount: Number(e.target.value) })}
                    placeholder="5000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Daily Profit ROI (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPlan.dailyProfitPercent || 5}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dailyProfitPercent: Number(e.target.value) })}
                    placeholder="6.0"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Duration (Days)</label>
                  <input
                    type="number"
                    value={editingPlan.durationDays || 30}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })}
                    placeholder="30"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={editingPlan.badge || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                    placeholder="e.g. Ramadan Special VIP"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Highlights (One per line)</label>
                <textarea
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder="Rs. 300 credited daily&#10;Clean solar asset backing&#10;Instant JazzCash withdrawal"
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Package Description</label>
                <textarea
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  placeholder="Brief description of the underlying asset..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPlan.popular)}
                    onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-300 font-semibold">Mark as "Popular Package"</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950/40"
                >
                  {isSaving ? 'Saving Package...' : isEditing ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
