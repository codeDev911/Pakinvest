import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  ArrowDownLeft,
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
  Lock,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface DepositDetailModalProps {
  deposit: Transaction | null;
  onClose: () => void;
  onApprove: (txId: string) => Promise<void>;
  onDecline: (txId: string, reason: string) => Promise<void>;
}

export const DepositDetailModal: React.FC<DepositDetailModalProps> = ({
  deposit,
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

  if (!deposit) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmApprove = async () => {
    setIsProcessing(true);
    await onApprove(deposit.id);
    setIsProcessing(false);
    onClose();
  };

  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReason.trim()) return;
    setIsProcessing(true);
    await onDecline(deposit.id, declineReason);
    setIsProcessing(false);
    onClose();
  };

  // Commission preview calculation
  const t1Comm = Math.round(deposit.amount * 0.1);
  const t2Comm = Math.round(deposit.amount * 0.04);
  const t3Comm = Math.round(deposit.amount * 0.01);
  const totalComm = t1Comm + t2Comm + t3Comm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl my-8 overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Deposit Transaction Detail</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    deposit.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : deposit.status === 'pending'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {deposit.status.toUpperCase()}
                </span>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ref ID: {deposit.id}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Deposit Highlights Card */}
          <div
            className={`p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Deposit Amount
              </span>
              <p className="text-2xl font-black text-emerald-500 tracking-tight mt-0.5">
                {formatPKR(deposit.amount)}
              </p>
            </div>

            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Payment Gateway
              </span>
              <p className="text-sm font-bold text-amber-500 mt-1 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>{deposit.gateway || 'Direct'}</span>
              </p>
            </div>

            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Submission Timestamp
              </span>
              <p className={`text-xs font-mono font-semibold mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {deposit.timestamp}
              </p>
            </div>
          </div>

          {/* Verification TID Box */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Official Gateway Transaction ID (TID Proof):</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(deposit.referenceCode, 'tid')}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-500"
              >
                {copiedKey === 'tid' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy TID</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-lg font-black font-mono tracking-wider text-amber-400">
              {deposit.referenceCode || 'NO-REF-PROVIDED'}
            </p>
          </div>

          {/* Investor Details & Origin Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Investor Box */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
                <Users className="w-4 h-4" />
                <span>Investor Profile</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Name:</span>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{deposit.userName || 'Investor'}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Phone:</span>
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{deposit.userPhone || '—'}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>User ID:</span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{deposit.userId || '—'}</span>
                </div>
              </div>
            </div>

            {/* Sender / Receiving Account */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-blue-500">
                <CreditCard className="w-4 h-4" />
                <span>Sender / Channel Info</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Sender Title:</span>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    {deposit.senderTitle || deposit.accountTitle || 'Direct Transfer'}
                  </strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Sender Account:</span>
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {deposit.senderPhone || deposit.accountNumber || '—'}
                  </strong>
                </div>
                {deposit.bankName && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Bank:</span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{deposit.bankName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3-Tier Multi-Level Commission Distribution Preview */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                <Coins className="w-4 h-4" />
                <span>Automated 3-Tier Referral Payout Breakdown</span>
              </h4>
              <span className="text-xs font-bold text-purple-400">
                Total Team Pool: {formatPKR(totalComm)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between text-[11px] font-bold text-purple-400">
                  <span>Tier 1 Direct (10%)</span>
                  <span>+{formatPKR(t1Comm)}</span>
                </div>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Credited to direct sponsor wallet instantly upon approval.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between text-[11px] font-bold text-purple-400">
                  <span>Tier 2 Secondary (4%)</span>
                  <span>+{formatPKR(t2Comm)}</span>
                </div>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Distributed to Level 2 team leader.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between text-[11px] font-bold text-purple-400">
                  <span>Tier 3 Network (1%)</span>
                  <span>+{formatPKR(t3Comm)}</span>
                </div>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Distributed to Level 3 network leader.
                </p>
              </div>
            </div>
          </div>

          {/* Audit Notes if any */}
          {deposit.notes && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <strong className="text-slate-400 mr-1.5">Audit Note:</strong>
              {deposit.notes}
            </div>
          )}

          {/* Decline Form (when user clicks decline) */}
          {isDeclining && (
            <form onSubmit={handleConfirmDecline} className="space-y-3 p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Reason for Declining Deposit:</span>
              </div>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. TID not found in JazzCash portal, Amount mismatch, Duplicate proof submitted..."
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
                  {isProcessing ? 'Declining...' : 'Confirm Decline Deposit'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
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

          {deposit.status === 'pending' && !isDeclining && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsDeclining(true)}
                className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Decline Proof</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isProcessing}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Approving...' : 'Approve & Credit Wallet'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
