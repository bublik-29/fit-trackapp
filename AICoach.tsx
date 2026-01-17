
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ProgressData, Language, AIAnalysis } from './types';

interface AICoachProps {
  data: ProgressData;
  lang: Language;
}

const AICoach: React.FC<AICoachProps> = ({ data, lang }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare a compact version of history for the model
      const history = Object.entries(data)
        .slice(-10) // Last 10 sessions
        .map(([date, entry]) => ({
          d: date,
          b: entry.blockNumber,
          a: entry.exerciseA.map(s => `${s.weight}x${s.reps}`).join(','),
          b2: entry.exerciseB.map(s => `${s.weight}x${s.reps}`).join(',')
        }));

      const prompt = `Analyze this workout history for a strength training athlete. 
      History (JSON): ${JSON.stringify(history)}
      Language: ${lang}
      
      Return ONLY a JSON object with this structure:
      {
        "headline": "Short punchy status (max 5 words)",
        "summary": "2-3 sentences of overall progress analysis",
        "recommendations": ["Point 1 about weight increase", "Point 2 about consistency", "Point 3 about recovery"],
        "status": "optimizing" | "plateau" | "peak"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setAnalysis(result);
    } catch (error) {
      console.error("AI Insight Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) {
    return (
      <button 
        onClick={generateInsights}
        className="w-full mb-8 py-4 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform">✨</span>
        {lang === 'en' ? 'Get AI Training Insights' : lang === 'ru' ? 'Получить AI-анализ' : 'Pobierz analizę AI'}
      </button>
    );
  }

  return (
    <div className="mb-8 p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[80px] rounded-full"></div>
      
      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Analyzing Performance...
          </p>
        </div>
      ) : analysis && (
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              analysis.status === 'peak' ? 'bg-emerald-500' : analysis.status === 'plateau' ? 'bg-amber-500' : 'bg-indigo-500'
            }`}>
              {analysis.status}
            </span>
            <button onClick={() => setAnalysis(null)} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          
          <h3 className="text-2xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {analysis.headline}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
            {analysis.summary}
          </p>
          
          <div className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-xs font-semibold text-slate-200">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;
