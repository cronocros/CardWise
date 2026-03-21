'use client';

import React from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown, FileUp, Sparkles, Search, SearchX, X, Tag, CalendarDays } from 'lucide-react';
import { AreaTrendChart, SimplePieChart } from '@/components/mobile/charts';
import { LedgerCalendar } from '@/components/mobile/calendar';
import { TransactionItem } from '@/components/mobile/cards';
import { GroupLedgerView } from '@/components/mobile/group-ledger';
import { Transaction, CategoryData } from '@/types/mobile';
import { Mascot } from '@/components/mobile/mascot';
interface LedgerViewProps {
  selectedLedgerDate: Date;
  setSelectedLedgerDate: (val: Date) => void;
  categories: CategoryData[];
  transactions: Transaction[];
  setSelectedTx: (tx: Transaction) => void;
  router: { push: (url: string) => void };
  visibleSections?: string[];
}

export function LedgerView({
  selectedLedgerDate,
  setSelectedLedgerDate,
  categories,
  transactions,
  setSelectedTx,
  router,
  visibleSections = ['summary', 'trend', 'calendar', 'dailyList']
}: LedgerViewProps) {
  const [viewMode, setViewMode] = React.useState<'calendar' | 'history' | 'group'>('calendar');
  const [visibleDays, setVisibleDays] = React.useState(10);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // 다중 필터 상태
  const [searchCategories, setSearchCategories] = React.useState<string[]>([]);
  const [searchTags, setSearchTags] = React.useState<string[]>([]);
  const [searchPeriod, setSearchPeriod] = React.useState<{ type: string; start?: string; end?: string }>({ type: 'all' });
  
  // 필터 모달 상태
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterModalTab, setFilterModalTab] = React.useState<'category'|'period'|'tag'>('category');

  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState<number | null>(null);

  // 필터 적용 메커니즘
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
       // Search Query (name match)
       if (searchQuery) {
          const matchTitle = (tx.name || '').toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchTitle) return false;
       }
       // Categories (Multiple OR)
       if (searchCategories.length > 0 && !searchCategories.includes(tx.category)) return false;
       
       // Tags (Multiple OR)
       if (searchTags.length > 0) {
          const hasMatchedTag = searchTags.some(tag => tx.tags?.includes(tag));
          if (!hasMatchedTag) return false;
       }
       
       // Period match
       if (searchPeriod.type !== 'all') {
          const txDate = new Date(tx.date);
          const now = new Date();
          
          if (searchPeriod.type === 'custom' && searchPeriod.start && searchPeriod.end) {
             const start = new Date(searchPeriod.start);
             const end = new Date(searchPeriod.end);
             end.setHours(23, 59, 59, 999);
             const txTime = txDate.getTime();
             if (txTime < start.getTime() || txTime > end.getTime()) return false;
          } else if (searchPeriod.type !== 'custom') {
             const pType = searchPeriod.type.slice(-1); // '7d', '1m', '3m'
             const pVal = parseInt(searchPeriod.type.slice(0, -1));
             
             if (pType === 'd') {
                const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
                if (diffDays > pVal) return false;
             } else if (pType === 'm') {
                const diffMonths = (now.getFullYear() - txDate.getFullYear()) * 12 + (now.getMonth() - txDate.getMonth());
                if (diffMonths > pVal) return false;
             }
          }
       }
       return true;
    });
  }, [transactions, searchQuery, searchCategories, searchTags, searchPeriod]);

  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
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
    <div className="animate-spring space-y-3 pt-3 pb-20">
      <div className="flex items-center gap-2 mb-1">
         <div className="flex-1 p-1 bg-gray-50/50 rounded-[22px] border border-gray-100 flex items-center">
          {['calendar', 'history', 'group'].map(id => (
            <button key={id} onClick={() => setViewMode(id as 'calendar' | 'history' | 'group')}
              className={`flex-1 py-2.5 rounded-[18px] font-black font-display text-[13px] tracking-tight transition-all duration-300 ${
                viewMode === id ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
              }`}>
              {id === 'calendar' ? '달력' : id === 'history' ? '목록' : '공동'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
           <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white text-gray-400 active:scale-90 transition-all border border-gray-100 shadow-sm">
             <FileUp size={16} />
           </button>
           <button onClick={() => router.push('/mobile/ledger-entry')}
             className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white text-slate-700 active:scale-95 transition-all border border-gray-100 shadow-[0_5px_15px_-5px_rgba(15,23,42,0.1)]">
             <Plus size={22} strokeWidth={2.5} />
           </button>
        </div>
      </div>

      {viewMode === 'group' ? (
        <GroupLedgerView />
      ) : viewMode === 'calendar' ? (
        <div className="animate-fade-in space-y-3">
          {visibleSections.map(section => {
            if (section === 'summary') {
              return (
                 <div key="summary" className="px-4 py-2.5 flex items-center justify-between gap-3">
                   <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 active:scale-75 transition-transform"><ChevronLeft size={16} /></button>
                   
                   <div className="flex-1 text-center">
                      <h3 className="text-[16px] font-black text-slate-800 tracking-tighter mb-0.5">2026년 3월</h3>
                      <div className="flex items-center justify-center gap-4">
                         <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black text-gray-400">수입</span>
                            <span className="text-[14px] font-black text-emerald-500 tracking-tighter leading-none">₩{totalIncome.toLocaleString()}</span>
                         </div>
                         <div className="w-px h-3 bg-gray-100" />
                         <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black text-gray-400">지출</span>
                            <span className="text-[14px] font-black text-rose-500 tracking-tighter leading-none">₩{totalExpense.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
      
                   <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 active:scale-75 transition-transform"><ChevronRight size={16} /></button>
                 </div>
              );
            }
            if (section === 'trend') {
              return (
                 <section key="trend" className="p-5 rounded-[36px] bg-white border border-gray-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-1.5">
                          <div className="w-1 h-2.5 bg-rose-500 rounded-full" />
                          <h3 className="text-[14px] font-black text-gray-800 tracking-tight flex items-center gap-1.5">
                            지출 트렌드
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded-md text-[9px] font-bold text-slate-500 whitespace-nowrap">최근 6개월</span>
                          </h3>
                       </div>
                       <button onClick={() => setViewMode("history")} className="flex items-center gap-0.5 text-[12px] font-black text-rose-500 hover:text-rose-600 active:scale-95 transition-all">
                         상세보기 <ChevronRight size={14} />
                       </button>
                    </div>
                    <div className="scale-y-90 origin-top -mb-4">
                      <AreaTrendChart />
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                       <div className="flex-[1.5]">
                          <p className="text-[16px] font-black tracking-tighter transition-colors duration-300" style={{
                            color: activeCategoryIndex !== null && categories[activeCategoryIndex] && categories[activeCategoryIndex].color
                              ? categories[activeCategoryIndex].color : '#f43f5e'
                          }}>
                            {activeCategoryIndex !== null && categories[activeCategoryIndex] 
                              ? `${categories[activeCategoryIndex].name} (${categories[activeCategoryIndex].percent}%)` 
                              : categories.length > 0 
                                ? `${categories[0].name} (${categories[0].percent}%)` 
                                : '내역 없음'}
                          </p>
                       </div>
                       <div className="flex-1 flex justify-end">
                          <SimplePieChart data={categories} onHoverChange={setActiveCategoryIndex} />
                       </div>
                    </div>
                 </section>
              );
            }
            if (section === 'calendar') {
              return (
                 <div key="calendar">
                   <LedgerCalendar 
                     selectedDate={selectedLedgerDate}
                     onDateSelect={setSelectedLedgerDate}
                     transactions={filteredTransactions}
                   />
                 </div>
              );
            }
            if (section === 'dailyList') {
              return (
                 <section key="dailyList" className="mt-4">
                    <div className="flex items-center justify-between mb-4 px-4">
                      <h3 className="text-[16px] font-black text-slate-800 tracking-tighter">
                        {String(selectedLedgerDate.getMonth() + 1).padStart(2, "0")}월 {String(selectedLedgerDate.getDate()).padStart(2, "0")}일 ({["일","월","화","수","목","금","토"][selectedLedgerDate.getDay()]}) 소비 현황
                      </h3>
                      <button onClick={() => setViewMode("history")} className="flex items-center gap-0.5 text-[12px] font-black text-slate-400 active:scale-95 transition-all">상세보기 <ChevronRight size={14} /></button>
                    </div>
                    <div className="bg-white rounded-[38px] border border-gray-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden divide-y divide-gray-50 px-3 py-1">
                      {filteredTransactions
                        .filter(tx => {
                          const txDate = new Date(tx.date);
                          return txDate.getDate() === selectedLedgerDate.getDate() && txDate.getMonth() === selectedLedgerDate.getMonth();
                        }).length > 0 ? (
                          filteredTransactions
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
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col gap-4 p-6 rounded-[32px] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <FileUp size={80} />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                  <div className="px-2.5 py-1 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                     <Sparkles size={10} className="text-rose-300" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">소비 내역</p>
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
             <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all z-20">
                <Search size={18} />
             </button>
          </div>

          {isSearchOpen && (
             <div className="animate-in slide-in-from-top-4 fade-in duration-300 mx-2 p-3 rounded-[24px] bg-white border border-gray-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] relative z-0 mt-3 mb-2 space-y-3">
                {/* 검색 인풋 영역 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 rounded-[16px] border border-gray-100/50 focus-within:bg-white focus-within:border-slate-800 transition-all focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.05)]">
                   <Search size={16} className="text-gray-400 shrink-0" />
                   <input 
                      type="text" 
                      placeholder="결제명을 검색해보세요"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none text-[14px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 leading-none py-1.5"
                   />
                   {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center active:scale-90 transition-transform shrink-0">
                       <SearchX size={14} />
                     </button>
                   )}
                </div>
                
                {/* 1줄 필터 바 (필터 모달 호출 버튼 칩스) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                   {/* 카테고리 필터 버튼 */}
                   <button 
                      onClick={() => { setFilterModalTab('category'); setIsFilterModalOpen(true); }}
                      className={`shrink-0 flex items-center gap-1.5 font-bold text-[13px] pl-3 py-1.5 rounded-[12px] pr-2 transition-colors border ${
                        searchCategories.length === 0 ? 'bg-white text-slate-500 border-gray-200 hover:bg-gray-50' : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      }`}
                   >
                      {searchCategories.length === 0 ? '모든 분류' : searchCategories.length === 1 ? searchCategories[0] : `${searchCategories[0]} 외 ${searchCategories.length-1}개`}
                      <ChevronDown size={14} className={`pointer-events-none ${searchCategories.length === 0 ? 'text-slate-400' : 'text-slate-300'}`} />
                   </button>

                   {/* 조회 기간 필터 버튼 */}
                   <button 
                      onClick={() => { setFilterModalTab('period'); setIsFilterModalOpen(true); }}
                      className={`shrink-0 flex items-center gap-1.5 font-bold text-[13px] pl-3 py-1.5 rounded-[12px] pr-2 transition-colors border ${
                        searchPeriod.type === 'all' ? 'bg-white text-slate-500 border-gray-200 hover:bg-gray-50' : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      }`}
                   >
                      {searchPeriod.type === 'all' ? '모든 기간' : searchPeriod.type === 'custom' ? '직접 설정' : { '7d': '최근 1주일', '1m': '최근 1개월', '3m': '최근 3개월' }[searchPeriod.type]}
                      <ChevronDown size={14} className={`pointer-events-none ${searchPeriod.type === 'all' ? 'text-slate-400' : 'text-slate-300'}`} />
                   </button>

                   {/* 태그 영역 리스트 및 추가 버튼 */}
                   <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                   
                   {searchTags.map(tag => (
                      <button 
                         key={tag}
                         onClick={() => setSearchTags(prev => prev.filter(t => t !== tag))}
                         className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[13px] font-bold bg-rose-50 border border-rose-200 text-rose-600 shadow-sm hover:bg-rose-100 transition-all"
                      >
                         #{tag}
                         <X size={12} className="opacity-60 hover:opacity-100" />
                      </button>
                   ))}

                   <button 
                      onClick={() => { setFilterModalTab('tag'); setIsFilterModalOpen(true); }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-bold bg-white border border-dashed border-gray-300 text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-all"
                   >
                      <Plus size={14} /> 태그 검색
                   </button>
                </div>
             </div>
          )}

          {/* 상세 필터 모달 (Bottom Sheet) */}
          {isFilterModalOpen && (
             <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsFilterModalOpen(false)} />
                <div className="relative bg-white rounded-t-[32px] p-6 pb-8 animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col">
                   <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[20px] font-black text-slate-800 tracking-tight">상세 필터</h3>
                      <button onClick={() => { setSearchCategories([]); setSearchTags([]); setSearchPeriod({ type: 'all' }); }} className="text-[13px] font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-all bg-gray-50 px-3 py-1.5 rounded-full">모두 초기화</button>
                   </div>
                   
                   <div className="flex items-center gap-2 mb-6 p-1.5 bg-gray-50 rounded-[16px]">
                     {['category', 'period', 'tag'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setFilterModalTab(tab as 'category' | 'period' | 'tag')}
                          className={`flex-1 py-2 rounded-xl text-[14px] font-bold transition-all ${filterModalTab === tab ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           {tab === 'category' ? '카테고리' : tab === 'period' ? '조회 기간' : '태그'}
                        </button>
                     ))}
                   </div>

                   <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2 pb-4 min-h-[50vh]">
                     {filterModalTab === 'category' && (
                        <div className="flex flex-wrap gap-2.5">
                           <button onClick={() => setSearchCategories([])} className={`px-4 py-2.5 rounded-2xl text-[14px] font-bold border-2 transition-all ${searchCategories.length === 0 ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-gray-100 hover:border-gray-200'}`}>전체 카테고리</button>
                           {Array.from(new Set(categories.map(c => c.name))).map(cat => (
                             <button 
                               key={cat}
                               onClick={() => setSearchCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                               className={`px-4 py-2.5 rounded-2xl text-[14px] font-bold border-2 transition-all cursor-pointer ${searchCategories.includes(cat) ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-white text-slate-600 border-gray-100 hover:border-gray-200'}`}
                             >
                               {cat}
                             </button>
                           ))}
                        </div>
                     )}
                     
                     {filterModalTab === 'tag' && (
                        <div className="flex flex-wrap gap-2">
                           {Array.from(new Set(transactions.flatMap(tx => tx.tags || []))).map(tag => (
                             <button 
                               key={tag}
                               onClick={() => setSearchTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                               className={`px-3 py-2 rounded-xl text-[14px] font-bold border-2 transition-all cursor-pointer ${searchTags.includes(tag) ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-white text-slate-500 border-gray-100 hover:border-gray-200'}`}
                             >
                               #{tag}
                             </button>
                           ))}
                           {Array.from(new Set(transactions.flatMap(tx => tx.tags || []))).length === 0 && (
                             <div className="py-12 w-full flex flex-col items-center justify-center text-center">
                               <Tag size={40} className="text-gray-200 mb-3" />
                               <span className="text-[15px] font-bold text-slate-400">등록된 태그가 아직 없어요</span>
                             </div>
                           )}
                        </div>
                     )}
                     
                     {filterModalTab === 'period' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-3">
                             {[{ id: 'all', label: '전체 시간' }, { id: '7d', label: '최근 1주일' }, { id: '1m', label: '최근 1개월' }, { id: '3m', label: '최근 3개월' }].map(p => (
                                <button 
                                  key={p.id}
                                  onClick={() => setSearchPeriod({ type: p.id })}
                                  className={`py-3.5 rounded-2xl text-[14px] font-bold border-2 transition-all cursor-pointer ${searchPeriod.type === p.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-gray-100 hover:border-gray-200'}`}
                                >
                                  {p.label}
                                </button>
                             ))}
                           </div>
                           
                           <div className="pt-6 border-t border-gray-100">
                             <div className="flex items-center gap-2 mb-4">
                               <CalendarDays size={16} className="text-rose-500" />
                               <p className="text-[14px] font-black text-slate-800 tracking-tight">직접 설정</p>
                             </div>
                             <div className="flex items-center gap-3">
                               <div className={`flex-1 bg-white border-2 rounded-2xl px-4 py-3.5 focus-within:border-slate-800 transition-colors ${searchPeriod.type === 'custom' ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100'}`}>
                                 <input 
                                   type="date" 
                                   value={searchPeriod.start || ''} 
                                   onChange={e => setSearchPeriod({ type: 'custom', start: e.target.value, end: searchPeriod.end })}
                                   className="w-full bg-transparent border-none text-[14px] font-bold text-slate-700 outline-none focus:ring-0 p-0" 
                                 />
                               </div>
                               <span className="text-slate-300 font-black text-[18px]">-</span>
                               <div className={`flex-1 bg-white border-2 rounded-2xl px-4 py-3.5 focus-within:border-slate-800 transition-colors ${searchPeriod.type === 'custom' ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100'}`}>
                                 <input 
                                   type="date" 
                                   value={searchPeriod.end || ''} 
                                   onChange={e => setSearchPeriod({ type: 'custom', start: searchPeriod.start, end: e.target.value })}
                                   className="w-full bg-transparent border-none text-[14px] font-bold text-slate-700 outline-none focus:ring-0 p-0" 
                                 />
                               </div>
                             </div>
                           </div>
                        </div>
                     )}
                   </div>
                   
                   <button onClick={() => setIsFilterModalOpen(false)} className="mt-4 w-full py-4.5 bg-slate-900 rounded-[24px] text-white font-black text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(15,23,42,0.3)]">
                     필터 닫기 및 결과보기
                   </button>
                </div>
             </div>
          )}

          <div className="space-y-8 pb-32 px-2">
            {groupEntries.slice(0, visibleDays).map(([date, dailyTxs]) => (
              <div key={date} className="animate-fade-in">
                <div className="flex items-center justify-between mb-4 px-2">
                   <h4 className="text-[14px] font-black text-slate-400 tracking-tight">{date}</h4>
                   <span className="text-[11px] font-black text-slate-300">
                     {dailyTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}원 지출
                   </span>
                </div>
                <div className="bg-white rounded-[38px] border border-gray-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden divide-y divide-gray-50 px-3 py-1">
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


