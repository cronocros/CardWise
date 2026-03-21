'use client';

import React from 'react';
import { Plus, ChevronLeft, ChevronRight, FileUp, Calendar } from 'lucide-react';
import { AreaTrendChart, SimplePieChart } from '@/components/mobile/charts';
import { LedgerCalendar } from '@/components/mobile/calendar';
import { TransactionItem } from '@/components/mobile/cards';
import { GroupLedgerView } from '@/components/mobile/group-ledger';
import { Transaction, CategoryData } from '@/types/mobile';
import { Mascot } from '@/components/mobile/mascot';
import { Sparkles } from 'lucide-react';

interface LedgerViewProps {
  selectedLedgerDate: Date;
  setSelectedLedgerDate: (val: Date) => void;
  categories: CategoryData[];
  transactions: Transaction[];
  setSelectedTx: (tx: Transaction) => void;
  router: { push: (url: string) => void };
}

export function LedgerView({
  selectedLedgerDate,
  setSelectedLedgerDate,
  categories,
  transactions,
  setSelectedTx,
  router
}: LedgerViewProps) {
  const [viewMode, setViewMode] = React.useState<'calendar' | 'history' | 'group'>('calendar');
  const [visibleDays, setVisibleDays] = React.useState(10);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  const groupedTransactions = transactions.reduce((groups, tx) => {
    const dateKey = new Date(tx.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const groupEntries = Object.entries(groupedTransactions);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleDays(prev => prev + 10);
      setIsLoadingMore(false);
    }, 800);
  };

  return (
    <div className="animate-spring space-y-4 pt-5 pb-20">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Personal Budgeting</p>
          <h2 className="text-[26px] font-black text-gray-800 tracking-tighter">가계부</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-gray-50 text-gray-400 active:scale-90 transition-all border border-gray-100/50">
            <FileUp size={20} />
          </button>
          <button onClick={() => router.push('/mobile/ledger-entry')}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-gray-50 text-gray-400 active:scale-90 transition-all border border-gray-100/50">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex p-1.5 bg-gray-50 rounded-[28px] border border-gray-100 mb-6">
        {[
          {id: 'calendar', label: '달력'}, 
          {id: 'history', label: '목록'},
          {id: 'group', label: '공동'}
        ].map(tab => (
          <button key={tab.id} onClick={() => setViewMode(tab.id as 'calendar' | 'history' | 'group')}
            className={`flex-1 py-3.5 rounded-[22px] font-black text-[13px] transition-all duration-300 ${
              viewMode === tab.id ? 'bg-white shadow-md text-gray-800' : 'text-gray-400 font-bold'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'group' ? (
        <GroupLedgerView />
      ) : viewMode === 'calendar' ? (
        <div className="animate-fade-in space-y-4">
           <div className="flex items-center justify-between p-7 rounded-[40px] bg-white border border-gray-50 shadow-xl">
             <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-800 active:scale-75 transition-transform"><ChevronLeft size={20} /></button>
             <div className="text-center">
                <h3 className="text-xl font-black text-gray-800 tracking-tighter">2026년 3월</h3>
                <p className="text-[11px] font-black text-rose-500 mt-1 tracking-tight">지출 계: ₩{totalExpense.toLocaleString()}</p>
             </div>
             <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-800 active:scale-75 transition-transform"><ChevronRight size={20} /></button>
           </div>

           <section className="p-8 rounded-[48px] bg-white border border-gray-50 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[16px] font-black text-gray-800 tracking-tight">지출 트렌드</h3>
                 <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest">최근 6개월</span>
              </div>
              <AreaTrendChart />
              <div className="mt-10 flex items-center gap-6">
                 <div className="flex-[1.5]">
                    <h4 className="text-[13px] font-black text-gray-400 uppercase tracking-widest opacity-60 mb-1">카테고리 비율</h4>
                    <p className="text-[17px] font-black text-gray-800 tracking-tight">가장 많이 쓴 카테고리</p>
                    <p className="text-[22px] font-black text-rose-500 tracking-tighter">식사 (30%)</p>
                 </div>
                 <div className="flex-1 flex justify-end">
                    <SimplePieChart data={categories} />
                 </div>
              </div>
           </section>

           <LedgerCalendar 
             selectedDate={selectedLedgerDate}
             onDateSelect={setSelectedLedgerDate}
             onViewDetail={() => setViewMode('history')}
             transactions={transactions}
           />

           <section className="mt-8">
              <div className="flex items-center justify-between mb-4 px-4">
                <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">
                  {selectedLedgerDate.getDate()}일 소비 현황
                </h3>
              </div>
              <div className="bg-white rounded-[44px] border border-gray-100 shadow-xl overflow-hidden divide-y divide-gray-50">
                {transactions
                  .filter(tx => {
                    const txDate = new Date(tx.date);
                    return txDate.getDate() === selectedLedgerDate.getDate() && txDate.getMonth() === selectedLedgerDate.getMonth();
                  }).length > 0 ? (
                    transactions
                      .filter(tx => {
                        const txDate = new Date(tx.date);
                        return txDate.getDate() === selectedLedgerDate.getDate() && txDate.getMonth() === selectedLedgerDate.getMonth();
                      })
                      .map(tx => <TransactionItem key={tx.id} tx={tx} onClick={() => setSelectedTx(tx)} />)
                  ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                       <Mascot pose="thinking" size={90} className="mb-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                       <p className="text-[17px] font-black text-slate-300 tracking-tight">이날은 지출 내역이 없어요</p>
                       <p className="text-[12px] font-bold text-slate-200 mt-2">다른 날짜를 선택해보세요!</p>
                    </div>
                  )
                }
              </div>
           </section>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col gap-4 p-8 rounded-[48px] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <FileUp size={80} />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                  <div className="px-2.5 py-1 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                     <Sparkles size={10} className="text-rose-300" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">Transaction History</p>
                  </div>
               </div>
               <h3 className="text-[34px] font-black tracking-tighter mb-6 leading-none">전체 소비 내역</h3>
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1.5">총 지출</span>
                     <span className="text-[22px] font-black text-rose-400 font-display tracking-tight">₩{totalExpense.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col">
                     <span className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1.5">총 수입</span>
                     <span className="text-[22px] font-black text-emerald-400 font-display tracking-tight">₩{totalIncome.toLocaleString()}</span>
                  </div>
               </div>
             </div>
             <button onClick={() => setViewMode('calendar')} className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                <Calendar size={18} />
             </button>
          </div>

          <div className="space-y-8 pb-32 px-2">
            {groupEntries.slice(0, visibleDays).map(([date, dailyTxs]) => (
              <div key={date} className="animate-fade-in">
                <div className="flex items-center justify-between mb-4 px-2">
                   <h4 className="text-[14px] font-black text-slate-400 tracking-tight">{date}</h4>
                   <span className="text-[11px] font-black text-slate-300">
                     {dailyTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}원 지출
                   </span>
                </div>
                <div className="bg-white rounded-[44px] border border-gray-100 shadow-xl overflow-hidden divide-y divide-gray-50">
                  {dailyTxs.map(tx => (
                    <TransactionItem 
                      key={tx.id} 
                      tx={tx} 
                      onClick={() => setSelectedTx(tx)}
                    />
                  ))}
                </div>
              </div>
            ))}
            
             {visibleDays < groupEntries.length && (
               <div className="flex flex-col items-center justify-center py-16 group/load">
                 {isLoadingMore ? (
                   <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                     <Mascot pose="celebrating" size={64} className="animate-bounce" />
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                       <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse [animation-delay:0.2s]" />
                       <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse [animation-delay:0.4s]" />
                       <span className="text-[14px] font-black text-slate-800 tracking-tighter">타임머신 탑승 중...</span>
                     </div>
                   </div>
                 ) : (
                   <button 
                     onClick={handleLoadMore}
                     className="px-12 py-6 rounded-[32px] bg-white border border-gray-100 text-[15px] font-black text-slate-800 hover:shadow-2xl hover:border-rose-100 hover:-translate-y-1 transition-all duration-500 active:scale-95 shadow-xl group/btn overflow-hidden relative"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-orange-50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                     <span className="relative z-10 flex items-center gap-3">
                        과거 내역 10일치 더 가져오기
                        <ChevronRight size={18} className="text-rose-500 group-hover/load:translate-x-1 transition-transform" />
                     </span>
                   </button>
                 )}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
