import React, { useState } from 'react';
import { ActiveInvestment } from '../../types';
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
  Users,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface ActivePlanDetailModalProps {
  investment: ActiveInvestment | null;
  onClose: () => void;
  onCancelInvestment?: (invId: string, reason: string, refundPrincipal: boolean) => Promise<boolean>;
}

export const ActivePlanDetailModal: React.FC<ActivePlanDetailModalProps> = ({
  investment,
  onClose,
  onCancelInvestment,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [isTerminating, setIsTerminating] = useState(false);
  const [termReason, setTermReason] = useState('');
  const [refundPrincipal, setRefundPrincipal] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!investment) return null;

  const handleConfirmTerminate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCancelInvestment) return;
    setIsProcessing(true);
    const ok = await onCancelInvestment(investment.id, termReason, refundPrincipal);
    setIsProcessing(false);
    if (ok) onClose();
  };

  const progressPercent = Math.min(
    100,
    Math.round(((investment.durationDays - investment.daysRemaining) / investment.durationDays) * 100)
  );

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
              style={{ backgroundColor: investment.accentColor || '#10b981' }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">{investment.planName}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    investment.status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {investment.status.toUpperCase()}
                </span>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Contract ID: {investment.id}
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
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Invested Capital
              </span>
              <p className="text-lg font-black text-emerald-400 tracking-tight mt-1">
                {formatPKR(investment.investedAmount)}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Daily Dividend
              </span>
              <p className="text-lg font-black text-amber-400 tracking-tight mt-1">
                +{formatPKR(investment.dailyProfitAmount)}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {investment.dailyProfitPercent}% daily rate
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Earned So Far
              </span>
              <p className="text-lg font-black text-indigo-400 tracking-tight mt-1">
                {formatPKR(investment.earnedSoFar)}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Max: {formatPKR(investment.totalExpectedReturn)}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Days Remaining
              </span>
              <p className="text-lg font-black text-cyan-400 tracking-tight mt-1">
                {investment.daysRemaining} / {investment.durationDays}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {progressPercent}% completed
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Maturity Timeline Progress
              </span>
              <span className="font-bold text-emerald-400">{progressPercent}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Investor Info & Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <Users className="w-4 h-4" />
                <span>Investor Details</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Name:</span>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{investment.userName || 'Investor'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Phone:</span>
                  <span className="font-mono font-bold">{investment.userPhone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>User ID:</span>
                  <span className="font-mono">{investment.userId || '—'}</span>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Schedule & Payouts</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Start Date:</span>
                  <span>{investment.startDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Maturity Date:</span>
                  <span>{investment.endDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Next 24h Payout:</span>
                  <span className="font-bold text-amber-400">{investment.nextPayoutTime || 'Daily at 02:30 PM'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terminate early form */}
          {isTerminating && (
            <form onSubmit={handleConfirmTerminate} className="space-y-3 p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Conclude / Terminate Active Investment Early:</span>
              </div>
              <textarea
                value={termReason}
                onChange={(e) => setTermReason(e.target.value)}
                placeholder="Reason for early contract closure (e.g. Investor requested closure, Compliance check)..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-rose-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="refundCheck"
                  checked={refundPrincipal}
                  onChange={(e) => setRefundPrincipal(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <label htmlFor="refundCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Refund initial principal ({formatPKR(investment.investedAmount)}) back to investor's wallet
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTerminating(false)}
                  className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40"
                >
                  {isProcessing ? 'Terminating...' : 'Confirm Closure'}
                </button>
              </div>
            </form>
          )}
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

          {investment.status === 'active' && !isTerminating && onCancelInvestment && (
            <button
              type="button"
              onClick={() => setIsTerminating(true)}
              className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Conclude Investment Early</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
