import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  QrCode,
  ShieldAlert,
  Server,
  Lock,
  CheckCircle2,
  Sparkles,
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
  const [showActiveSecret, setShowActiveSecret] = useState(false);
  const [copiedActiveKey, setCopiedActiveKey] = useState(false);

  // New Generation / Regeneration State
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSecret, setNewSecret] = useState('');
  const [newFormattedSecret, setNewFormattedSecret] = useState('');
  const [newOtpauthUrl, setNewOtpauthUrl] = useState('');
  const [copiedNewKey, setCopiedNewKey] = useState(false);
  const [verifyTestCode, setVerifyTestCode] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Live Test Verifier
  const [testCodeInput, setTestCodeInput] = useState('');
  const [isTestingCode, setIsTestingCode] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Alerts / messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current TOTP key and status from PostgreSQL
  const fetchTotpStatus = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl('/api/admin/totp/status'));
      const data = await res.json();
      if (data?.success) {
        setTotpData(data);
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

  // Generate a brand new authenticator key (RFC 6238 Base32)
  const handleGenerateNewKey = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName: adminName || 'CRM Admin' }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to generate key from backend');
      }

      setNewSecret(data.secret);
      setNewFormattedSecret(data.formattedSecret || data.secret);
      setNewOtpauthUrl(data.otpauthUrl);
      setVerifyTestCode('');
      setSuccessMsg('New Authenticator Key generated! Scan the QR code or copy key to your authenticator app, then click "Save Key to Database".');
      
      if (showToast) {
        showToast('Key Generated', 'Scan QR or copy key, then click Save Key to Database.', 'info');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error generating authenticator key');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save and lock the newly generated/regenerated key directly in DB
  const handleSaveKeyToDatabase = async () => {
    if (!newSecret) return;
    setIsSavingKey(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/save-key'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: newSecret,
          operatorName: adminName || 'Admin Operator',
          code: verifyTestCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save key in database');
      }

      setSuccessMsg('Authenticator key successfully saved and activated in PostgreSQL database! Use your authenticator app for future CRM logins.');
      if (showToast) {
        showToast('Security Key Saved', 'New authenticator key is now active in database.', 'success');
      }

      // Reset generation staging & refresh live active key
      setNewSecret('');
      setNewFormattedSecret('');
      setNewOtpauthUrl('');
      setVerifyTestCode('');
      await fetchTotpStatus();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save key in database');
    } finally {
      setIsSavingKey(false);
    }
  };

  // Test current 6-digit code against saved key
  const handleTestLiveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCodeInput.trim() || testCodeInput.trim().length !== 6) return;

    setIsTestingCode(true);
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorName: adminName || 'Admin Operator',
          totpCode: testCodeInput.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        setTestResult({
          success: true,
          message: '6-digit code verified successfully! Your authenticator app and server clock are perfectly synchronized.',
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error || 'Verification code failed. Ensure your authenticator app time is accurate.',
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

  const copyToClipboard = (text: string, isNew: boolean) => {
    navigator.clipboard.writeText(text);
    if (isNew) {
      setCopiedNewKey(true);
      setTimeout(() => setCopiedNewKey(false), 2000);
    } else {
      setCopiedActiveKey(true);
      setTimeout(() => setCopiedActiveKey(false), 2000);
    }
    if (showToast) {
      showToast('Copied', 'Authenticator key copied to clipboard', 'info');
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RFC 6238 TOTP
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configure your Google Authenticator or Authy 2FA key, save it safely in the PostgreSQL database, and regenerate credentials on demand.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-refresh-totp-status"
            onClick={fetchTotpStatus}
            disabled={isLoading}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
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
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Current Status & Key Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Key Status Card */}
        <div className="lg:col-span-6 space-y-6">
          <div
            className={`p-6 rounded-3xl border transition-colors space-y-5 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Active Authenticator Key
                </h2>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  totpData?.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {totpData?.isConfigured ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Active in Database</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Not Configured Yet</span>
                  </>
                )}
              </span>
            </div>

            {totpData?.isConfigured ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-400">Database Secret Key:</span>
                    <button
                      type="button"
                      onClick={() => setShowActiveSecret(!showActiveSecret)}
                      className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                    >
                      {showActiveSecret ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Key</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Reveal Key</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-xs font-semibold text-emerald-400 select-all break-all">
                      {showActiveSecret
                        ? totpData.formattedSecret || totpData.secret
                        : totpData.maskedSecret || '•••• •••• •••• ••••'}
                    </code>
                    {totpData.secret && (
                      <button
                        type="button"
                        id="btn-copy-active-totp"
                        onClick={() => copyToClipboard(totpData.secret!, false)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        title="Copy Key"
                      >
                        {copiedActiveKey ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {copiedActiveKey && (
                    <p className="text-[10px] text-emerald-400 mt-1 text-right">Key copied to clipboard!</p>
                  )}
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block">Configured By</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {totpData.configuredBy || adminName || 'Admin'}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] text-slate-400 block">Activated Date</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {totpData.configuredAt
                        ? new Date(totpData.configuredAt).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Active QR Code Preview */}
                {totpData.otpauthUrl && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Pair Another Authenticator App:
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="p-2.5 bg-white rounded-xl shadow-md border-2 border-emerald-500/40 shrink-0">
                        <QRCodeSVG value={totpData.otpauthUrl} size={110} level="M" />
                      </div>
                      <div className="space-y-1 text-center sm:text-left text-xs">
                        <p className="font-semibold text-emerald-400">Scan with Google Authenticator or Authy</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Use this QR code if you switch devices or want to link multiple backup authenticator apps.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>No Authenticator Key Configured Yet</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Generate an authenticator key below and paste it into your Google Authenticator or Authy app. Once saved, every CRM login will require your 6-digit code.
                </p>
              </div>
            )}

            {/* Action Button: Generate / Regenerate Key */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                id="btn-generate-authenticator-key"
                onClick={handleGenerateNewKey}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>
                  {totpData?.isConfigured ? 'Regenerate / Update Authenticator Key' : 'Generate Authenticator Key'}
                </span>
              </button>
            </div>
          </div>

          {/* Code Verifier / Quick Test Tool */}
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
                Test Authenticator Synchronization
              </h2>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Paste the current 6-digit code from your app here to confirm your device clock and the server are in sync.
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
                  placeholder="Paste 6-digit code"
                  maxLength={6}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  id="btn-test-authenticator-code"
                  disabled={isTestingCode || testCodeInput.length !== 6}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-emerald-400 font-bold text-xs border border-slate-700 transition-colors"
                >
                  {isTestingCode ? 'Checking...' : 'Verify Code'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Generation / Regeneration Setup Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div
            className={`p-6 rounded-3xl border transition-colors space-y-5 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-emerald-500" />
                <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {newSecret ? 'New Key Ready to Save' : 'Generate / Regenerate Key'}
                </h2>
              </div>
              {newSecret && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Unsaved Staging
                </span>
              )}
            </div>

            {newSecret ? (
              <div className="space-y-5">
                <div className="text-xs text-slate-400 leading-relaxed">
                  Follow these 3 easy steps to pair the key and activate it in the database:
                </div>

                {/* Step 1: QR Code & Scan */}
                <div className="flex flex-col items-center justify-center p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300">Step 1: Scan QR in Authenticator App</span>
                  <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/40">
                    <QRCodeSVG value={newOtpauthUrl} size={150} level="M" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PakInvest CRM (Time-based 30s)
                  </span>
                </div>

                {/* Step 2: Manual Setup Key to Copy & Paste */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Step 2: Or Paste Key Manually</span>
                    <span className="text-[10px] text-slate-500 font-normal">If camera is unavailable</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <code className="text-xs font-mono text-emerald-400 flex-1 break-all select-all font-bold tracking-wider">
                      {newFormattedSecret || newSecret}
                    </code>
                    <button
                      type="button"
                      id="btn-copy-new-secret"
                      onClick={() => copyToClipboard(newSecret, true)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
                      title="Copy Key to Paste in Authenticator"
                    >
                      {copiedNewKey ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {copiedNewKey && (
                    <p className="text-[10px] text-emerald-400 text-right">Key copied to clipboard!</p>
                  )}
                </div>

                {/* Step 3: Optional Test Verification Code before Save */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Step 3: Confirm 6-Digit Code (Optional Test)</span>
                    <span className="text-[10px] text-slate-500">Verify before saving</span>
                  </label>
                  <input
                    type="text"
                    id="input-verify-new-code"
                    value={verifyTestCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerifyTestCode(val);
                    }}
                    placeholder="Enter 6-digit code from app"
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-sm font-mono tracking-widest placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Save to Database Button */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSecret('');
                      setNewFormattedSecret('');
                      setNewOtpauthUrl('');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-save-key-to-db"
                    onClick={handleSaveKeyToDatabase}
                    disabled={isSavingKey}
                    className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isSavingKey ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving in Database...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save Key to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
                <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
                <div>
                  <h3 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Ready to Generate or Regenerate
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Click &quot;Generate / Regenerate Authenticator Key&quot; on the left to create a new key. You can copy it, paste it in Google Authenticator or Authy, and save it directly into the database.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Information & Security Policy Card */}
          <div
            className={`p-6 rounded-3xl border transition-colors space-y-3 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
              <Sparkles className="w-4 h-4" />
              <span>CRM Authentication Flow Details</span>
            </div>
            <ul className="text-xs space-y-2 text-slate-400 list-disc list-inside leading-relaxed">
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Saved in Database:</strong> Your key is stored encrypted in the PostgreSQL <code className="text-emerald-400">SystemSetting</code> table and is persistent across deployments.
              </li>
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Quick Copy & Paste Login:</strong> On the CRM login page, simply paste the current 6-digit code from Google Authenticator to enter immediately.
              </li>
              <li>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Regenerate Anytime:</strong> You can regenerate your key at any time from this Settings page if you change phones or rotate credentials.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
