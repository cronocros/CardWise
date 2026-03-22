'use client';

import React from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown, FileUp, Sparkles, Search, SearchX, X, Tag, CalendarDays, LayoutGrid, RotateCcw } from 'lucide-react';
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
  
  // 오늘 날짜 기본값 (YYYY-MM-DD 형식)
  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);

  // 다중 필터 상태 - 기본값을 오늘로 설정
  const [searchCategories, setSearchCategories] = React.useState<string[]>([]);
  const [searchTags, setSearchTags] = React.useState<string[]>([]);
  const [searchPeriod, setSearchPeriod] = React.useState<{ type: string; start?: string; end?: string }>({ 
    type: 'all', 
    start: todayStr, 
    end: todayStr 
  });
  
  // 필터 모달 상태
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filterModalTab, setFilterModalTab] = React.useState<'category'|'period'|'tag'>('category');

  const [activeCategoryIndex, setActiveCategoryIndex] = React.useState<number | null>(null);

  // 날짜 선택기 제어를 위한 Ref
  const startDateRef = React.useRef<HTMLInputElement>(null);
  const endDateRef = React.useRef<HTMLInputElement>(null);

  // 날짜 선택기 열기 함수
  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (el) {
      const input = el as HTMLInputElement & { showPicker?: () => void };
      if (typeof input.showPicker === 'function') {
        try {
          input.showPicker();
        } catch {
          input.click();
        }
      } else {
        input.click();
      }
    }
  };

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

  // 필터 활성화 여부
  const isFilterActive = searchQuery !== '' || searchCategories.length > 0 || searchTags.length > 0 || searchPeriod.type !== 'all';

  // 카드에 표시할 집계 데이터 (필터 없을 땐 해당 월 기준)
  const cardSummaryData = React.useMemo(() => {
    if (!isFilterActive) {
      const now = new Date();
      const currentMonthTxs = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      });
      return {
        expense: currentMonthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
        income: currentMonthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        title: `${now.getMonth() + 1}월 소비내역`
      };
    }
    return {
      expense: filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
      income: filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      title: '필터 적용 합계'
    };
  }, [isFilterActive, transactions, filteredTransactions]);

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
          {/* 소비 내역 카드 섹션 */}
          <div className="mx-2 mb-2 relative group z-20">
             <div className="flex flex-col gap-4 p-6 rounded-[32px] bg-slate-900 text-white shadow-2xl relative overflow-hidden h-[180px] justify-center items-center">
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
               <h3 className="text-[30px] font-black tracking-tighter mb-8 text-center">{cardSummaryData.title}</h3>
               <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center text-center whitespace-nowrap">
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 font-display">총 지출 합계</span>
                     <span className="text-[20px] font-black text-rose-400 font-display tracking-tight">{cardSummaryData.expense.toLocaleString()}원</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-center text-center whitespace-nowrap">
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 font-display">총 수입 합계</span>
                     <span className="text-[20px] font-black text-emerald-400 font-display tracking-tight">{cardSummaryData.income.toLocaleString()}원</span>
                  </div>
               </div>
              </div>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all z-20 shadow-lg backdrop-blur-sm border border-white/10">
                 <Search size={18} />
              </button>
           </div>
          </div>

          {isSearchOpen && (
             <div className="animate-in slide-in-from-top-10 fade-in duration-500 mx-2 p-3 pt-16 rounded-b-[32px] bg-white border-x border-b border-gray-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] relative z-10 -mt-12 space-y-3">
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
                
                {/* 검색 필터 단축 메뉴 바 (아이콘 버튼 + 액티브 칩) - 가로 스크롤 대신 줄바꿈(Wrap) 적용 */}
                <div className="relative flex flex-wrap items-center gap-1.5 pb-1 px-1 min-h-[40px]">
                   {/* 고정된 필터 모달 아이콘 버튼들 */}
                   <div className="flex items-center gap-1.5 shrink-0 bg-gray-50/50 p-1 rounded-full border border-gray-100">
                     <button 
                        onClick={() => { setFilterModalTab('period'); setIsFilterModalOpen(true); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all ${filterModalTab === 'period' && isFilterModalOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-800'}`}
                     >
                        <CalendarDays size={15} />
                     </button>
                     <button 
                        onClick={() => { setFilterModalTab('category'); setIsFilterModalOpen(true); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all ${filterModalTab === 'category' && isFilterModalOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-800'}`}
                     >
                        <LayoutGrid size={15} />
                     </button>
                     <button 
                        onClick={() => { setFilterModalTab('tag'); setIsFilterModalOpen(true); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all ${filterModalTab === 'tag' && isFilterModalOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-800'}`}
                     >
                        <Tag size={15} />
                     </button>
                   </div>

                   {/* 구분선 */}
                   <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
                   
                   {/* 모달에서 선택한 내역이 나열되는 영역 (액티브 칩) */}
                   {searchPeriod.type !== 'all' && (
                      <button 
                         onClick={() => { setFilterModalTab('period'); setIsFilterModalOpen(true); }}
                         className="shrink-0 flex items-center gap-0.5 font-black text-[9px] px-2 py-1.5 rounded-full bg-slate-900 text-white shadow-md shadow-slate-100 transition-all active:scale-95"
                      >
                         {searchPeriod.type === 'custom' ? '직접 설정' : { '7d': '1주일', '1m': '1개월', '3m': '3개월' }[searchPeriod.type]}
                         <ChevronDown size={8} className="opacity-60" />
                      </button>
                   )}

                   {searchCategories.map(cat => (
                      <button 
                         key={cat}
                         onClick={() => setSearchCategories(prev => prev.filter(c => c !== cat))}
                         className="shrink-0 flex items-center gap-0.5 font-black text-[9px] px-2 py-1.5 rounded-full bg-slate-900 text-white shadow-md shadow-slate-100 transition-all hover:bg-slate-800 active:scale-95"
                      >
                         {cat}
                         <X size={8} className="opacity-60" />
                      </button>
                   ))}

                   {searchTags.map(tag => (
                      <button 
                         key={tag}
                         onClick={() => setSearchTags(prev => prev.filter(t => t !== tag))}
                         className="shrink-0 flex items-center gap-0.5 px-2 py-1.5 rounded-full text-[9px] font-black bg-rose-50 border border-rose-100 text-rose-500 shadow-sm hover:bg-rose-100 transition-all active:scale-95"
                      >
                         #{tag}
                         <X size={8} className="opacity-60" />
                      </button>
                   ))}

                   {/* 선택된 필터가 하나도 없을 때 안내 문구 */}
                   {searchPeriod.type === 'all' && searchCategories.length === 0 && searchTags.length === 0 && (
                      <span className="text-[12px] text-gray-400 font-bold px-2 shrink-0 animate-in fade-in">아이콘을 눌러 필터를 추가해보세요</span>
                   )}
                </div>

                {/* 팝오버 필터 (Popover) - 가로 스크롤 영역 밖의 상위 컨테이너에 위치하며 레이어 순서를 최상단으로 설정 */}
                {isFilterModalOpen && (
                   <div className="absolute top-full left-0 right-0 z-[200] mt-1 animate-in fade-in slide-in-from-top-2 duration-200 px-1">
                      {/* 배경 클릭 감지 (닫기) - 딤 처리 강화 및 블러 처리 */}
                      <div className="fixed inset-0 z-0 bg-slate-900/15 backdrop-blur-[3px]" onClick={() => setIsFilterModalOpen(false)} />
                      
                      {/* 실제 팝오버 본체 - 크기 축소 및 디자인 정밀화 */}
                      <div className="relative z-10 w-full bg-white rounded-[22px] border border-slate-100 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.3)] p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3 px-1">
                           <div className="flex items-center gap-1.5">
                              <span className="w-1 h-4 bg-slate-900 rounded-full" />
                              <h4 className="text-[13px] font-black text-slate-800 tracking-tight">
                                 {filterModalTab === 'category' ? '분류 선택' : filterModalTab === 'period' ? '기간 설정' : '태그 필터'}
                              </h4>
                           </div>
                           <button onClick={() => { setSearchCategories([]); setSearchTags([]); setSearchPeriod({ type: 'all' }); }} className="flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
                              <RotateCcw size={10} />
                              초기화
                           </button>
                        </div>

                        <div className="max-h-[30vh] overflow-y-auto no-scrollbar px-0.5 pb-0.5">
                           {filterModalTab === 'category' && (
                              <div className="flex flex-wrap gap-1.5">
                                 <button onClick={() => setSearchCategories([])} className={`px-3 py-1.5 rounded-lg text-[12px] font-black border transition-all ${searchCategories.length === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-gray-50 text-slate-400 border-transparent hover:border-gray-200'}`}>전체</button>
                                 {Array.from(new Set(categories.map(c => c.name))).map(cat => (
                                    <button 
                                      key={cat}
                                      onClick={() => setSearchCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                                      className={`px-3 py-1.5 rounded-lg text-[12px] font-black border transition-all ${searchCategories.includes(cat) ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-gray-50 text-slate-500 border-transparent hover:border-gray-200'}`}
                                    >
                                      {cat}
                                    </button>
                                 ))}
                              </div>
                           )}

                           {filterModalTab === 'period' && (
                              <div className="space-y-3">
                                 <div className="grid grid-cols-2 gap-1.5">
                                    {[{ id: 'all', label: '전체 시간' }, { id: '7d', label: '최근 1주일' }, { id: '1m', label: '최근 1개월' }, { id: '3m', label: '최근 3개월' }].map(p => (
                                       <button 
                                          key={p.id}
                                          onClick={() => setSearchPeriod({ type: p.id })}
                                          className={`py-1.5 rounded-lg text-[12px] font-black border transition-all ${searchPeriod.type === p.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-gray-50 text-slate-500 border-transparent hover:border-gray-200'}`}
                                       >
                                          {p.label}
                                       </button>
                                    ))}
                                 </div>
                                 <div className="pt-3 border-t border-gray-50">
                                    <p className="text-[10px] font-black text-slate-400 mb-1.5 px-0.5 uppercase tracking-wider">직접 설정 (시작 - 종료)</p>
                                    <div className="flex items-center gap-1.5">
                                       <div 
                                          onClick={() => openDatePicker(startDateRef)}
                                          className="relative flex-1 bg-gray-50 rounded-lg h-7 flex items-center justify-center p-1 border border-transparent focus-within:border-slate-200 cursor-pointer active:bg-gray-100 transition-colors"
                                       >
                                          <CalendarDays size={10} className="absolute left-2 text-slate-400 pointer-events-none" />
                                          <span className="text-[9px] font-black text-slate-800 ml-3 pointer-events-none">{searchPeriod.start || todayStr}</span>
                                          <input 
                                             ref={startDateRef}
                                             type="date" 
                                             value={searchPeriod.start || todayStr} 
                                             onChange={e => setSearchPeriod({ type: 'custom', start: e.target.value, end: searchPeriod.end })}
                                             className="absolute inset-0 opacity-0 pointer-events-none w-full" 
                                          />
                                       </div>
                                       <span className="text-slate-200 text-[10px]">-</span>
                                       <div 
                                          onClick={() => openDatePicker(endDateRef)}
                                          className="relative flex-1 bg-gray-50 rounded-lg h-7 flex items-center justify-center p-1 border border-transparent focus-within:border-slate-200 cursor-pointer active:bg-gray-100 transition-colors"
                                       >
                                          <CalendarDays size={10} className="absolute left-2 text-slate-400 pointer-events-none" />
                                          <span className="text-[9px] font-black text-slate-800 ml-3 pointer-events-none">{searchPeriod.end || todayStr}</span>
                                          <input 
                                             ref={endDateRef}
                                             type="date" 
                                             value={searchPeriod.end || todayStr} 
                                             onChange={e => setSearchPeriod({ type: 'custom', start: searchPeriod.start, end: e.target.value })}
                                             className="absolute inset-0 opacity-0 pointer-events-none w-full" 
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {filterModalTab === 'tag' && (
                              <div className="flex flex-wrap gap-1.5">
                                 {Array.from(new Set(transactions.flatMap(tx => tx.tags || []))).map(tag => (
                                    <button 
                                      key={tag}
                                      onClick={() => setSearchTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                      className={`px-3 py-1.5 rounded-lg text-[12px] font-black border transition-all ${searchTags.includes(tag) ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-gray-50 text-slate-500 border-transparent hover:border-gray-200'}`}
                                    >
                                      #{tag}
                                    </button>
                                 ))}
                                 {Array.from(new Set(transactions.flatMap(tx => tx.tags || []))).length === 0 && (
                                    <div className="py-6 w-full text-center text-[12px] font-black text-slate-300">등록된 태그가 없습니다</div>
                                 )}
                              </div>
                           )}
                        </div>

                        <button 
                           onClick={() => setIsFilterModalOpen(false)}
                           className="mt-4 w-full py-1.5 bg-slate-900 rounded-xl text-white font-black text-[11px] shadow-lg shadow-slate-100 active:scale-95 transition-all"
                        >
                           필터 적용하기
                        </button>
                      </div>
                   </div>
                )}
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


