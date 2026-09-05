import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck, Zap } from 'lucide-react';
import { isNativePlatform } from '../config/api';

export const DownloadAppBanner: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // CRITICAL: Strictly hide the download banner when running inside the Android APK
  if (isNativePlatform) {
    return null;
  }

  const handleDownload = () => {
    setDownloading(true);

    // Trigger download of the APK file
    const link = document.createElement('a');
    link.href = '/investify.apk';
    link.download = 'Investify.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <div
      id="download-app-banner"
      className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border border-emerald-500/30 shadow-md relative overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  Investify for Android
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Official APK
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Real-time mobile push notifications & fast 1-tap PIN login
              </p>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 pt-1">
          <button
            id="download-apk-action-btn"
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
            <span>{downloading ? 'Downloading APK...' : 'Download Android App (.APK)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="py-3 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-white/10"
          >
            <span>Install Guide</span>
            {showInstructions ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Collapsible Step-by-Step Installation Guide */}
        {showInstructions && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs space-y-2.5 mt-2 animate-in fade-in duration-200">
            <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
              3 Quick Steps to Install on Android
            </span>
            <div className="space-y-2 text-slate-300 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>Click the <strong>Download Android App</strong> button above to save <code>Investify.apk</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>Open the downloaded file. When prompted, tap <strong>Settings</strong> and allow <em>Install unknown apps</em> for your browser.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Tap <strong>Install</strong>, launch Investify, and allow notifications to receive instant payout alerts!</span>
              </div>
            </div>
          </div>
        )}

        {/* Feature Pills */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-0.5 border-t border-white/10">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Safe</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Lightweight (1.4 MB)</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Android 8.0+</span>
          </span>
        </div>
      </div>
    </div>
  );
};
