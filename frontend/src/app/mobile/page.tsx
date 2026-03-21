'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  Plus, 
  Bell,
  Settings,
  Menu
} from 'lucide-react';

// Common Components
import { BottomNavigation } from '@/components/mobile/nav';
import { 
  AddTransactionModal, 
  AchievementModal, 
  TransactionDetailModal, 
  EditHomeModal, 
  NotificationModal, 
  AssetActionModal, 
  CardSettingsModal,
  SitemapModal
} from '@/components/mobile/modals';
import { CardRegistrationModal } from '@/components/mobile/CardRegistrationModal';
import { createClient } from '@/utils/supabase/client';
import { getPayments, PaymentRecord, getMyCards, UserCardSummaryResponse } from '@/lib/cardwise-api';

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

// ─────────────────────────────────────────────────────────────
// Shared UI Components
// ─────────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-3 text-[12px] font-black text-gray-700 sticky top-0 z-[100] bg-white border-b-2 border-gray-100">
      <span>9:41</span>
      <div className="flex items-center gap-2">
        <span className="opacity-50">75%</span>
        <div className="w-[22px] h-[11px] border-[1.5px] border-gray-400 rounded-[3px] p-[1.5px] relative">
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-[2px] h-[5px] bg-gray-400 rounded-r-[1px]" />
          <div className="h-full w-[75%] bg-gray-700 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

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
  const [userData, setUserData] = useState<{ id: string; email: string; displayName: string; level: number; exp: number; tierName: string } | null>(null);

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
          
        setUserData({
          id: user.id,
          email: user.email || '',
          displayName: profile?.display_name || user.email?.split('@')[0] || '사용자',
          level: profile?.level || 1,
          exp: profile?.exp || 0,
          tierName: profile?.tier_name || 'BRONZE'
        });
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
        
        setTransactions(mapped.length > 0 ? mapped : SAMPLE_TRANSACTIONS);
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
        if (mapped.length > 0) setCards(mapped);
      }
    };

    fetchUser();
    fetchTransactionsData();
    fetchCardsData();
  }, []);
  
  // Modal State
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showEditHome, setShowEditHome] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssetAction, setShowAssetAction] = useState<'fill' | 'send' | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  
  // View State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedLedgerDate, setSelectedLedgerDate] = useState(new Date());
  const [visibleSections, setVisibleSections] = useState(['balance', 'performance', 'weekly', 'category', 'goal', 'recent']);

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
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
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

  const tabTitles: Record<string, string> = {
    home: '자산 현황',
    cards: '카드 관리',
    ledger: '소비 내역',
    benefits: '혜택 가이드',
    community: '소셜 센터',
    mypage: '내 프로필',
    settings: '환경 설정',
    insights: '소비 분석',
    'all-badges': '업적 센터'
  };

  const toggleSection = (id: string) => {
    setVisibleSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const showFAB = ['home', 'ledger', 'cards'].includes(activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <StatusBar />

      {/* ─── Global App Header ─── */}
      <header className="px-5 pt-4 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-gray-50 sticky top-[44px] z-[90]">
          <div className="flex items-center gap-3 active:scale-95 transition-all">
             <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xl shadow-inner border border-gray-100/50">
               {userData?.displayName?.[0] || '👤'}
             </div>
             <div className="flex flex-col">
               <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-black text-slate-600 tracking-tight">{userData?.displayName || 'Loading...'} 님</span>
                    <span className="text-[10px]">⚡</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[14px] font-black text-slate-800 tracking-tight leading-none opacity-60">
                    {tabTitles[activeTab] || 'CardWise'}
                  </span>
               </div>
                 <div className="flex items-center gap-1 mt-1.5 ml-0.5">
                   <div className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 flex items-center gap-1 shadow-sm">
                     <span className="text-[7.5px] font-black text-amber-600 uppercase tracking-widest leading-none">{userData?.tierName || '플래티넘'}</span>
                   </div>
                   <div className="px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 flex items-center gap-1 shadow-sm">
                     <span className="text-[7.5px] font-black text-rose-500 uppercase tracking-widest leading-none">LV.{userData?.level || '24'}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotifications(true)}
              className="relative w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 active:scale-75 transition-transform">
              <Bell size={18} />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 border border-white" />
            </button>
            <button onClick={() => {
               if (activeTab === 'cards') setShowCardSettings(true);
               else setShowEditHome(true);
            }}
              className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 active:scale-75 transition-transform">
              <Settings size={18} />
            </button>
            <button onClick={() => setShowSitemap(true)}
              className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-75 transition-transform">
              <Menu size={20} />
            </button>
          </div>
      </header>

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
          />
        )}
        {activeTab === 'cards' && (
          <CardsView 
            cards={cards}
            setShowAddCard={setShowAddCard}
            router={router}
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
        {activeTab === 'insights' && <div className="p-10 text-center text-slate-400 font-bold">AI 소비 분석 준비 중</div>}
      </main>

      {/* ─── Navigation & FAB ─── */}
      {showFAB && (
        <div className="fixed bottom-[110px] right-8 z-[70]">
          <button onClick={() => setShowAddTx(true)}
            className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white active:scale-75 transition-all shadow-xl"
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
        <EditHomeModal isOpen={showEditHome} onClose={() => setShowEditHome(false)} visibleSections={visibleSections} onToggleSection={toggleSection} />
        <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        <AssetActionModal isOpen={!!showAssetAction} onClose={() => setShowAssetAction(null)} type={showAssetAction} />
        <CardSettingsModal isOpen={showCardSettings} onClose={() => setShowCardSettings(false)} cards={cards} onUpdate={setCards} />
        <CardRegistrationModal isOpen={showAddCard} onClose={() => setShowAddCard(false)} onAdd={(newCard) => setCards([newCard, ...cards])} />
        <SitemapModal isOpen={showSitemap} onClose={() => setShowSitemap(false)} onNavigate={(tab) => {
          setActiveTab(tab);
          setShowSitemap(false);
        }} />
      </div>
    </div>
  );
}
