import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvestmentPlan } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { ActiveInvestmentCard } from '../ActiveInvestmentCard';
import {
  Zap,
  Sun,
  Sprout,
  Truck,
  Building2,
  ShieldCheck,
  Clock,
  TrendingUp,
  Sparkles,
  Calculator,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export const PlansTab: React.FC = () => {
  const {
    plans,
    activeInvestments,
    setSelectedPlanForDetail,
    claimProfit,
    claimAllProfits,
    readyToCollectPackagesCount,
    readyToCollectTotalAmount,
    user,
    plansTabSection,
    setPlansTabSection,
  } = useApp();

  const [isClaimingAll, setIsClaimingAll] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [calcPlan, setCalcPlan] = useState<InvestmentPlan>(plans[1] || plans[0]);
  const [calcAmount, setCalcAmount] = useState<number>(calcPlan.fixedAmount || calcPlan.minAmount);
  const viewSection = plansTabSection;
  const setViewSection = setPlansTabSection;

  const handleClaimAll = async () => {
    setIsClaimingAll(true);
    await claimAllProfits();
    setIsClaimingAll(false);
  };

  const categories = ['All', 'Starter', 'Solar Energy', 'Agro Yield', 'CPEC Logistics', 'Real Estate', 'VIP Bluechip'];

  const filteredPlans = activeCategory === 'All'
    ? plans
    : plans.filter((p) => p.category === activeCategory);

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

  // Calculator figures
  const calcDailyProfit = (calcAmount * calcPlan.dailyProfitPercent) / 100;
  const calcWeeklyProfit = calcDailyProfit * 7;
  const calcTotalProfit = calcDailyProfit * calcPlan.durationDays;
  const calcTotalWithCapital = calcTotalProfit + calcAmount;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Investment Packages
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fixed prices, transparent daily profits, automated JazzCash/EasyPaisa payouts
          </p>
        </div>

        {/* Switcher Tab between All Plans & My Active Plans */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold self-start">
          <button
            onClick={() => setViewSection('plans')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewSection === 'plans'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Plans ({plans.length})
          </button>
          <button
            onClick={() => setViewSection('active')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 relative ${
              viewSection === 'active'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Active</span>
            <span className={`px-1.5 py-0.2 rounded-full text-white text-[10px] font-bold ${
              readyToCollectPackagesCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}>
              {readyToCollectPackagesCount > 0 ? `${readyToCollectPackagesCount} Ready` : activeInvestments.length}
            </span>
          </button>
        </div>
      </div>

      {viewSection === 'active' ? (
        /* ACTIVE INVESTMENTS VIEW */
        <div className="space-y-4">
          {/* Prominent Ready to Collect Banner */}
          {readyToCollectPackagesCount > 0 && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                    <span>{readyToCollectPackagesCount} {readyToCollectPackagesCount === 1 ? 'Package Yield Ready' : 'Packages Yield Ready'}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">Ready</span>
                  </h4>
                  <p className="text-xs text-emerald-100">
                    Collect your rewards of <strong className="text-white font-black">{formatPKR(readyToCollectTotalAmount)}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isClaimingAll}
                onClick={handleClaimAll}
                className="py-2.5 px-4 rounded-xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isClaimingAll ? 'Collecting...' : `Collect All (${formatPKR(readyToCollectTotalAmount)})`}</span>
              </button>
            </div>
          )}

          {activeInvestments.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Active Plans Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Activate an investment package to start earning daily guaranteed ROI in Pakistani Rupees.
              </p>
              <button
                onClick={() => setViewSection('plans')}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                Plans
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInvestments.map((inv) => (
                <ActiveInvestmentCard key={inv.id} investment={inv} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* EXPLORE PLANS VIEW */
        <div className="space-y-6">
          {/* Categories Horizontal Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanForDetail(plan)}
                className="group relative p-5 rounded-3xl bg-white dark:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Full-width Title Header */}
                  <div className="w-full space-y-1.5">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {plan.name}
                      </h4>
                      {plan.badge && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="shrink-0">{getPlanIcon(plan.category)}</span>
                      <span>{plan.category}</span>
                      <span>•</span>
                      <span>{plan.durationDays} Days</span>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-semibold">
                        Price
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-display">
                        {formatPKR(plan.fixedAmount || plan.minAmount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider font-bold">
                        Daily ({plan.dailyProfitPercent}%)
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display">
                        +{formatPKR(plan.dailyProfitAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {plan.highlights.slice(0, 2).map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80 mt-3.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Return</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatPKR(plan.totalReturnAmount)} ({plan.totalRoiPercent}%)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="py-2 px-4 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    Invest
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Profit Calculator Tool */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Smart Daily Profit Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculate your guaranteed returns in Pakistani Rupees (Rs.)
                  </p>
                </div>
              </div>
            </div>

            {/* Select Plan dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Select Investment Package
                </label>
                <select
                  value={calcPlan.id}
                  onChange={(e) => {
                    const found = plans.find((p) => p.id === e.target.value);
                    if (found) {
                      setCalcPlan(found);
                      setCalcAmount(found.fixedAmount || found.minAmount);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatPKR(p.fixedAmount || p.minAmount)} ({p.dailyProfitPercent}%/day)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Plan Duration
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 flex justify-between items-center">
                  <span>{calcPlan.durationDays} Days Lock-in</span>
                  <span className="text-slate-400 text-[11px] font-normal">Capital Returned at End</span>
                </div>
              </div>
            </div>

            {/* Projected Returns Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">Daily Profit</span>
                <span className="text-base font-black text-emerald-400 font-display">
                  +{formatPKR(calcDailyProfit)}
                </span>
                <span className="text-[9px] text-slate-400 block">{calcPlan.dailyProfitPercent}% / 24h</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">7 Days Return</span>
                <span className="text-base font-black text-emerald-400 font-display">
                  +{formatPKR(calcWeeklyProfit)}
                </span>
                <span className="text-[9px] text-slate-400 block">Weekly Payout</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">Total Net Profit</span>
                <span className="text-base font-black text-amber-400 font-display">
                  +{formatPKR(calcTotalProfit)}
                </span>
                <span className="text-[9px] text-slate-400 block">Excl. Principal</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">Total Payout</span>
                <span className="text-base font-black text-white font-display">
                  {formatPKR(calcTotalWithCapital)}
                </span>
                <span className="text-[9px] text-emerald-400 block">Principal Included</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlanForDetail(calcPlan)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Invest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
