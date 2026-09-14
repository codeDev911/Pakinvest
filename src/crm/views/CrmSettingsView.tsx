import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  ShieldAlert,
  Server,
  Lock,
  CheckCircle2,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getApiUrl } from '../../config/api';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmSettingsViewProps {
  adminName: string;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

interface TotpDetails {
  isConfigured: boolean;
  enabled: boolean;
  configuredAt: string | null;
  configuredBy: string | null;
  secret: string | null;
  formattedSecret: string | null;
  maskedSecret: string | null;
  otpauthUrl: string | null;
}

export const CrmSettingsView: React.FC<CrmSettingsViewProps> = ({ adminName, showToast }) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  // Active TOTP Config from DB
  const [totpData, setTotpData] = useState<TotpDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  // Regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastRegeneratedAt, setLastRegeneratedAt] = useState<string | null>(null);

  // Live Test Verifier
  const [testCodeInput, setTestCodeInput] = useState('');
  const [isTestingCode, setIsTestingCode] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Alerts / messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current TOTP key directly from PostgreSQL
  const fetchTotpStatus = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl(`/api/admin/totp/details?t=${Date.now()}`), {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data?.success) {
        setTotpData(data);
        if (data.configuredAt) {
          setLastRegeneratedAt(data.configuredAt);
        }
      } else {
        throw new Error(data?.error || 'Failed to fetch TOTP status from database');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to communicate with backend database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTotpStatus();
  }, []);

  // Real-time Regenerate Key and save immediately to PostgreSQL database
  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    setErrorMsg('');
    setSuccessMsg('');
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/regenerate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify({ operatorName: adminName || 'Admin Manager' }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to regenerate key from backend');
      }

      // Real-time update in state from live DB response
      setTotpData({
        isConfigured: true,
        enabled: true,
        configuredAt: data.configuredAt,
        configuredBy: data.configuredBy,
        secret: data.secret,
        formattedSecret: data.formattedSecret,
        maskedSecret: data.maskedSecret,
        otpauthUrl: data.otpauthUrl,
      });

      setLastRegeneratedAt(data.configuredAt || new Date().toISOString());
      setTestCodeInput('');
      setSuccessMsg(
        `✓ REAL-TIME DATABASE KEY UPDATED! New key "${data.formattedSecret || data.secret}" has been written to the PostgreSQL database. All previous keys are now invalidated.`
      );

      if (showToast) {
        showToast('Key Regenerated & Saved in DB', 'New Authenticator key is active in database.', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error regenerating authenticator key in database');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Test current 6-digit code against saved key in real-time
  const handleTestLiveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = testCodeInput.replace(/\D/g, '').trim();
    if (clean.length !== 6) return;

    setIsTestingCode(true);
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorName: adminName || 'Admin Operator',
          totpCode: clean,
          accessCode: '7860',
        }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        setTestResult({
          success: true,
          message: '6-digit code verified successfully! Your authenticator app and server are perfectly in sync.',
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error || 'Verification code failed. Ensure your authenticator app time is synced.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Verification failed. Could not reach server.',
      });
    } finally {
      setIsTestingCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
    if (showToast) {
      showToast('Copied to Clipboard', 'Authenticator key copied successfully.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl border transition-colors ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  CRM Security & Authenticator Key Settings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>PostgreSQL Active</span>
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                RFC 6238 Time-based One-Time Password (TOTP) 2FA. Keys are persisted in the database and authenticate in real-time.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-refresh-totp-status"
            onClick={fetchTotpStatus}
            disabled={isLoading}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-300 block">Database Key Updated</span>
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Active Key & Sync Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column: Active Key & Real-Time Regeneration */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className={`p-6 rounded-3xl border transition-colors space-y-6 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Database Authenticator Secret Key
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Live in Database</span>
              </span>
            </div>

            {/* Secret Key Display Box */}
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active Secret Key (Paste in Authenticator App)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">RFC 6238 Base32</span>
                </div>

                <div className="flex items-center gap-3">
                  <code className="flex-1 font-mono text-sm sm:text-base font-bold text-emerald-400 select-all tracking-wider break-all bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
                    {totpData?.formattedSecret || totpData?.secret || 'Loading active key...'}
                  </code>
                  {totpData?.secret && (
                    <button
                      type="button"
                      id="btn-copy-active-totp"
                      onClick={() => copyToClipboard(totpData.secret!)}
                      className="px-3.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-emerald-900/30"
                      title="Copy Key"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code & Scan Helper */}
              {totpData?.otpauthUrl && (
                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-emerald-500/50 shrink-0">
                    <QRCodeSVG value={totpData.otpauthUrl} size={135} level="M" />
                  </div>
                  <div className="space-y-2 text-center sm:text-left text-xs">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan with Phone Camera</span>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      Google Authenticator or Authy
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Scan this QR code in your authenticator app to automatically set up the 30-second rotating 6-digit code.
                    </p>
                  </div>
                </div>
              )}

              {/* Key Metadata Details */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block font-medium">Configured By</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {totpData?.configuredBy || adminName || 'Admin Manager'}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block font-medium">Last Saved / Regenerated</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {lastRegeneratedAt
                      ? new Date(lastRegeneratedAt).toLocaleString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Regenerate Key */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <button
                type="button"
                id="btn-generate-authenticator-key"
                onClick={handleRegenerateKey}
                disabled={isRegenerating}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>
                  {isRegenerating ? 'Regenerating & Saving to Database...' : 'Regenerate New Key in Database (Real-Time)'}
                </span>
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                Clicking this will instantly generate a new Base32 secret key, save it directly to the PostgreSQL database, and invalidate all old keys immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Code Synchronizer Tester & Security Steps */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Code Verifier */}
          <div
            className={`p-6 rounded-3xl border transition-colors space-y-4 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Test Live Authenticator Code
              </h2>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              After adding the key or scanning the QR code, type the 6-digit code displayed in your app to confirm real-time synchronization.
            </p>

            <form onSubmit={handleTestLiveCode} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="input-test-authenticator-code"
                  value={testCodeInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setTestCodeInput(val);
                  }}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  className={`flex-1 px-4 py-3 rounded-xl border text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-emerald-400 placeholder:text-slate-700'
                      : 'bg-slate-50 border-slate-300 text-emerald-700 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  id="btn-test-authenticator-code"
                  disabled={isTestingCode || testCodeInput.length !== 6}
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isTestingCode ? 'Checking...' : 'Verify Code'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
                    testResult.success
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span className="font-medium">{testResult.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Quick Setup Instructions */}
          <div
            className={`p-6 rounded-3xl border transition-colors space-y-3.5 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                How Real-Time 2FA Works
              </h3>
            </div>
            <ol className="text-xs space-y-2.5 text-slate-400 list-decimal list-inside">
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Add Key to Authenticator:</strong> Tap &quot;+&quot; in Google Authenticator or Authy and scan the QR code, or paste the secret key above.
              </li>
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Instant Invalidation:</strong> Whenever you click &quot;Regenerate New Key&quot;, the database is immediately overwritten. Old keys become invalid instantly.
              </li>
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Login Verification:</strong> On future logins to PakInvest CRM, enter the 6-digit code currently visible on your phone.
              </li>
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Time Synchronization:</strong> Codes rotate every 30 seconds. Ensure your phone clock is set to Automatic network time.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
