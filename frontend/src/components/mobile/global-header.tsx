'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Settings, Menu, Zap } from 'lucide-react';
import { useUser } from '@/providers/UserProvider';

// Beautiful random avatar generator if photo is missing
const getRandomAvatar = (seed: string = 'default') => {
  const gradients = [
    'from-pink-400 to-rose-400',
    'from-purple-400 to-indigo-400',
    'from-blue-400 to-cyan-400',
    'from-teal-400 to-emerald-400',
    'from-amber-400 to-orange-400',
    'from-fuchsia-400 to-purple-500'
  ];
  
  const emojis = ['🐯', '🦊', '🐱', '🐼', '🐨', '🦄', '🐳', '🍎', '🌈', '⚡', '💎', '🔥'];
  
  // Simple hash for consistency
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const gIdx = Math.abs(hash) % gradients.length;
  const eIdx = Math.abs(hash) % emojis.length;
  
  return {
    gradient: gradients[gIdx],
    emoji: emojis[eIdx]
  };
};

const getRandomNickname = (seed: string = 'default') => {
  const adjectives = ['알뜰한', '바쁜', '행복한', '부지런한', '똑똑한', '신나는', '포근한', '든든한', '지혜로운', '다정한'];
  const nouns = ['토끼', '다람쥐', '고양이', '강아지', '펭귄', '돌고래', '나무늘보', '코알라', '병아리', '부엉이'];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const adjIdx = Math.abs(hash) % adjectives.length;
  const nounIdx = Math.abs(hash + 123) % nouns.length;
  
  return `${adjectives[adjIdx]} ${nouns[nounIdx]}`;
};

export function GlobalHeader() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  
  if (loading) {
    return (
      <header className="w-full px-4 pt-4 pb-2 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-slate-200" />
             <div className="space-y-2">
               <div className="w-24 h-4 bg-slate-200 rounded" />
               <div className="w-16 h-3 bg-slate-200 rounded" />
             </div>
          </div>
          <div className="flex gap-2">
             <div className="w-10 h-10 rounded-2xl bg-slate-200" />
             <div className="w-10 h-10 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </header>
    );
  }

  const loginId = user?.email?.split('@')[0] || 'admin';
  // If the profile display_name is exactly the email prefix, it means nickname hasn't been set uniquely yet.
  const rawDisplayName = user?.displayName || loginId;
  const isNicknameSet = rawDisplayName !== loginId;
  const nicknameDisplay = isNicknameSet ? rawDisplayName : getRandomNickname(loginId);

  const level = user?.level || 1;
  const tier = user?.tierName || 'BRONZE';
  
  const avatar = getRandomAvatar(nicknameDisplay + (user?.photoUrl || ''));

  return (
    <header className="w-full px-4 pt-1 pb-3 bg-transparent z-50">
      <div className="flex items-center justify-between">
        {/* Left: Profile Section */}
        <div className="flex items-center gap-3">
          {/* Avatar Area */}
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden bg-gradient-to-br ${avatar.gradient}`}
          >
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl filter drop-shadow-sm">{avatar.emoji}</span>
            )}
          </div>
          
          {/* User Info & Badges */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 leading-none">
              <Zap size={14} className="text-orange-500 fill-orange-500" />
              <span className="text-sm font-black text-slate-800 tracking-tight">
                {nicknameDisplay} <span className="text-[11px] font-bold text-slate-400 opacity-80 ml-0.5">({loginId})</span> <span className="font-bold text-[13px] opacity-70">님</span>
              </span>
              <span className="text-slate-300 text-sm mx-0.5">•</span>
              <span className="text-[11px] font-black text-rose-500 tracking-tight uppercase">
                {activeTab === 'home' ? '홈' : activeTab === 'cards' ? '내카드관리' : activeTab === 'ledger' ? '가계부' : activeTab === 'benefits' ? '혜택' : activeTab === 'community' ? '커뮤니티' : '마이'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
               {/* Tier & Level Badges */}
               <div className="flex items-center gap-1">
                  <div className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">
                      {tier}
                    </span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">
                      LV.{level}
                    </span>
                  </div>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-200 mx-0.5" />
               <span className="text-[10px] font-bold text-slate-300 tracking-tight">서비스 이용 중</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="w-10 h-10 rounded-2xl bg-white shadow-shadow border border-slate-100 flex items-center justify-center text-slate-400 active:scale-75 transition-all relative"
            onClick={() => window.dispatchEvent(new CustomEvent('openNotificationModal'))}
          >
            <Bell size={18} />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
          </button>
          
          <button 
            className="w-10 h-10 rounded-2xl bg-white shadow-shadow border border-slate-100 flex items-center justify-center text-slate-400 active:scale-75 transition-all outline-none"
            onClick={() => {
              if (activeTab === 'home') {
                window.dispatchEvent(new CustomEvent('openEditHomeModal'));
              } else if (activeTab === 'cards') {
                window.dispatchEvent(new CustomEvent('openCardSettingsModal'));
              } else {
                router.push('/mobile/profile');
              }
            }}
          >
            <Settings size={18} />
          </button>
          
          <button 
            className="w-10 h-10 rounded-2xl bg-white shadow-shadow border border-slate-100 flex items-center justify-center text-slate-400 active:scale-75 transition-all outline-none"
            onClick={() => window.dispatchEvent(new CustomEvent('openSitemapModal'))}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
