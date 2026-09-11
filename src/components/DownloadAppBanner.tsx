import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { isNativePlatform } from '../config/api';
import { checkForAppUpdate, triggerApkDownload } from '../services/appUpdateService';

export const DownloadAppBanner: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [latestApkName, setLatestApkName] = useState<string>('Investify.apk');
  const [downloadUrl, setDownloadUrl] = useState<string>('/api/download-apk');
  const [latestVersion, setLatestVersion] = useState<string>('');

  useEffect(() => {
    checkForAppUpdate().then((res) => {
      if (res && res.latestApkName) {
        setLatestApkName(res.latestApkName);
        setDownloadUrl(res.downloadUrl);
        if (res.latestVersion) {
          setLatestVersion(`v${res.latestVersion}`);
        }
      }
    });
  }, []);

  // Strictly hide the download banner when running inside the Android APK
  if (isNativePlatform) {
    return null;
  }

  const handleDownload = () => {
    setDownloading(true);
    triggerApkDownload(downloadUrl);
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
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
            <span>Investify App</span>
            {latestVersion && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold">
                {latestVersion}
              </span>
            )}
          </h4>
          <span className="text-[10px] text-slate-400 block truncate font-mono">
            {latestApkName}
          </span>
        </div>
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

