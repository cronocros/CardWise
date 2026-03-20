'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight,
  Camera, Award, Star, Zap,
  Crown, CreditCard, Gift, Globe, FileText, Trash2, MessageCircle
} from 'lucide-react';
import { SettingsDetailModal } from './modals';

const BADGES = [
  { id: 'pioneer', label: '초기 개척자', emoji: '🥇', description: 'CardWise 첫 번째 가입자 1000명 내 가입', achieved: true, cat: '금융 & 자산' },
  { id: 'card5', label: '카드 수집가', emoji: '💳', description: '5개 이상의 카드를 등록', achieved: true, cat: '금융 & 자산' },
  { id: 'savings', label: '절약의 왕', emoji: '💰', description: '한 달 혜택 절약 5만원 달성', achieved: true, cat: '금융 & 자산' },
  { id: 'rich', label: '자산가', emoji: '💎', description: '총 자산 1억원 달성', achieved: false, cat: '금융 & 자산' },
  { id: 'investor', label: '투자 꿈나무', emoji: '🌱', description: '첫 주식 구매 성공', achieved: true, cat: '금융 & 자산' },
  
  // Lifestyle
  { id: 'cafe', label: '카페 매니아', emoji: '☕', description: '주 3회 이상 카페 방문', achieved: true, cat: '라이프스타일' },
  { id: 'foodie', label: '맛집 정복자', emoji: '🍱', description: '전국 맛집 50곳 방문', achieved: false, cat: '라이프스타일' },
  { id: 'traveler', label: '여행가', emoji: '✈️', description: '해외 결제 3회 이상', achieved: false, cat: '라이프스타일' },
  { id: 'shopper', label: '쇼핑 중독', emoji: '🛍️', description: '한 달 쇼핑 10회 이상', achieved: true, cat: '라이프스타일' },
  { id: 'sub', label: '구독 장인', emoji: '📺', description: '정기 구독 3개 이상 관리', achieved: true, cat: '라이프스타일' },
  
  // Social
  { id: 'talker', label: '소통왕', emoji: '🗣️', description: '커뮤니티 댓글 100개 달성', achieved: true, cat: '소셜 & 소통' },
  { id: 'star', label: '인기 스타', emoji: '🌟', description: '내 게시글 추천 50개 달성', achieved: false, cat: '소셜 & 소통' },
  { id: 'group', label: '그룹 리더', emoji: '👑', description: '공동 가계부 그룹 생성 및 관리', achieved: false, cat: '소셜 & 소통' },
  { id: 'manager', label: '자산 관리사', emoji: '💼', description: '그룹 예산 관리 10회 고정', achieved: false, cat: '소셜 & 소통' },
  
  // Milestones
  { id: 'million', label: '백만원 클럽', emoji: '🏆', description: '월간 지출 100만원 달성', achieved: true, cat: '마일스톤 & 업적' },
  { id: 'ten_million', label: '천만원 클럽', emoji: '🏛️', description: '연간 실적 1,000만원 달성', achieved: false, cat: '마일스톤 & 업적' },
  { id: 'morning', label: '아침형 인간', emoji: '🌅', description: '새벽 6시 이전 첫 결제', achieved: true, cat: '마일스톤 & 업적' },
  { id: 'night', label: '밤샘 소비', emoji: '🌙', description: '자정 이후 결제 5회', achieved: true, cat: '마일스톤 & 업적' },
  { id: 'streak', label: '연속 사용', emoji: '🔥', description: '30일 연속 앱 접속', achieved: true, cat: '마일스톤 & 업적' },
  { id: 'lucky', label: '오늘의 운세', emoji: '🔮', description: '운세 서비스 30회 이용', achieved: true, cat: '마일스톤 & 업적' },
];

const MENU_GROUPS = [
  {
    title: '계정',
    items: [
      { label: '개인정보 관리', icon: <Settings size={17} />, badge: '' },
      { label: '알림 설정', icon: <Bell size={17} />, badge: '3' },
      { label: '보안 및 인증', icon: <Shield size={17} />, badge: '' },
    ],
  },
  {
    title: '카드 & 혜택',
    items: [
      { label: '카드 관리', icon: <CreditCard size={17} />, badge: '' },
      { label: '바우처 관리', icon: <Gift size={17} />, badge: '2' },
      { label: '언어/지역 설정', icon: <Globe size={17} />, badge: '' },
    ],
  },
  {
    title: '고객지원',
    items: [
      { label: '자주 묻는 질문', icon: <HelpCircle size={17} />, badge: '' },
      { label: '1:1 문의', icon: <MessageCircle size={17} />, badge: '' },
      { label: '개인정보처리방침', icon: <FileText size={17} />, badge: '' },
    ],
  },
];

export function ProfileView({ onSeeMoreBadges }: { onSeeMoreBadges: () => void }) {
  const router = useRouter();
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      router.push('/mobile/login');
    }
  };

  const handleMenuClick = (label: string) => {
    setSelectedSetting(label);
  };

  const achievedCount = BADGES.filter(b => b.achieved).length;
  const displayBadges = BADGES.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* ── Profile Hero Card ── */}
      <div className="relative p-7 rounded-[48px] bg-white border border-gray-100 shadow-2xl shadow-rose-100/30 overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 blur-[120px] rounded-full opacity-40 group-hover:scale-125 transition-transform duration-1000"
          style={{ background: 'radial-gradient(circle, #f43f5e, #6366f1, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-50/50 blur-[80px]" />

        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer active:scale-95 transition-transform">
              <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-rose-50 to-indigo-50 border-[6px] border-white shadow-xl flex items-center justify-center text-4xl overflow-hidden ring-1 ring-slate-100">
                 🧑
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                <Camera size={14} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="text-[26px] font-black text-slate-900 tracking-tighter leading-none">크로노 님</h3>
                <div className="px-2.5 py-1 rounded-lg text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                  <Crown size={10} strokeWidth={3} /> PLATINUM
                </div>
              </div>
              <p className="text-[13px] text-slate-400 font-bold tracking-tight opacity-60">chrono-user@cardwise.com</p>
              
              <div className="mt-4 flex flex-col gap-2">
                 <div className="flex items-center justify-between px-1">
                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">레벨 24 엘리트</span>
                   <span className="text-[9px] font-black text-slate-300 leading-none">840 / 1000 경험치</span>
                 </div>
                 <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                    <div className="h-full w-[84%] bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all duration-1000" />
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-1">
            <div className="flex items-center gap-3 p-4 bg-rose-50/30 rounded-[28px] border border-rose-100/50 shadow-sm backdrop-blur-sm group/stat cursor-pointer hover:bg-rose-50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                <Zap size={18} className="text-rose-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest leading-none mb-1">자산 지수</span>
                <span className="text-[14px] font-black text-rose-600 tracking-tight whitespace-nowrap leading-none">86점</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-slate-50/30 rounded-[28px] border border-slate-100/50 shadow-sm backdrop-blur-sm group/stat cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                <Star size={18} className="text-amber-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">절약 금액</span>
                <span className="text-[14px] font-black text-slate-700 tracking-tight whitespace-nowrap leading-none">42.5만</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Badge & Achievement ── */}
      <div className="p-8 rounded-[48px] bg-white border border-gray-50 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
              <Award size={20} />
            </div>
            <div>
               <h4 className="text-[17px] font-black text-slate-800 tracking-tight">수집한 뱃지</h4>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Achievements</p>
            </div>
          </div>
          <span className="text-[13px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full">{achievedCount} / {BADGES.length}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {displayBadges.map(badge => (
            <div key={badge.id}
              className={`p-5 rounded-[28px] flex flex-col items-center text-center gap-2.5 border transition-all active:scale-95 ${
                badge.achieved
                  ? 'bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.1)]'
                  : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
              }`}>
              <div className="text-3xl drop-shadow-md">{badge.emoji}</div>
              <p className={`text-[11px] font-black leading-tight tracking-tighter ${badge.achieved ? 'text-amber-900' : 'text-gray-400'}`}>
                {badge.label}
              </p>
            </div>
          ))}
        </div>

        <button onClick={onSeeMoreBadges}
          className="w-full h-15 rounded-[22px] bg-slate-50 text-slate-400 font-black text-[13px] flex items-center justify-center gap-2 active:bg-slate-100 transition-all border border-slate-100/50 group/more">
          전체 뱃지 보러가기
          <ChevronRight size={16} className="transition-transform duration-300 group-hover/more:translate-x-1" />
        </button>
      </div>

      {/* ── Menu Categories ── */}
      <div className="space-y-6">
        {MENU_GROUPS.map((group, gi) => (
          <div key={gi} className="space-y-3">
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.25em] ml-5">{group.title}</p>
            <div className="bg-white rounded-[40px] border border-gray-50 shadow-xl overflow-hidden divide-y divide-gray-50 px-2">
              {group.items.map((item, ii) => (
                <div key={ii}
                  onClick={() => handleMenuClick(item.label)}
                  className="flex items-center justify-between px-6 py-5 cursor-pointer active:bg-rose-50 transition-all group rounded-[28px] hover:px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-rose-400 group-hover:bg-rose-50 transition-all">
                      {item.icon}
                    </div>
                    <span className="text-[15px] font-black text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.badge && (
                      <div className="px-2 py-0.5 min-w-[20px] rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-rose-500/20">
                        {item.badge}
                      </div>
                    )}
                    <ChevronRight size={18} className="text-gray-200 group-hover:text-rose-300 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <button 
          onClick={handleLogout}
          className="w-full h-16 rounded-[28px] bg-rose-50 text-rose-500 font-black text-[16px] active:scale-95 transition-all border border-rose-100 shadow-sm flex items-center justify-center gap-3"
        >
          <LogOut size={20} /> 로그아웃
        </button>
        <button className="w-full h-14 rounded-2xl text-slate-300 font-black text-[13px] active:opacity-50 transition-all flex items-center justify-center gap-2">
          <Trash2 size={16} /> 서비스 탈퇴하기
        </button>
      </div>

      {/* ── Global Settings Modal ── */}
      <SettingsDetailModal 
        isOpen={!!selectedSetting} 
        onClose={() => setSelectedSetting(null)} 
        title={selectedSetting || ''} 
      />
    </div>
  );
}

export function AllBadgesView({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-fade-in pb-24 pt-4">
      <div className="flex items-center gap-4">
         <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
            <ChevronRight size={20} className="rotate-180" />
         </button>
         <div>
            <h2 className="text-[24px] font-black text-slate-800 tracking-tighter">업적 센터</h2>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none mt-0.5">수집한 업적 리스트</p>
         </div>
      </div>

      {['금융 & 자산', '라이프스타일', '소셜 & 소통', '마일스톤 & 업적'].map(cat => (
        <div key={cat} className="space-y-4">
          <div className="flex items-center gap-2 pl-2">
             <div className="w-1.5 h-4 rounded-full bg-rose-500" />
             <h3 className="text-[16px] font-black text-slate-700 tracking-tight">{cat}</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
             {BADGES.filter(b => b.cat === cat).map(badge => (
               <div key={badge.id}
                 className={`p-4 rounded-[32px] flex flex-col items-center text-center gap-2 border transition-all active:scale-95 group ${
                   badge.achieved
                     ? 'bg-white border-rose-100 shadow-xl shadow-rose-100/20'
                     : 'bg-slate-50 border-slate-100 opacity-40 grayscale'
                 }`}>
                 <div className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-500">{badge.emoji}</div>
                 <div className="flex flex-col gap-1">
                    <p className={`text-[11px] font-black leading-tight tracking-tighter ${badge.achieved ? 'text-slate-800' : 'text-slate-400'}`}>
                      {badge.label}
                    </p>
                    <p className="text-[8px] font-bold text-slate-300 leading-[1.2] tracking-tighter max-w-[80px]">
                      {badge.description}
                    </p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
}
