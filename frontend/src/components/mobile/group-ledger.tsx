'use client';

import React, { useState } from 'react';
import { 
  Plus, ChevronRight, Crown, UserCheck, 
  PieChart, Calendar, Sparkles
} from 'lucide-react';
import { Mascot } from '@/components/mobile/mascot';

// ─────────────────────────────────────────────────────────────
// Group Ledger View — 공동 가계부
// ─────────────────────────────────────────────────────────────

interface GroupMember {
  name: string;
  role: 'OWNER' | 'MEMBER';
  avatar: string;
  spent: number;
  color: string;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
  myRole: 'OWNER' | 'MEMBER';
  monthlyTotal: number;
  members: GroupMember[];
}

interface GroupTransaction {
  id: string;
  memberName: string;
  memberAvatar: string;
  name: string;
  category: string;
  amount: number;
  date: string;
}

const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: '우리 가족',
    emoji: '👨‍👩‍👧',
    memberCount: 3,
    myRole: 'OWNER',
    monthlyTotal: 2450000,
    members: [
      { name: '김카드', role: 'OWNER', avatar: '🧑', spent: 1200000, color: '#f43f5e' },
      { name: '김아내', role: 'MEMBER', avatar: '👩', spent: 750000, color: '#a855f7' },
      { name: '김아이', role: 'MEMBER', avatar: '👧', spent: 500000, color: '#3b82f6' },
    ],
  },
  {
    id: '2',
    name: '직장 동료',
    emoji: '💼',
    memberCount: 4,
    myRole: 'MEMBER',
    monthlyTotal: 186000,
    members: [
      { name: '최팀장', role: 'OWNER', avatar: '👨‍💼', spent: 60000, color: '#f59e0b' },
      { name: '김카드', role: 'MEMBER', avatar: '🧑', spent: 46000, color: '#f43f5e' },
      { name: '이동료', role: 'MEMBER', avatar: '👤', spent: 42000, color: '#10b981' },
      { name: '박동료', role: 'MEMBER', avatar: '👤', spent: 38000, color: '#6366f1' },
    ],
  },
];

const MOCK_GROUP_TXS: GroupTransaction[] = [
  { id: '1', memberName: '김카드', memberAvatar: '🧑', name: '이마트', category: '쇼핑', amount: 78000, date: '오늘' },
  { id: '2', memberName: '김아내', memberAvatar: '👩', name: '스타벅스', category: '카페', amount: 12000, date: '오늘' },
  { id: '3', memberName: '김아이', memberAvatar: '👧', name: '교보문고', category: '문화', amount: 24000, date: '어제' },
  { id: '4', memberName: '김카드', memberAvatar: '🧑', name: '롯데마트', category: '쇼핑', amount: 54000, date: '어제' },
];

function formatKRW(n: number) {
  const man = Math.floor(n / 10000);
  const rest = Math.round((n % 10000) / 1000);
  if (man > 0 && rest > 0) return `${man}만 ${rest}천원`;
  if (man > 0) return `${man}만원`;
  if (rest > 0) return `${rest}천원`;
  return `${n.toLocaleString()}원`;
}

export function GroupLedgerView() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedGroup = MOCK_GROUPS.find(g => g.id === selectedGroupId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Group Selector */}
      {!selectedGroupId ? (
        <>
          {/* Active Groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[14px] font-black text-var(--text-strong) opacity-50 uppercase tracking-widest">참여 중인 그룹</h4>
              <button onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 text-[12px] font-black text-rose-500 active:opacity-50 transition-opacity">
                <Plus size={14} />새 그룹
              </button>
            </div>

            {MOCK_GROUPS.map(group => (
              <button key={group.id} onClick={() => setSelectedGroupId(group.id)}
                className="w-full p-6 rounded-[36px] bg-white border border-gray-50 shadow-lg text-left group active:scale-[0.98] transition-all">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[22px] bg-gray-50 flex items-center justify-center text-2xl shadow-inner">
                      {group.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-black text-var(--text-strong)">{group.name}</p>
                        {group.myRole === 'OWNER' ? (
                          <Crown size={12} className="text-amber-500" />
                        ) : (
                          <UserCheck size={12} className="text-blue-400" />
                        )}
                      </div>
                      <p className="text-[12px] text-var(--text-soft) opacity-50 font-bold mt-0.5">
                        멤버 {group.memberCount}명 · {group.myRole === 'OWNER' ? 'OWNER' : 'MEMBER'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-black text-var(--text-strong)">{formatKRW(group.monthlyTotal)}</p>
                    <p className="text-[10px] font-bold text-var(--text-muted) opacity-40 uppercase tracking-widest">이번달</p>
                  </div>
                </div>

                {/* Member Avatar Row */}
                <div className="flex items-center gap-2">
                  {group.members.slice(0, 4).map((m, i) => (
                    <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm"
                      style={{ background: `${m.color}20` }}>
                      {m.avatar}
                    </div>
                  ))}
                  {group.memberCount > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 border-2 border-white shadow-sm">
                      +{group.memberCount - 4}
                    </div>
                  )}
                  <div className="flex-1" />
                  <ChevronRight size={16} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Empty Invite Banner */}
          <div className="p-8 rounded-[48px] border-2 border-dashed border-rose-100 flex flex-col items-center text-center gap-4 bg-rose-50/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Mascot pose="thinking" size={80} className="mb-2 relative z-10" />
            <div className="relative z-10">
              <p className="text-[17px] font-black text-rose-600 tracking-tight">함께 쓰면 더 즐거워요!</p>
              <p className="text-[12px] font-bold text-rose-400 mt-1 opacity-80 leading-snug">가족이나 친구와 함께 지출을 관리하고<br/>최고의 절약 왕을 가려보세요 🏆</p>
            </div>
            <button onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 rounded-[22px] bg-rose-500 text-white font-black text-[14px] active:scale-95 transition-all shadow-lg shadow-rose-200 border border-rose-400/20 relative z-10 group-hover:-translate-y-1 duration-500">
              새 그룹 만들기
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Group Detail View */}
          <div>
            {/* Back + Group Header */}
            <div className="p-7 rounded-[44px] bg-slate-900 shadow-2xl relative overflow-hidden mb-6 group">
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full" />
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
               
               <div className="flex items-center gap-4 relative z-10">
                 <button onClick={() => setSelectedGroupId(null)}
                   className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-75 transition-transform">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                     <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
                   </svg>
                 </button>
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <span className="text-2xl">{selectedGroup?.emoji}</span>
                     <h3 className="text-[20px] font-black text-white tracking-tighter leading-none">{selectedGroup?.name}</h3>
                   </div>
                   <div className="flex items-center gap-2 mt-2">
                     <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 flex items-center gap-1">
                        <Sparkles size={10} className="text-rose-300" />
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Master Level</span>
                     </div>
                     <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">멤버 {selectedGroup?.memberCount}명</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-[22px] font-black text-rose-400 font-display tracking-tight leading-none mb-1">{formatKRW(selectedGroup?.monthlyTotal || 0)}</p>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Monthly Sum</p>
                 </div>
               </div>
            </div>

            {/* Stats/List Toggle */}
            <div className="flex p-1 bg-gray-50 rounded-2xl mb-6">
              {[{ id: 'list', label: '내역', icon: <Calendar size={14}/> }, 
                { id: 'stats', label: '통계', icon: <PieChart size={14}/> }].map(tab => (
                <button key={tab.id} onClick={() => setViewMode(tab.id as 'list' | 'stats')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] transition-all ${
                    viewMode === tab.id ? 'bg-white shadow text-var(--text-strong)' : 'text-gray-400'
                  }`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-3">
                {MOCK_GROUP_TXS.map(tx => (
                  <div key={tx.id} className="p-5 rounded-[28px] bg-white border border-gray-50 shadow-md flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-lg">{tx.memberAvatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-black text-var(--text-strong) truncate">{tx.name}</p>
                      <p className="text-[11px] text-var(--text-soft) opacity-40 font-bold">{tx.memberName} · {tx.date}</p>
                    </div>
                    <p className="text-[15px] font-black text-var(--text-strong)">{formatKRW(tx.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[12px] font-black text-var(--text-soft) opacity-40 uppercase tracking-widest px-1">멤버별 지출</p>
                {selectedGroup?.members.map((m, i) => {
                  const pct = Math.round((m.spent / (selectedGroup.monthlyTotal)) * 100);
                  return (
                    <div key={i} className="p-5 rounded-[28px] bg-white border border-gray-50 shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{ background: `${m.color}15` }}>
                            {m.avatar}
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-var(--text-strong)">{m.name}</p>
                            <p className="text-[10px] font-bold opacity-30 uppercase">{m.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-black" style={{ color: m.color }}>{formatKRW(m.spent)}</p>
                          <p className="text-[10px] font-bold opacity-30">{pct}%</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[900] flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-[430px] mx-auto bg-white rounded-t-[48px] p-8 pb-12 shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
            <h3 className="text-[24px] font-black tracking-tighter text-var(--text-strong) mb-6">새 그룹 만들기</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">그룹 이름</label>
                <input type="text" placeholder="예: 우리 가족" className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 outline-none focus:border-rose-200 font-bold text-[15px] transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">그룹 설명 (선택)</label>
                <input type="text" placeholder="그룹에 대한 설명을 입력하세요" className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 outline-none focus:border-rose-200 font-bold text-[15px] transition-all" />
              </div>
            </div>
            <button className="w-full h-16 rounded-[24px] mt-8 font-black text-[16px] text-white active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
              그룹 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
