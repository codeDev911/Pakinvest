import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Users,
} from 'lucide-react';

export type TransactionType = 'deposit' | 'withdrawal' | 'referral' | 'bonus';

export interface FeedTransaction {
  id: string;
  userName: string;
  userPhone: string; // Cut number e.g. 0301***942
  type: TransactionType;
  amount: number;
}

interface ActiveFeedItem extends FeedTransaction {
  instanceId: string;
}

const FAKE_TRANSACTIONS: FeedTransaction[] = [
  {
    id: 'tx-1',
    userName: 'Muhammad Bilal',
    userPhone: '0301***942',
    type: 'deposit',
    amount: 5000,
  },
  {
    id: 'tx-2',
    userName: 'Kamran Akhtar',
    userPhone: '0345***218',
    type: 'withdrawal',
    amount: 4200,
  },
  {
    id: 'tx-3',
    userName: 'Hamza Tariq',
    userPhone: '0321***780',
    type: 'referral',
    amount: 1500,
  },
  {
    id: 'tx-4',
    userName: 'Zahid Khan',
    userPhone: '0333***415',
    type: 'deposit',
    amount: 10000,
  },
  {
    id: 'tx-5',
    userName: 'Farhan Sheikh',
    userPhone: '0312***990',
    type: 'withdrawal',
    amount: 7850,
  },
  {
    id: 'tx-6',
    userName: 'Babar Nawaz',
    userPhone: '0300***672',
    type: 'bonus',
    amount: 850,
  },
  {
    id: 'tx-7',
    userName: 'Usman Farooq',
    userPhone: '0342***831',
    type: 'deposit',
    amount: 25000,
  },
  {
    id: 'tx-8',
    userName: 'Sajid Mehmood',
    userPhone: '0322***109',
    type: 'withdrawal',
    amount: 12400,
  },
  {
    id: 'tx-9',
    userName: 'Waqas Ahmed',
    userPhone: '0307***544',
    type: 'referral',
    amount: 3200,
  },
  {
    id: 'tx-10',
    userName: 'Ali Raza',
    userPhone: '0315***326',
    type: 'deposit',
    amount: 1500,
  },
  {
    id: 'tx-11',
    userName: 'Adeel Rehman',
    userPhone: '0331***887',
    type: 'withdrawal',
    amount: 3600,
  },
  {
    id: 'tx-12',
    userName: 'Shahid Afridi',
    userPhone: '0346***712',
    type: 'bonus',
    amount: 1000,
  },
  {
    id: 'tx-13',
    userName: 'Imran Qureshi',
    userPhone: '0308***153',
    type: 'deposit',
    amount: 15000,
  },
  {
    id: 'tx-14',
    userName: 'Daniyal Khan',
    userPhone: '0323***645',
    type: 'withdrawal',
    amount: 18500,
  },
  {
    id: 'tx-15',
    userName: 'Arslan Aslam',
    userPhone: '0305***298',
    type: 'referral',
    amount: 2250,
  },
  {
    id: 'tx-16',
    userName: 'Khurram Shah',
    userPhone: '0334***501',
    type: 'deposit',
    amount: 50000,
  },
  {
    id: 'tx-17',
    userName: 'Naveed Iqbal',
    userPhone: '0313***739',
    type: 'withdrawal',
    amount: 6200,
  },
  {
    id: 'tx-18',
    userName: 'Omer Sheikh',
    userPhone: '0306***884',
    type: 'bonus',
    amount: 750,
  },
];

const getTypeConfig = (type: TransactionType) => {
  switch (type) {
    case 'deposit':
      return {
        icon: <ArrowDownLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
        badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
        amountColor: 'text-emerald-600 dark:text-emerald-400',
        prefix: '+',
      };
    case 'withdrawal':
      return {
        icon: <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
        badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25',
        amountColor: 'text-amber-600 dark:text-amber-400',
        prefix: '-',
      };
    case 'referral':
      return {
        icon: <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
        badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25',
        amountColor: 'text-blue-600 dark:text-blue-400',
        prefix: '+',
      };
    case 'bonus':
      return {
        icon: <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
        badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25',
        amountColor: 'text-purple-600 dark:text-purple-400',
        prefix: '+',
      };
  }
};

export const LivePlatformFeed: React.FC = () => {
  // Always maintain exactly 4 records in rows
  const [feedItems, setFeedItems] = useState<ActiveFeedItem[]>(() => {
    return FAKE_TRANSACTIONS.slice(0, 4).map((item, idx) => ({
      ...item,
      instanceId: `${item.id}-init-${idx}`,
    }));
  });

  const nextIndexRef = useRef<number>(4);

  // Cycle every 2.6 seconds: Top item disappears, remaining items slide up, and new one joins beneath the 3rd
  useEffect(() => {
    const timer = setInterval(() => {
      const idx = nextIndexRef.current;
      const nextTx = FAKE_TRANSACTIONS[idx % FAKE_TRANSACTIONS.length];
      nextIndexRef.current = (idx + 1) % FAKE_TRANSACTIONS.length;

      const newItem: ActiveFeedItem = {
        ...nextTx,
        instanceId: `${nextTx.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };

      // Drop the top item and append the new item at the bottom (after the 3rd record)
      setFeedItems((prev) => [...prev.slice(1), newItem]);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="live-user-activity-banner"
      className="my-3 sm:my-4 p-3 sm:p-3.5 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden relative transition-all"
    >
      {/* Feed Header: Title, Live Beacon & Description */}
      <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/80">
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
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide shrink-0">
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

      {/* 4 Rows in flex layout: Top disappears and new item is added to the bottom */}
      <div className="relative flex flex-col gap-1.5 overflow-hidden min-h-[148px]">
        <AnimatePresence initial={false} mode="popLayout">
          {feedItems.map((item) => {
            const config = getTypeConfig(item.type);
            return (
              <motion.div
                key={item.instanceId}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.98 }}
                transition={{
                  duration: 0.38,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors"
              >
                {/* Left: Small Icon & Name with Cut Number in a single flex line */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${config.badgeBg}`}
                    title={item.type.toUpperCase()}
                  >
                    {config.icon}
                  </div>

                  <div className="flex items-center gap-1.5 truncate text-[11px] sm:text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {item.userName}
                    </span>
                    <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      ({item.userPhone})
                    </span>
                  </div>
                </div>

                {/* Right: Amount in Roboto Slab */}
                <div
                  className={`text-[11px] sm:text-xs font-bold font-roboto-slab shrink-0 pl-2 tracking-tight ${config.amountColor}`}
                >
                  {config.prefix}Rs. {item.amount.toLocaleString()}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
