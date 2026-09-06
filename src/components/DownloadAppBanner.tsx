import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { isNativePlatform, ANDROID_APK_DOWNLOAD_URL } from '../config/api';

export const DownloadAppBanner: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  // Strictly hide the download banner when running inside the Android APK
  if (isNativePlatform) {
    return null;
  }

  const handleDownload = () => {
    setDownloading(true);

    // If external URL (e.g. GitHub Releases, Firebase Storage, Drive, CDN), open directly
    if (ANDROID_APK_DOWNLOAD_URL.startsWith('http')) {
      window.open(ANDROID_APK_DOWNLOAD_URL, '_blank');
      setTimeout(() => setDownloading(false), 1500);
      return;
    }

    // Direct browser navigation to the APK endpoint forces standard browser binary download
    window.location.href = ANDROID_APK_DOWNLOAD_URL;

    setTimeout(() => {
      setDownloading(false);
    }, 2500);
  };

  return (
    <div
      id="download-app-banner"
      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 transition-all hover:border-emerald-500/50"
    >
      {/* App Icon + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 overflow-hidden shadow-2xs">
          <img
            src="/favicon.png"
            alt="Investify App Icon"
            className="w-7 h-7 object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              Investify Android App
            </h4>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
              APK
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Fast 1-tap login & payout alerts
          </p>
        </div>
      </div>

      {/* Compact Download Button */}
      <button
        id="download-apk-action-btn"
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-75 active:scale-95"
      >
        <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
        <span>{downloading ? 'Downloading...' : 'Download'}</span>
      </button>
    </div>
  );
};

