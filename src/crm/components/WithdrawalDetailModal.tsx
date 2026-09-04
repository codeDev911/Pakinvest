import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import {
  ArrowUpRight,
  X,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Building2,
  Clock,
  ShieldCheck,
  Users,
  Coins,
  AlertTriangle,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface WithdrawalDetailModalProps {
  withdrawal: Transaction | null;
  onClose: () => void;
  onApprove: (txId: string) => Promise<void>;
  onDecline: (txId: string, reason: string) => Promise<void>;
}

export const WithdrawalDetailModal: React.FC<WithdrawalDetailModalProps> = ({
  withdrawal,
  onClose,
  onApprove,
  onDecline,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!withdrawal) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmApprove = async () => {
    setIsProcessing(true);
    await onApprove(withdrawal.id);
    setIsProcessing(false);
    onClose();
  };

  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReason.trim()) return;
    setIsProcessing(true);
    await onDecline(withdrawal.id, declineReason);
    setIsProcessing(false);
    onClose();
  };

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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Withdrawal Payout Detail</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    withdrawal.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : withdrawal.status === 'pending'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {withdrawal.status.toUpperCase()}
                </span>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ref ID: {withdrawal.id}
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
          {/* Main Highlights Card */}
          <div
            className={`p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Dispatched Payout (Net)
              </span>
              <p className="text-2xl font-black text-amber-500 tracking-tight mt-0.5">
                {formatPKR(withdrawal.netAmount || withdrawal.amount)}
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Requested: {formatPKR(withdrawal.amount)} • Fee: {formatPKR(withdrawal.fee || 0)}
              </p>
            </div>

            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Destination Gateway
              </span>
              <p className="text-sm font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>{withdrawal.gateway || 'Direct Wallet'}</span>
              </p>
            </div>

            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Request Timestamp (PKT)
              </span>
              <p className={`text-xs font-mono font-semibold mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {formatPakistanDateTime(withdrawal.timestamp || withdrawal.createdAt)}
              </p>
            </div>
          </div>

          {/* Beneficiary Account Card */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
              <CreditCard className="w-4 h-4" />
              <span>Investor Payout Destination Account</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Account Title:</span>
                <p className="text-sm font-bold text-white mt-0.5 truncate">
                  {withdrawal.accountTitle || withdrawal.userName || 'Investor'}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Account Number / IBAN:</span>
                  {withdrawal.accountNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(withdrawal.accountNumber || '', 'acc')}
                      className="text-amber-500 hover:text-amber-400 flex items-center gap-1 text-[11px] font-bold"
                    >
                      {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'acc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <p className="text-sm font-black font-mono text-amber-300 mt-0.5 truncate">
                  {withdrawal.accountNumber || withdrawal.userPhone || '—'}
                </p>
              </div>

              {withdrawal.bankName && (
                <div className={`p-3 rounded-xl border sm:col-span-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Bank / Institution:</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{withdrawal.bankName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Investor Profile */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
              <Users className="w-4 h-4" />
              <span>Investor Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Name:</span>
                <p className="font-bold text-white mt-0.5">{withdrawal.userName || 'Investor'}</p>
              </div>
              <div>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Registered Phone:</span>
                <p className="font-mono font-semibold text-slate-300 mt-0.5">{withdrawal.userPhone || '—'}</p>
              </div>
              <div>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Reference Code:</span>
                <p className="font-mono text-slate-400 mt-0.5">{withdrawal.referenceCode || withdrawal.id}</p>
              </div>
            </div>
          </div>

          {/* Audit Notes */}
          {withdrawal.notes && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <strong className="text-slate-400 mr-1.5">Settlement Record:</strong>
              {withdrawal.notes}
            </div>
          )}

          {/* Decline Form */}
          {isDeclining && (
            <form onSubmit={handleConfirmDecline} className="space-y-3 p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Reason for Declining Withdrawal (Funds will auto-refund to user wallet):</span>
              </div>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Account number title mismatch with JazzCash/EasyPaisa, Bank account blocked..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-rose-900/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeclining(false)}
                  className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40"
                >
                  {isProcessing ? 'Processing Refund...' : 'Decline & Auto-Refund to Wallet'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors w-full sm:w-auto ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Close Details
          </button>

          {withdrawal.status === 'pending' && !isDeclining && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsDeclining(true)}
                className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Decline & Refund</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isProcessing}
                className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Dispatching...' : 'Mark Dispatched & Settled'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
