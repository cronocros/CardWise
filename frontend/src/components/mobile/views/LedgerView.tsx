'use client';

import React from 'react';
import { Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaTrendChart, SimplePieChart } from '@/components/mobile/charts';
import { LedgerCalendar } from '@/components/mobile/calendar';
import { TransactionItem } from '@/components/mobile/cards';
import { GroupLedgerView } from '@/components/mobile/group-ledger';
import { Transaction, CategoryData } from '@/types/mobile';

interface LedgerViewProps {
  ledgerMode: 'personal' | 'group';
  setLedgerMode: (val: 'personal' | 'group') => void;
  selectedLedgerDate: Date;
  setSelectedLedgerDate: (val: Date) => void;
  categories: CategoryData[];
  transactions: Transaction[];
  setSelectedTx: (tx: Transaction) => void;
  router: any; // NextRouter typing
}

export function LedgerView({
  ledgerMode,
  setLedgerMode,
  selectedLedgerDate,
  setSelectedLedgerDate,
  categories,
  transactions,
  setSelectedTx,
  router
}: LedgerViewProps) {
  return (
    <div className="animate-spring space-y-4 pt-5">
      {/* Page actions row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">My Budget</p>
          <h2 className="text-[26px] font-black text-gray-800 tracking-tighter">가계부</h2>
        </div>
        <button onClick={() => router.push('/mobile/ledger-entry')}
          className="flex items-center gap-2 px-4 py-3 rounded-[18px] text-white font-black text-[12px] active:scale-90 transition-all shadow-md"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
          <Plus size={14} />수기 입력
        </button>
      </div>

      {/* Personal / Group Segment Control */}
      <div className="flex p-1.5 bg-gray-50 rounded-[28px] border border-gray-100">
        {[{id: 'personal', label: '개인 가계부', icon: null}, {id: 'group', label: '공동 가계부', icon: <Users size={13} className="inline" />}].map(tab => (
          <button key={tab.id} onClick={() => setLedgerMode(tab.id as 'personal' | 'group')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[22px] font-black text-[13px] transition-all duration-300 ${
              ledgerMode === tab.id ? 'bg-white shadow-md text-gray-800' : 'text-gray-400'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {ledgerMode === 'group' ? (
        <GroupLedgerView />
      ) : (
        <>
          <div className="flex items-center justify-between p-7 rounded-[40px] bg-white border border-gray-50 shadow-xl">
            <button className="w-13 h-13 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-800 active:scale-75 transition-transform"><ChevronLeft size={24} /></button>
            <div className="text-center">
               <h3 className="text-xl font-black text-gray-800 tracking-tighter">2026년 3월</h3>
               <p className="text-[10px] font-black text-emerald-500 mt-1 tracking-[0.2em] uppercase">Status: Healthy</p>
            </div>
            <button className="w-13 h-13 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-800 active:scale-75 transition-transform"><ChevronRight size={24} /></button>
          </div>

          <section className="p-8 rounded-[48px] bg-white border border-gray-50 shadow-xl relative overflow-hidden group">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[16px] font-black text-gray-800 tracking-tight">지출 트렌드</h3>
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest">Last 6 Months</span>
             </div>
             <AreaTrendChart />
             <div className="flex justify-between px-3 mt-8 text-[11px] font-black text-gray-300 font-display tracking-widest border-b border-gray-50 pb-8">
                {['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'].map(m => <span key={m} className="hover:text-rose-400 transition-colors cursor-pointer">{m}</span>)}
             </div>

             <div className="mt-10 flex items-center gap-8">
                <div className="flex-1">
                   <h4 className="text-[13px] font-black text-gray-400 uppercase tracking-widest opacity-60 mb-1">Category Ratio</h4>
                   <p className="text-[18px] font-black text-gray-800 tracking-tighter">가장 많이 쓴 카테고리<br/><span className="text-rose-500">식사 (30%)</span></p>
                </div>
                <SimplePieChart data={categories} />
             </div>
          </section>

          <LedgerCalendar 
            selectedDate={selectedLedgerDate}
            onDateSelect={setSelectedLedgerDate}
          />

          {/* Selected Date Transactions */}
          <section className="mt-10 animate-fade-in" key={selectedLedgerDate.toISOString()}>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">
                {selectedLedgerDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 지출
              </h3>
              <span className="text-[12px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase tracking-widest">
                Personal
              </span>
            </div>
            <div className="p-7 rounded-[40px] bg-white border border-gray-100 shadow-lg space-y-2">
              {transactions
                .filter(tx => {
                  const txDate = new Date(tx.date);
                  return txDate.getDate() === selectedLedgerDate.getDate() && 
                         txDate.getMonth() === selectedLedgerDate.getMonth();
                })
                .map(tx => (
                  <TransactionItem 
                    key={tx.id} 
                    tx={tx} 
                    onClick={() => setSelectedTx(tx)}
                  />
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
