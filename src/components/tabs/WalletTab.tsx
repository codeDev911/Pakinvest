import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  Coins,
  Lock,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

export const WalletTab: React.FC = () => {
  const {
    user,
    savedPaymentAccounts,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsAddAccountModalOpen,
    deletePaymentAccount,
    hideBalance,
    withdrawableBalance,
    unspentDeposit,
    setCurrentTab,
  } = useApp();

  const getGatewayIcon = (gw: string) => {
    switch (gw) {
      case 'JazzCash':
        return <Smartphone className="w-5 h-5 text-amber-500" />;
      case 'EasyPaisa':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'Raast':
        return <Sparkles className="w-5 h-5 text-orange-500" />;
      case 'Bank_Transfer':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      default:
        return <Coins className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          My PKR Wallet
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage Pakistani Rupee (Rs.) funds, linked JazzCash / EasyPaisa accounts, and payout gateways
        </p>
      </div>

      {/* Main Wallet Balances Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Available Balance Box */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-950 text-white border border-emerald-700/50 shadow-lg space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200">Total Wallet Balance</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Wallet PKR
              </span>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                {hideBalance ? 'Rs. •••••••' : formatPKR(user.balance)}
              </h3>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Total available funds across deposits, yields, and bonuses
              </p>
            </div>

            {/* Split pills for Withdrawable vs Unspent Deposit */}
            <div className="p-3 rounded-2xl bg-black/25 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Withdrawable Amount:
                </span>
                <span className="font-extrabold text-white font-mono">
                  {hideBalance ? '••••' : formatPKR(withdrawableBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Deposit (Requires Package):
                </span>
                <span className="font-extrabold text-amber-200 font-mono">
                  {hideBalance ? '••••' : formatPKR(unspentDeposit)}
                </span>
              </div>
            </div>

            {unspentDeposit > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-amber-200 leading-tight">
                  Invest deposit in plans to earn withdrawable daily profits!
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentTab('plans')}
                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0 transition-colors"
                >
                  Invest Now
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/40 shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-300" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Breakdown Box */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Portfolio Capital Allocation
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Active Locked Capital
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatPKR(user.investedCapital)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Withdrawable Earnings
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatPKR(withdrawableBalance)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Uninvested Deposit
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                {formatPKR(unspentDeposit)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Lifetime Daily Profits
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                +{formatPKR(user.totalEarnedProfit)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Total Withdrawn Payouts
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatPKR(user.totalWithdrawn)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Total Portfolio Value</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
              {formatPKR(user.balance + user.investedCapital)}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Payment Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Linked Receiving Gateways
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Saved JazzCash, EasyPaisa, and Raast accounts for 1-click withdrawals
            </p>
          </div>

          <button
            onClick={() => setIsAddAccountModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedPaymentAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {getGatewayIcon(acc.gateway)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {acc.accountTitle}
                    </h4>
                    {acc.isDefault && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {acc.accountNumber} {acc.bankName ? `(${acc.bankName})` : ''}
                  </p>
                  <span className="text-[10px] text-slate-400">Gateway: {acc.gateway}</span>
                </div>
              </div>

              <button
                onClick={() => deletePaymentAccount(acc.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remove account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Limits Info */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200">
            Protected with 4-Digit Security PIN & SECP Financial Standard
          </h4>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            All withdrawals are protected by your 4-digit PIN. Instant 24/7 disbursements to verified Pakistani financial institutions.
          </p>
        </div>
      </div>
    </div>
  );
};
