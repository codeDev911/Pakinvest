import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_REFERRAL_MEMBERS } from '../../data/mockData';
import { formatPKR } from '../../utils/formatters';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Gift,
  Award,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ReferralTab: React.FC = () => {
  const { user, claimReferralBonus, showToast, referralNetwork } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [showQr, setShowQr] = useState(false);

  const inviteUrl = `${window.location.origin}/join?ref=${user.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    showToast('Code Copied', `Referral code ${user.referralCode} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    showToast('Link Copied', 'Invite link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🇵🇰 Join Investify - Earn guaranteed daily profits in Pakistani Rupees (Rs.) on your investments with instant JazzCash & EasyPaisa withdrawals!\n\nUse my invite code: *${user.referralCode}*\nSign up here: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Live real members from database or referral network
  const members = referralNetwork.members.length > 0
    ? referralNetwork.members
    : (user.referralEarnings > 0 ? INITIAL_REFERRAL_MEMBERS : []);

  const filteredMembers = selectedTier === 'all'
    ? members
    : members.filter((m) => m.tier === selectedTier);

  const totalTeamVolume = referralNetwork.totalTeamVolume > 0
    ? referralNetwork.totalTeamVolume
    : members.reduce((acc, m) => acc + m.totalDeposited, 0);

  const totalActiveInvestors = members.filter((m) => m.status === 'Active' || m.totalDeposited > 0).length;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Referral Network & Commissions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Invite friends & build a 3-tier passive income team across Pakistan
        </p>
      </div>

      {/* Main Referral Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-800/40 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-300">My Referral Program</span>
              <h3 className="text-base font-black text-white">Earn Unlimited Cash in Rs.</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Gift className="w-3.5 h-3.5" />
            <span>Up to 15% Total</span>
          </div>
        </div>

        {/* Code & Link Share Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Code Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-800/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Your Referral Code</span>
              <span className="text-base font-mono font-black text-amber-400 tracking-wider">
                {user.referralCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <div className="flex gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Copy Full Invite Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Unclaimed Commission Box */}
        <div className="p-3.5 rounded-2xl bg-indigo-900/40 border border-indigo-700/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-300 block">Pending Unclaimed Commission</span>
            <span className="text-base font-extrabold text-amber-400 font-display">
              +{formatPKR(user.unclaimedReferralEarnings)}
            </span>
          </div>

          <button
            onClick={claimReferralBonus}
            disabled={user.unclaimedReferralEarnings <= 0}
            className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transfer to Wallet</span>
          </button>
        </div>
      </div>

      {/* 3-Tier Commission Structure Explainer */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          3-Tier Multi-Level Commission Structure
        </h3>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Level 1 (Direct)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display">
              10%
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">On every direct deposit</p>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Level 2 (Team)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display">
              4%
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">From sub-referrals</p>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              Level 3 (Network)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-display">
              1%
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Extended network</p>
          </div>
        </div>
      </div>

      {/* Referral Team Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Total Team Size</span>
          <span className="text-base font-black text-slate-900 dark:text-white font-display">
            {members.length} Members
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Active Investors</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display">
            {totalActiveInvestors} Active
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Team Investment Volume</span>
          <span className="text-base font-black text-slate-900 dark:text-white font-display">
            {formatPKR(totalTeamVolume)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Total Commission Earned</span>
          <span className="text-base font-black text-amber-500 font-display">
            +{formatPKR(user.referralEarnings)}
          </span>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Team Members
          </h3>

          {/* Tier filter buttons */}
          <div className="flex gap-1">
            {['all', 1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedTier === t
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t === 'all' ? 'All' : `L${t}`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredMembers.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Team Members Yet {selectedTier !== 'all' ? `in Level ${selectedTier}` : ''}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Share your referral code <span className="font-mono font-bold text-amber-500">{user.referralCode}</span> with friends or on WhatsApp to start earning up to 15% instant commissions on their deposits!
                </p>
              </div>
              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Invite on WhatsApp</span>
              </button>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                    L{member.tier}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        {member.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {member.phoneMasked} • Joined {member.joinedDate}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block font-display">
                    Deposit: {formatPKR(member.totalDeposited)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Earned: +{formatPKR(member.commissionEarned)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
