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
      className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-between gap-3 transition-all"
    >
      {/* App Icon + Title Only */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 overflow-hidden">
          <img
            src="/favicon.png"
            alt="Investify"
            className="w-6 h-6 object-contain"
          />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
          Investify App
        </h4>
      </div>

      {/* Download Button */}
      <button
        id="download-apk-action-btn"
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-75 active:scale-95"
      >
        <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
        <span>{downloading ? 'Downloading...' : 'Download'}</span>
      </button>
    </div>
  );
};

