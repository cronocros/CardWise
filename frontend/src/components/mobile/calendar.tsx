'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '@/types/mobile';

// Simple cn helper since @/lib/utils is missing
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function LedgerCalendar({ 
  selectedDate, 
  onDateSelect,
  transactions = []
}: { 
  selectedDate: Date; 
  onDateSelect: (date: Date) => void;
  transactions?: Transaction[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  // Calculate activity data from transactions for the current viewing month
  const activityData: Record<string, { income: boolean; expense: boolean }> = {};
  
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
      const day = d.getDate().toString();
      if (!activityData[day]) {
        activityData[day] = { income: false, expense: false };
      }
      if (tx.type === 'income') activityData[day].income = true;
      else activityData[day].expense = true;
    }
  });

  // Calculate selected date summary (Real data calculation)
  const selectedSummary = transactions.reduce((acc, tx) => {
    const d = new Date(tx.date);
    if (d.getDate() === selectedDate.getDate() && 
        d.getMonth() === selectedDate.getMonth() && 
        d.getFullYear() === selectedDate.getFullYear()) {
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expense += tx.amount;
    }
    return acc;
  }, { income: 0, expense: 0 });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);
  
  const today = new Date();

  return (
    <div className="px-5 py-4 rounded-[40px] bg-white border border-gray-100 shadow-xl mt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[18px] font-black text-slate-800 tracking-tight">{monthName}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="w-9 h-9 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="w-9 h-9 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <span key={d} className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em] mb-1.5",
            i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-slate-900 opacity-30"
          )}>{d}</span>
        ))}
        
        {padding.map((_, i) => <div key={`p-${i}`} className="h-10 w-10" />)}
        
        {days.map((day) => {
          const activity = activityData[String(day)];
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayOfWeek = date.getDay();
          const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          
          // Simple holiday check (Jan/March 2026)
          const isHoliday = (monthStr === '2026-01' && [1, 17, 18, 19, 20].includes(day)) || 
                          (monthStr === '2026-03' && [1, 2].includes(day));
          
          const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
          const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
          
          // Saturday blue, Sunday/Holiday red
          const dayColorClass = (dayOfWeek === 0 || isHoliday) ? "text-rose-500" : dayOfWeek === 6 ? "text-blue-500" : "text-slate-800";

          return (
            <div key={day} 
              className="relative flex flex-col items-center group cursor-pointer"
              onClick={() => onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              <span className={cn(
                "w-10 h-10 flex items-center justify-center text-[14px] font-black rounded-2xl transition-all duration-300",
                isSelected ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : 
                isToday ? "border-2 border-rose-500 text-rose-500 font-bold" : 
                cn(dayColorClass, "hover:bg-gray-50")
              )}>
                {day}
              </span>
              
              {activity && (
                <div className="absolute -bottom-1 flex items-center gap-1">
                   {activity.income && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-white shadow-sm" />}
                   {activity.expense && <div className="w-1.5 h-1.5 rounded-full bg-rose-400 border border-white shadow-sm" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 px-4 py-1.5 rounded-[22px] bg-slate-50/10 border border-slate-100/30 flex flex-col items-center">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]" />
            <span className="text-[13px] font-black text-slate-700 tracking-tighter">
              수입 <span className="text-emerald-500 font-display ml-0.5">{selectedSummary.income.toLocaleString()}원</span>
            </span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.3)]" />
            <span className="text-[13px] font-black text-slate-700 tracking-tighter">
              지출 <span className="text-rose-500 font-display ml-0.5">{selectedSummary.expense.toLocaleString()}원</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
