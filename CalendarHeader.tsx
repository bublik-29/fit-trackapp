
import React from 'react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  t: any;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth,
  onToday,
  t
}) => {
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          {monthName} <span className="text-slate-400 font-light">{year}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>
      
      <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
        <button 
          onClick={onPrevMonth}
          className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={onToday}
          className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border-x border-slate-100 uppercase tracking-widest"
        >
          {t.today}
        </button>
        
        <button 
          onClick={onNextMonth}
          className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
