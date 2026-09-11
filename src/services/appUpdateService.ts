import { getApiUrl, getEffectiveApiBaseUrl, isNativePlatform } from '../config/api';
import { getInstalledAppVersion, compareVersions } from '../config/appVersion';

export interface ApkReleaseInfo {
  fileName: string;
  version: string;
  downloadUrl: string;
  fullDownloadUrl: string;
  sizeFormatted: string;
  modifiedAt: string;
}

export interface AppVersionCheckResult {
  success: boolean;
  installedVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  latestApkName: string;
  downloadUrl: string;
  fullDownloadUrl: string;
  sizeFormatted: string;
  releasedAt: string;
  allApks: ApkReleaseInfo[];
  error?: string;
}

export async function checkForAppUpdate(overrideCurrentVersion?: string): Promise<AppVersionCheckResult> {
  const installedVersion = overrideCurrentVersion || getInstalledAppVersion();

  try {
    const url = getApiUrl('/api/app/version');
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    if (data && data.success) {
      const latestVersion = data.latestVersion || '1.0';
      const hasUpdate = compareVersions(latestVersion, installedVersion) > 0;

      // In Capacitor native app, make sure downloadUrl is fully qualified
      const rawDownloadUrl: string = data.downloadUrl || '/investify.apk';
      let effectiveDownloadUrl = rawDownloadUrl;
      const apiBase = getEffectiveApiBaseUrl();

      if (rawDownloadUrl.startsWith('http://') || rawDownloadUrl.startsWith('https://')) {
        effectiveDownloadUrl = rawDownloadUrl;
      } else if (apiBase) {
        effectiveDownloadUrl = `${apiBase.replace(/\/+$/, '')}/${rawDownloadUrl.replace(/^\/+/, '')}`;
      } else if (typeof window !== 'undefined') {
        effectiveDownloadUrl = `${window.location.origin.replace(/\/+$/, '')}/${rawDownloadUrl.replace(/^\/+/, '')}`;
      }

      return {
        success: true,
        installedVersion,
        latestVersion,
        hasUpdate,
        latestApkName: data.latestApkName || 'Investify.apk',
        downloadUrl: effectiveDownloadUrl,
        fullDownloadUrl: data.fullDownloadUrl || effectiveDownloadUrl,
        sizeFormatted: data.sizeFormatted || '7.9 MB',
        releasedAt: data.releasedAt || new Date().toISOString(),
        allApks: data.allApks || [],
      };
    }
  } catch (err: any) {
    console.error('Failed to check for app updates:', err);
  }

  return {
    success: false,
    installedVersion,
    latestVersion: installedVersion,
    hasUpdate: false,
    latestApkName: 'Investify.apk',
    downloadUrl: '/investify.apk',
    fullDownloadUrl: '/investify.apk',
    sizeFormatted: '7.9 MB',
    releasedAt: new Date().toISOString(),
    allApks: [],
    error: 'Could not connect to update server.',
  };
}

/**
 * Triggers APK download in web browser or native environment
 */
export function triggerApkDownload(downloadUrl: string): void {
  if (!downloadUrl) return;

  const apiBase = getEffectiveApiBaseUrl();
  let fullUrl = downloadUrl;

  if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
    if (apiBase) {
      fullUrl = `${apiBase.replace(/\/+$/, '')}/${downloadUrl.replace(/^\/+/, '')}`;
    } else if (typeof window !== 'undefined') {
      fullUrl = `${window.location.origin.replace(/\/+$/, '')}/${downloadUrl.replace(/^\/+/, '')}`;
    }
  }

  if (isNativePlatform) {
    // In native webview, opening the external browser triggers the system package installer/download manager
    window.open(fullUrl, '_system');
  } else {
    // Standard web browser download
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fullUrl.split('/').pop() || 'Investify.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
