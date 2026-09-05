import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
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
  User,
  Layers,
  Flame,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LivePlatformFeed } from '../LivePlatformFeed';
import { DownloadAppBanner } from '../DownloadAppBanner';

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
    setIsStreakModalOpen,
    setIsAuthModalOpen,
    setPlansTabSection,
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

      {/* 2. Quick Actions */}
      <div className="space-y-2.5">
        {/* Primary Row: Deposit & Withdraw (Hero Action Buttons) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Deposit Button */}
          <button
            id="home-btn-deposit"
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block">
                Deposit
              </span>
            </div>
          </button>

          {/* Withdraw Button */}
          <button
            id="home-btn-withdrawal"
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block">
                Withdraw
              </span>
            </div>
          </button>
        </div>

        {/* 3 Quick Action Buttons Below Withdrawal & Deposit (User Requested: My Packages, Profile, Rewards) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* My Packages Button */}
          <button
            id="home-btn-my-packages"
            type="button"
            onClick={() => {
              setPlansTabSection('active');
              setCurrentTab('plans');
            }}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs relative">
              <Layers className="w-5 h-5" />
              {activeInvestments.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[9px] font-black shadow-xs">
                  {activeInvestments.length}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              My Packages
            </span>
          </button>

          {/* Profile Button */}
          <button
            id="home-btn-profile"
            type="button"
            onClick={() => setCurrentTab('settings')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Profile
            </span>
          </button>

          {/* Daily Check-in / Rewards Button */}
          <button
            id="home-btn-rewards"
            type="button"
            onClick={() => setIsStreakModalOpen(true)}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
              <Flame className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Rewards
            </span>
          </button>
        </div>
      </div>

      {/* Download Android Mobile App (Only rendered in Web browser, hidden inside APK) */}
      <DownloadAppBanner />

      {/* 3. Live Simulated Platform Activity (Unlimited Upward Feed) */}
      <LivePlatformFeed />

      {/* 4. Live Activity & Notifications Alert Box */}
      <div
        onClick={() => setIsNotificationModalOpen(true)}
        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-2xs group"
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
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {notifications.length > 0 ? notifications[0].title : 'Live Notifications & Status'}
              </h4>
              {unreadNotificationsCount > 0 ? (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {unreadNotificationsCount} New
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Live
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
              {notifications.length > 0
                ? notifications[0].message
                : 'Real-time updates on approvals, withdrawals, and payouts'}
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
      </div>

      {/* 4. Featured Investment Packages Carousel */}
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
                {/* Full width Title Header */}
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {plan.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {plan.dailyProfitPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="shrink-0">{getPlanIcon(plan.category)}</span>
                    <span>{plan.category}</span>
                    <span>•</span>
                    <span>{plan.durationDays} Days</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Price</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatPKR(plan.fixedAmount || plan.minAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Invest</span>
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
