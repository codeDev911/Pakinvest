import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import {
  X,
  Zap,
  Sun,
  Sprout,
  Truck,
  Building2,
  ShieldCheck,
  Clock,
  TrendingUp,
  Coins,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PlanDetailModal: React.FC = () => {
  const {
    selectedPlanForDetail,
    setSelectedPlanForDetail,
    investInPlan,
    user,
    setIsDepositModalOpen,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!selectedPlanForDetail) return null;

  const plan = selectedPlanForDetail;
  const investAmount = plan.fixedAmount || plan.minAmount;
  const dailyProfit = (investAmount * plan.dailyProfitPercent) / 100;
  const totalProfitOnly = dailyProfit * plan.durationDays;
  const totalReturnWithPrincipal = totalProfitOnly + investAmount;
  const hasEnoughBalance = user.balance >= investAmount;

  const handleInvest = async () => {
    setIsSubmitting(true);
    const success = await investInPlan(plan, investAmount);
    setIsSubmitting(false);
    if (success) {
      setSelectedPlanForDetail(null);
    }
  };

  const getPlanIcon = (cat: string) => {
    switch (cat) {
      case 'Starter':
        return <Zap className="w-6 h-6 text-emerald-500" />;
      case 'Solar Energy':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'Agro Yield':
        return <Sprout className="w-6 h-6 text-green-500" />;
      case 'CPEC Logistics':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'Real Estate':
        return <Building2 className="w-6 h-6 text-purple-500" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-yellow-500" />;
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
          onClick={() => setSelectedPlanForDetail(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Down to Up Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Top handle bar */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {getPlanIcon(plan.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {plan.category} • {plan.durationDays} Days Duration
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlanForDetail(null)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Price & Daily Return Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Package Price
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                  {formatPKR(investAmount)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  100% Principal Guarantee
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Daily Guaranteed ROI
                </span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                  {plan.dailyProfitPercent}% <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">/day</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  +{formatPKR(dailyProfit)} every 24 hrs
                </span>
              </div>
            </div>

            {/* Total Return Projection Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Return on Maturity</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {plan.totalRoiPercent}% Total ROI
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400 font-display">
                  {formatPKR(totalReturnWithPrincipal)}
                </span>
                <span className="text-xs text-slate-300">
                  Net Profit: +{formatPKR(totalProfitOnly)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-200">{plan.durationDays} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Payout Frequency</span>
                  <span className="font-bold text-emerald-400">Real-time / Hourly</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Capital Refund</span>
                  <span className="font-bold text-slate-200">100% at End</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                About this Project
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                {plan.description}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Plan Highlights
              </h4>
              <div className="space-y-2">
                {plan.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance check summary */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Your Wallet Balance:</span>
              <span className={`font-bold ${hasEnoughBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {formatPKR(user.balance)}
              </span>
            </div>

            {/* Action Button */}
            {hasEnoughBalance ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleInvest}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Investing...
                  </span>
                ) : (
                  <span>Invest</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanForDetail(null);
                  setIsDepositModalOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                Deposit
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
