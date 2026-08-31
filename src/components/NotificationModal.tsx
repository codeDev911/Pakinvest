import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Users,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserNotification } from '../types';
import { formatPKR } from '../utils/formatters';

export const NotificationModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    clearAllNotifications,
  } = useApp();

  if (!isNotificationModalOpen) return null;

  const getNotificationIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'withdrawal_approved':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        );
      case 'withdrawal_declined':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'deposit_approved':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        );
      case 'deposit_declined':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'profit_unlocked':
      case 'profit_claimed':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'referral_reward':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <Users className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
            <Info className="w-5 h-5" />
          </div>
        );
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
          onClick={() => setIsNotificationModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Down to Up Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col overflow-hidden z-10"
        >
          {/* Top handle bar for mobile feel */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Notifications & Alerts
                  </h3>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                      {unreadNotificationsCount} New
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Status updates, payouts and wallet notifications
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNotificationModalOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <div className="px-5 py-2 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-500">
                {notifications.length} Total Messages
              </span>
              <div className="flex items-center gap-3">
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => markNotificationAsRead()}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => clearAllNotifications()}
                  className="text-rose-500 hover:text-rose-600 font-medium hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* List Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Notifications Yet
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  You will receive real-time notifications when your deposits, withdrawals, or daily profits are processed.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                    notif.read
                      ? 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 opacity-90'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/80 shadow-xs'
                  }`}
                >
                  {getNotificationIcon(notif.type)}

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${
                          notif.read
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {notif.amount && (
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                          {formatPKR(notif.amount)}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                      {notif.message}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{notif.timestamp}</span>
                      {!notif.read && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded-md">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 absolute top-4 right-3.5 animate-ping" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Notification Center</span>
            </div>
            <button
              onClick={() => setIsNotificationModalOpen(false)}
              className="py-2 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
