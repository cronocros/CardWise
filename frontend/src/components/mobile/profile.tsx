'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight,
  Camera, Award, Star, Zap,
  Crown, CreditCard, Gift, Globe, FileText, Trash2, MessageCircle,
  ChevronDown
} from 'lucide-react';
import { SettingsDetailModal } from './modals';

const BADGES = [
  { id: 'pioneer', label: '초기 개척자', emoji: '🥇', description: 'CardWise 첫 번째 가입자 1000명 내 가입', achieved: true },
  { id: 'card5', label: '카드 수집가', emoji: '💳', description: '5개 이상의 카드를 등록', achieved: true },
  { id: 'savings', label: '절약의 왕', emoji: '💰', description: '한 달 혜택 절약 5만원 달성', achieved: true },
  { id: 'group', label: '그룹 리더', emoji: '👑', description: '공동 가계부 그룹 생성 및 관리', achieved: false },
  { id: 'million', label: '백만원 클럽', emoji: '🏆', description: '연간 실적 100만원 달성', achieved: false },
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

export function ProfileView() {
  const router = useRouter();
  const [showAllBadges, setShowAllBadges] = useState(false);
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
  const displayBadges = showAllBadges ? BADGES : BADGES.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* ── Profile Hero Card ── */}
      <div className="relative p-8 rounded-[48px] bg-white border border-gray-50 shadow-xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-30 group-hover:scale-110 transition-transform duration-1000"
          style={{ background: 'radial-gradient(circle, #f43f5e, #6366f1, transparent)' }} />

        <div className="flex items-center gap-6 relative z-10">
          <div className="relative group cursor-pointer active:scale-95 transition-transform">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-rose-100 to-rose-50 border-4 border-white shadow-2xl flex items-center justify-center text-4xl overflow-hidden">
               🧑
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg border-2 border-white group-hover:rotate-12 transition-all">
              <Camera size={14} className="text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[24px] font-black text-slate-800 tracking-tighter">김카드</h3>
              <div className="px-3 py-1 rounded-full text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                <Crown size={10} /> PLATINUM
              </div>
            </div>
            <p className="text-[12px] text-slate-400 font-bold tracking-tight opacity-70">kim-card@cardwise.com</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100 shadow-sm">
                <Zap size={11} className="text-rose-500" />
                <span className="text-[11px] font-black text-rose-500">자산지수 86점</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <Star size={11} className="text-amber-500" />
                <span className="text-[11px] font-black text-gray-600">절약 42.5만</span>
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

        <button onClick={() => setShowAllBadges(!showAllBadges)}
          className="w-full h-14 rounded-[22px] bg-gray-50 text-gray-400 font-black text-[13px] flex items-center justify-center gap-2 active:bg-gray-100 transition-all border border-gray-100">
          {showAllBadges ? '접기' : '더 많은 뱃지 보기'}
          <ChevronDown size={16} className={`transition-transform duration-300 ${showAllBadges ? 'rotate-180' : ''}`} />
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
                  className="flex items-center justify-between px-6 py-5.5 cursor-pointer active:bg-rose-50 transition-all group rounded-[28px] hover:px-8">
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
