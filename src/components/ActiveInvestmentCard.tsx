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
      {/* 1. Header: Full Width Title with Status */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between gap-2 w-full">
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
            {investment.planName}
          </h4>
          {investment.status === 'active' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              Completed
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0">{getPlanIcon(investment.planCategory)}</span>
            <span>{investment.planCategory}</span>
            <span>•</span>
            <span>{investment.durationDays} Days</span>
          </div>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            +{formatPKR(investment.dailyProfitAmount)}/day ({investment.dailyProfitPercent}%)
          </span>
        </div>
      </div>

      {/* 2. Primary Financial Stats: Invested & Total Claimed */}
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

      {/* 3. Clean Countdown Timer & To-The-Point Collect Action */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isReady ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isReady ? 'Ready to Collect' : 'Countdown'}
            </span>
          </div>
          <div className="font-mono font-black text-sm tracking-wider text-slate-900 dark:text-white">
            {isReady ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ready</span>
            ) : (
              countdown.formatted
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!isReady || isClaiming}
          onClick={handleClaim}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
            isReady
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white cursor-pointer shadow-emerald-500/25 shadow-md ring-2 ring-emerald-400/60'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          {isReady ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isClaiming ? 'Collecting...' : 'Collect'}</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>Locked</span>
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
