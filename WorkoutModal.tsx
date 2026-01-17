
import React, { useState, useEffect, useRef } from 'react';
import { BlockStats, Language, ExerciseSet, WorkoutEntry } from './types';

interface WorkoutModalProps {
  date: Date;
  isCompleted: boolean;
  currentEntry?: WorkoutEntry;
  prevStats: { [key: number]: BlockStats };
  onSave: (block: 1 | 2 | 3, exA: ExerciseSet[], exB: ExerciseSet[], duration: number) => void;
  onClear: () => void;
  onClose: () => void;
  lang: Language;
  t: any;
}

const getBlockData = (lang: Language) => [
  { id: 1, title: 'Block 1', exercises: [{ name: 'Barbell Curl' }, { name: 'French Press' }] },
  { id: 2, title: 'Block 2', exercises: [{ name: 'Military Press' }, { name: 'Reverse Curl' }] },
  { id: 3, title: 'Block 3', exercises: [{ name: 'Upright Row' }, { name: 'Wrist Curl' }] }
];

const WorkoutModal: React.FC<WorkoutModalProps> = ({ 
  date, isCompleted, currentEntry, prevStats, onSave, onClear, onClose, lang, t 
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<1 | 2 | 3>((currentEntry?.blockNumber as 1 | 2 | 3) || 1);
  const [mode, setMode] = useState<'setup' | 'countdown' | 'active' | 'summary'>(isCompleted ? 'summary' : 'setup');
  const [setsA, setSetsA] = useState<ExerciseSet[]>(currentEntry?.exerciseA || [{weight:0,reps:20},{weight:0,reps:20},{weight:0,reps:20}]);
  const [setsB, setSetsB] = useState<ExerciseSet[]>(currentEntry?.exerciseB || [{weight:0,reps:20},{weight:0,reps:20},{weight:0,reps:20}]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode === 'active') {
      timerIntervalRef.current = window.setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [mode]);

  useEffect(() => {
    let interval: number;
    if (restTimer !== null && restTimer > 0) {
      interval = window.setInterval(() => setRestTimer(t => (t !== null ? t - 1 : 0)), 1000);
    } else if (restTimer === 0) {
      if (window.navigator.vibrate) window.navigator.vibrate([500, 200, 500]);
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const startHoldFinish = () => {
    setHoldProgress(0);
    holdIntervalRef.current = window.setInterval(() => {
      setHoldProgress(p => {
        if (p >= 100) {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          onSave(selectedBlockId, setsA, setsB, timerSeconds);
          setMode('summary');
          return 100;
        }
        return p + 2.5;
      });
    }, 50);
  };

  const stopHoldFinish = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-300 max-h-[95vh] flex flex-col">
        <div className="p-6 sm:p-8 flex-grow overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
               {mode === 'active' ? `Block ${selectedBlockId}` : (mode === 'summary' ? t.sessionSummary : t.selectBlock)}
             </h2>
             {mode === 'active' && <div className="px-3 py-1 bg-slate-900 text-white rounded-xl text-sm font-black tabular-nums">{formatTime(timerSeconds)}</div>}
          </div>

          {mode === 'setup' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                {[1,2,3].map(id => (
                  <button key={id} onClick={() => setSelectedBlockId(id as 1|2|3)} className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${selectedBlockId === id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}>B{id}</button>
                ))}
              </div>
              <button onClick={() => setMode('active')} className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-100">{t.start}</button>
            </div>
          )}

          {mode === 'active' && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setRestTimer(60)} className="py-3 bg-amber-50 text-amber-700 font-black rounded-xl border border-amber-100 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    60s Rest
                  </button>
                  <button onClick={() => setRestTimer(90)} className="py-3 bg-indigo-50 text-indigo-700 font-black rounded-xl border border-indigo-100 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    90s Rest
                  </button>
               </div>

               {restTimer !== null && (
                 <div className="py-8 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-slate-100 animate-in zoom-in-95">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                       <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                          <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="276" strokeDashoffset={276 - (276 * restTimer) / (restTimer > 60 ? 90 : 60)} className="text-amber-500 transition-all duration-1000" />
                       </svg>
                       <span className="text-2xl font-black tabular-nums">{restTimer}s</span>
                    </div>
                    <button onClick={() => setRestTimer(null)} className="mt-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                 </div>
               )}

               <div className="relative pt-8">
                 <div className="absolute top-0 inset-x-0 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-50" style={{ width: `${holdProgress}%` }} />
                 </div>
                 <button onPointerDown={startHoldFinish} onPointerUp={stopHoldFinish} onPointerLeave={stopHoldFinish} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all touch-none select-none">
                   {t.finish}
                 </button>
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">{t.holdToFinish}</p>
               </div>
            </div>
          )}

          {mode === 'summary' && (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Duration</p>
                <p className="text-4xl font-black text-emerald-900">{formatTime(timerSeconds)}</p>
              </div>
              <button onClick={onClear} className="w-full py-4 border-2 border-slate-100 text-slate-400 font-bold rounded-2xl">{t.remove}</button>
              <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl">{t.close}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
