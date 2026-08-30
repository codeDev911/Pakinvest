import React, { useState, useEffect } from 'react';
import { ActiveInvestment } from '../types';
import { useApp } from '../context/AppContext';
import { formatPKR, formatCountdown, getPlanCycleTimeFormatted } from '../utils/formatters';
import {
  Clock,
  Sparkles,
  Zap,
  Sun,
  Sprout,
  Truck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Wallet,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActiveInvestmentCardProps {
  investment: ActiveInvestment;
  compact?: boolean;
}

export const ActiveInvestmentCard: React.FC<ActiveInvestmentCardProps> = ({
  investment,
  compact = false,
}) => {
  const { claimProfit } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);
  const [now, setNow] = useState(Date.now());

  // 1-second live ticker for smooth countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPlanIcon = (cat: string) => {
    switch (cat) {
      case 'Starter':
        return <Zap className="w-5 h-5 text-emerald-500" />;
      case 'Solar Energy':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Agro Yield':
        return <Sprout className="w-5 h-5 text-green-500" />;
      case 'CPEC Logistics':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'Real Estate':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-yellow-500" />;
    }
  };

  const nextClaimTime = investment.nextClaimTimestamp
    ? Number(investment.nextClaimTimestamp)
    : (investment.lastClaimTimestamp || now) + 86400000;

  const countdown = formatCountdown(nextClaimTime, now);
  const isReady = countdown.isReady && investment.status === 'active';

  const startTimeStr =
    investment.startTimeFormatted ||
    getPlanCycleTimeFormatted(investment.startTimestamp, investment.startDate);

  const progressPct = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((investment.durationDays - investment.daysRemaining) / investment.durationDays) * 100
      )
    )
  );

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReady || isClaiming) return;
    setIsClaiming(true);
    try {
      await claimProfit(investment.id);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      id={`active-plan-card-${investment.id}`}
      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
    >
      {/* 1. Header: Plan Name, Category & Active Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
            {getPlanIcon(investment.planCategory)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display leading-tight">
                {investment.planName}
              </h4>
              {investment.status === 'active' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Completed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <span>{investment.planCategory}</span>
              <span>•</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Daily Payout at {startTimeStr}
              </span>
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-display block">
            +{formatPKR(investment.dailyProfitAmount)}/day
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {investment.dailyProfitPercent}% Daily ROI
          </span>
        </div>
      </div>

      {/* 2. Primary Financial Stats: Invested & Total Claimed (Requested by User) */}
      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-slate-400" />
            Invested
          </span>
          <p className="text-sm font-black text-slate-900 dark:text-white font-display">
            {formatPKR(investment.investedAmount)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {investment.durationDays} Days Contract
          </span>
        </div>

        <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-700/80 pl-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Total Claimed
          </span>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-display">
            {formatPKR(investment.earnedSoFar || 0)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {investment.daysRemaining} days remaining
          </span>
        </div>
      </div>

      {/* 3. 24-Hour Cycle Countdown Box */}
      <div
        className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
          isReady
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border-emerald-300 dark:border-emerald-700/80 shadow-xs'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock
              className={`w-3.5 h-3.5 ${
                isReady ? 'text-emerald-600 animate-bounce' : 'text-amber-500 animate-spin'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              {isReady ? '24h Daily Cycle Complete!' : '24h Daily Profit Countdown'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Claim Window:</span>
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700/80 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 font-mono">
              {startTimeStr}
            </span>
          </div>
        </div>

        {/* Countdown Visual Numbers (Standalone Row) */}
        {isReady ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wide font-display">
                  Profit Ready to Claim!
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                +{formatPKR(investment.dailyProfitAmount)} unlocked and ready for your wallet.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-display">
              +{formatPKR(investment.dailyProfitAmount)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            {/* Hours Box */}
            <div className="text-center">
              <div className="w-12 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-800 dark:text-slate-100 shadow-2xs">
                {countdown.hours}
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5 block">
                HRS
              </span>
            </div>
            <span className="font-mono font-bold text-slate-400 text-lg pb-4">:</span>

            {/* Mins Box */}
            <div className="text-center">
              <div className="w-12 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-800 dark:text-slate-100 shadow-2xs">
                {countdown.minutes}
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5 block">
                MIN
              </span>
            </div>
            <span className="font-mono font-bold text-slate-400 text-lg pb-4">:</span>

            {/* Secs Box */}
            <div className="text-center">
              <div className="w-12 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 shadow-2xs">
                {countdown.seconds}
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5 block">
                SEC
              </span>
            </div>
          </div>
        )}

        {/* 24-Hour Cycle Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>24h Cycle Progress</span>
            <span>{countdown.percentElapsed}% completed</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isReady
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 to-emerald-500'
              }`}
              style={{ width: `${countdown.percentElapsed}%` }}
            />
          </div>
        </div>

        {/* Action Claim Button Placed Below Countdown */}
        <button
          type="button"
          disabled={!isReady || isClaiming}
          onClick={handleClaim}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
            isReady
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white cursor-pointer shadow-emerald-500/25 shadow-md ring-2 ring-emerald-400/60 animate-pulse'
              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/50'
          }`}
        >
          {isReady ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{isClaiming ? 'Claiming Profit...' : `Claim Daily Profit (+Rs. ${investment.dailyProfitAmount.toLocaleString()})`}</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Locked • Unlocks in {countdown.formatted} (Daily at {startTimeStr})</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Overall Contract Lifecycle Duration Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>Overall Contract Maturity: {investment.endDate}</span>
          <span className="font-bold">
            {investment.durationDays - investment.daysRemaining} / {investment.durationDays} Days
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
