import React, { useState } from 'react';
import {
  Smartphone,
  Sparkles,
  Send,
  CheckCircle2,
  Copy,
  Code,
  Radio,
  Clock,
  Zap,
  RefreshCw,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { SmsLog } from '../types';

interface AndroidCompanionModalProps {
  smsLogs: SmsLog[];
  onSmsSent: () => void;
}

export const AndroidCompanionModal: React.FC<AndroidCompanionModalProps> = ({
  smsLogs,
  onSmsSent
}) => {
  const [testSender, setTestSender] = useState<'bKash' | 'Nagad'>('bKash');
  const [testMessage, setTestMessage] = useState(
    'Your bKash verification code is 849201. Never share your PIN or OTP with anyone.'
  );
  const [simulating, setSimulating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick preset templates
  const applyPreset = (type: 'otp_bkash' | 'otp_nagad' | 'trx_bkash' | 'trx_nagad') => {
    if (type === 'otp_bkash') {
      const code = Math.floor(100000 + Math.random() * 900000);
      setTestSender('bKash');
      setTestMessage(`Your bKash verification code is ${code}. Never share your PIN or OTP with anyone.`);
    } else if (type === 'otp_nagad') {
      const code = Math.floor(100000 + Math.random() * 900000);
      setTestSender('Nagad');
      setTestMessage(`Your Nagad OTP is ${code}. Valid for 5 mins. Do not share.`);
    } else if (type === 'trx_bkash') {
      const trx = `BK${Math.floor(100000 + Math.random() * 900000)}`;
      setTestSender('bKash');
      setTestMessage(`You have received Tk 3,500.00 from 01711987654. Balance Tk 28,000.00. TrxID ${trx}.`);
    } else if (type === 'trx_nagad') {
      const trx = `NG${Math.floor(100000 + Math.random() * 900000)}`;
      setTestSender('Nagad');
      setTestMessage(`Cash In Received Amount: Tk 2000.00 Sender: 01819234567 TrxID: ${trx} Balance: Tk 20250.50`);
    }
  };

  const handleSimulateSms = async () => {
    setSimulating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sms-forwarder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: testSender,
          message: testMessage,
          apiKey: 'FW-COMPANION-SECRET-2026'
        })
      });

      const data = await res.json();
      setSimulating(false);
      setFeedback(data);
      onSmsSent();
    } catch (err: any) {
      setSimulating(false);
      setFeedback({ success: false, message: 'এসএমএস পাঠাতে ব্যর্থ হয়েছে' });
    }
  };

  const flutterCodeSnippet = `// Flutter Android SMS Listener Webhook Bridge
import 'package:telephony/telephony.dart';
import 'package:http/http.dart' as http;

final Telephony telephony = Telephony.instance;

void onSmsReceived(SmsMessage message) async {
  String sender = message.address ?? "";
  String body = message.body ?? "";

  if (sender.contains("bKash") || sender.contains("Nagad")) {
    await http.post(
      Uri.parse("https://your-finwall-app.app/api/sms-forwarder"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "sender": sender,
        "message": body,
        "apiKey": "FW-COMPANION-SECRET-2026"
      }),
    );
  }
}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">অ্যান্ড্রয়েড কম্প্যানিয়ন মনিটর (Android SMS Sync)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE LISTENER
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              bKash এবং Nagad ওটিপি বা ট্রানজেকশন আসার সাথে সাথে অ্যান্ড্রয়েড ব্যাকগ্রাউন্ড অ্যাপ স্বয়ংক্রিয়ভাবে ওয়েবে ফরোয়ার্ড করে ব্যালেন্স সিঙ্ক ও ওয়ালেট ভেরিফাই করে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            WEBHOOK PORT: 3000 /api/sms-forwarder
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Simulator Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              এসএমএস সিমুলেটর টেস্ট বেঞ্চ (Live Simulator)
            </h3>
            <span className="text-[11px] text-slate-400">টেস্টের জন্য এসএমএস প্রিসেট বেছে নিন</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => applyPreset('otp_bkash')}
              className="px-2.5 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-medium rounded-lg transition-colors"
            >
              bKash OTP
            </button>
            <button
              onClick={() => applyPreset('otp_nagad')}
              className="px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-medium rounded-lg transition-colors"
            >
              Nagad OTP
            </button>
            <button
              onClick={() => applyPreset('trx_bkash')}
              className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium rounded-lg transition-colors"
            >
              bKash Trx ৳3.5K
            </button>
            <button
              onClick={() => applyPreset('trx_nagad')}
              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-lg transition-colors"
            >
              Nagad Trx ৳2K
            </button>
          </div>

          {/* Sender & Message Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                প্রেরক (SMS Sender)
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTestSender('bKash')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                    testSender === 'bKash'
                      ? 'bg-pink-600 border-pink-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setTestSender('Nagad')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                    testSender === 'Nagad'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Nagad
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ইনকামিং এসএমএস টেক্সট (Simulated SMS Message Body)
              </label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleSimulateSms}
              disabled={simulating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              {simulating ? (
                <span>প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-emerald-200" />
                  <span>অ্যান্ড্রয়েড থেকে ওয়েবে ফরোয়ার্ড টেস্ট করুন (Trigger Forwarder)</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback Output */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                feedback.otpVerified || feedback.trxRecorded
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{feedback.message}</span>
              </div>
              {feedback.parsedData && (
                <div className="font-mono text-[11px] opacity-90">
                  ডিটেক্টেড ওটিপি: <strong>{feedback.parsedData.otp || 'N/A'}</strong> | TrxID: <strong>{feedback.parsedData.trxId || 'N/A'}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Integration Code Snippet Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              অ্যান্ড্রয়েড ফ্লাটার কোড ইন্টিগ্রেশন (Flutter / Kotlin App)
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(flutterCodeSnippet);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCode ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            আপনার অ্যান্ড্রয়েড মোবাইলে এই লাইটওয়েট ব্যাকগ্রাউন্ড স্ক্রিপ্ট বা এপ ইনস্টল থাকলে যেকোনো ওটিপি বা লেনদেনের এসএমএস সরাসরি ওয়েবসাইটে যুক্ত হয়ে যাবে।
          </p>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-purple-300 overflow-x-auto max-h-56">
            <code>{flutterCodeSnippet}</code>
          </pre>
        </div>
      </div>

      {/* SMS Forwarding History Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            ফরোয়ার্ডকৃত এসএমএস রেকর্ডসমূহ ({smsLogs.length} টি)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Webhook Receiver</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">সময়</th>
                <th className="pb-3 font-semibold">প্রেরক</th>
                <th className="pb-3 font-semibold">মেসেজ কন্টেন্ট</th>
                <th className="pb-3 font-semibold">ডিটেক্টেড ওটিপি/TrxID</th>
                <th className="pb-3 font-semibold">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {smsLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    কোন ফরোয়ার্ডকৃত এসএমএস রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                smsLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          log.sender === 'bKash' ? 'bg-pink-500/10 text-pink-400' : 'bg-orange-500/10 text-orange-400'
                        }`}
                      >
                        {log.sender}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs font-mono text-slate-300 truncate">
                      {log.message}
                    </td>
                    <td className="py-3 font-mono">
                      {log.extractedOtp ? (
                        <span className="text-emerald-400 font-bold">OTP: {log.extractedOtp}</span>
                      ) : log.extractedTrxId ? (
                        <span className="text-pink-400 font-bold">TrxID: {log.extractedTrxId}</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          log.status === 'otp_matched'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'trx_synced'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {log.status === 'otp_matched' ? 'OTP ভেরিফাইড' : log.status === 'trx_synced' ? 'ব্যালেন্স সিঙ্কড' : 'প্রসেসড'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
