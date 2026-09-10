import React from 'react';
import { getWhatsAppChannelUrl } from '../../config/whatsapp';
import { ChevronRight, ShieldCheck, BellRing } from 'lucide-react';

export const WhatsAppChannelCard: React.FC = () => {
  const whatsappUrl = getWhatsAppChannelUrl();

  const handleJoin = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="home-whatsapp-channel-card"
      onClick={handleJoin}
      className="group relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white cursor-pointer transition-all active:scale-[0.99]"
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Authentic WhatsApp Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-white fill-white"
            >
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path
                d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"
                fill="none"
                stroke="#25D366"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Official Channel
              </span>
              <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1">
                <BellRing className="w-3 h-3 text-amber-300 animate-pulse" />
                Daily Updates
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-white mt-1 leading-snug truncate">
              Join Our WhatsApp Channel
            </h4>

            <p className="text-[11px] sm:text-xs text-emerald-100/90 line-clamp-1 mt-0.5">
              Instant payout proofs, daily profit alerts & announcements
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1 bg-white text-slate-900 dark:bg-emerald-400 dark:text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shrink-0 group-hover:bg-emerald-300 transition-colors shadow-xs">
          <span>Join</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
