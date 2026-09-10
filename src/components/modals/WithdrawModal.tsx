import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GatewayType, PaymentAccount } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import { GatewayLogo } from '../common/GatewayLogo';
import {
  X,
  Lock,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WithdrawModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    withdrawFunds,
    user,
    savedPaymentAccounts,
    setIsAddAccountModalOpen,
    showToast,
    withdrawableBalance,
    unspentDeposit,
    setCurrentTab,
  } = useApp();

  const [selectedGateway, setSelectedGateway] = useState<GatewayType>('JazzCash');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    savedPaymentAccounts[0]?.id || 'custom'
  );
  const [amount, setAmount] = useState<number>(1500);
  const [customAmountInput, setCustomAmountInput] = useState<string>('1500');
  const [customTitle, setCustomTitle] = useState<string>(user.name);
  const [customNumber, setCustomNumber] = useState<string>('0302-8876543');
  const [pin, setPin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Details & Amount, 2 = PIN Confirmation

  // Dynamic fee configuration and daily quota from server
  const [feeConfig, setFeeConfig] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<{
    todayCount: number;
    maxDaily: number;
    remaining: number;
    canWithdraw: boolean;
  }>({
    todayCount: 0,
    maxDaily: 3,
    remaining: 3,
    canWithdraw: true,
  });

  const fetchWithdrawalInfo = () => {
    const token = localStorage.getItem('pakinvest_jwt_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(getApiUrl('/api/withdrawal-fee-config'), { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.config) {
          setFeeConfig(data.config);
        }
        if (data?.userDailyStats) {
          setDailyStats(data.userDailyStats);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isWithdrawModalOpen) {
      fetchWithdrawalInfo();
    }
  }, [isWithdrawModalOpen]);

  if (!isWithdrawModalOpen) return null;

  const minWithdrawal = feeConfig?.minWithdrawal ?? 300;
  const maxWithdrawal = feeConfig?.maxWithdrawal ?? 500000;
  const maxDaily = feeConfig?.maxDailyRequests ?? dailyStats.maxDaily ?? 3;

  // Dynamic fee calculation:
  // Explicit rule: If amount < 500 or feeConfig disabled => 0% processing fee
  let platformFee = 0;

  if (feeConfig && feeConfig.enabled === false) {
    platformFee = 0;
  } else if (amount < 500) {
    platformFee = 0;
  } else if (feeConfig?.tiers && Array.isArray(feeConfig.tiers)) {
    let matchedTier = null;
    for (const t of feeConfig.tiers) {
      if (t.condition === 'lt' && amount < t.threshold) { matchedTier = t; break; }
      if (t.condition === 'lte' && amount <= t.threshold) { matchedTier = t; break; }
      if (t.condition === 'gt' && amount > t.threshold) { matchedTier = t; break; }
      if (t.condition === 'gte' && amount >= t.threshold) { matchedTier = t; break; }
      if (t.condition === 'always') { matchedTier = t; break; }
    }
    if (matchedTier) {
      platformFee = Math.round((amount * (matchedTier.feePercent / 100)) + (matchedTier.flatFee || 0));
    } else {
      const feeRatePercent = feeConfig.standardPercent ?? 1.0;
      const flat = feeConfig.standardFlatFee ?? 0;
      platformFee = Math.round(amount * (feeRatePercent / 100) + flat);
    }
  } else {
    // Fallback standard calculation
    platformFee = Math.round(amount * 0.01);
  }

  platformFee = Math.max(0, platformFee);
  const netReceivable = Math.max(0, amount - platformFee);

  const matchedAccounts = savedPaymentAccounts.filter((a) => a.gateway === selectedGateway);

  const handlePercentageSelect = (percent: number) => {
    const calculated = Math.floor((withdrawableBalance * percent) / 100);
    const validAmount = Math.min(maxWithdrawal, Math.max(0, calculated));
    setAmount(validAmount);
    setCustomAmountInput(validAmount ? validAmount.toString() : '');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountInput(val);
    setAmount(val ? parseInt(val, 10) : 0);
  };

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyStats.canWithdraw || dailyStats.remaining <= 0) {
      showToast('Daily Limit Reached', `You can only submit up to ${maxDaily} withdrawal requests per day (${dailyStats.todayCount}/${maxDaily} submitted today).`, 'error');
      return;
    }
    if (amount < minWithdrawal) {
      showToast('Amount too low', `Minimum withdrawal amount is Rs. ${minWithdrawal.toLocaleString()}`, 'warning');
      return;
    }
    if (amount > maxWithdrawal) {
      showToast('Amount too high', `Maximum withdrawal limit is Rs. ${maxWithdrawal.toLocaleString()}`, 'warning');
      return;
    }
    if (amount > withdrawableBalance) {
      showToast(
        'Insufficient Withdrawable Balance',
        `Available withdrawable earnings: Rs. ${withdrawableBalance.toLocaleString()}. Deposited capital must be invested into packages to earn profits.`,
        'error'
      );
      return;
    }
    setStep(2);
  };

  const handleConfirmWithdrawal = async () => {
    if (pin !== user.securityPin && pin !== '1234') {
      showToast('Incorrect PIN', 'The 4-digit security PIN is incorrect (Default PIN: 1234)', 'error');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    let title = customTitle;
    let number = customNumber;
    let bankName: string | undefined = undefined;

    const selectedAcc = savedPaymentAccounts.find((a) => a.id === selectedAccountId);
    if (selectedAcc) {
      title = selectedAcc.accountTitle;
      number = selectedAcc.accountNumber;
      bankName = selectedAcc.bankName;
    }

    const success = await withdrawFunds(amount, selectedGateway, title, number, bankName, pin);
    setIsSubmitting(false);

    if (success) {
      setIsWithdrawModalOpen(false);
      setStep(1);
      setPin('');
      // Update local quota immediately
      setDailyStats((prev) => ({
        ...prev,
        todayCount: prev.todayCount + 1,
        remaining: Math.max(0, prev.remaining - 1),
        canWithdraw: prev.remaining - 1 > 0,
      }));
    }
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
          onClick={() => setIsWithdrawModalOpen(false)}
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
          {/* Top handle bar */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Withdraw
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {step === 1 ? (
              <form onSubmit={handleProceedToPin} className="space-y-4">
                {/* Balance Banner & Daily Quota */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Withdrawable Earnings / Profits</span>
                      <span className="text-2xl font-black text-emerald-400 font-display">
                        {formatPKR(withdrawableBalance)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Limits (Min - Max)</span>
                      <span className="text-xs font-black text-amber-300 font-mono">
                        {formatPKR(minWithdrawal)} - {formatPKR(maxWithdrawal)}
                      </span>
                    </div>
                  </div>

                  {unspentDeposit > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-amber-300 block">
                          Uninvested Deposit: {formatPKR(unspentDeposit)}
                        </span>
                        <span className="text-[10px] text-amber-200/80 block mt-0.5">
                          Deposited funds are not directly withdrawable. Invest in packages to generate withdrawable daily profits!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWithdrawModalOpen(false);
                          setCurrentTab('plans');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0 transition-colors shadow-sm"
                      >
                        Invest Now
                      </button>
                    </div>
                  )}

                  {/* Daily Quota Counter Bar */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Daily Withdrawal Limit:</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${
                      dailyStats.remaining > 0
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
                    }`}>
                      {dailyStats.remaining} of {maxDaily} left today
                    </span>
                  </div>
                </div>

                {/* Daily limit reached alert banner */}
                {(!dailyStats.canWithdraw || dailyStats.remaining <= 0) && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div className="text-xs">
                      <p className="font-bold">Daily Request Limit Reached</p>
                      <p className="text-[11px] text-rose-700/90 dark:text-rose-400/90 mt-0.5">
                        You have submitted the maximum allowed {maxDaily} withdrawal requests for today. Please wait until tomorrow to request another payout.
                      </p>
                    </div>
                  </div>
                )}

                {/* Gateway Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Select Receiving Gateway
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(['JazzCash', 'EasyPaisa', 'Raast', 'SadaPay', 'NayaPay', 'Bank_Transfer'] as GatewayType[]).map((gw) => {
                      const isSelected = selectedGateway === gw;
                      return (
                        <button
                          key={gw}
                          type="button"
                          onClick={() => {
                            setSelectedGateway(gw);
                            const match = savedPaymentAccounts.find((a) => a.gateway === gw);
                            if (match) setSelectedAccountId(match.id);
                            else setSelectedAccountId('custom');
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="mb-1">
                            {getGatewayIcon(gw)}
                          </div>
                          <span className="text-[10px] font-bold truncate w-full">
                            {gw === 'Bank_Transfer' ? 'Bank' : gw}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Receiving Account Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Receiving Account
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddAccountModalOpen(true)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Account
                    </button>
                  </div>

                  {matchedAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {matchedAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedAccountId(acc.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedAccountId === acc.id
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {selectedAccountId === acc.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                            )}
                            <GatewayLogo gateway={acc.gateway} size="xs" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white">
                                {acc.accountTitle}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {acc.accountNumber} {acc.bankName ? `(${acc.bankName})` : ''}
                              </p>
                            </div>
                          </div>
                          {acc.isDefault && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Account Title (Must match bank/wallet name)
                        </label>
                        <input
                          type="text"
                          required
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="e.g. Muhammad Ali"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {selectedGateway} Mobile / Account Number
                        </label>
                        <input
                          type="text"
                          required
                          value={customNumber}
                          onChange={(e) => setCustomNumber(e.target.value)}
                          placeholder="0300-1234567"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount to Withdraw */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Withdrawal Amount (Rs.)
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Withdrawable: {formatPKR(withdrawableBalance)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-600 dark:text-amber-400">
                      Rs.
                    </span>
                    <input
                      type="text"
                      value={customAmountInput}
                      onChange={handleCustomAmountChange}
                      placeholder="1,500"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Quick percentage buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-2.5">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePercentageSelect(pct)}
                        className="py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {pct === 100 ? '100% (Max)' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breakdown summary */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Withdrawal Request</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPKR(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Processing Fee</span>
                    <span className={`font-semibold font-mono ${platformFee === 0 ? 'text-emerald-500 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                      {formatPKR(platformFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                    <span className="text-slate-900 dark:text-white">Net You Receive</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatPKR(netReceivable)}</span>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  type="submit"
                  disabled={!dailyStats.canWithdraw || dailyStats.remaining <= 0 || amount < minWithdrawal || amount > maxWithdrawal || amount > withdrawableBalance || amount > user.balance}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {!dailyStats.canWithdraw || dailyStats.remaining <= 0
                      ? `Daily Limit Reached (${maxDaily}/${maxDaily} Used Today)`
                      : amount < minWithdrawal
                      ? `Minimum Rs. ${minWithdrawal.toLocaleString()} Required`
                      : amount > maxWithdrawal
                      ? `Maximum Rs. ${maxWithdrawal.toLocaleString()} Limit Exceeded`
                      : amount > withdrawableBalance
                      ? 'Insufficient Withdrawable Balance'
                      : amount > user.balance
                      ? 'Insufficient Balance'
                      : 'Verify with Security PIN'}
                  </span>
                </button>

                <div className="text-center pt-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Withdrawal guidelines apply.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsWithdrawModalOpen(false);
                        setCurrentTab('terms');
                      }}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      Read Terms & Policies
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* PIN STEP */
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Enter 4-Digit Withdrawal PIN
                  </h4>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Disbursement of</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{formatPKR(netReceivable)}</strong>
                    <span>via</span>
                    <div className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      <GatewayLogo gateway={selectedGateway} size="xs" />
                      <span>{selectedGateway === 'Bank_Transfer' ? 'Bank / Raast' : selectedGateway}</span>
                    </div>
                  </div>
                </div>

                {/* PIN Input */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = pin[idx] || '';
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all ${
                          digit
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {digit ? '•' : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (pin.length < 4) setPin((prev) => prev + num);
                      }}
                      className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-colors shadow-2xs active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPin('')}
                    className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-xs transition-colors hover:bg-slate-200"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pin.length < 4) setPin((prev) => prev + '0');
                    }}
                    className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-colors shadow-2xs active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPin((prev) => prev.slice(0, -1))}
                    className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors hover:bg-slate-200"
                  >
                    ⌫
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Default PIN for demo: <span className="font-mono font-bold text-emerald-500">1234</span>
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={pin.length !== 4 || isSubmitting}
                    onClick={handleConfirmWithdrawal}
                    className="w-2/3 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Dispatched...
                      </span>
                    ) : (
                      <span>Authorize Withdrawal</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
