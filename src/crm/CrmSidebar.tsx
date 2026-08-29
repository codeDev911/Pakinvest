import React from 'react';
import { CrmNavTab } from '../types';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Users,
  CreditCard,
  Receipt,
  LogOut,
  Smartphone,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface CrmSidebarProps {
  currentTab: CrmNavTab;
  onTabChange: (tab: CrmNavTab) => void;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  adminName: string;
  onLogout: () => void;
  onSwitchToClient: () => void;
}

export const CrmSidebar: React.FC<CrmSidebarProps> = ({
  currentTab,
  onTabChange,
  pendingDepositsCount,
  pendingWithdrawalsCount,
  adminName,
  onLogout,
  onSwitchToClient,
}) => {
  const navItems: { id: CrmNavTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Dashboard & Metrics',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'deposits',
      label: 'Deposit Approvals',
      icon: <ArrowDownLeft className="w-4 h-4" />,
      badge: pendingDepositsCount,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'withdrawals',
      label: 'Withdrawal Payouts',
      icon: <ArrowUpRight className="w-4 h-4" />,
      badge: pendingWithdrawalsCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'plans',
      label: 'Investment Packages',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Investors Directory',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'gateways',
      label: 'Payment Channels',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'ledger',
      label: 'Financial Ledger',
      icon: <Receipt className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-white tracking-tight">PakInvest</h2>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Team Management Portal</p>
          </div>
        </div>

        {/* Quick link to preview client app */}
        <button
          type="button"
          onClick={onSwitchToClient}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-between transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Open Client App</span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2">
          Management Controls
        </p>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Operator Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-white">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate max-w-[110px]">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Operator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 transition-colors"
            title="Lock & Exit CRM"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

