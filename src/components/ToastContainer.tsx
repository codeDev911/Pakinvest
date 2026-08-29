import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-16 sm:top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              {t.type === 'success' && (
                <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {t.type === 'error' && (
                <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {t.type === 'warning' && (
                <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {t.type === 'info' && (
                <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.title}
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
