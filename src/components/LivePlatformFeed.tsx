import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPKR } from '../utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface FeedTransaction {
  id: string;
  userName: string;
  userPhone: string;
  type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  gateway: string;
  label: string;
}

const FAKE_TRANSACTIONS: FeedTransaction[] = [
  {
    id: 'tx-1',
    userName: 'Muhammad Bilal',
    userPhone: '0301***942',
    type: 'deposit',
    amount: 5000,
    gateway: 'JazzCash',
    label: 'Deposit',
  },
  {
    id: 'tx-2',
    userName: 'Kamran Akhtar',
    userPhone: '0345***218',
    type: 'withdrawal',
    amount: 4200,
    gateway: 'EasyPaisa',
    label: 'Withdrawal',
  },
  {
    id: 'tx-3',
    userName: 'Hamza Tariq',
    userPhone: '0321***780',
    type: 'bonus',
    amount: 1500,
    gateway: 'Referral Bonus',
    label: 'Bonus Reward',
  },
  {
    id: 'tx-4',
    userName: 'Zahid Khan',
    userPhone: '0333***415',
    type: 'deposit',
    amount: 10000,
    gateway: 'Raast',
    label: 'Deposit',
  },
  {
    id: 'tx-5',
    userName: 'Farhan Sheikh',
    userPhone: '0312***990',
    type: 'withdrawal',
    amount: 7850,
    gateway: 'JazzCash',
    label: 'Withdrawal',
  },
  {
    id: 'tx-6',
    userName: 'Babar Nawaz',
    userPhone: '0300***672',
    type: 'bonus',
    amount: 500,
    gateway: 'Streak Reward',
    label: 'Bonus Reward',
  },
  {
    id: 'tx-7',
    userName: 'Usman Farooq',
    userPhone: '0342***831',
    type: 'deposit',
    amount: 25000,
    gateway: 'Meezan Bank',
    label: 'Deposit',
  },
  {
    id: 'tx-8',
    userName: 'Sajid Mehmood',
    userPhone: '0322***109',
    type: 'withdrawal',
    amount: 12400,
    gateway: 'EasyPaisa',
    label: 'Withdrawal',
  },
  {
    id: 'tx-9',
    userName: 'Waqas Ahmed',
    userPhone: '0307***544',
    type: 'bonus',
    amount: 3000,
    gateway: 'Team Royalty',
    label: 'Bonus Reward',
  },
  {
    id: 'tx-10',
    userName: 'Ali Raza',
    userPhone: '0315***326',
    type: 'deposit',
    amount: 1000,
    gateway: 'JazzCash',
    label: 'Deposit',
  },
  {
    id: 'tx-11',
    userName: 'Adeel Rehman',
    userPhone: '0331***887',
    type: 'withdrawal',
    amount: 3600,
    gateway: 'Raast',
    label: 'Withdrawal',
  },
  {
    id: 'tx-12',
    userName: 'Shahid Afridi',
    userPhone: '0346***712',
    type: 'bonus',
    amount: 1000,
    gateway: 'Grand Jackpot',
    label: 'Bonus Reward',
  },
  {
    id: 'tx-13',
    userName: 'Imran Qureshi',
    userPhone: '0308***153',
    type: 'deposit',
    amount: 15000,
    gateway: 'EasyPaisa',
    label: 'Deposit',
  },
  {
    id: 'tx-14',
    userName: 'Daniyal Khan',
    userPhone: '0323***645',
    type: 'withdrawal',
    amount: 18500,
    gateway: 'Bank Alfalah',
    label: 'Withdrawal',
  },
  {
    id: 'tx-15',
    userName: 'Arslan Aslam',
    userPhone: '0305***298',
    type: 'bonus',
    amount: 2250,
    gateway: 'Referral Bonus',
    label: 'Bonus Reward',
  },
  {
    id: 'tx-16',
    userName: 'Khurram Shah',
    userPhone: '0334***501',
    type: 'deposit',
    amount: 50000,
    gateway: 'Meezan Bank',
    label: 'Deposit',
  },
  {
    id: 'tx-17',
    userName: 'Naveed Iqbal',
    userPhone: '0313***739',
    type: 'withdrawal',
    amount: 6200,
    gateway: 'JazzCash',
    label: 'Withdrawal',
  },
  {
    id: 'tx-18',
    userName: 'Omer Sheikh',
    userPhone: '0306***884',
    type: 'bonus',
    amount: 750,
    gateway: 'Level 1 Bonus',
    label: 'Bonus Reward',
  },
];

const FeedItemRow: React.FC<{ item: FakeTransaction }> = ({ item }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let frameId: number;
    const duration = 500; // ms
    const startTime = performance.now();
    const target = item.amount;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [item.id, item.amount]);

  const typeConfig = useMemo(() => {
    switch (item.type) {
      case 'deposit':
        return {
          icon: <ArrowDownLeft className="w-4 h-4" />,
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          amountColor: 'text-emerald-600 dark:text-emerald-400',
          prefix: '+',
          title: 'Deposit Verified',
        };
      case 'withdrawal':
        return {
          icon: <ArrowUpRight className="w-4 h-4" />,
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          amountColor: 'text-amber-600 dark:text-amber-400',
          prefix: '-',
          title: 'Withdrawal Dispatched',
        };
      case 'bonus':
        return {
          icon: <Sparkles className="w-4 h-4" />,
          badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          amountColor: 'text-purple-600 dark:text-purple-400',
          prefix: '+',
          title: 'Bonus Credited',
        };
    }
  }, [item.type]);

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Left: Icon + User Details */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${typeConfig.badgeBg}`}
        >
          {typeConfig.icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {item.userName}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              ({item.userPhone})
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase tracking-wide ${typeConfig.badgeBg}`}
            >
              {item.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="truncate">{typeConfig.title}</span>
            <span>•</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {item.gateway}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Animated Count in Roboto Slab Font */}
      <div className="text-right shrink-0 pl-2">
        <div
          className={`text-sm sm:text-base font-bold font-roboto-slab tracking-tight ${typeConfig.amountColor}`}
        >
          {typeConfig.prefix}Rs. {count.toLocaleString()}
        </div>
        <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-500 font-semibold mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Just now</span>
        </div>
      </div>
    </div>
  );
};

export const LivePlatformFeed: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = FAKE_TRANSACTIONS[currentIndex % FAKE_TRANSACTIONS.length];

  // Cycle to next item every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FAKE_TRANSACTIONS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="live-user-activity-banner"
      className="my-3.5 sm:my-5 p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/50 overflow-hidden relative transition-all"
    >
      {/* Feed Header: Title & Description */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Live Platform Activity
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 uppercase tracking-wide shrink-0">
                24/7 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Verified deposits, instant cashouts & bonus payouts across Pakistan
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Real-Time Stream</span>
        </div>
      </div>

      {/* Upward Continuous Push Reel: New item enters from bottom pushing old item up simultaneously */}
      <div className="relative h-[48px] sm:h-[50px] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentItem.id + '-' + currentIndex}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{
              duration: 0.55,
              ease: [0.25, 1, 0.5, 1], // Smooth cubic push curve
            }}
            className="absolute inset-0 flex items-center w-full"
          >
            <FeedItemRow item={currentItem} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
