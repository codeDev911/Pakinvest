import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GatewayType } from '../../types';
import { OFFICIAL_DEPOSIT_CHANNELS } from '../../data/mockData';
import { formatPKR } from '../../utils/formatters';
import { GatewayLogo } from '../common/GatewayLogo';
import {
  X,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const QUICK_AMOUNTS = [1500, 3500, 5000, 10000, 25000, 50000];

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, depositFunds, user, officialChannels } = useApp();
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>('JazzCash');
  const [amount, setAmount] = useState<number>(5000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('5000');
  const [senderTitle, setSenderTitle] = useState<string>(user.name);
  const [senderNumber, setSenderNumber] = useState<string>('03028876543');
  const [trxId, setTrxId] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isDepositModalOpen) return null;

  const activeChannels = (officialChannels && officialChannels.length > 0)
    ? officialChannels.filter((c) => c.isActive !== false)
    : OFFICIAL_DEPOSIT_CHANNELS;

  const availableGateways = Array.from(new Set(activeChannels.map((c) => c.gateway)));
  const displayGateways = availableGateways.length > 0 ? availableGateways : (['JazzCash', 'EasyPaisa', 'Raast', 'Bank_Transfer', 'USDT_TRC20'] as GatewayType[]);

  const effectiveGateway = displayGateways.includes(selectedGateway) ? selectedGateway : displayGateways[0];

  const currentChannel =
    activeChannels.find((c) => c.gateway === effectiveGateway) ||
    activeChannels[0] ||
    OFFICIAL_DEPOSIT_CHANNELS[0];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmountInput(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountInput(val);
    setAmount(val ? parseInt(val, 10) : 0);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < currentChannel.minDeposit) {
      alert(`Minimum deposit for ${selectedGateway} is Rs. ${currentChannel.minDeposit.toLocaleString()}`);
      return;
    }
    if (!trxId.trim()) {
      alert('Please enter your 11 or 12 digit Transaction ID (TID) from the SMS/receipt.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // Smooth UX transition
    await depositFunds(amount, selectedGateway, trxId, senderNumber, senderTitle);
    setIsSubmitting(false);
    setIsDepositModalOpen(false);
    setStep(1);
    setTrxId('');
  };

  const getGatewayIcon = (gw: GatewayType) => {
    return <GatewayLogo gateway={gw} size="sm" />;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDepositModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Down to Up Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Top handle bar for mobile feel */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                Rs
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deposit
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {step === 1 ? (
              <>
                {/* Gateway Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {displayGateways.map((gw) => {
                      const isSelected = effectiveGateway === gw;
                      return (
                        <button
                          key={gw}
                          type="button"
                          onClick={() => setSelectedGateway(gw)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="shrink-0">
                            {getGatewayIcon(gw)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {gw === 'Bank_Transfer' ? 'Meezan / Bank' : gw === 'USDT_TRC20' ? 'USDT (TRC20)' : gw}
                            </p>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {gw === 'Raast' ? 'Instant 0% fee' : 'Fast automated'}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Deposit Amount (PKR)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Min: {formatPKR(currentChannel.minDeposit)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      Rs.
                    </span>
                    <input
                      type="text"
                      value={customAmountInput}
                      onChange={handleCustomAmountChange}
                      placeholder="5,000"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAmountSelect(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          amount === val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        +{formatPKR(val)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Notice */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Estimated arrival time:{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {currentChannel.processingTime}
                    </span>
                    . 100% automated settlement with zero platform processing fees.
                  </p>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={amount < currentChannel.minDeposit}
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Payment Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmitDeposit} className="space-y-4">
                {/* Company Payment Info Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GatewayLogo gateway={selectedGateway} size="xs" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Official {selectedGateway === 'Bank_Transfer' ? 'Meezan / Bank' : selectedGateway} Receiving Account
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                      Verified
                    </span>
                  </div>

                  {/* Account Title */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <div>
                      <p className="text-[10px] text-slate-400">Account Title</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {currentChannel.accountTitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentChannel.accountTitle, 'title')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {copiedField === 'title' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Account Number / IBAN */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <div>
                      <p className="text-[10px] text-slate-400">
                        {selectedGateway === 'USDT_TRC20' ? 'TRC20 Wallet Address' : 'Account / Mobile / Raast Number'}
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-800 dark:text-white break-all">
                        {currentChannel.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentChannel.accountNumber, 'number')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                    >
                      {copiedField === 'number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {currentChannel.bankName && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Bank: <span className="font-semibold">{currentChannel.bankName}</span>
                    </div>
                  )}

                  {/* Instructions */}
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed bg-emerald-100/50 dark:bg-emerald-950/80 p-2.5 rounded-xl">
                    💡 {currentChannel.instructions}
                  </p>
                </div>

                {/* Amount to send summary */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Sending Amount:</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatPKR(amount)}
                  </span>
                </div>

                {/* Transaction ID Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter Transaction ID (TID / TRX ID / Reference No.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 029841029381 (from SMS receipt)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    You received this in the JazzCash/EasyPaisa confirmation message.
                  </span>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={senderTitle}
                      onChange={(e) => setSenderTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Sender Phone / Account
                    </label>
                    <input
                      type="text"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !trxId}
                    className="w-2/3 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying Deposit...
                      </span>
                    ) : (
                      <span>Confirm & Credit Balance</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
