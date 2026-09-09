import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Coins,
  TrendingUp,
  Flame,
  Users,
  Lock,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TermsAndPoliciesPageProps {
  onBack?: () => void;
}

export const TermsAndPoliciesPage: React.FC<TermsAndPoliciesPageProps> = ({ onBack }) => {
  const { setCurrentTab } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Standalone Header with Title & Back Button - No standard Navbar or Bottom Tabs */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center active:scale-95"
              aria-label="Back to Application"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
                Terms & Platform Policies
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Rules, Capital Protection & Withdrawal Guidelines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden xs:inline">Compliance v2.4</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Executive Summary Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <FileText className="w-3.5 h-3.5" />
              Member Agreement
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
              Transparent, Sustainable & Fair Financial Rules
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl font-normal">
              Investify operates under strict algorithmic liquidity standards to ensure long-term stability for all investors. Please review these operational rules regarding capital allocation, withdrawal quotas, and daily loyalty incentives.
            </p>
          </div>
        </div>

        {/* Section 1: Non-Withdrawable Deposited Capital (Anti-Exploit Protection) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">
                Section 1 • Capital Policy
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                Deposited Funds Allocation & Anti-Exploit Safeguard
              </h3>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p>
              To maintain the integrity of our referral commissions system and prevent fraudulent circular cash-outs, <strong>funds deposited into your wallet are strictly designated for activating investment packages</strong> and cannot be withdrawn immediately as raw, uninvested capital.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Why is this rule essential?</span>
              </div>
              <p className="text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
                When a member deposits funds, direct and multi-tier commissions are immediately disbursed to their sponsor. If uninvested funds could be withdrawn right away, bad actors could repeatedly deposit and withdraw to artificially siphon referral bonuses without participating in investments.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-600 dark:text-rose-400 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Non-Withdrawable</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Uninvested raw deposits sitting in wallet before package activation.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Withdrawable Anytime</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily package profits, streak bonuses, and referral commissions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Daily Payout Quota & Withdrawal Limits */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-wider">
                Section 2 • Disbursal Policy
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                Withdrawal Quota, Limits & Gateways
              </h3>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>
                  <strong>Daily Request Quota:</strong> Each investor is permitted up to <strong>3 withdrawal requests per 24 hours</strong>. The quota resets automatically at 00:00 AM Pakistan Standard Time (PKT).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>
                  <strong>Thresholds:</strong> The minimum withdrawal threshold is <strong>Rs. 300</strong>, and the maximum limit per transaction is <strong>Rs. 500,000</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>
                  <strong>Supported Gateways:</strong> Disbursals are processed to JazzCash, EasyPaisa, Raast ID, SadaPay, NayaPay, and all State Bank of Pakistan registered commercial banks.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>
                  <strong>Processing Window:</strong> Standard withdrawals are vetted and disbursed within <strong>15 to 60 minutes</strong>. Banking network maintenance periods may take up to 24 hours.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Daily Streaks & Package Requirement */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">
                Section 3 • Loyalty Rewards
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                Active Package Requirement for Daily Streaks
              </h3>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p>
              Daily loyalty streak bonuses reward dedicated platform participants:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>
                  <strong>Active Package Mandate:</strong> Members must maintain <strong>at least one active investment package</strong> to check in and claim streak cash bonuses. Accounts with zero active packages cannot claim streaks.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>
                  <strong>Expiry Handling:</strong> If all active investment packages mature and conclude, streak check-ins pause until a new package is activated.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>
                  <strong>Streak Progression:</strong> Daily rewards escalate from Day 1 through Day 7. Missing a 24-hour cycle resets your streak to Day 1.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Referral Network & Fair Play */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-purple-600 dark:text-purple-400 tracking-wider">
                Section 4 • Community Program
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                Referral Commissions & Fair Play Standards
              </h3>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p>
              Investify offers a multi-tier referral program rewarding partners who bring genuine investors into the ecosystem:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span>
                  <strong>Tiered Payouts:</strong> Level 1 (Direct Referrals) earns up to 8% instant commission upon package activation. Level 2 and Level 3 earn downstream incentives.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span>
                  <strong>Zero-Tolerance Abuse Policy:</strong> Self-referrals, clone accounts, emulator farms, or manipulating fake deposit proofs will lead to immediate account suspension and forfeiture of illegitimate balances.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Security PIN & Account Safeguards */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                Section 5 • Security Standards
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                Transaction PIN & Authentication
              </h3>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p>
              Every withdrawal request and financial modification requires your personal <strong>4-Digit Security PIN</strong>.
            </p>
            <p>
              Platform representatives will <strong>NEVER</strong> ask for your password, PIN, or SMS verification codes. Keep your security credentials confidential at all times.
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Application</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('support')}
            className="py-3.5 px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all text-center flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Contact Helpdesk Support</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default TermsAndPoliciesPage;
