
import React from 'react';

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isCompleted: boolean;
  isRestDay: boolean;
  blockNumber?: number;
  onClick: () => void;
  t: any;
}

const DayCell: React.FC<DayCellProps> = ({ day, isToday, isCompleted, isRestDay, blockNumber, onClick, t }) => {
  if (day === null) {
    return <div className="h-16 sm:h-32 bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-2xl"></div>;
  }

  let bgColor = 'bg-white border-slate-200 text-slate-700';
  let ringColor = '';

  if (isCompleted) {
    bgColor = 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-200';
    ringColor = 'ring-1 sm:ring-2 ring-emerald-500 ring-offset-1 sm:ring-offset-2';
  } else if (isRestDay) {
    bgColor = 'bg-amber-400 border-amber-500 text-amber-900 shadow-md shadow-amber-100';
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative h-16 sm:h-32 p-2 sm:p-3 border transition-all duration-300 rounded-xl sm:rounded-2xl flex flex-col items-start group active:scale-95
        ${bgColor} ${ringColor}
      `}
    >
      <span className={`
        text-[10px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full
        ${isToday 
          ? (isCompleted ? 'bg-white text-emerald-600' : isRestDay ? 'bg-amber-900 text-white' : 'bg-slate-800 text-white') 
          : ''
        }
      `}>
        {day}
      </span>
      
      {isCompleted && blockNumber && (
        <div className="mt-auto w-full flex flex-col items-center justify-center pb-1">
          <span className="text-lg sm:text-3xl font-black leading-none tracking-tighter">B{blockNumber}</span>
        </div>
      )}

      {!isCompleted && isRestDay && (
        <div className="mt-auto w-full text-center pb-1">
           <span className="text-[8px] sm:text-[10px] uppercase font-black opacity-60">{t.rest}</span>
        </div>
      )}
      
      {!isCompleted && !isRestDay && isToday && (
        <div className="mt-auto w-full flex flex-col items-center pb-1">
           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  );
};

export default DayCell;
