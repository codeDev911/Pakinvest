import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../../config/api';
import { safeFetchJson } from '../utils/safeFetch';

interface CrmSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecurityConfig {
  secretAccessKey: string;
  directAccessPath: string;
  totpSecret: string;
  totpIssuer: string;
  totpAccount: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  lastRotatedAt: string;
}

export const CrmSecurityModal: React.FC<CrmSecurityModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pakinvest_admin_token');
      const gateKey = sessionStorage.getItem('pakinvest_crm_gate_key');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (gateKey) headers['x-crm-key'] = gateKey;
    }
    return headers;
  };

  const fetchSecurityInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await safeFetchJson(getApiUrl('/api/admin/security/info'), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (res.ok && res.data?.success && res.data?.config) {
        setConfig(res.data.config);
      } else {
        setError(res.error || res.data?.error || 'Failed to load team security settings.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error connecting to security service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSecurityInfo();
      setTestResult(null);
      setTestCode('');
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleTestTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode.trim() || testCode.length !== 6) return;

    setTesting(true);
    setTestResult(null);
    try {
      const res = await safeFetchJson(getApiUrl('/api/admin/security/verify-totp-test'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code: testCode.trim() }),
      });

      if (res.ok && res.data?.success) {
        if (res.data.valid) {
          setTestResult({
            success: true,
            message: 'Success! Your Google Authenticator code is verified and in sync.',
          });
        } else {
          setTestResult({
            success: false,
            message: 'Code mismatch. Please verify that your device clock is accurate and try again.',
          });
        }
      } else {
        setTestResult({
          success: false,
          message: res.error || res.data?.error || 'Verification test failed.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Verification test failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRotateCredentials = async (type: 'key' | 'totp' | 'both') => {
    const msg =
      type === 'both'
        ? 'Regenerate BOTH the master passkey and the Google Authenticator 2FA secret? Existing links and 2FA will require updating.'
        : type === 'key'
        ? 'Regenerate the master secret passkey? The secret access link will change.'
        : 'Regenerate the Google Authenticator 2FA secret? All team members must re-scan the new QR code.';

    if (!window.confirm(msg)) return;

    setRotating(true);
    try {
      const res = await safeFetchJson(getApiUrl('/api/admin/security/rotate'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          rotateKey: type === 'key' || type === 'both',
          rotateTotp: type === 'totp' || type === 'both',
        }),
      });

      if (res.ok && res.data?.success && res.data?.config) {
        setConfig(res.data.config);
        setTestResult(null);
        setTestCode('');
        alert('Credentials successfully updated and saved.');
      } else {
        alert(res.error || res.data?.error || 'Failed to rotate credentials.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating credentials.');
    } finally {
      setRotating(false);
    }
  };

  if (!isOpen) return null;

  const fullDirectUrl = config
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${config.directAccessPath}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Team Access Security & 2FA
              </h2>
              <p className="text-xs text-slate-400">
                Manage restricted URL gate keys and Google Authenticator 2FA settings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-200">Security Access Issue</div>
                <div className="text-[11px] leading-relaxed text-rose-300/90">{error}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchSecurityInfo}
              className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-medium">Decrypting and loading 2FA security parameters...</span>
          </div>
        ) : config ? (
          <div className="space-y-6">
            {/* Section 1: Secret Direct Access Link */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Direct Secret Access URL (For Authorized Team)</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Bypasses 404 Gate</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visiting <code className="text-slate-300 font-mono">/crm-control</code> directly without this key displays an HTTP 404 page. Bookmark this long URL to access the CRM console:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullDirectUrl}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(fullDirectUrl, 'url')}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedField === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'url' ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>

              {/* Master Secret Passkey */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Standalone Master Passkey: </span>
                  <code className="text-xs font-mono text-slate-300 ml-1">{config.secretAccessKey}</code>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.secretAccessKey, 'key')}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'key' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Google Authenticator (TOTP 2FA) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Google Authenticator (2FA / RFC 6238 TOTP)</span>
                </div>
                <span className="text-[11px] text-slate-400">Scan on Phone</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* QR Code Container */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner">
                  {config.qrCodeDataUrl ? (
                    <img
                      src={config.qrCodeDataUrl}
                      alt="Google Authenticator QR Code"
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                      QR unavailable
                    </div>
                  )}
                  <span className="text-[10px] text-slate-600 font-semibold mt-1">Scan with Authenticator</span>
                </div>

                {/* Setup Steps & Secret Key */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                    <li>Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your mobile phone.</li>
                    <li>Tap <strong>+ (Add account)</strong> and select <strong>Scan a QR code</strong>.</li>
                    <li>Scan the QR code on the left, or enter the manual key below:</li>
                  </ol>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Manual Setup Key</div>
                      <div className="font-mono text-xs text-amber-400 font-bold select-all tracking-wider">
                        {config.totpSecret}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(config.totpSecret, 'totp')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    >
                      {copiedField === 'totp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Test 6-Digit Code */}
                  <form onSubmit={handleTestTotp} className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-[11px] font-bold text-slate-300">
                      Test Authenticator Code Verification:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={testCode}
                        onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456"
                        className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono tracking-widest text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={testing || testCode.length !== 6}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {testing ? 'Testing...' : 'Verify Code'}
                      </button>
                    </div>

                    {testResult && (
                      <div
                        className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                          testResult.success
                            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                            : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Section 3: Rotation & Maintenance */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-300">Credentials Maintenance</div>
                <div className="text-[11px] text-slate-500">
                  Last updated:{' '}
                  {config.lastRotatedAt
                    ? new Date(config.lastRotatedAt).toLocaleString()
                    : 'System Default'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={rotating}
                  onClick={() => handleRotateCredentials('key')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  Rotate URL Key
                </button>
                <button
                  type="button"
                  disabled={rotating}
                  onClick={() => handleRotateCredentials('totp')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  Rotate 2FA Secret
                </button>
              </div>
            </div>
          </div>
        ) : !loading && error ? (
          <div className="py-8 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white">Security Parameters Currently Inaccessible</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The CRM security gateway could not retrieve 2FA parameters. Please verify your administrative session or click Retry to reconnect.
            </p>
            <button
              type="button"
              onClick={fetchSecurityInfo}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
