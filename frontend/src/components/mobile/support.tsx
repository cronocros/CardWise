'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Bell, HelpCircle, MessageCircle, 
  ChevronRight, Search, Megaphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCommunityPosts, unwrapArray } from '@/lib/cardwise-api';
import { CommunityPost } from '@/types/mobile';

export function SupportView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'FAQ' | 'INQUIRY'>('NOTICE');
  const [notices, setNotices] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'NOTICE') {
      const fetchNotices = async () => {
        setLoading(true);
        try {
          const res = await getCommunityPosts('NOTICE', 1, 20);
          setNotices(unwrapArray<CommunityPost>(res));
        } catch (err) {
          console.error('Failed to load notices', err);
        }
        setLoading(false);
      };
      fetchNotices();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white flex flex-col animate-fade-in">
      {/* Header */}
      <header className="px-6 py-8 flex items-center gap-4 sticky top-0 z-[100] bg-white border-b border-gray-50">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center active:scale-95 transition-all text-slate-800">
           <ChevronLeft size={22} />
        </button>
        <h1 className="text-[22px] font-black text-slate-900 tracking-tighter">고객지원</h1>
      </header>

      {/* Tabs */}
      <div className="flex px-6 border-b border-gray-100">
        {[
          { id: 'NOTICE', label: '공지사항', icon: <Megaphone size={16} /> },
          { id: 'FAQ', label: '자주 묻는 질문', icon: <HelpCircle size={16} /> },
          { id: 'INQUIRY', label: '1:1 문의', icon: <MessageCircle size={16} /> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'NOTICE' | 'FAQ' | 'INQUIRY')}
            className={`flex-1 py-5 flex flex-col items-center gap-2 transition-all relative ${
              activeTab === tab.id ? 'text-slate-900 font-black' : 'text-gray-300 font-bold'
            }`}
          >
            {tab.icon}
            <span className="text-[12px]">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 pb-32">
        {activeTab === 'NOTICE' && (
          <div className="space-y-4">
             {loading ? (
                <div className="flex flex-col items-center py-20 opacity-40">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-900 border-t-transparent animate-spin mb-4" />
                  <p className="font-black text-xs">Checking Announcements...</p>
                </div>
             ) : notices.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                   <Bell size={40} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-gray-400 font-bold">등록된 공지사항이 없습니다.</p>
                </div>
             ) : (
                notices.map((notice) => (
                  <div 
                    key={notice.postId}
                    className="p-6 rounded-[32px] bg-white border border-gray-100 shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-[9px] font-black text-rose-500 uppercase tracking-widest">Notice</span>
                         <span className="text-[10px] font-bold text-gray-300">{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-[15px] font-black text-slate-800 line-clamp-1 group-hover:text-rose-500 transition-colors">{notice.title}</h3>
                    </div>
                    <ChevronRight size={18} className="text-gray-200 group-hover:text-rose-300 transition-all" />
                  </div>
                ))
             )}
          </div>
        )}

        {activeTab === 'FAQ' && (
          <div className="space-y-4">
             <div className="relative mb-8">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="무엇을 도와드릴까요?" 
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-slate-900/5 font-bold transition-all"
                />
             </div>
             {[
               { q: '카드 혜택이 적용되지 않았어요.', a: '결제 시 전월 실적 미달 등의 사유로...' },
               { q: '비밀번호를 분실했습니다.', a: '로그인 화면의 [비밀번호 찾기] 기능을 통해...' },
               { q: '바우처 사용이 안 돼요.', a: '바우처의 유효기간과 사용 가능한 카드를...' }
             ].map((faq, i) => (
               <div key={i} className="p-6 rounded-[32px] bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                  <h4 className="text-[14px] font-black text-slate-800 mb-2">Q. {faq.q}</h4>
                  <p className="text-[12px] font-medium text-gray-500 leading-relaxed italic">{faq.a}</p>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'INQUIRY' && (
          <div className="flex flex-col items-center py-20 text-center">
             <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mb-8 shadow-2xl shadow-slate-400">
                <MessageCircle size={32} className="text-white" />
             </div>
             <h2 className="text-[20px] font-black text-slate-900 mb-2 tracking-tighter">도움이 필요하신가요?</h2>
             <p className="text-[13px] font-bold text-gray-400 mb-10 leading-relaxed">
                궁금한 점이 있다면 언제든 문의해주세요. <br/>
                상담원이 신속하게 답변해 드립니다.
             </p>
             <button className="w-full max-w-[240px] h-16 rounded-3xl bg-slate-900 text-white font-black active:scale-95 transition-all shadow-xl">
                1:1 문의하기
             </button>
             <p className="text-[11px] font-black text-gray-300 mt-6 tracking-widest uppercase opacity-50">Response within 24 hours</p>
          </div>
        )}
      </main>
    </div>
  );
}
