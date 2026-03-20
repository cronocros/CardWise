'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Filter, Tag, X, SlidersHorizontal } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Ledger Entry Page — 수기 입력 + 태그 + 필터링
// ─────────────────────────────────────────────────────────────

const ALL_TAGS = ['식비', '교통', '쇼핑', '카페', '문화', '의료', '구독', '여행', '운동', '선물', '공과금', '기타'];
const CATEGORIES = [
  { emoji: '🍽️', name: '식사', color: '#f97316' },
  { emoji: '🚇', name: '교통', color: '#3b82f6' },
  { emoji: '🛍️', name: '쇼핑', color: '#a855f7' },
  { emoji: '☕', name: '카페', color: '#f43f5e' },
  { emoji: '🎭', name: '문화', color: '#22c55e' },
  { emoji: '💊', name: '의료', color: '#ef4444' },
  { emoji: '📱', name: '구독', color: '#6366f1' },
  { emoji: '✈️', name: '여행', color: '#eab308' },
];

const SAMPLE_TRANSACTIONS = [
  { id: '1', icon: '🛒', name: '이마트 영등포', amount: 32500, date: '오늘', tags: ['식비', '쇼핑'], category: '쇼핑' },
  { id: '2', icon: '☕', name: '스타벅스', amount: 6800, date: '오늘', tags: ['카페'], category: '카페' },
  { id: '3', icon: '🚇', name: '서울 지하철', amount: 1400, date: '어제', tags: ['교통'], category: '교통' },
  { id: '4', icon: '🍜', name: '마루이치 라멘', amount: 12000, date: '어제', tags: ['식비'], category: '식사' },
  { id: '5', icon: '📱', name: '넷플릭스', amount: 17000, date: '2일 전', tags: ['구독'], category: '구독' },
  { id: '6', icon: '💊', name: '동네 약국', amount: 8500, date: '3일 전', tags: ['의료'], category: '의료' },
];

type View = 'list' | 'add' | 'filter';

export default function LedgerEntryPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Add Form State
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [chosenCard, setChosenCard] = useState('삼성카드 iD SIMPLE');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  const toggleFormTag = (tag: string) => {
    setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filteredTx = SAMPLE_TRANSACTIONS.filter(tx => {
    const matchSearch = !searchQuery || tx.name.includes(searchQuery);
    const matchTag = selectedTags.length === 0 || selectedTags.some(t => tx.tags.includes(t));
    const matchCat = !selectedCategory || tx.category === selectedCategory;
    return matchSearch && matchTag && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[12px] font-black text-gray-800 bg-white sticky top-0 z-50">
        <span>9:41</span><span className="opacity-40">75%</span>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-50 px-5 pb-4 sticky top-[36px] z-40">
        <div className="flex items-center gap-3 mb-4 pt-3">
          <button onClick={() => view !== 'list' ? setView('list') : router.back()}
            className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h2 className="flex-1 text-[18px] font-black text-gray-800 tracking-tight">
            {view === 'add' ? '지출 입력' : view === 'filter' ? '필터 & 태그' : '가계부 내역'}
          </h2>
          {view === 'list' && (
            <div className="flex gap-2">
              <button onClick={() => setView('filter')}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${selectedTags.length > 0 || selectedCategory ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                <Filter size={18} />
              </button>
              <button onClick={() => setView('add')}
                className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white active:scale-90 transition-all shadow-md shadow-rose-200">
                <span className="text-xl leading-none font-black">+</span>
              </button>
            </div>
          )}
        </div>

        {view === 'list' && (
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              type="text" placeholder="가게명, 태그로 검색..."
              className="w-full h-12 pl-11 pr-4 rounded-[18px] bg-gray-50 border border-gray-100 outline-none text-[14px] font-bold text-gray-700 placeholder-gray-300 focus:border-rose-200 transition-colors" />
          </div>
        )}
      </div>

      {/* Active Filters */}
      {view === 'list' && (selectedTags.length > 0 || selectedCategory) && (
        <div className="flex gap-2 px-5 pt-3 overflow-x-auto scrollbar-hide">
          {selectedCategory && (
            <button onClick={() => setSelectedCategory('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[12px] font-black">
              {selectedCategory} <X size={11} />
            </button>
          )}
          {selectedTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 text-white text-[12px] font-black whitespace-nowrap">
              #{tag} <X size={11} />
            </button>
          ))}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="flex-1 px-5 pt-4 pb-32 space-y-2">
          {filteredTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24 gap-4">
              <div className="text-5xl">🔍</div>
              <p className="text-[15px] font-black text-gray-400">결과가 없어요</p>
              <button onClick={() => { setSearchQuery(''); setSelectedTags([]); setSelectedCategory(''); }}
                className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-500 font-black text-[13px]">
                필터 초기화
              </button>
            </div>
          ) : filteredTx.map(tx => (
            <div key={tx.id}
              className="bg-white rounded-[22px] p-4 border border-gray-50 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all">
              <div className="w-11 h-11 rounded-[16px] bg-gray-50 flex items-center justify-center text-xl shadow-inner">{tx.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-black text-gray-800 truncate">{tx.name}</p>
                <div className="flex gap-1 mt-1">
                  {tx.tags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${selectedTags.includes(tag) ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[14px] font-black text-gray-800">{tx.amount.toLocaleString()}원</p>
                <p className="text-[10px] font-bold text-gray-300">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD VIEW ── */}
      {view === 'add' && (
        <div className="flex-1 px-5 pt-4 pb-32 space-y-5">
          {/* Amount */}
          <div className="bg-white rounded-[28px] p-6 border border-gray-50 shadow-md text-center">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-3">금액</label>
            <div className="flex items-baseline justify-center gap-2">
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                type="text" inputMode="numeric" placeholder="0"
                className="text-[42px] font-black text-gray-800 tracking-tight bg-transparent outline-none text-center w-full" />
              <span className="text-[20px] font-black text-gray-400">원</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">카테고리</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setActiveCategory(cat)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-[22px] transition-all active:scale-90 ${
                    activeCategory.name === cat.name ? 'shadow-md' : 'bg-white border border-gray-100'
                  }`}
                  style={activeCategory.name === cat.name ? { background: `${cat.color}15`, border: `2px solid ${cat.color}30` } : {}}>
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-[10px] font-black" style={{ color: activeCategory.name === cat.name ? cat.color : '#9ca3af' }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">메모</label>
            <input value={memo} onChange={e => setMemo(e.target.value)}
              type="text" placeholder="어디서, 무엇을?"
              className="w-full h-14 px-5 rounded-[22px] bg-white border border-gray-100 outline-none text-[15px] font-bold text-gray-700 placeholder-gray-300 focus:border-rose-200 transition-colors shadow-sm" />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 flex items-center gap-2 block">
              <Tag size={13} />태그 선택 (복수)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleFormTag(tag)}
                  className={`px-3 py-2 rounded-2xl text-[12px] font-black border transition-all active:scale-90 ${
                    formTags.includes(tag)
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                      : 'bg-white text-gray-500 border-gray-100'
                  }`}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Card Selection */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">사용 카드</label>
            <div className="space-y-2">
              {['삼성카드 iD SIMPLE', '신한카드 Deep Dream'].map(card => (
                <button key={card} onClick={() => setChosenCard(card)}
                  className={`w-full flex items-center gap-3 p-4 rounded-[22px] border transition-all ${
                    chosenCard === card ? 'border-rose-300 bg-rose-50' : 'border-gray-100 bg-white'
                  }`}>
                  <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: card.includes('삼성') ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #a855f7, #6d28d9)' }} />
                  <span className={`text-[13px] font-black ${chosenCard === card ? 'text-rose-600' : 'text-gray-600'}`}>{card}</span>
                  {chosenCard === card && <div className="w-2 h-2 rounded-full bg-rose-500 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER VIEW ── */}
      {view === 'filter' && (
        <div className="flex-1 px-5 pt-4 pb-32 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">카테고리</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setSelectedCategory(prev => prev === cat.name ? '' : cat.name)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-[22px] transition-all active:scale-90 border ${
                    selectedCategory === cat.name ? 'border-[2px] shadow-md' : 'bg-white border-gray-100'
                  }`}
                  style={selectedCategory === cat.name ? { background: `${cat.color}15`, borderColor: `${cat.color}40` } : {}}>
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-[10px] font-black" style={{ color: selectedCategory === cat.name ? cat.color : '#9ca3af' }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 flex items-center gap-2 block">
              <Tag size={13} />태그로 필터
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-4 py-2.5 rounded-2xl text-[12px] font-black border transition-all active:scale-90 ${
                    selectedTags.includes(tag)
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100'
                      : 'bg-white text-gray-500 border-gray-100'
                  }`}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button onClick={() => { setSelectedTags([]); setSelectedCategory(''); }}
            className="w-full py-4 rounded-[22px] border-2 border-dashed border-gray-200 text-gray-400 font-black text-[13px] active:scale-95 transition-all">
            필터 초기화
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-5 bg-white/95 backdrop-blur-xl border-t border-gray-100">
        {view === 'add' ? (
          <button onClick={() => setView('list')}
            className="w-full h-14 rounded-[22px] text-white font-black text-[16px] active:scale-95 transition-all shadow-lg shadow-rose-200"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
            {amount ? `${parseInt(amount).toLocaleString()}원 저장하기` : '저장하기'}
          </button>
        ) : view === 'filter' ? (
          <button onClick={() => setView('list')}
            className="w-full h-14 rounded-[22px] text-white font-black text-[16px] active:scale-95 transition-all shadow-lg shadow-rose-200"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
            {selectedTags.length + (selectedCategory ? 1 : 0) > 0 ? `${selectedTags.length + (selectedCategory ? 1 : 0)}개 필터 적용` : '닫기'}
          </button>
        ) : (
          <button onClick={() => setView('add')}
            className="w-full h-14 rounded-[22px] text-white font-black text-[16px] active:scale-95 transition-all shadow-lg shadow-rose-200"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
            + 지출 수기 입력
          </button>
        )}
      </div>
    </div>
  );
}
