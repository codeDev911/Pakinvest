import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Headphones,
  MessageSquare,
  Send,
  Mail,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  Sparkles,
  ExternalLink,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getApiUrl } from '../../config/api';
import { FaqItem } from '../../types';

interface SupportPageProps {
  onBack?: () => void;
}

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Deposits & Withdrawals',
    question: 'Can I withdraw my deposited capital directly without investing?',
    answer: 'No. To maintain the financial security of the platform and prevent referral commission exploitation, all deposited funds are designated for purchasing investment packages. Once invested, your packages generate daily profits, streak bonuses, and referral commissions—all of which are 100% withdrawable to your JazzCash, EasyPaisa, Raast, or Bank Account at any time.',
    order: 1,
    isActive: true,
  },
  {
    id: 'faq-2',
    category: 'Deposits & Withdrawals',
    question: 'What are the withdrawal limits and daily quotas?',
    answer: 'Each account can request up to 3 withdrawals per 24-hour cycle. The minimum withdrawal threshold is Rs. 300, and the maximum is Rs. 500,000 per request. Withdrawals are processed through JazzCash, EasyPaisa, Raast, and all registered commercial banks in Pakistan.',
    order: 2,
    isActive: true,
  },
  {
    id: 'faq-3',
    category: 'Deposits & Withdrawals',
    question: 'How long does it take for deposits to reflect in my balance?',
    answer: 'Once you transfer the funds to our official merchant account and submit the transaction receipt, our automated reconciliation and finance desk approves and credits your balance within 5 to 20 minutes during working hours.',
    order: 3,
    isActive: true,
  },
  {
    id: 'faq-4',
    category: 'Investment Packages',
    question: 'How does daily profit crediting work?',
    answer: 'Profits accrue continuously on your active investment packages based on the contractual ROI percentage. You can claim or withdraw your earned profits daily into your withdrawable balance.',
    order: 4,
    isActive: true,
  },
  {
    id: 'faq-5',
    category: 'Streaks & Rewards',
    question: 'Why are daily check-in streaks locked on my account?',
    answer: 'Daily streak loyalty rewards are an exclusive benefit for active investors. You must hold at least one active investment package to claim daily check-in cash bonuses. Simply activate any package to unlock your 7-day bonus roadmap.',
    order: 5,
    isActive: true,
  },
  {
    id: 'faq-6',
    category: 'Account & Security',
    question: 'What is the 4-digit security PIN and how is it used?',
    answer: 'The 4-digit security PIN safeguards your payouts and sensitive settings. Default PIN is set to 1234. You can change your PIN anytime in Settings > Security. Never share your PIN or OTP with anyone.',
    order: 6,
    isActive: true,
  },
  {
    id: 'faq-7',
    category: 'Referrals & Earnings',
    question: 'How do referral commissions work?',
    answer: 'When a new member registers using your referral invite link and activates an investment package, you automatically earn instant referral commission credited directly to your withdrawable balance.',
    order: 7,
    isActive: true,
  },
  {
    id: 'faq-8',
    category: 'Support & Help',
    question: 'How do I contact customer support if I have an issue?',
    answer: 'Our VIP Helpdesk operates 24/7. You can contact our dedicated support agents directly through WhatsApp, join our official Telegram community, or email our support desk at support@investify.pk.',
    order: 8,
    isActive: true,
  },
];

export const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
  const { setCurrentTab, showToast } = useApp();
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Load FAQs from CRM Backend
  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/faqs'));
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data?.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
      }
    } catch (e) {
      console.warn('Failed to load FAQs from backend, using local defaults:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentTab('home');
    }
  };

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category || 'General')))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar with Back Button & Support Badge */}
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
                Help & VIP Support
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                24/7 Official Assistance & FAQ Knowledge Base
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Desk Online</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Support Hero Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Headphones className="w-3.5 h-3.5" />
              Priority Assistance
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
              How can our team help you today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Connect directly with our VIP account executives on WhatsApp, join our official announcement community on Telegram, or browse our platform FAQs below.
            </p>
          </div>
        </div>

        {/* Direct Channels Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp Support */}
          <a
            href="https://wa.me/923000000000?text=Hello%20Investify%20Support,%20I%20need%20assistance%20with%20my%20account"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                WhatsApp VIP Desk
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Instant 1-on-1 chat for deposits, withdrawals & accounts
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Start Chat &rarr;
            </span>
          </a>

          {/* Telegram Channel */}
          <a
            href="https://t.me/investify_official"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Telegram Channel
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Daily news, reward promos, and payment proofs
              </p>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              Join Community &rarr;
            </span>
          </a>
        </div>

        {/* FAQs Knowledge Base Header & Controls */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                <span>Frequently Asked Questions</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredFaqs.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Managed in real-time by Investify CRM Operations
              </p>
            </div>
            <button
              type="button"
              onClick={fetchFaqs}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors"
              title="Refresh FAQs from Server"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, e.g. 'withdraw', 'streaks', 'deposit'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No FAQs matching &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-slate-400">
                  Try a different search keyword or contact our WhatsApp support desk directly.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl transition-all overflow-hidden bg-white dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 focus:outline-none"
                    >
                      <div className="space-y-1 pr-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {faq.category || 'General'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {faq.question}
                        </h4>
                      </div>
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                        <p className="pt-2">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Footer Support Notice */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-center space-y-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Didn&apos;t find your answer?
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Our finance and verification officers are ready to assist you on WhatsApp 24/7.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
