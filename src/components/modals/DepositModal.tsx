import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GatewayType } from '../../types';
import { OFFICIAL_DEPOSIT_CHANNELS } from '../../data/mockData';
import { formatPKR } from '../../utils/formatters';
import { GatewayLogo } from '../common/GatewayLogo';
import { getApiUrl } from '../../config/api';
import {
  X,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Info,
  UploadCloud,
  Loader2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const QUICK_AMOUNTS = [1500, 3500, 5000, 10000, 25000, 50000];

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, depositFunds, officialChannels } = useApp();
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>('JazzCash');
  const [amount, setAmount] = useState<number>(5000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('5000');
  const [senderTitle, setSenderTitle] = useState<string>('');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Receipt Image Upload State (Deferred until submit)
  const [selectedReceiptData, setSelectedReceiptData] = useState<string>(''); // Local compressed base64 preview
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptFileSize, setReceiptFileSize] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fast client-side image compression helper (downscales huge camera photos to max 1600px for instant upload)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target?.result as string);
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image exceeds 20MB limit. Please choose a smaller photo.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setReceiptFileName(file.name);
    setReceiptFileSize(sizeFormatted);
    setUploadError(null);

    try {
      // Compress locally for instant crisp preview without initiating server network upload yet
      const compressedData = await compressImage(file);
      if (compressedData) {
        setSelectedReceiptData(compressedData);
      } else {
        setUploadError('Unable to process selected image.');
      }
    } catch {
      setUploadError('Failed to prepare receipt image.');
    }
  };

  const handleRemoveImage = () => {
    setSelectedReceiptData('');
    setReceiptFileName('');
    setReceiptFileSize('');
    setUploadError(null);
  };

  if (!isDepositModalOpen) return null;

  const activeChannels = (officialChannels && officialChannels.length > 0)
    ? officialChannels.filter((c) => c.isActive !== false)
    : OFFICIAL_DEPOSIT_CHANNELS;

  const availableGateways = Array.from(new Set(activeChannels.map((c) => c.gateway)));
  const displayGateways = availableGateways.length > 0 ? availableGateways : (['JazzCash', 'EasyPaisa', 'Raast', 'SadaPay', 'NayaPay', 'Bank_Transfer', 'USDT_TRC20'] as GatewayType[]);

  const effectiveGateway = displayGateways.includes(selectedGateway) ? selectedGateway : displayGateways[0];

  const currentChannel =
    activeChannels.find((c) => c.gateway === effectiveGateway) ||
    activeChannels[0] ||
    OFFICIAL_DEPOSIT_CHANNELS[0];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmountInput(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountInput(val);
    setAmount(val ? parseInt(val, 10) : 0);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < currentChannel.minDeposit) {
      alert(`Minimum deposit for ${selectedGateway} is Rs. ${currentChannel.minDeposit.toLocaleString()}`);
      return;
    }

    if (!selectedReceiptData) {
      setUploadError('Payment receipt screenshot is required. Please select and upload your transfer proof.');
      return;
    }

    setIsSubmitting(true);

    let finalProofUrl: string | undefined = undefined;

    // 1. Upload photo now (deferred until submit button click)
    if (selectedReceiptData) {
      setIsUploadingImage(true);
      try {
        const uploadRes = await fetch(getApiUrl('/api/upload/receipt'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: selectedReceiptData,
            fileName: receiptFileName || 'receipt_proof.jpg',
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData && uploadData.url) {
          finalProofUrl = uploadData.url;
        } else {
          finalProofUrl = selectedReceiptData;
        }
      } catch (uploadErr) {
        console.warn('[Receipt Upload Error]: Falling back to local data URI', uploadErr);
        finalProofUrl = selectedReceiptData;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // 2. Reference / Transaction ID is optional. If empty, generate a readable reference.
    const effectiveTrxId =
      trxId.trim() ||
      `DEP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Submit deposit request
    const success = await depositFunds(
      amount,
      selectedGateway,
      effectiveTrxId,
      senderNumber || undefined,
      senderTitle || undefined,
      finalProofUrl
    );

    setIsSubmitting(false);

    if (success) {
      setIsDepositModalOpen(false);
      setStep(1);
      setTrxId('');
      setSenderTitle('');
      setSenderNumber('');
      handleRemoveImage();
    }
  };

  const getGatewayIcon = (gw: GatewayType) => {
    return <GatewayLogo gateway={gw} size="sm" />;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDepositModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Down to Up Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Top handle bar for mobile feel */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                Rs
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deposit
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {step === 1 ? (
              <>
                {/* Gateway Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {displayGateways.map((gw) => {
                      const isSelected = effectiveGateway === gw;
                      return (
                        <button
                          key={gw}
                          type="button"
                          onClick={() => setSelectedGateway(gw)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="shrink-0">
                            {getGatewayIcon(gw)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {gw === 'Bank_Transfer' ? 'Meezan / Bank' : gw === 'USDT_TRC20' ? 'USDT (TRC20)' : gw}
                            </p>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {gw === 'Raast' ? 'Instant 0% fee' : 'Fast automated'}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Deposit Amount (PKR)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Min: {formatPKR(currentChannel.minDeposit)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      Rs.
                    </span>
                    <input
                      type="text"
                      value={customAmountInput}
                      onChange={handleCustomAmountChange}
                      placeholder="5,000"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAmountSelect(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          amount === val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        +{formatPKR(val)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Notice */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Estimated arrival time:{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {currentChannel.processingTime}
                    </span>
                    . 100% automated settlement with zero platform processing fees.
                  </p>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={amount < currentChannel.minDeposit}
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Payment Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmitDeposit} className="space-y-4">
                {/* Company Payment Info Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GatewayLogo gateway={selectedGateway} size="xs" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Official {selectedGateway === 'Bank_Transfer' ? 'Meezan / Bank' : selectedGateway} Receiving Account
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                      Verified
                    </span>
                  </div>

                  {/* Account Title */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <div>
                      <p className="text-[10px] text-slate-400">Account Title</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {currentChannel.accountTitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentChannel.accountTitle, 'title')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {copiedField === 'title' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Account Number / IBAN */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <div>
                      <p className="text-[10px] text-slate-400">
                        {selectedGateway === 'USDT_TRC20' ? 'TRC20 Wallet Address' : 'Account / Mobile / Raast Number'}
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-800 dark:text-white break-all">
                        {currentChannel.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentChannel.accountNumber, 'number')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                    >
                      {copiedField === 'number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {currentChannel.bankName && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Bank: <span className="font-semibold">{currentChannel.bankName}</span>
                    </div>
                  )}

                  {/* Instructions */}
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed bg-emerald-100/50 dark:bg-emerald-950/80 p-2.5 rounded-xl">
                    💡 {currentChannel.instructions}
                  </p>
                </div>

                {/* Amount to send summary */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Sending Amount:</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatPKR(amount)}
                  </span>
                </div>

                {/* Receipt Image Upload (Above Enter Transaction ID) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Upload Payment Receipt Screenshot <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  </div>

                  {!selectedReceiptData && !isUploadingImage && (
                    <label
                      htmlFor="deposit-receipt-file-input"
                      className={`flex flex-col items-center justify-center p-3.5 border-2 border-dashed ${
                        uploadError
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/40 dark:bg-rose-950/20'
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                      } rounded-2xl cursor-pointer transition-all text-center group`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Tap to Select Receipt Proof <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, JPEG or WEBP (JazzCash/EasyPaisa/Bank transfer success screen)
                      </span>
                      <input
                        id="deposit-receipt-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}

                  {isUploadingImage && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-emerald-500 animate-spin flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                          Uploading receipt proof...
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {receiptFileName} {receiptFileSize ? `(${receiptFileSize})` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedReceiptData && !isUploadingImage && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-emerald-500/40 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/30 bg-black/20 flex-shrink-0">
                          <img
                            src={selectedReceiptData}
                            alt="Receipt preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[190px]">
                              {receiptFileName || 'Receipt Screenshot'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Attached</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {receiptFileSize ? `${receiptFileSize} • ` : ''}Receipt will be attached upon submit
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={selectedReceiptData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Preview full image"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove this receipt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-[11px] text-rose-500 font-medium">{uploadError}</p>
                  )}
                </div>

                {/* Transaction ID Input (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Transaction ID (TID / TRX ID / Reference No.)
                    </label>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="Optional: Enter TID / TRX ID from SMS receipt"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Optional: Enter 11/12 digit TID if available, or upload your payment screenshot above.
                  </span>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={senderTitle}
                      onChange={(e) => setSenderTitle(e.target.value)}
                      placeholder="Account holder name"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Sender Phone / Account
                    </label>
                    <input
                      type="text"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="e.g. 03001234567"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedReceiptData}
                    className="w-2/3 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!selectedReceiptData ? 'Please select a receipt screenshot first' : undefined}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isUploadingImage ? 'Uploading Receipt Proof...' : 'Submitting Deposit...'}
                      </span>
                    ) : (
                      <span>{!selectedReceiptData ? 'Upload Receipt to Submit' : 'Confirm & Credit Balance'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
