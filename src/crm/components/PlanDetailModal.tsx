import React from 'react';
import { InvestmentPlan } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  Package,
  X,
  Clock,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck,
  Zap,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface PlanDetailModalProps {
  plan: InvestmentPlan | null;
  onClose: () => void;
  onEdit?: (plan: InvestmentPlan) => void;
  onDelete?: (planId: string) => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  plan,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl my-8 overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-md"
              style={{ backgroundColor: plan.accentColor || '#10b981' }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">{plan.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                  {plan.category}
                </span>
                {plan.popular && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    Featured
                  </span>
                )}
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Plan ID: {plan.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Financial KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Capital Amount
              </span>
              <p className="text-lg font-black text-emerald-400 tracking-tight mt-1">
                {formatPKR(plan.fixedAmount || plan.minAmount)}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Daily ROI Rate
              </span>
              <p className="text-lg font-black text-amber-400 tracking-tight mt-1">
                {plan.dailyProfitPercent}% / day
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatPKR(plan.dailyProfitAmount || (plan.minAmount * plan.dailyProfitPercent) / 100)} / day
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Tenure Duration
              </span>
              <p className="text-lg font-black text-indigo-400 tracking-tight mt-1">
                {plan.durationDays} Days
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Payout: {plan.payoutFrequency || 'Daily'}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Total Net Return
              </span>
              <p className="text-lg font-black text-purple-400 tracking-tight mt-1">
                {formatPKR(plan.totalReturnAmount || (plan.minAmount * (100 + plan.totalRoiPercent)) / 100)}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.totalRoiPercent}% ROI Yield
              </p>
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Package Overview & Sector Backing
              </h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {plan.description}
              </p>
            </div>
          )}

          {/* Highlights & Features */}
          {plan.highlights && plan.highlights.length > 0 && (
            <div
              className={`p-4 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Package Investor Highlights</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capital Return Policy */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">Capital Refund Guarantee: </strong>
              <span>{plan.capitalReturnPolicy || '100% Capital returned to investor wallet upon plan completion'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-5 border-t flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Close Details
          </button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(plan);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Parameters</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(plan.id);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
