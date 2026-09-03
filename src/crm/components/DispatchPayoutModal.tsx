import React, { useState, useEffect } from 'react';
import { Transaction, OfficialDepositChannel } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import {
  ArrowUpRight,
  X,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  TrendingDown,
  Info,
  Layers,
  Check,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface DispatchPayoutModalProps {
  withdrawal: Transaction | null;
  channels?: OfficialDepositChannel[];
  onClose: () => void;
  onConfirmDispatch: (
    txId: string,
    channelId: string,
    gateway: string,
    dispatchReference: string,
    dispatchNotes: string
  ) => Promise<boolean | void>;
}

export const DispatchPayoutModal: React.FC<DispatchPayoutModalProps> = ({
  withdrawal,
  channels: propChannels,
  onClose,
  onConfirmDispatch,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [channels, setChannels] = useState<OfficialDepositChannel[]>(propChannels || []);
  const [isLoadingChannels, setIsLoadingChannels] = useState(!propChannels || propChannels.length === 0);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [dispatchReference, setDispatchReference] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch channels if not provided
  useEffect(() => {
    let isMounted = true;
    const loadChannels = async () => {
      try {
        const res = await fetch(getApiUrl('/api/admin/deposit-channels'));
        const data = await res.json();
        if (isMounted && data?.success && Array.isArray(data?.channels)) {
          setChannels(data.channels);
          // Auto-select channel matching recipient gateway if available
          if (withdrawal && data.channels.length > 0) {
            const matching = data.channels.find(
              (c: OfficialDepositChannel) =>
                c.gateway.toLowerCase() === (withdrawal.gateway || '').toLowerCase() && c.isActive !== false
            );
            if (matching && matching.id) {
              setSelectedChannelId(matching.id);
            } else if (data.channels[0]?.id) {
              setSelectedChannelId(data.channels[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load channels for payout modal:', err);
      } finally {
        if (isMounted) setIsLoadingChannels(false);
      }
    };

    loadChannels();
    return () => {
      isMounted = false;
    };
  }, [withdrawal]);

  if (!withdrawal) return null;

  const dispatchAmount =
    typeof withdrawal.netAmount === 'number' && withdrawal.netAmount > 0
      ? withdrawal.netAmount
      : withdrawal.amount;

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const channelCurrentBalance = selectedChannel?.currentBalance || 0;
  const balanceAfterDispatch = channelCurrentBalance - dispatchAmount;
  const isInsufficient = balanceAfterDispatch < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) {
      setErrorMsg('Please select a payment channel to dispatch from.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirmDispatch(
        withdrawal.id,
        selectedChannel.id || '',
        selectedChannel.gateway,
        dispatchReference.trim(),
        dispatchNotes.trim()
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch withdrawal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGatewayIcon = (gateway: string) => {
    const gw = gateway.toLowerCase();
    if (gw.includes('jazz') || gw.includes('easy')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (gw.includes('bank') || gw.includes('hbl') || gw.includes('meezan')) {
      return <Building2 className="w-5 h-5" />;
    }
    return <CreditCard className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl my-8 overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Dispatch Payout & Channel Deduction</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  TREASURY SETTLEMENT
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select official payment channel to send money and deduct from system float
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Recipient & Payout Summary Card */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Investor / Beneficiary:
              </span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{withdrawal.userName || 'Investor'}</span>
                <span className="font-mono text-slate-400 font-normal">({withdrawal.userPhone || '—'})</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Destination Account:
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-400">{withdrawal.accountNumber}</span>
                <span className="block text-[11px] text-slate-400">
                  {withdrawal.gateway} • {withdrawal.accountTitle || 'Account Holder'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Gross Request: {formatPKR(withdrawal.amount)}</span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Fee: {formatPKR(withdrawal.fee || 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Net Cash to Dispatch
                </span>
                <span className="text-2xl font-mono font-black text-amber-400 tracking-tight">
                  {formatPKR(dispatchAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Channel Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Payment Channel to Send Money From:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {channels.length} Channels Available
              </span>
            </div>

            {isLoadingChannels ? (
              <div className="p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 animate-pulse">
                Loading official payment channels...
              </div>
            ) : channels.length === 0 ? (
              <div className="p-4 rounded-2xl border border-rose-900/50 bg-rose-950/20 text-rose-300 text-xs">
                No payment channels configured in CRM. Please configure deposit/payment channels first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {channels.map((c) => {
                  const isSelected = c.id === selectedChannelId;
                  const isMatching =
                    c.gateway.toLowerCase() === (withdrawal.gateway || '').toLowerCase();
                  const bal = c.currentBalance || 0;
                  const hasSufficient = bal >= dispatchAmount;

                  return (
                    <div
                      key={c.id || c.gateway}
                      onClick={() => c.id && setSelectedChannelId(c.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                          : isDark
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Selection radio mark */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {getGatewayIcon(c.gateway)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">{c.gateway}</span>
                            <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[140px]">
                              {c.accountTitle}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1">
                          {isMatching && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                              Matches Recipient
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              hasSufficient
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {hasSufficient ? 'Float OK' : 'Low Float'}
                          </span>
                        </div>
                      </div>

                      {/* Account Number & Balance */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-baseline justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-400 truncate max-w-[110px]">
                          {c.accountNumber}
                        </span>
                        <div className="text-right">
                          <span className="text-[9px] uppercase text-slate-500 block">Current Float</span>
                          <span
                            className={`font-mono font-bold text-xs ${
                              bal > 0 ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          >
                            {formatPKR(bal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Live Float Deduction Impact Preview */}
          {selectedChannel && (
            <div
              className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isInsufficient
                  ? 'bg-rose-950/30 border-rose-900/60'
                  : 'bg-emerald-950/20 border-emerald-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <TrendingDown className={`w-4 h-4 ${isInsufficient ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <span>Channel Float Deduction Simulation</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {selectedChannel.gateway} ({selectedChannel.accountNumber})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Balance Before</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{formatPKR(channelCurrentBalance)}</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-rose-400 uppercase block">Payout Outflow</span>
                  <span className="font-bold text-rose-400 mt-0.5 block">-{formatPKR(dispatchAmount)}</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 uppercase block">Balance After</span>
                  <span
                    className={`font-bold mt-0.5 block ${
                      balanceAfterDispatch >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPKR(balanceAfterDispatch)}
                  </span>
                </div>
              </div>

              {isInsufficient && (
                <div className="flex items-start gap-1.5 text-[11px] text-rose-300 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    Note: Payout amount exceeds channel recorded float. Channel will reflect an overdraft until replenishment or manual adjustment.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 4. Dispatch Proof Inputs */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Bank / Wallet Transaction TID Reference (Proof of Sent Funds)</span>
                <span className="text-[10px] text-slate-500 font-normal">Optional but Recommended</span>
              </label>
              <input
                type="text"
                value={dispatchReference}
                onChange={(e) => setDispatchReference(e.target.value)}
                placeholder="e.g. TRX-9988221, JazzCash TID, Meezan IBFT Ref #..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Internal Dispatch Notes</span>
                <span className="text-[10px] text-slate-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="e.g. Dispatched via manager mobile app at 02:30 PM..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedChannel}
              className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Processing Deduction...'
                  : `Confirm & Deduct ${formatPKR(dispatchAmount)}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
