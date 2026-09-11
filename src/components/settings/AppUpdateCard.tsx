import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Sparkles } from 'lucide-react';
import { checkForAppUpdate, triggerApkDownload, AppVersionCheckResult } from '../../services/appUpdateService';
import { APP_VERSION } from '../../config/appVersion';
import { isNativePlatform } from '../../config/api';

export const AppUpdateCard: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<AppVersionCheckResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Only show inside the Android APK (native platform), strictly not in web
  const shouldRender = isNativePlatform || (typeof window !== 'undefined' && window.location.search.includes('simulate_apk=true'));

  useEffect(() => {
    if (!shouldRender) return;

    checkForAppUpdate().then((info) => {
      setUpdateInfo(info);
    });
  }, [shouldRender]);

  if (!shouldRender) {
    return null;
  }

  if (!updateInfo) {
    return null;
  }

  const handleDownload = () => {
    setIsDownloading(true);
    triggerApkDownload(updateInfo.downloadUrl);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  if (updateInfo.hasUpdate) {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white block truncate">
              New update available (v{updateInfo.latestVersion})
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-mono">
              Current: v{APP_VERSION} • {updateInfo.latestApkName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-70"
        >
          <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
          <span>{isDownloading ? 'Downloading...' : 'Click to download'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">
            App is up to date
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
            Investify v{APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
};
