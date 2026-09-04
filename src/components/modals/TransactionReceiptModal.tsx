import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Download,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building2,
  Coins,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TransactionReceiptModal: React.FC = () => {
  const { selectedTransactionReceipt, setSelectedTransactionReceipt, showToast } = useApp();
  const [copied, setCopied] = useState<boolean>(false);

  if (!selectedTransactionReceipt) return null;

  const tx = selectedTransactionReceipt;

  const handleCopyTxId = () => {
    navigator.clipboard.writeText(tx.referenceCode || tx.id);
    setCopied(true);
    showToast('Copied', 'Transaction Reference copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (tx.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {tx.status}
          </span>
        );
    }
  };

  const getTypeLabel = () => {
    switch (tx.type) {
      case 'deposit':
        return 'Deposit Confirmed';
      case 'withdrawal':
        return 'Withdrawal Dispatched';
      case 'daily_profit':
        return 'Daily Profit Accrued';
      case 'referral_bonus':
        return 'Referral Commission';
      case 'plan_investment':
        return 'Investment Plan Activated';
      case 'streak_reward':
        return 'Daily Streak Bonus';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTransactionReceipt(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Down to Up Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Mobile Handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                Official Transaction Receipt
              </span>
            </div>
            <button
              onClick={() => setSelectedTransactionReceipt(null)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Card Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Top Status & Amount */}
            <div className="text-center py-2 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {getTypeLabel()}
              </p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                {tx.type === 'withdrawal' || tx.type === 'plan_investment' ? '-' : '+'}
                {formatPKR(tx.amount)}
              </h2>
              <div>{getStatusBadge()}</div>
            </div>

            {/* Receipt Details Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{tx.id}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Reference / TID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {tx.referenceCode}
                  </span>
                  <button
                    onClick={handleCopyTxId}
                    className="p-1 text-slate-400 hover:text-emerald-500"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Gateway Channel</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {tx.gateway === 'Bank_Transfer' ? 'Meezan Bank' : tx.gateway || 'PakInvest Wallet'}
                </span>
              </div>

              {tx.accountNumber && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Recipient Account</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {tx.accountNumber} ({tx.accountTitle})
                  </span>
                </div>
              )}

              {tx.planName && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Investment Package</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{tx.planName}</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Processing Fee</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {tx.fee > 0 ? formatPKR(tx.fee) : 'Rs. 0 (Free)'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Date & Timestamp (PKT)</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatPakistanDateTime(tx.timestamp || tx.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center font-bold text-sm pt-1">
                <span className="text-slate-900 dark:text-white">Net Settled Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {formatPKR(tx.netAmount)}
                </span>
              </div>
            </div>

            {/* Note text */}
            {tx.notes && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                💬 {tx.notes}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyTxId}
                className="flex-1 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Details</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTransactionReceipt(null)}
                className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
