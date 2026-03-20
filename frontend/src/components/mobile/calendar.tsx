'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Simple cn helper since @/lib/utils is missing
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function LedgerCalendar({ 
  selectedDate, 
  onDateSelect 
}: { 
  selectedDate: Date; 
  onDateSelect: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  // Simplified dots system for income/expense
  const activityData: Record<string, { income: boolean; expense: boolean }> = {
    '2': { income: true, expense: false },
    '5': { income: false, expense: true },
    '8': { income: true, expense: true },
    '12': { income: false, expense: true },
    '15': { income: true, expense: false },
    '18': { income: false, expense: true },
    '22': { income: true, expense: true },
    '24': { income: false, expense: true },
    '28': { income: true, expense: false },
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="p-6 rounded-[40px] bg-white border border-gray-100 shadow-xl mt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-[18px] font-black text-slate-800 tracking-tight">{monthName}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-6 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <span key={d} className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-30", i === 0 ? "text-rose-500" : "text-slate-900")}>{d}</span>
        ))}
        
        {padding.map((_, i) => <div key={`p-${i}`} className="h-10 w-10" />)}
        
        {days.map((day) => {
          const activity = activityData[String(day)];
          const isToday = day === 20 && currentDate.getMonth() === 2; // Mock Today: Mar 20
          const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
          
          return (
            <div key={day} 
              className="relative flex flex-col items-center group cursor-pointer"
              onClick={() => onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              <span className={cn(
                "w-10 h-10 flex items-center justify-center text-[14px] font-black rounded-2xl transition-all duration-300",
                isSelected ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : 
                isToday ? "border-2 border-rose-500 text-rose-500" : "text-slate-800 hover:bg-gray-50"
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

      <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center px-2">
        <div className="flex flex-col">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Selected Detail</p>
           <p className="text-[16px] font-black text-slate-800 tracking-tight">지출 12,500원 <span className="text-gray-200 mx-1">/</span> 수입 0원</p>
        </div>
        <button className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-500 text-[11px] font-black active:scale-95 transition-all">
           상세보기
        </button>
      </div>
    </div>
  );
}
