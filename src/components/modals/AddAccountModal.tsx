import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GatewayType } from '../../types';
import { X, Smartphone, CreditCard, Building2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AddAccountModal: React.FC = () => {
  const { isAddAccountModalOpen, setIsAddAccountModalOpen, addPaymentAccount, user } = useApp();
  const [gateway, setGateway] = useState<GatewayType>('JazzCash');
  const [accountTitle, setAccountTitle] = useState<string>(user.name);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Meezan Bank');
  const [isDefault, setIsDefault] = useState<boolean>(true);

  if (!isAddAccountModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountTitle.trim() || !accountNumber.trim()) {
      alert('Please fill all required account fields.');
      return;
    }

    addPaymentAccount({
      gateway,
      accountTitle,
      accountNumber,
      bankName: gateway === 'Bank_Transfer' ? bankName : undefined,
      isDefault,
    });

    setIsAddAccountModalOpen(false);
    setAccountNumber('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAddAccountModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Link New Payment Method
            </h3>
            <button
              onClick={() => setIsAddAccountModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Gateway */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['JazzCash', 'EasyPaisa', 'Raast', 'Bank_Transfer'] as GatewayType[]).map((gw) => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => setGateway(gw)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      gateway === gw
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white ring-1 ring-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {gw === 'Bank_Transfer' ? 'Bank Account' : gw}
                  </button>
                ))}
              </div>
            </div>

            {gateway === 'Bank_Transfer' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Meezan Bank">Meezan Bank</option>
                  <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                  <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                  <option value="Bank Alfalah">Bank Alfalah</option>
                  <option value="SadaPay">SadaPay</option>
                  <option value="NayaPay">NayaPay</option>
                  <option value="MCB Bank">MCB Bank</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Title (Must Match CNIC)
              </label>
              <input
                type="text"
                required
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="e.g. Afnan Ahmed"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {gateway === 'Bank_Transfer' ? 'IBAN or Account Number' : `${gateway} Mobile Number`}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={gateway === 'Bank_Transfer' ? 'PK82MEZN...' : '0300-1234567'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="defaultAcc"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="defaultAcc" className="text-xs text-slate-600 dark:text-slate-400">
                Set as default withdrawal account
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                Save Payment Method
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
