
import React, { useState, useEffect, useMemo } from 'react';
import { ProgressData, MonthSummary, WorkoutEntry, BlockStats, Language, ExerciseSet } from './types';
import { saveProgress, loadProgress } from './storageService';
import CalendarHeader from './CalendarHeader';
import DayCell from './DayCell';
import WorkoutModal from './WorkoutModal';
import Summary from './Summary';
import AICoach from './AICoach';

const translations = {
  en: {
    title: 'BLOCK TRAINING',
    subtitle: 'Progress Tracker',
    today: 'Today',
    rest: 'Rest',
    footer: 'Visualize your progress',
    monthlyReport: 'Monthly Achievement',
    days: 'days',
    export: 'Export Data',
    import: 'Import Data',
    settings: 'Settings',
    confirmImport: 'Importing will overwrite current data. Continue?',
    growth: 'Growth',
    consistency: 'Consistency',
    lastWeights: 'Personal Bests (Max Weight x Reps)',
    block: 'Block',
    sessionSummary: 'Session Summary',
    remove: 'Remove Entry',
    close: 'Close',
    lastTime: 'Last',
    weight: 'Weight',
    reps: 'Reps',
    set: 'Set',
    start: 'START',
    finish: 'FINISH',
    holdToFinish: 'Hold 3s to finish',
    activeTimer: 'Workout Time',
    countdown: 'Get Ready!',
    selectBlock: 'Select Training Block'
  },
  ru: {
    title: 'БЛОЧНЫЕ ТРЕНИРОВКИ',
    subtitle: 'Трекер прогресса',
    today: 'Сегодня',
    rest: 'Отдых',
    footer: 'Визуализируйте свой прогресс',
    monthlyReport: 'Достижения за месяц',
    days: 'дн.',
    export: 'Экспорт данных',
    import: 'Импорт данных',
    settings: 'Настройки',
    confirmImport: 'Импорт перезапишет текущие данные. Продолжить?',
    growth: 'Рост',
    consistency: 'Постоянство',
    lastWeights: 'Личные рекорды (Макс. Вес x Повторы)',
    block: 'Блок',
    sessionSummary: 'Итоги сессии',
    remove: 'Удалить',
    close: 'Закрыть',
    lastTime: 'Прошлый раз',
    weight: 'Вес',
    reps: 'Повторы',
    set: 'Подход',
    start: 'СТАРТ',
    finish: 'ЗАКОНЧИТЬ',
    holdToFinish: 'Удерживайте 3с',
    activeTimer: 'Время тренировки',
    countdown: 'Приготовьтесь!',
    selectBlock: 'Выберите блок'
  },
  pl: {
    title: 'TRENING BLOKOWY',
    subtitle: 'Monitor postępów',
    today: 'Dziś',
    rest: 'Odpoczynek',
    footer: 'Wizualizuj swoje postępy',
    monthlyReport: 'Osiągnięcia miesiąca',
    days: 'dni',
    export: 'Eksportuj dane',
    import: 'Importuj dane',
    settings: 'Ustawienia',
    confirmImport: 'Import nadpisze obecne dane. Kontynuować?',
    growth: 'Wzrost',
    consistency: 'Konsekwencja',
    lastWeights: 'Rekordy życiowe (Maks. Ciężar x Powt.)',
    block: 'Blok',
    sessionSummary: 'Podsumowanie sesji',
    remove: 'Usuń wpis',
    close: 'Zamknij',
    lastTime: 'Ostatnio',
    weight: 'Ciężar',
    reps: 'Powt.',
    set: 'Seria',
    start: 'START',
    finish: 'KONIEC',
    holdToFinish: 'Przytrzymaj 3s',
    activeTimer: 'Czas treningu',
    countdown: 'Przygotuj się!',
    selectBlock: 'Wybierz blok'
  }
};

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progress, setProgress] = useState<ProgressData>(loadProgress());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('fittrack_lang') as Language) || 'en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('fittrack_lang', lang);
  }, [lang]);

  const t = translations[lang];

  const handleExport = () => {
    const dataStr = JSON.stringify(progress);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.confirm(t.confirmImport)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        setProgress(importedData);
        setIsSettingsOpen(false);
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const getDateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const getPreviousDateKey = (date: Date) => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    return getDateKey(prev);
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  const prevStats = useMemo(() => {
    const emptySet = () => [{ weight: 0, reps: 20 }, { weight: 0, reps: 20 }, { weight: 0, reps: 20 }];
    const stats: { [key: number]: BlockStats } = { 
      1: { exerciseA: emptySet(), exerciseB: emptySet() }, 
      2: { exerciseA: emptySet(), exerciseB: emptySet() }, 
      3: { exerciseA: emptySet(), exerciseB: emptySet() } 
    };
    const sortedEntries = (Object.values(progress) as WorkoutEntry[])
      .filter(e => e.completed && e.blockNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (let i = 1; i <= 3; i++) {
      const lastEntry = sortedEntries.find(e => e.blockNumber === i);
      if (lastEntry) stats[i] = { exerciseA: lastEntry.exerciseA, exerciseB: lastEntry.exerciseB };
    }
    return stats;
  }, [progress]);

  const monthSummary = useMemo((): MonthSummary & { daysInMonth: number } => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let completedCount = 0;
    const pbs: { [key: string]: ExerciseSet } = {};
    const updatePB = (exKey: string, sets: ExerciseSet[]) => {
      sets.forEach(set => {
        if (!pbs[exKey] || set.weight > pbs[exKey].weight || (set.weight === pbs[exKey].weight && set.reps > pbs[exKey].reps)) {
          pbs[exKey] = { ...set };
        }
      });
    };
    Object.values(progress).forEach(entry => {
      if (entry.completed) {
        const d = new Date(entry.date);
        if (d.getFullYear() === year && d.getMonth() === month) completedCount++;
        const b = entry.blockNumber;
        updatePB(`b${b}_a`, entry.exerciseA);
        updatePB(`b${b}_b`, entry.exerciseB);
      }
    });
    return { totalWorkouts: completedCount, personalBests: pbs, daysInMonth };
  }, [currentDate, progress]);

  const handleSaveWorkout = (block: 1 | 2 | 3, exA: ExerciseSet[], exB: ExerciseSet[], duration: number) => {
    if (!selectedDate) return;
    const key = getDateKey(selectedDate);
    setProgress(prev => ({ ...prev, [key]: { completed: true, blockNumber: block, exerciseA: exA, exerciseB: exB, date: selectedDate.toISOString(), duration } }));
  };

  return (
    <div className="min-h-screen pb-10 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col">
      <nav className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">B</div>
          <div>
            <span className="text-xl font-black text-slate-800 tracking-tighter block leading-none">{t.title}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{t.subtitle}</span>
          </div>
        </div>
        
        <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-slate-600 active:rotate-90 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>
      </nav>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6">{t.settings}</h2>
            <div className="space-y-4">
              <div className="p-1 bg-slate-100 rounded-xl flex">
                {(['en', 'ru', 'pl'] as Language[]).map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${lang === l ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={handleExport} className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4 4v12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t.export}
              </button>
              <label className="w-full py-4 border-2 border-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-3 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t.import}
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-6 py-3 text-slate-400 font-bold text-sm">{t.close}</button>
          </div>
        </div>
      )}

      {Object.keys(progress).length > 2 && <AICoach data={progress} lang={lang} />}
      <Summary summary={monthSummary} lang={lang} t={t} />

      <main className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex-grow mb-10">
        <CalendarHeader 
          currentDate={currentDate} 
          onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          onToday={() => setCurrentDate(new Date())}
          t={t}
        />

        <div className="grid grid-cols-7 gap-1 sm:gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
             <div key={idx} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-3">{day}</div>
          ))}
          {monthData.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} className="h-16 sm:h-32 bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-2xl"></div>;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const key = getDateKey(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCompleted = progress[key]?.completed || false;
            const isRestDay = !isCompleted && progress[getPreviousDateKey(date)]?.completed === true;
            return <DayCell key={day} day={day} isToday={isToday} isCompleted={isCompleted} isRestDay={isRestDay} blockNumber={progress[key]?.blockNumber} onClick={() => setSelectedDate(date)} t={t} />;
          })}
        </div>
      </main>

      {selectedDate && (
        <WorkoutModal 
          date={selectedDate}
          isCompleted={progress[getDateKey(selectedDate)]?.completed || false}
          currentEntry={progress[getDateKey(selectedDate)]}
          prevStats={prevStats}
          onSave={handleSaveWorkout}
          onClear={() => {
            const key = getDateKey(selectedDate);
            setProgress(prev => { const n = {...prev}; delete n[key]; return n; });
            setSelectedDate(null);
          }}
          onClose={() => setSelectedDate(null)}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
};

export default App;
