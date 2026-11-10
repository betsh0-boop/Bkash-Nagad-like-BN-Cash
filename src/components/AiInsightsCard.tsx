import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Lightbulb, CheckCircle2, Shield } from 'lucide-react';

interface AiInsightsCardProps {
  onRefreshTrigger?: number;
}

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ onRefreshTrigger }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/spending-insights', { method: 'POST' });
      const data = await res.json();
      setLoading(false);
      if (data.success && data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [onRefreshTrigger]);

  if (!insights && !loading) return null;

  return (
    <div className="bg-gradient-to-r from-pink-950/40 via-slate-900 to-purple-950/40 border border-pink-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">AI ফ্যামিলি ফাইনান্স অ্যাডভাইজর (AI Smart Advisor)</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                GEMINI 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">bKash & Nagad স্মার্ট ক্যাশফ্লো পরামর্শ</p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          title="Refresh AI Insights"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
          <span>আপনার পরিবারের ক্যাশফ্লো এবং ওয়ালেট হিস্ট্রি এনালাইসিস করা হচ্ছে...</span>
        </div>
      ) : insights ? (
        <div className="mt-4 space-y-3">
          {/* Summary Box */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs space-y-1">
            <p className="text-slate-200 font-medium leading-relaxed">{insights.summaryBn}</p>
            <p className="text-slate-400 text-[11px] font-sans">{insights.summaryEn}</p>
          </div>

          {/* Smart Recommendations List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              স্মার্ট ক্যাশব্যাক ও চার্জ সাশ্রয়ী পরামর্শ:
            </span>
            {insights.recommendations?.map((rec: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
