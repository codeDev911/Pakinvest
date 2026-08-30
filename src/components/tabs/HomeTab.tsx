import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import { ActiveInvestmentCard } from '../ActiveInvestmentCard';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  TrendingUp,
  Bell,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  Coins,
  Building2,
  Sun,
  Truck,
  Zap,
  Activity,
  Award,
  CalendarCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomeTab: React.FC = () => {
  const {
    user,
    activeInvestments,
    plans,
    transactions,
    notifications,
    unreadNotificationsCount,
    setCurrentTab,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setSelectedPlanForDetail,
    setSelectedTransactionReceipt,
    setIsNotificationModalOpen,
    claimProfit,
    claimAllProfits,
    totalLiveUnclaimedProfit,
    totalDailyProfitRate,
    profitPerSecond,
    hideBalance,
    toggleHideBalance,
  } = useApp();

  const [isClaimingAll, setIsClaimingAll] = useState<boolean>(false);

  const getPlanIcon = (category: string) => {
    switch (category) {
      case 'Starter':
        return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'Solar Energy':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Agro Yield':
        return <Coins className="w-4 h-4 text-green-500" />;
      case 'CPEC Logistics':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'Real Estate':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
    }
  };

  const recentTransactions = transactions.slice(0, 4);

  const handleClaimAll = async () => {
    setIsClaimingAll(true);
    await claimAllProfits();
    setIsClaimingAll(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 max-w-4xl mx-auto px-3.5 sm:px-4 pt-1">
      {/* 1. Main Hero Financial Card (Responsive, Light & Dark Theme Perfect) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white p-4.5 sm:p-6 border border-emerald-700/40 shadow-xl shadow-emerald-950/20">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Label & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                Total Portfolio Balance
              </span>
              <button
                type="button"
                onClick={toggleHideBalance}
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 transition-colors"
                title={hideBalance ? 'Show Balance' : 'Hide Balance'}
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified PKR</span>
            </div>
          </div>

          {/* Large Main PKR Balance Display */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
              {hideBalance ? 'Rs. ••••••••' : formatPKR(user.balance)}
            </h1>

            <div className="text-xs text-emerald-200/90 flex items-center gap-1.5 font-medium">
              <span>Liquid Withdrawable</span>
              <span className="text-white font-bold">Rs. {user.balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Sub-Metrics Grid (Invested, Lifetime Profit, Referral Bonus) */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-emerald-800/60 text-xs">
            <div className="bg-emerald-900/40 p-2.5 rounded-2xl border border-emerald-700/30">
              <span className="text-[10px] text-emerald-200/80 block truncate">Locked Capital</span>
              <span className="font-bold text-white text-xs sm:text-sm font-display truncate block mt-0.5">
                {hideBalance ? '••••' : formatPKR(user.investedCapital)}
              </span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-2xl border border-emerald-700/30">
              <span className="text-[10px] text-emerald-200/80 block truncate">Lifetime Profit</span>
              <span className="font-bold text-emerald-300 text-xs sm:text-sm font-display truncate block mt-0.5">
                +{hideBalance ? '••••' : formatPKR(user.totalEarnedProfit)}
              </span>
            </div>

            <div className="bg-emerald-900/40 p-2.5 rounded-2xl border border-emerald-700/30">
              <span className="text-[10px] text-emerald-200/80 block truncate">Team Bonus</span>
              <span className="font-bold text-amber-300 text-xs sm:text-sm font-display truncate block mt-0.5">
                +{hideBalance ? '••••' : formatPKR(user.referralEarnings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions (ONLY ICONS AND TITLES - NO DESCRIPTION AS REQUESTED) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Deposit Button */}
        <button
          type="button"
          onClick={() => setIsDepositModalOpen(true)}
          className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Deposit
          </span>
        </button>

        {/* Withdrawal Button */}
        <button
          type="button"
          onClick={() => setIsWithdrawModalOpen(true)}
          className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            Withdrawal
          </span>
        </button>

        {/* Transactions Button */}
        <button
          type="button"
          onClick={() => setCurrentTab('transactions')}
          className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
            <ReceiptText className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Transactions
          </span>
        </button>
      </div>

      {/* 3. Daily Loyalty Bonus & 24-Hour Cycle Daily Payout Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 24-Hour Cycle Daily Payout Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                24h Daily Payout Schedule
              </span>
              {totalDailyProfitRate > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                  24h Cycle
                </span>
              )}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-display">
              {totalDailyProfitRate > 0 ? (
                <span>+{formatPKR(totalDailyProfitRate)}<span className="text-xs font-normal text-slate-500">/day</span></span>
              ) : (
                <span className="text-slate-400 text-sm font-normal">No Active Plans</span>
              )}
            </div>
            {totalDailyProfitRate > 0 && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Total Claimed: <strong className="text-emerald-600 dark:text-emerald-400">{formatPKR(user.totalEarnedProfit || 0)}</strong>
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={totalLiveUnclaimedProfit <= 0 || isClaimingAll}
            onClick={handleClaimAll}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 ${
              totalLiveUnclaimedProfit > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white cursor-pointer shadow-emerald-500/20 shadow-md ring-2 ring-emerald-400/50 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isClaimingAll
                ? 'Claiming...'
                : totalLiveUnclaimedProfit > 0
                ? `Claim All (${formatPKR(totalLiveUnclaimedProfit)})`
                : '24h Timer Active'}
            </span>
          </button>
        </div>

        {/* Live Activity & Notifications Alert Box */}
        <div
          onClick={() => setIsNotificationModalOpen(true)}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 relative">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {notifications.length > 0 ? notifications[0].title : 'Live Notifications & Status'}
                </h4>
                {unreadNotificationsCount > 0 ? (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {unreadNotificationsCount} New
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                {notifications.length > 0
                  ? notifications[0].message
                  : 'Real-time updates on approvals, withdrawals, and payouts'}
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </div>
      </div>

      {/* 4. Active Investments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              My Active Portfolios ({activeInvestments.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('plans')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2.5 shadow-2xs">
            <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Active Investment Plans</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Activate an investment package starting at Rs. 1,000 to begin receiving daily 24-hour automated returns.
            </p>
            <button
              type="button"
              onClick={() => setCurrentTab('plans')}
              className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
            >
              Browse Packages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeInvestments.map((inv) => (
              <ActiveInvestmentCard key={inv.id} investment={inv} />
            ))}
          </div>
        )}
      </div>

      {/* 5. Featured Investment Packages Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Featured Investment Packages
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('plans')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All ({plans.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.slice(0, 3).map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanForDetail(plan)}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {getPlanIcon(plan.category)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {plan.dailyProfitPercent}% Daily
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {plan.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {plan.durationDays} Days Duration
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Price</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatPKR(plan.fixedAmount || plan.minAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Invest Now</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Recent Transaction Ledger Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Recent Transactions
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('transactions')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Full Ledger
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No transactions recorded yet.
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'daily_profit' || tx.type === 'referral_bonus' || tx.type === 'streak_reward';
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransactionReceipt(tx)}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      ) : tx.type === 'withdrawal' ? (
                        <ArrowUpRight className="w-4 h-4 text-amber-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
                          {tx.type.replace('_', ' ')}
                        </span>
                        {tx.status === 'pending' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                            Pending
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {tx.timestamp} • Ref: {tx.referenceCode}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-extrabold font-display ${
                      isCredit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isCredit ? '+' : '-'}{formatPKR(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
