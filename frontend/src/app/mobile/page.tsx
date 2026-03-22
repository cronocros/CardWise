'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';

// Common Components
import { BottomNavigation } from '@/components/mobile/nav';
import { 
  AddTransactionModal, 
  AchievementModal, 
  TransactionDetailModal, 
  EditHomeModal, 
  EditLedgerModal,
  NotificationModal, 
  AssetActionModal, 
  CardSettingsModal,
  SitemapModal
} from '@/components/mobile/modals';
import { createClient } from '@/utils/supabase/client';
import { getPayments, PaymentRecord, getMyCards, UserCardSummaryResponse, getMonthlySpendingSummary } from '@/lib/cardwise-api';

// Views (Refactored)
import { HomeView } from '@/components/mobile/views/HomeView';
import { CardsView } from '@/components/mobile/views/CardsView';
import { LedgerView } from '@/components/mobile/views/LedgerView';
import { BenefitsView } from '@/components/mobile/benefits'; 
import { ProfileView, AllBadgesView } from '@/components/mobile/profile';
import { CommunityView } from '@/components/mobile/community';

// Data & Types
import { Transaction, Card } from '@/types/mobile';
import { SAMPLE_USER, SAMPLE_CARDS, SAMPLE_TRANSACTIONS, SPENDING_CATEGORIES } from '@/lib/sampleData';
import { WeeklyBarChart } from '@/components/mobile/charts';

// Simple global cache to avoid refetching on every tab change (component mount)
const globalCache: {
  userData: { id: string; email: string; displayName: string; level: number; exp: number; tierName: string } | null;
  monthlySpend: number;
  transactions: Transaction[] | null;
  cards: Card[] | null;
  lastFetched: number;
} = {
  userData: null,
  monthlySpend: SAMPLE_USER.monthlySpend,
  transactions: null,
  cards: null,
  lastFetched: 0
};

export default function MobileHomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MobileHomePageContent />
    </Suspense>
  );
}

// ... (StatusBar component)

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 left-0 right-0 max-w-[430px] mx-auto pointer-events-none z-[80]">
      <div className="relative w-full h-full flex justify-center">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto flex items-center justify-center px-5 py-3.5 rounded-[30px] bg-slate-800/80 backdrop-blur-xl text-white shadow-xl active:scale-95 transition-all outline-none border border-slate-700/50"
          style={{boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.1)'}}
        >
          <div className="mr-1.5 mt-0.5 animate-bounce">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
          <span className="text-[14px] font-[900] tracking-[0.2em] uppercase px-1">Top</span>
        </button>
      </div>
    </div>
  );
}

function MobileHomePageContent() {
  const router = useRouter();
  
  // App Shell State
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  
  // Real Data State
  const [userData, setUserData] = useState<{ id: string; email: string; displayName: string; level: number; exp: number; tierName: string } | null>(globalCache.userData);
  const [monthlySpend, setMonthlySpend] = useState(globalCache.monthlySpend);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('account_profile')
          .select('display_name, level, exp, tier_name')
          .eq('account_id', user.id)
          .single();
          
        const mappedUser = {
          id: user.id,
          email: user.email || '',
          displayName: profile?.display_name || user.email?.split('@')[0] || '사용자',
          level: profile?.level || 1,
          exp: profile?.exp || 0,
          tierName: profile?.tier_name || 'BRONZE'
        };
        setUserData(mappedUser);
        globalCache.userData = mappedUser;
        
        // Fetch monthly summary
        const now = new Date();
        const summary = await getMonthlySpendingSummary(user.id, now.getFullYear(), now.getMonth() + 1);
        if (summary && summary.totalAmount != null) {
          setMonthlySpend(summary.totalAmount);
          globalCache.monthlySpend = summary.totalAmount;
        }
      }
    };
    
    const fetchTransactionsData = async () => {
      const response = await getPayments(100);
      if (response && response.data) {
        const mapped: Transaction[] = response.data.map((p: PaymentRecord) => ({
          id: `tx-${p.paymentId}`,
          icon: p.transactionType === 'INCOME' ? '💰' : (p.merchantName.includes('카페') ? '☕' : p.merchantName.includes('식당') ? '🍱' : '💳'), 
          name: p.merchantName,
          category: p.transactionType === 'INCOME' ? '수입' : '생활', 
          card: 'My Card', 
          amount: p.finalKrwAmount ?? p.krwAmount,
          date: p.paidAt,
          type: (p.transactionType?.toLowerCase() as 'expense' | 'income') || 'expense',
          currency: 'KRW',
          isAdjusted: p.isAdjusted
        }));
        
        if (mapped.length > 0) {
          setTransactions(mapped);
          globalCache.transactions = mapped;
        }
      }
    };

    const fetchCardsData = async () => {
      const response = await getMyCards();
      if (response && response.data) {
        const mapped: Card[] = response.data.map((c: UserCardSummaryResponse) => ({
          id: c.userCardId.toString(),
          name: c.cardNickname || c.cardName,
          firstFour: '****',
          lastFour: '****',
          issuer: c.cardName.split(' ')[0] || 'CardWise',
          gradient: 'linear-gradient(135deg, #111, #444)', // Default dark
          current: 0,
          target: 300000,
          benefitType: 'discount',
          benefitValue: '상세 정보 확인 필요',
          brand: 'visa',
          tier: 'classic',
          color: '#1a1a1a',
          currency: 'KRW'
        }));
        if (mapped.length > 0) {
           setCards(mapped);
           globalCache.cards = mapped;
        }
      }
    };

    // Stale-while-revalidate pattern to avoid UI flashing
    if (globalCache.transactions) setTransactions(globalCache.transactions);
    if (globalCache.cards) setCards(globalCache.cards);

    const now = Date.now();
    if (now - globalCache.lastFetched > 30000) { // 30 sec cache
       globalCache.lastFetched = now;
       fetchUser();
       fetchTransactionsData();
       fetchCardsData();
    }
  }, []);
  
  // Modal State
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showEditHome, setShowEditHome] = useState(false);
  const [showEditLedger, setShowEditLedger] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssetAction, setShowAssetAction] = useState<'fill' | 'send' | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);

  // Persistence for user card settings
  useEffect(() => {
    const saved = localStorage.getItem('cardwise_user_cards');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cards', e);
      }
    }
  }, []);

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('cardwise_user_cards', JSON.stringify(cards));
    }
  }, [cards]);
  
  // View State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedLedgerDate, setSelectedLedgerDate] = useState(new Date());
  
  // Persistent Home Sections
  const DEFAULT_SECTIONS = ['balance', 'performance', 'analytics', 'insights', 'recent'];
  const [visibleSections, setVisibleSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('home_visible_sections');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load home sections:', e);
        }
      }
    }
    return DEFAULT_SECTIONS;
  });

  // Sync to localStorage
  const saveSections = (sections: string[]) => {
    setVisibleSections(sections);
    localStorage.setItem('home_visible_sections', JSON.stringify(sections));
  };

  // Persistent Ledger Sections
  const DEFAULT_LEDGER_SECTIONS = ['summary', 'trend', 'calendar', 'dailyList'];
  const [visibleLedgerSections, setVisibleLedgerSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ledger_visible_sections');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load ledger sections:', e);
        }
      }
    }
    return DEFAULT_LEDGER_SECTIONS;
  });

  const saveLedgerSections = (sections: string[]) => {
    setVisibleLedgerSections(sections);
    localStorage.setItem('ledger_visible_sections', JSON.stringify(sections));
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.alert('보안을 위해 세션이 만료되었습니다. 다시 로그인해 주세요.');
          window.location.href = '/login';
        }
      }, 30 * 60 * 1000); // 30 mins instead of 5
    };
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    const handleEditHome = () => setShowEditHome(true);
    const handleEditLedger = () => setShowEditLedger(true);
    const handleNotification = () => setShowNotifications(true);
    const handleCardSettings = () => setShowCardSettings(true);
    const handleSitemap = () => setShowSitemap(true);
    
    window.addEventListener('openEditHomeModal', handleEditHome);
    window.addEventListener('openEditLedgerModal', handleEditLedger);
    window.addEventListener('openNotificationModal', handleNotification);
    window.addEventListener('openCardSettingsModal', handleCardSettings);
    window.addEventListener('openSitemapModal', handleSitemap);
    
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      window.removeEventListener('openEditHomeModal', handleEditHome);
      window.removeEventListener('openEditLedgerModal', handleEditLedger);
      window.removeEventListener('openNotificationModal', handleNotification);
      window.removeEventListener('openCardSettingsModal', handleCardSettings);
      window.removeEventListener('openSitemapModal', handleSitemap);
      clearTimeout(timeout);
    };
  }, []);

  const buckets = [
    { label: '이번달 목표', pct: SAMPLE_USER.savingRate, achieved: false, value: `${(SAMPLE_USER.monthlySpend/10000).toFixed(1)}만원`, target: SAMPLE_USER.monthlyBudget },
  ];

  const categories = SPENDING_CATEGORIES.map(c => ({
    name: c.name,
    percent: Math.round((c.amount / SAMPLE_USER.monthlySpend) * 100),
    color: c.color
  }));


  const toggleSection = (id: string) => {
    const newSections = visibleSections.includes(id) 
      ? visibleSections.filter(s => s !== id) 
      : [...visibleSections, id];
    saveSections(newSections);
  };

  const resetSections = () => {
    if (window.confirm('홈 화면 구성을 초기 상태로 되돌리시겠습니까?')) {
      saveSections(DEFAULT_SECTIONS);
    }
  };

  const toggleLedgerSection = (id: string) => {
    const newSections = visibleLedgerSections.includes(id) 
      ? visibleLedgerSections.filter(s => s !== id) 
      : [...visibleLedgerSections, id];
    saveLedgerSections(newSections);
  };

  const resetLedgerSections = () => {
    if (window.confirm('가계부 화면 구성을 초기 상태로 되돌리시겠습니까?')) {
      saveLedgerSections(DEFAULT_LEDGER_SECTIONS);
    }
  };

  const onToggleMainCard = (cardId: string) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isMain: c.id === cardId ? !c.isMain : false
    })));
  };

  const onTogglePinCard = (cardId: string) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isPinned: c.id === cardId ? !c.isPinned : c.isPinned
    })));
  };

  const showFAB = ['ledger', 'cards'].includes(activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">

      {/* ─── Main View ─── */}
      <main className="flex-1 px-6 max-w-[430px] mx-auto pb-32 w-full">
        {activeTab === 'home' && (
          <HomeView 
            visibleSections={visibleSections}
            categories={categories}
            buckets={buckets}
            transactions={transactions}
            setSelectedTx={setSelectedTx}
            router={router}
            monthlySpend={monthlySpend}
          />
        )}
        {activeTab === 'cards' && (
          <CardsView 
            cards={cards}
            router={router}
            onToggleMain={onToggleMainCard}
            onTogglePin={onTogglePinCard}
          />
        )}
        {activeTab === 'ledger' && (
          <LedgerView 
            selectedLedgerDate={selectedLedgerDate}
            setSelectedLedgerDate={setSelectedLedgerDate}
            categories={categories}
            transactions={transactions}
            setSelectedTx={setSelectedTx}
            router={router}
            visibleSections={visibleLedgerSections}
          />
        )}
        {activeTab === 'community' && <CommunityView />}
        {activeTab === 'benefits' && (
          <div className="space-y-8 pt-5">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">혜택 허브</p>
              <h2 className="text-[26px] font-black text-gray-800 tracking-tighter">혜택 센터</h2>
            </div>
            {/* Quick Menu */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🎟', label: '바우처 관리', sub: '내 쿠폰', path: '/mobile/vouchers', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
                { icon: '🧠', label: 'AI 인사이트', sub: '소비 리포트', path: '/mobile/insights', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
                { icon: '🔮', label: '오늘의 운세', sub: '재물운/카드추천', path: '/mobile/fortune', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
                { icon: '🔍', label: '카드 찾기', sub: '맞춤 혜택 검색', path: '/mobile/finder', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }
              ].map(item => (
                <button key={item.path} onClick={() => router.push(item.path)} className="p-5 rounded-[32px] text-left active:scale-[0.96] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5" style={{ background: item.gradient }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="flex flex-col">
                    <p className="text-[14px] font-black text-white">{item.label}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <BenefitsView />
          </div>
        )}
        {activeTab === 'mypage' && <ProfileView onSeeMoreBadges={() => setActiveTab('all-badges')} user={userData} />}
        {activeTab === 'all-badges' && <AllBadgesView onBack={() => setActiveTab('mypage')} />}
        {activeTab === 'settings' && <div className="p-10 text-center text-slate-400 font-bold">환경 설정 준비 중</div>}
        {activeTab === 'insights' && (
          <div className="animate-fade-in py-6 space-y-6">
             <div className="px-6 mb-2 mt-4 inline-block">
               <h2 className="text-[26px] font-black text-gray-800 tracking-tighter mb-1 relative z-10">AI 소비 분석</h2>
               <p className="text-[12px] font-bold text-gray-400">데이터 기반 똑똑한 맞춤 리포트</p>
             </div>

             {/* Weekly Pattern Chart */}
             <div className="px-6">
               <section className="px-6 py-5 rounded-[40px] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] animate-fade-in" style={{ animationDelay: '0.1s' }}>
                 <div className="flex items-center justify-between mb-8 px-2">
                   <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">주간 소비 패턴</h3>
                   <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest">이번주</span>
                 </div>
                 <WeeklyBarChart />
               </section>
             </div>

             <div className="px-6">
               {/* WordCloud styled with box */}
               <div className="bg-white rounded-[40px] px-6 py-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">소비 키워드 인사이트</h3>
                    <div className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest">AI 분석</div>
                 </div>
                 {/* Dummy or real WordCloud component can go here, handled in charts.tsx */}
                 <div className="opacity-80 scale-110 mt-4">
                   <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 py-6 px-4 min-h-[140px] bg-gradient-to-b from-transparent to-rose-50/20 rounded-[32px] border border-dashed border-rose-100/50">
                     {[
                        { text: '편의점', size: 24, color: 'text-rose-500' },
                        { text: '스타벅스', size: 18, color: 'text-blue-500' },
                        { text: '배달의민족', size: 22, color: 'text-emerald-500' },
                        { text: '교통', size: 14, color: 'text-slate-400' },
                        { text: '넷플릭스', size: 16, color: 'text-rose-400' },
                        { text: '쇼핑', size: 20, color: 'text-purple-500' },
                        { text: '자기계발', size: 13, color: 'text-amber-500' },
                        { text: '점심식사', size: 22, color: 'text-rose-600' },
                     ].map((tag, i) => (
                       <span key={i} className={`font-black tracking-tight ${tag.color}`} style={{ fontSize: `${tag.size}px` }}>
                         #{tag.text}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* ─── Navigation & FAB ─── */}
      {showFAB && (
        <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 w-full max-w-[430px] flex justify-end px-8 z-[70] pointer-events-none">
          <button 
            onClick={() => {
              if (activeTab === 'cards') {
                router.push('/mobile/add-card');
              } else {
                setShowAddTx(true);
              }
            }}
            className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white active:scale-75 transition-all shadow-xl pointer-events-auto"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Global Modals ─── */}
      <div className="z-[1000]">
        <AddTransactionModal isOpen={showAddTx} onClose={() => setShowAddTx(false)} cards={cards} />
        <AchievementModal isOpen={showAchievement} onClose={() => setShowAchievement(false)} tierName="골드 챌린저" benefit="카페 5% 추가" current={245000} target={300000} />
        <TransactionDetailModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} tx={selectedTx} />
        <EditHomeModal 
          isOpen={showEditHome} 
          onClose={() => setShowEditHome(false)} 
          visibleSections={visibleSections} 
          onToggleSection={toggleSection}
          onReorder={saveSections}
          onReset={resetSections}
        />
        <EditLedgerModal 
          isOpen={showEditLedger} 
          onClose={() => setShowEditLedger(false)} 
          visibleSections={visibleLedgerSections} 
          onToggleSection={toggleLedgerSection}
          onReorder={saveLedgerSections}
          onReset={resetLedgerSections}
        />
        <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        <AssetActionModal isOpen={!!showAssetAction} onClose={() => setShowAssetAction(null)} type={showAssetAction} />
        <CardSettingsModal isOpen={showCardSettings} onClose={() => setShowCardSettings(false)} cards={cards} onUpdate={setCards} />
        {/* Removed CardRegistrationModal as it is now a separate page */}
        <SitemapModal isOpen={showSitemap} onClose={() => setShowSitemap(false)} onNavigate={(tab) => {
          setActiveTab(tab);
          setShowSitemap(false);
        }} />
      </div>

      <ScrollToTop />
    </div>
  );
}


