'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { 
  ChevronLeft, Bell, HelpCircle, MessageCircle, 
  ChevronRight, Search, Megaphone, Clock, X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getNotices, getFaqs, getMyInquiries, 
  unwrapArray, NoticeRecord, FaqRecord, InquiryRecord 
} from '@/lib/cardwise-api';

interface SupportData {
  NOTICE: { list: NoticeRecord[], page: number, hasMore: boolean };
  FAQ: { list: FaqRecord[], page: number, hasMore: boolean };
  INQUIRY: { list: InquiryRecord[], page: number, hasMore: boolean };
}

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'NOTICE' | 'FAQ' | 'INQUIRY' | null;
  
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'FAQ' | 'INQUIRY'>(initialTab || 'NOTICE');
  
  const [data, setData] = useState<SupportData>({
    NOTICE: { list: [], page: 0, hasMore: true },
    FAQ: { list: [], page: 0, hasMore: true },
    INQUIRY: { list: [], page: 0, hasMore: true }
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ title: string, content: string, date: string, category?: string } | null>(null);

  const fetchData = useCallback(async (tab: 'NOTICE' | 'FAQ' | 'INQUIRY', isMore = false) => {
    if (loading) return;
    const currentPage = isMore ? data[tab].page + 1 : 0;
    
    setLoading(true);
    try {
      let newList: any[] = [];
      if (tab === 'NOTICE') {
        const res = await getNotices(currentPage);
        newList = unwrapArray<NoticeRecord>(res);
      } else if (tab === 'FAQ') {
        const res = await getFaqs(currentPage);
        newList = unwrapArray<FaqRecord>(res);
      } else if (tab === 'INQUIRY') {
        const res = await getMyInquiries(currentPage);
        newList = unwrapArray<InquiryRecord>(res);
      }

      setData(prev => ({
        ...prev,
        [tab]: {
          list: isMore ? [...prev[tab].list, ...newList] : newList,
          page: currentPage,
          hasMore: newList.length >= 10
        }
      }));
    } catch (err) {
      console.error(`Failed to load ${tab}`, err);
    }
    setLoading(false);
  }, [loading, data]);

  useEffect(() => {
    fetchData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleItemClick = (item: any, type: 'NOTICE' | 'FAQ') => {
    if (type === 'NOTICE') {
      setSelectedItem({
        title: (item as NoticeRecord).title,
        content: (item as NoticeRecord).content,
        date: new Date((item as NoticeRecord).createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        category: (item as NoticeRecord).isCritical ? '필독' : '공지'
      });
    } else {
      setSelectedItem({
        title: (item as FaqRecord).question,
        content: (item as FaqRecord).answer,
        date: new Date((item as FaqRecord).createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        category: (item as FaqRecord).category
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      {/* Detail View Layer (Limited to Mobile Width) */}
      {selectedItem && (
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[1000] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          {/* Mobile Handle Style */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 rounded-full bg-slate-100" />
          </div>

          <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-lg">
             <button 
               onClick={() => setSelectedItem(null)} 
               className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors"
             >
                <X size={20} />
             </button>
             <h2 className="text-[17px] font-black text-slate-900 tracking-tight">상세 정보</h2>
             <div className="w-10" />
          </header>

          <main className="flex-1 px-7 py-6 overflow-y-auto pb-32">
             <div className="flex items-center gap-3 mb-6">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  selectedItem.category === '필독' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 text-slate-500 uppercase tracking-widest'
                }`}>
                  {selectedItem.category}
                </span>
                <span className="text-[12px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} className="opacity-70" /> {selectedItem.date}
                </span>
             </div>

             <h1 className="text-[23px] font-black text-slate-900 leading-[1.3] mb-10 tracking-tight">
               {selectedItem.title}
             </h1>

             <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-20 bg-slate-100 rounded-full opacity-50" />
                <div className="text-[15px] font-medium text-slate-600 leading-[1.7] whitespace-pre-wrap">
                  {selectedItem.content}
                </div>
             </div>
          </main>

          <footer className="p-6 pt-4 border-t border-slate-50 bg-white/80 backdrop-blur-xl">
             <button 
               onClick={() => setSelectedItem(null)} 
               className="w-full h-15 rounded-[22px] bg-slate-900 text-white text-[16px] font-black shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all"
             >
                확인했습니다
             </button>
          </footer>
        </div>
      )}

      {/* Main Header */}
      <header className="px-6 py-6 flex items-center gap-4 bg-white sticky top-0 z-[90] border-b border-slate-50">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800 active:scale-90 transition-all">
           <ChevronLeft size={22} />
        </button>
        <h1 className="text-[20px] font-black text-slate-900 tracking-tighter">고객지원</h1>
      </header>

      {/* Tabs - Sleek Mobile Style */}
      <div className="flex px-5 pt-3 border-b border-slate-50 sticky top-[80px] z-[80] bg-white">
        {[
          { id: 'NOTICE', label: '공지사항', icon: <Megaphone size={16} /> },
          { id: 'FAQ', label: 'FAQ', icon: <HelpCircle size={16} /> },
          { id: 'INQUIRY', label: '1:1 문의', icon: <MessageCircle size={16} /> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'NOTICE' | 'FAQ' | 'INQUIRY')}
            className={`flex-1 flex flex-col items-center gap-2 pb-4 transition-all relative ${
              activeTab === tab.id ? 'text-slate-900 scale-105' : 'text-slate-300 opacity-60'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
            }`}>
              {tab.icon}
            </div>
            <span className={`text-[11px] transition-all ${activeTab === tab.id ? 'font-black' : 'font-bold'}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-6 right-6 h-1 bg-slate-900 rounded-full animate-in zoom-in-50 duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 p-6 pb-32 overflow-y-auto">
        {loading && data[activeTab].list.length === 0 ? (
          <div className="flex flex-col items-center py-24">
            <div className="w-11 h-11 rounded-full border-[6px] border-slate-100 border-t-slate-900 animate-spin mb-6" />
            <p className="font-black text-slate-400 text-[13px] animate-pulse tracking-tight">정보를 가져오는 중입니다...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {activeTab === 'NOTICE' && (
              <div className="space-y-4">
                 {data.NOTICE.list.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-100">
                       <Bell size={48} className="mx-auto text-slate-200 mb-6 opacity-50" />
                       <p className="text-slate-400 font-bold text-sm">등록된 공지사항이 아직 없습니다.</p>
                    </div>
                 ) : (
                    <>
                      {data.NOTICE.list.map((notice) => (
                        <div 
                          key={notice.noticeId}
                          onClick={() => handleItemClick(notice, 'NOTICE')}
                          className="p-6 rounded-[34px] bg-white border border-slate-100 shadow-sm active:scale-[0.97] hover:border-rose-100 group transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-3">
                             {notice.isCritical ? (
                               <span className="px-2 py-0.5 rounded bg-rose-500 text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-rose-500/20">필독</span>
                             ) : (
                               <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">공지</span>
                             )}
                             <span className="text-[10px] font-bold text-slate-300 ml-1">{new Date(notice.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-start justify-between">
                            <h3 className="text-[16px] font-black text-slate-800 leading-snug group-hover:text-rose-500 transition-colors">{notice.title}</h3>
                            <ChevronRight size={18} className="text-slate-200 mt-1 shrink-0 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                      {data.NOTICE.hasMore && (
                        <button 
                          onClick={() => fetchData('NOTICE', true)}
                          className="w-full py-8 text-slate-300 font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all text-center"
                        >
                          {loading ? '불러오는 중...' : '공지사항 더 보기 ▼'}
                        </button>
                      )}
                    </>
                 )}
              </div>
            )}

            {activeTab === 'FAQ' && (
              <div className="space-y-4">
                 <div className="relative mb-8 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-all" size={18} />
                    <input 
                      type="text" 
                      placeholder="무엇이 궁금하신가요?" 
                      className="w-full h-16 pl-14 pr-6 rounded-[22px] bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white focus:ring-0 text-sm font-bold transition-all placeholder:text-slate-300 shadow-inner"
                    />
                 </div>
                 {data.FAQ.list.length === 0 ? (
                    <div className="text-center py-24">
                       <HelpCircle size={48} className="mx-auto text-slate-100 mb-6" />
                       <p className="text-slate-300 font-black">자주 묻는 질문이 없습니다.</p>
                    </div>
                 ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {data.FAQ.list.map((faq) => (
                          <div 
                            key={faq.faqId} 
                            onClick={() => handleItemClick(faq, 'FAQ')}
                            className="p-6 rounded-[32px] bg-slate-50 border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
                          >
                             <div>
                               <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 opacity-80">{faq.category}</div>
                               <h4 className="text-[14px] font-black text-slate-800 leading-snug pr-4">Q. {faq.question}</h4>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm shrink-0">
                               <ChevronRight size={14} />
                             </div>
                          </div>
                        ))}
                      </div>
                      {data.FAQ.hasMore && (
                        <button 
                          onClick={() => fetchData('FAQ', true)}
                          className="w-full py-8 text-slate-300 font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all text-center"
                        >
                          {loading ? '불러오는 중...' : '질문 더 보기 ▼'}
                        </button>
                      )}
                    </>
                 )}
              </div>
            )}

            {activeTab === 'INQUIRY' && (
              <div className="space-y-10">
                 {data.INQUIRY.list.length > 0 && (
                   <div className="space-y-6">
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">MY INQUIRY HISTORY</p>
                      {data.INQUIRY.list.map(iq => (
                        <div key={iq.inquiryId} className="p-7 rounded-[44px] bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all">
                           <div className="flex items-center justify-between mb-5">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${
                                iq.status === 'ANSWERED' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-amber-400 text-white shadow-lg shadow-amber-400/20'
                              }`}>
                                {iq.status === 'ANSWERED' ? '답변 완료' : '검토 중'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 grayscale opacity-70">
                                <Clock size={12} /> {new Date(iq.createdAt).toLocaleDateString()}
                              </span>
                           </div>
                           <h4 className="text-[16px] font-black text-slate-900 mb-4 tracking-tight leading-snug">{iq.title}</h4>
                           <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-6">{iq.content}</p>
                           
                           {iq.answer ? (
                             <div className="mt-2 p-6 rounded-[34px] bg-slate-900 shadow-xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                   <MessageCircle size={40} className="text-white" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                   <div className="w-8 h-8 rounded-2xl bg-slate-800 flex items-center justify-center text-rose-500 shadow-inner">
                                      <MessageCircle size={16} />
                                   </div>
                                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">CardWise Answer</span>
                                </div>
                                <p className="text-[13px] font-bold text-slate-200 leading-relaxed italic relative z-10">
                                  {iq.answer}
                                </p>
                             </div>
                           ) : (
                             <div className="mt-2 p-5 rounded-[28px] bg-slate-50 border border-slate-100 text-center">
                                <p className="text-[11px] font-bold text-slate-400 italic">상담원이 내용을 확인하고 있습니다.</p>
                             </div>
                           )}
                        </div>
                      ))}
                      {data.INQUIRY.hasMore && (
                        <button 
                          onClick={() => fetchData('INQUIRY', true)}
                          className="w-full py-8 text-slate-300 font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all text-center"
                        >
                          {loading ? '불러오는 중...' : '문의 내역 더 보기 ▼'}
                        </button>
                      )}
                   </div>
                 )}

                 <div className="flex flex-col items-center py-14 px-8 text-center bg-slate-900 rounded-[64px] shadow-2xl relative overflow-hidden group">
                    {/* Decorative Background Element */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    
                    <div className="w-22 h-22 rounded-[38px] bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 shadow-xl shadow-black/20 animate-in zoom-in duration-1000">
                       <MessageCircle size={36} className="text-rose-400" />
                    </div>
                    <h2 className="text-[21px] font-black text-white mb-4 tracking-tight">도움이 더 필요하신가요?</h2>
                    <p className="text-[14px] font-bold text-slate-400 mb-10 leading-relaxed opacity-80">
                       CardWise 전문 상담팀이<br/>세심하게 답변해 드립니다.
                    </p>
                    <button className="w-full h-16 rounded-[24px] bg-white text-slate-900 font-black text-[15px] active:scale-95 transition-all shadow-xl shadow-white/5 hover:bg-rose-50">
                       새 문의 작성하기
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export function SupportView() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="w-12 h-12 border-[6px] border-slate-50 border-t-rose-500 rounded-full animate-spin shadow-lg" />
       </div>
    }>
      <SupportContent />
    </Suspense>
  );
}
