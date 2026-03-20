'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Bell,
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
  CardSettingsModal 
} from '@/components/mobile/modals';
import { CardRegistrationModal } from '@/components/mobile/CardRegistrationModal';

// Views (Refactored)
import { HomeView } from '@/components/mobile/views/HomeView';
import { CardsView } from '@/components/mobile/views/CardsView';
import { LedgerView } from '@/components/mobile/views/LedgerView';
import { BenefitsView } from '@/components/mobile/benefits'; // Partially refactored already
import { ProfileView } from '@/components/mobile/profile';
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
  const router = useRouter();
  
  // App Shell State
  const [activeTab, setActiveTab] = useState('home');
  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const [transactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  
  // Modal State
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showEditHome, setShowEditHome] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssetAction, setShowAssetAction] = useState<'fill' | 'send' | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  
  // View State
  const [ledgerMode, setLedgerMode] = useState<'personal' | 'group'>('personal');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedLedgerDate, setSelectedLedgerDate] = useState(new Date());
  const [visibleSections, setVisibleSections] = useState(['balance', 'performance', 'weekly', 'category', 'goal', 'recent']);


  // ─────────────────────────────────────────────────────────────
  // Session Management (5-minute Timeout)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Use window.alert and replace for guaranteed redirect across all browsers/Next.js states
        if (typeof window !== 'undefined') {
          window.alert('보안을 위해 세션이 만료되었습니다. 다시 로그인해 주세요.');
          window.location.href = '/mobile/login';
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, []);

  // Computed Data
  const buckets = [
    { label: '이번달 목표', pct: SAMPLE_USER.savingRate, achieved: false, value: `${(SAMPLE_USER.monthlySpend/10000).toFixed(1)}만원`, target: SAMPLE_USER.monthlyBudget },
  ];

  const categories = SPENDING_CATEGORIES.map(c => ({
    name: c.name,
    percent: Math.round((c.amount / SAMPLE_USER.monthlySpend) * 100),
    color: c.color
  }));

  const tabTitles: Record<string, string> = {
    home: '자산',
    cards: '카드 관리',
    ledger: '가계부',
    community: '커뮤니티',
    benefits: '혜택 센터',
    mypage: '내 정보',
    dashboard: '자산' // Add dashboard as alias to prevent English fallback
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
      
      {/* ─── Header ─── */}
      <header className="px-5 pt-4 pb-4 flex items-center justify-between bg-white border-b border-gray-50 sticky top-[44px] z-[90]">
          <div className="flex items-center gap-3 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-6 h-6">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-black text-rose-500 tracking-[-0.05em] leading-none uppercase">
                {tabTitles[activeTab] || 'CardWise'}
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Premium Identity</span>
            </div>
          </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCardSettings(true)}
            className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 active:scale-75 transition-transform">
            <Plus size={18} className="rotate-45" />
          </button>
          <button onClick={() => setShowNotifications(true)}
            className="relative w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 active:scale-75 transition-transform">
            <Bell size={17} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
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
            setShowEditHome={setShowEditHome}
            setShowAssetAction={setShowAssetAction}
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
            ledgerMode={ledgerMode}
            setLedgerMode={setLedgerMode}
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
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Benefits Hub</p>
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

        {activeTab === 'mypage' && (
          <div className="pt-5">
            <ProfileView />
          </div>
        )}
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
        <CardSettingsModal isOpen={showCardSettings} onClose={() => setShowCardSettings(false)} cards={cards} />
        <CardRegistrationModal isOpen={showAddCard} onClose={() => setShowAddCard(false)} onAdd={(newCard) => setCards([newCard, ...cards])} />
      </div>
    </div>
  );
}
