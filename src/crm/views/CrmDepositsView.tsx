import React, { useState } from 'react';
import { Transaction, GatewayType } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';

interface CrmDepositsViewProps {
  deposits: Transaction[];
  onApproveDeposit: (txId: string) => Promise<void>;
  onDeclineDeposit: (txId: string, reason: string) => Promise<void>;
}

export const CrmDepositsView: React.FC<CrmDepositsViewProps> = ({
  deposits,
  onApproveDeposit,
  onDeclineDeposit,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('pending');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Decline Modal State
  const [declineModalTx, setDeclineModalTx] = useState<Transaction | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeposits = deposits.filter((tx) => {
    if (tx.type !== 'deposit') return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (gatewayFilter !== 'all' && tx.gateway !== gatewayFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.userName?.toLowerCase().includes(q);
      const matchPhone = tx.userPhone?.toLowerCase().includes(q) || tx.senderPhone?.toLowerCase().includes(q);
      const matchRef = tx.referenceCode?.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      return matchName || matchPhone || matchRef || matchId;
    }
    return true;
  });

  const totalFilteredVolume = filteredDeposits.reduce((acc, curr) => acc + curr.amount, 0);

  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineModalTx) return;
    setIsProcessing(true);
    await onDeclineDeposit(declineModalTx.id, declineReason || 'Deposit declined: Invalid TID proof.');
    setIsProcessing(false);
    setDeclineModalTx(null);
    setDeclineReason('');
  };

  const quickDeclineReasons = [
    'TID not received in JazzCash / EasyPaisa Till account',
    'Invalid TID length or duplicated reference number',
    'Sender title and account name mismatch',
    'Amount received is less than submitted claim',
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            <span>Pakistani Deposit Verification Queue</span>
          </h2>
          <p className="text-xs text-slate-400">
            Verify JazzCash, EasyPaisa, Raast and Bank IBFT deposit transaction IDs (TIDs)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Showing:</span>
          <strong className="text-white">{filteredDeposits.length} Records</strong>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Volume:</span>
          <strong className="text-emerald-400">{formatPKR(totalFilteredVolume)}</strong>
        </div>
      </div>

      {/* 2. Controls & Search Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Investor Name, Mobile Number, or TID Reference..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {(['pending', 'completed', 'declined', 'all'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Gateway Select Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Gateway:</span>
          {['all', 'JazzCash', 'EasyPaisa', 'Raast', 'Bank_Transfer', 'USDT_TRC20'].map((gw) => (
            <button
              key={gw}
              type="button"
              onClick={() => setGatewayFilter(gw)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                gatewayFilter === gw
                  ? 'bg-slate-800 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {gw === 'all' ? 'All Gateways' : gw}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Deposit Items List */}
      {filteredDeposits.length === 0 ? (
        <div className="py-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">No deposit records found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or adjusting status filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeposits.map((tx) => {
            const isPending = tx.status === 'pending';
            const isCompleted = tx.status === 'completed';
            const isDeclined = tx.status === 'declined';

            return (
              <div
                key={tx.id}
                className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border transition-all ${
                  isPending
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Investor Info & TID Proof */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.userName || 'Investor'}</span>
                      <span className="text-xs text-slate-400 font-mono">({tx.userPhone || 'No phone'})</span>
                      
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                        {tx.gateway}
                      </span>

                      {isPending && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-2.5 h-2.5" />
                          Pending Audit
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Credited & Bonus Distributed
                        </span>
                      )}
                      {isDeclined && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" />
                          Declined
                        </span>
                      )}
                    </div>

                    {/* Proof Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[11px]">TID Proof:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-amber-300 text-xs">{tx.referenceCode}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.referenceCode, tx.id)}
                            className="text-slate-400 hover:text-white"
                            title="Copy TID"
                          >
                            {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[11px]">Sender Phone:</span>
                        <strong className="font-mono text-slate-200 text-xs">{tx.senderPhone || tx.userPhone || 'N/A'}</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[11px]">Submitted:</span>
                        <span className="font-mono text-slate-300 text-[11px]">{tx.timestamp}</span>
                      </div>
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Note: {tx.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400 text-left lg:text-right">Deposit Amount</p>
                      <p className="text-xl font-black text-emerald-400 text-left lg:text-right">
                        {formatPKR(tx.amount)}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onApproveDeposit(tx.id)}
                          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeclineModalTx(tx);
                            setDeclineReason('');
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Decline Deposit Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeclineModalTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              You are declining Rs. <strong>{declineModalTx.amount.toLocaleString()}</strong> from{' '}
              <strong>{declineModalTx.userName}</strong> (TID: {declineModalTx.referenceCode}).
            </p>

            <form onSubmit={handleConfirmDecline} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Quick Reason Presets:</label>
                <div className="space-y-1">
                  {quickDeclineReasons.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDeclineReason(r)}
                      className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-colors truncate"
                    >
                      • {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Custom Decline Reason:</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Provide detailed explanation for rejection..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclineModalTx(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  {isProcessing ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
