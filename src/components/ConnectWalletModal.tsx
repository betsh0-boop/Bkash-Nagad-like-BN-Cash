import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Shield,
  Key,
  CheckCircle2,
  Copy,
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Wallet, WalletProvider } from '../types';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [provider, setProvider] = useState<WalletProvider>('bKash');
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');

  // Step 2 state
  const [pendingWallet, setPendingWallet] = useState<Wallet | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [rawSmsText, setRawSmsText] = useState('');
  const [simulatedOtpMsg, setSimulatedOtpMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Step 1: Submit Wallet Info & PIN -> Dispatch OTP
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !ownerName || !mobileNumber || !pin) {
      setErrorMessage('সবগুলো ঘর পূরণ করুন (Fill out all required fields)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wallets/connect-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ownerName,
          provider,
          mobileNumber,
          pin
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setPendingWallet(data.wallet);
        setSimulatedOtpMsg(data.simulatedOtpMessage);
        setStep(2);
      } else {
        setErrorMessage(data.error || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('সার্ভার যোগাযোগে ত্রুটি ঘটেছে।');
    }
  };

  // Step 2: Submit OTP or Full Message Paste
  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!pendingWallet) return;

    if (!otpCode && !rawSmsText) {
      setErrorMessage('ওটিপি কোড অথবা সম্পূর্ণ মেসেজ পেস্ট করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wallets/connect-step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: pendingWallet.id,
          otpCode,
          rawSmsText
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setStep(3);
        onWalletConnected();
      } else {
        setErrorMessage(data.error || 'ওটিপি যাচাইকরণ ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('যাচাইকরণ সফল হয়নি। আবার চেষ্টা করুন।');
    }
  };

  // Helper to paste simulated SMS into the full message box
  const handlePasteSampleSms = () => {
    setRawSmsText(simulatedOtpMsg);
    // Extract OTP automatically
    const match = simulatedOtpMsg.match(/\b\d{6}\b/);
    if (match) {
      setOtpCode(match[0]);
    }
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setOwnerName('');
    setMobileNumber('');
    setPin('');
    setOtpCode('');
    setRawSmsText('');
    setPendingWallet(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">নতুন ওয়ালেট যুক্ত করুন</h3>
              <p className="text-xs text-slate-400">bKash বা Nagad ওয়ালেট এবং ওটিপি সংযোগ</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
          <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-pink-400' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px] font-bold">1</span>
            নাম্বার ও পিন
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-pink-400' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px] font-bold">2</span>
            ওটিপি / মেসেজ পেস্ট
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-400' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
            সম্পন্ন
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Basic Info & PIN Entry */}
        {step === 1 && (
          <form onSubmit={handleSubmitStep1} className="p-6 space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ওয়ালেট প্রোভাইডার সিলেক্ট করুন (Select Wallet Provider)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('bKash')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    provider === 'bKash'
                      ? 'bg-pink-500/10 border-pink-500 text-white font-semibold shadow-lg shadow-pink-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center font-extrabold text-white text-xs">
                    bK
                  </div>
                  <div>
                    <div className="text-sm">bKash (বিকাশ)</div>
                    <div className="text-[10px] text-slate-400">Personal Wallet</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('Nagad')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    provider === 'Nagad'
                      ? 'bg-orange-500/10 border-orange-500 text-white font-semibold shadow-lg shadow-orange-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-extrabold text-white text-xs">
                    NG
                  </div>
                  <div>
                    <div className="text-sm">Nagad (নগদ)</div>
                    <div className="text-[10px] text-slate-400">Personal Wallet</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Wallet Nickname & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ওয়ালেটের নাম (Wallet Nickname)
                </label>
                <input
                  type="text"
                  placeholder="e.g. আব্বুর বিকাশ মেইন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  সদস্যের নাম (Owner Full Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Md. Harun-or-Rashid"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            </div>

            {/* Mobile Number & PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  মোবাইল নম্বর (Mobile Number)
                </label>
                <input
                  type="tel"
                  placeholder="01711XXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {provider} পিন অপশন (PIN)
                </label>
                <input
                  type="password"
                  maxLength={5}
                  placeholder="•••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500 tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Shield className="w-4 h-4 text-emerald-400" />
                নিরাপত্তা এনক্রিপশন (256-bit Encrypted)
              </div>
              <p>সাবমিট করলেই গ্রাহকের {provider} নাম্বারে ওটিপি পাঠানো হবে। পরবর্তী ধাপে ওটিপি বা মেসেজ পেস্ট করে যুক্ত করা যাবে।</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                provider === 'bKash'
                  ? 'bg-pink-600 hover:bg-pink-500 shadow-lg shadow-pink-600/20'
                  : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ওটিপি পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>ওটিপি পাঠান (Submit & Get OTP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification & Full Message Paste */}
        {step === 2 && (
          <form onSubmit={handleSubmitStep2} className="p-6 space-y-4">
            {/* Incoming Simulated SMS Preview Helper */}
            {simulatedOtpMsg && (
              <div className="p-3.5 bg-pink-500/10 border border-pink-500/30 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-pink-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    ইনকামিং {provider} এসএমএস (Simulated SMS)
                  </span>
                  <button
                    type="button"
                    onClick={handlePasteSampleSms}
                    className="px-2 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    মেসেজ পেস্ট করুন
                  </button>
                </div>
                <p className="font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px]">
                  "{simulatedOtpMsg}"
                </p>
              </div>
            )}

            {/* Manual 6-Digit OTP Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ৬ ডিজিট ওটিপি কোড (Enter 6-Digit OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="849201"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-xl font-mono font-bold text-white tracking-widest focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Option B: Full SMS Message Paste Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                অথবা গ্রাহকের সম্পূর্ণ মেসেজ পেস্ট করুন (Paste Full SMS Message)
              </label>
              <textarea
                rows={3}
                placeholder="গ্রাহক থেকে প্রাপ্ত বিকাশ বা নগদ সম্পূর্ণ মেসেজটি কপি করে এখানে পেস্ট করুন..."
                value={rawSmsText}
                onChange={(e) => {
                  setRawSmsText(e.target.value);
                  const m = e.target.value.match(/\b\d{6}\b/);
                  if (m) setOtpCode(m[0]);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                মেসেজ পেস্ট করলে অটোলজিকে ৬ ডিজিটের ওটিপি কোড ডিটেক্ট হয়ে যাবে।
              </p>
            </div>

            {/* Android Auto Sync Indicator */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-white font-semibold">অ্যান্ড্রয়েড অটোমেশন অ্যাক্টিভ</strong>
                অ্যান্ড্রয়েড কম্প্যানিয়ন এপ ওটিপি আসার সাথে সাথে স্বয়ংক্রিয়ভাবে সার্ভারে ফরোয়ার্ড ও ভেরিফাই করবে।
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ভেরিফাই ও ওয়ালেট কানেক্ট করুন</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">ওয়ালেট সফলতা এবং নিরাপত্তার সাথে যুক্ত হয়েছে!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {name} ({provider}) এখন আপনার ফিনওয়াল ড্যাশবোর্ডে সক্রিয়।
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">ওয়ালেটের নাম:</span>
                <span className="font-semibold text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মালিক:</span>
                <span className="font-semibold text-slate-200">{ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মোবাইল:</span>
                <span className="font-mono text-emerald-400">{mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">প্রাথমিক ব্যালেন্স:</span>
                <span className="font-mono text-white font-bold">
                  ৳ {pendingWallet?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              ড্যাশবোর্ডে ফিরে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
