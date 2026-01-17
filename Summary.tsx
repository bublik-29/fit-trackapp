
import React from 'react';
import { MonthSummary, Language } from './types';

interface SummaryProps {
  summary: MonthSummary & { daysInMonth?: number };
  lang: Language;
  t: any;
}

const getExerciseInfo = (lang: Language) => [
  { key: 'b1_a', block: 1, name: { en: 'Bicep Curl', ru: 'Бицепс', pl: 'Biceps' }[lang] },
  { key: 'b1_b', block: 1, name: { en: 'French Press', ru: 'Фр. жим', pl: 'Francuz' }[lang] },
  { key: 'b2_a', block: 2, name: { en: 'Military Press', ru: 'Жим сидя', pl: 'Military' }[lang] },
  { key: 'b2_b', block: 2, name: { en: 'Reverse Curl', ru: 'Обр. хват', pl: 'Nachwyt' }[lang] },
  { key: 'b3_a', block: 3, name: { en: 'Upright Row', ru: 'Тяга к подб.', pl: 'Podciąganie' }[lang] },
  { key: 'b3_b', block: 3, name: { en: 'Wrist Curls', ru: 'Запястья', pl: 'Nadgarstki' }[lang] }
];

const Summary: React.FC<SummaryProps> = ({ summary, lang, t }) => {
  const exercises = getExerciseInfo(lang);
  const completionPercentage = summary.daysInMonth ? Math.round((summary.totalWorkouts / summary.daysInMonth) * 100) : 0;

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500"></div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-grow">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t.monthlyReport}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-800">{summary.totalWorkouts}</p>
              <p className="text-slate-400 text-xs font-bold">/ {summary.daysInMonth || 30} {t.days}</p>
            </div>
            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-400 p-5 rounded-3xl border border-amber-500 shadow-md shadow-amber-100 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-900 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </div>
          <div>
            <p className="text-amber-900/60 text-[10px] font-bold uppercase tracking-widest">{t.growth}</p>
            <p className="text-lg font-black text-amber-900">{t.consistency}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">{t.lastWeights}</h3>
        <div className="grid grid-cols-3 gap-3 min-w-[320px]">
          {[1, 2, 3].map(b => (
            <div key={b} className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">{t.block} {b}</p>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-3">
                 {exercises.filter(ex => ex.block === b).map((ex, i) => {
                    const pb = summary.personalBests[ex.key];
                    return (
                      <div key={i} className="text-center">
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-1 truncate px-1">{ex.name}</p>
                         <p className="text-base sm:text-lg font-black text-slate-800 leading-none">
                            {pb ? pb.weight : '--'}
                            <span className="text-[10px] font-bold text-slate-300 mx-1">x</span>
                            {pb ? pb.reps : '--'}
                         </p>
                      </div>
                    );
                 })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Summary;
