'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  CreditCard, 
  Check, 
  Smartphone, 
  Bus, 
  Wifi, 
  Wallet, 
  Target, 
  Info,
  Apple,
  Star,
  Pin,
  Bell,
  BellOff,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { 
  registerCardDetailed, 
  getCardMetadata, 
  getCards, 
  CardMetadataResponse, 
  CardSummaryDto, 
  unwrapData, 
  unwrapArray 
} from '@/lib/cardwise-api';

const FEATURES = [
  { id: 'apple_pay', label: '애플페이', icon: Apple, color: 'text-slate-900' },
  { id: 'samsung_pay', label: '삼성페이', icon: Smartphone, color: 'text-blue-500' },
  { id: 'transport', label: '교통카드', icon: Bus, color: 'text-teal-500' },
  { id: 'contactless', label: '컨택리스', icon: Wifi, color: 'text-sky-500' },
  { id: 'wallet', label: '현금카드겸용', icon: Wallet, color: 'text-amber-500' },
];

export default function AddCardPage() {
  const router = useRouter();
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<CardMetadataResponse['data'] | null>(null);
  
  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<CardSummaryDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Cascading product list
  const [productList, setProductList] = useState<CardSummaryDto[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    issuerId: '',
    brandId: '',
    cardId: null as number | null, // Pre-defined card template ID
    firstFour: '',
    lastFour: '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    expiry: '',
    target: 300000,
    annualTarget: 10000000,
    features: [] as string[],
    imageUrl: null as string | null,
    useActualImage: true,
    isNotificationEnabled: true,
    isMain: false,
    isPinned: false
  });

  const lastFourRef = useRef<HTMLInputElement>(null);

  // Fetch initial metadata
  useEffect(() => {
    async function loadMetadata() {
      setIsLoadingMetadata(true);
      const res = await getCardMetadata();
      const unwrapped = unwrapData<CardMetadataResponse['data']>(res);
      if (unwrapped) {
        setMetadata(unwrapped);
      }
      setIsLoadingMetadata(false);
    }
    loadMetadata();
  }, []);

  // Fetch product list when issuer or brand changes (Cascading)
  useEffect(() => {
    if (formData.issuerId && formData.brandId) {
      async function loadProducts() {
        const res = await getCards(formData.issuerId, formData.brandId);
        setProductList(unwrapArray<CardSummaryDto>(res));
      }
      loadProducts();
    } else {
      setProductList([]);
    }
  }, [formData.issuerId, formData.brandId]);

  // Handle Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchKeyword.length >= 2) {
        setIsSearching(true);
        const res = await getCards(undefined, undefined, searchKeyword);
        setSearchResults(unwrapArray<CardSummaryDto>(res));
        setIsSearching(false);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const selectProduct = (p: CardSummaryDto) => {
    // Backend API might not return imageUrl if not rebuilt/restarted.
    // Force fallback for Deep Dream during migration.
    let finalImageUrl = p.imageUrl || null;
    if (!finalImageUrl && p.cardName.includes('Deep Dream')) {
      finalImageUrl = '/images/cards/shinhan_deepdream.png';
    }

    setFormData(prev => ({
      ...prev,
      name: p.cardName,
      issuerId: p.issuerId,
      brandId: p.brandId,
      cardId: p.cardId,
      type: p.cardType as 'CREDIT' | 'DEBIT',
      features: p.features,
      imageUrl: finalImageUrl
    }));
    setSearchKeyword('');
    setShowSearchResults(false);
  };

  const toggleFeature = (id: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(id) 
        ? prev.features.filter(f => f !== id) 
        : [...prev.features, id]
    }));
  };

  const formatWithCommas = (val: number | string) => {
    const num = typeof val === 'string' ? parseInt(val.replace(/[^0-9]/g, '')) : val;
    if (isNaN(num)) return '0';
    return num.toLocaleString('ko-KR');
  };

  const handleCurrencyChange = (val: string, key: 'target' | 'annualTarget') => {
    const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
    setFormData({...formData, [key]: num});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issuerId || !formData.brandId || !formData.name) {
      alert('카드 정보를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const [expMM, expYY] = (formData.expiry || '06/29').split('/');
      await registerCardDetailed({
        cardNickname: formData.name,
        issuerId: formData.issuerId,
        brandId: formData.brandId,
        cardType: formData.type,
        cardNumberFirstFour: formData.firstFour,
        cardNumberLastFour: formData.lastFour,
        expiryMonth: expMM || '06',
        expiryYear: expYY || '29',
        monthlyTargetAmount: formData.target,
        annualTargetAmount: formData.annualTarget,
        features: formData.features,
        isNotificationEnabled: formData.isNotificationEnabled,
        isMain: formData.isMain,
        isPinned: formData.isPinned,
        imageUrl: formData.useActualImage ? formData.imageUrl || undefined : undefined
      });

      // Simple local sync
      const saved = localStorage.getItem('cardwise_user_cards');
      const cardList = saved ? JSON.parse(saved) : [];
      localStorage.setItem('cardwise_user_cards', JSON.stringify([{
        id: Date.now().toString(),
        name: formData.name,
        issuer: metadata?.issuers.find(i => i.id === formData.issuerId)?.name || '기타',
        brand: formData.brandId,
        firstFour: formData.firstFour,
        lastFour: formData.lastFour,
        type: formData.type.toLowerCase(),
        target: formData.target,
        features: formData.features,
        isMain: formData.isMain,
        isPinned: formData.isPinned
      }, ...cardList]));

      router.push('/mobile?tab=cards');
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMetadata) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
         <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center shadow-sm mb-4">
            <Loader2 size={32} className="text-rose-500 animate-spin" />
         </div>
         <p className="text-[14px] font-black text-slate-800">데이터베이스 동기화 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto overflow-x-hidden pb-10">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 flex items-center justify-between z-50 sticky top-0 bg-gray-50/80 backdrop-blur-xl border-b border-gray-100">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-[17px] font-black tracking-tight text-slate-800">새로운 카드 등록</h1>
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Card Preview */}
        <section className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">디자인 미리보기</p>
          <div 
            className="w-full h-[176px] rounded-[32px] p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden transition-all duration-500"
            style={{ 
              background: (formData.useActualImage && formData.imageUrl) 
                ? 'none' 
                : (formData.type === 'CREDIT' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #f43f5e, #e11d48)') 
            }}
          >
            {formData.useActualImage && formData.imageUrl && (
              <>
                <img 
                  src={formData.imageUrl} 
                  alt="Card Design" 
                  className="absolute inset-0 w-full h-full object-cover z-0 animate-fade-in"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-[5]" />
              </>
            )}
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/60 drop-shadow-md">
                        {formData.type === 'CREDIT' ? 'CREDIT' : 'DEBIT'}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-[11px] font-black italic tracking-tighter text-white drop-shadow-sm uppercase">
                      {metadata?.brands.find(b => b.id === formData.brandId)?.name || 'VISA'}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-black text-white tracking-tight drop-shadow-md">
                    {formData.name || '상품을 선택하세요'}
                  </h4>
               </div>
               <div className="flex flex-col items-end pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    {formData.isPinned && <Pin size={16} fill="white" className="text-white drop-shadow-lg rotate-45" />}
                    {formData.isMain && <Star size={18} fill="#fbbf24" className="text-amber-400 drop-shadow-lg" />}
                    <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] leading-none ml-1">Valid Thru</span>
                  </div>
                  <span className="text-[11px] font-black text-white/70 font-mono tracking-widest leading-none">
                    {formData.expiry || '12/28'}
                  </span>
               </div>
            </div>
            <div className="relative z-10 -mt-2">
               <div className="flex items-center gap-4 opacity-40">
                  <span className="text-[18px] font-black text-white tracking-[0.1em] font-mono leading-none">
                    {formData.firstFour || '4521'}
                  </span>
                  <div className="flex gap-2">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-1.5">
                        {[1, 2, 3, 4].map(j => <div key={j} className="w-1 h-1 rounded-full bg-white" />)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[18px] font-black text-white tracking-[0.1em] font-mono leading-none">
                    {formData.lastFour || '8888'}
                  </span>
               </div>
            </div>
             <div className="flex items-center justify-between w-full relative z-10">
               <div className="flex items-center gap-2.5">
                 <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                   <div className="w-4 h-3 bg-amber-400/80 rounded-[2px]" />
                 </div>
                 <div className="text-[10px] text-white/60 font-[900] tracking-widest uppercase">
                    {formData.issuerId ? (metadata?.issuers.find(i => i.id === formData.issuerId)?.name) : 'CARDWISE'}
                 </div>
               </div>
               <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm max-h-[32px]">
                {formData.features.map(fid => {
                  const f = FEATURES.find(x => x.id === fid);
                  return f ? <f.icon key={fid} size={12} className="text-white/60" /> : null;
                })}
                {formData.isNotificationEnabled && <Bell size={12} className="text-white/60" />}
               </div>
            </div>
          </div>
        </section>
        
        <div className="flex items-center justify-between p-4 rounded-[22px] bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.useActualImage ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              <CreditCard size={14} />
            </div>
            <div>
              <p className="text-[12px] font-black text-slate-800">카드 디자인 적용</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formData.useActualImage ? '공식 이미지 사용 중' : '기본 색상 사용 중'}</p>
            </div>
          </div>
          <button type="button" onClick={() => setFormData({...formData, useActualImage: !formData.useActualImage})} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.useActualImage ? 'bg-rose-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.useActualImage ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-widest border-b pb-1.5 flex items-center gap-2">
               <CreditCard size={14} /> 기본 정보
            </h3>
            
            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">상품 검색</label>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="상품명으로 직접 검색..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-[14px] shadow-sm"
                  />
                  {searchKeyword && (
                    <button type="button" onClick={() => setSearchKeyword('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[22px] shadow-2xl border border-gray-100 z-[100] max-h-60 overflow-y-auto p-2 animate-slide-up">
                    {isSearching ? (
                      <div className="p-4 text-center"><Loader2 size={16} className="animate-spin inline mr-2" /> 검색 중...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(p => (
                        <button key={p.cardId} type="button" onClick={() => selectProduct(p)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-[16px] transition-colors border-b border-gray-50 last:border-0 text-left">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                              {metadata?.issuers.find(i => i.id === p.issuerId)?.name} / {p.brandId}
                            </span>
                            <span className="text-[14px] font-black text-slate-800">{p.cardName}</span>
                          </div>
                          {(p.imageUrl || p.cardName.includes('Deep Dream')) && (
                            <img 
                              src={p.imageUrl || '/images/cards/shinhan_deepdream.png'} 
                              alt="" 
                              className="w-12 h-7 rounded-sm object-cover shadow-sm ml-2" 
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[12px] font-bold text-slate-400">검색 결과가 없습니다</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">1. 카드사</label>
                  <select 
                    value={formData.issuerId}
                    onChange={e => setFormData({...formData, issuerId: e.target.value, brandId: '', cardId: null, name: ''})}
                    className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-slate-700 shadow-sm appearance-none text-[13px]"
                  >
                    <option value="">선택하세요</option>
                    {metadata?.issuers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">2. 제휴 브랜드</label>
                  <select 
                    disabled={!formData.issuerId}
                    value={formData.brandId}
                    onChange={e => setFormData({...formData, brandId: e.target.value, cardId: null, name: ''})}
                    className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-slate-700 shadow-sm appearance-none text-[13px] disabled:opacity-50"
                  >
                    <option value="">선택하세요</option>
                    {metadata?.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">3. 상품명 선택 (또는 직접 입력)</label>
                <div className="relative">
                  <select 
                    disabled={!formData.issuerId || !formData.brandId}
                    value={formData.cardId || ""}
                    onChange={e => {
                      const p = productList.find(x => x.cardId === parseInt(e.target.value));
                      if (p) selectProduct(p);
                    }}
                    className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-slate-700 shadow-sm appearance-none text-[13px] disabled:opacity-50"
                  >
                    <option value="">{formData.issuerId && formData.brandId ? '등록된 상품 목록' : '먼저 카드사/브랜드를 선택하세요'}</option>
                    {productList.map(p => <option key={p.cardId} value={p.cardId}>{p.cardName}</option>)}
                  </select>
                  <input 
                    type="text"
                    placeholder="목록에 없으면 직접 입력"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value, cardId: null})}
                    className="mt-2 w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-slate-800 shadow-sm text-[14px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" inputMode="numeric" maxLength={4} placeholder="앞 4자리" value={formData.firstFour}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setFormData({...formData, firstFour: val});
                    if (val.length === 4) lastFourRef.current?.focus();
                  }}
                  className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-center text-[15px] tracking-[3px] shadow-sm"
                />
                <input 
                  ref={lastFourRef} type="text" inputMode="numeric" maxLength={4} placeholder="뒤 4자리" value={formData.lastFour}
                  onChange={e => setFormData({...formData, lastFour: e.target.value.replace(/[^0-9]/g, '').slice(0, 4)})}
                  className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-center text-[15px] tracking-[3px] shadow-sm"
                />
              </div>

              <input 
                type="text" placeholder="유효기간 (MM/YY)" maxLength={5} value={formData.expiry}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                  setFormData({...formData, expiry: val});
                }}
                className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-slate-800 shadow-sm text-[14px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-widest border-b pb-1.5 flex items-center gap-2">
               <Info size={14} /> 타입 및 주요 기능
            </h3>
            <div className="flex gap-2 p-1 rounded-2xl bg-gray-100/50">
              {['CREDIT', 'DEBIT'].map(t => (
                <button key={t} type="button" onClick={() => setFormData({...formData, type: t as 'CREDIT' | 'DEBIT'})} className={`flex-1 py-3 rounded-xl font-black text-[12px] transition-all ${formData.type === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>
                  {t === 'CREDIT' ? '신용카드' : '체크카드'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map(feat => (
                <button key={feat.id} type="button" onClick={() => toggleFeature(feat.id)} className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${formData.features.includes(feat.id) ? 'bg-white border-rose-100 shadow-sm' : 'bg-transparent border-gray-100 opacity-50 grayscale'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${formData.features.includes(feat.id) ? 'bg-rose-50/50' : 'bg-gray-100/50'}`}>
                    <feat.icon size={13} className={formData.features.includes(feat.id) ? feat.color : 'text-gray-400'} />
                  </div>
                  <span className={`text-[11px] font-black ${formData.features.includes(feat.id) ? 'text-slate-800' : 'text-slate-400'}`}>{feat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-widest border-b pb-1.5 flex items-center gap-2">
               <Target size={14} /> 실적 목표 설정
            </h3>
            <div className="space-y-4">
               {[{label: '월간 목표 (원)', key: 'target'}, {label: '연간 누적 목표 (원)', key: 'annualTarget'}].map(field => (
                 <div key={field.key} className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">{field.label}</label>
                    <input 
                      type="text" inputMode="numeric"
                      value={formatWithCommas(formData[field.key as keyof typeof formData] as number)}
                      onChange={e => handleCurrencyChange(e.target.value, field.key as 'target' | 'annualTarget')}
                      className="w-full p-4 rounded-[18px] bg-white border border-gray-100 focus:border-rose-300 outline-none transition-all font-black text-slate-800 shadow-sm text-[14px]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-[2px] text-[11px] font-black text-slate-200">₩</span>
                 </div>
               ))}
               <div className="p-4 rounded-[22px] bg-rose-50/30 border border-rose-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.isNotificationEnabled ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                       {formData.isNotificationEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                     </div>
                     <div><p className="text-[12px] font-black text-slate-800">실적 달성 알림</p><p className="text-[10px] font-bold text-slate-400 mt-0.5">목표 도달 시 푸시 알림</p></div>
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, isNotificationEnabled: !formData.isNotificationEnabled})} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isNotificationEnabled ? 'bg-rose-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.isNotificationEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </div>

          <div className="flex gap-3">
             {[{icon: Star, label: '주력 카드', key: 'isMain', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100'}, 
               {icon: Pin, label: '상단 고정', key: 'isPinned', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100'}].map(opt => (
               <button 
                 key={opt.key} type="button" 
                 onClick={() => setFormData({...formData, [opt.key]: !formData[opt.key as keyof typeof formData]})}
                 className={`flex-1 flex flex-col items-center gap-2 p-3.5 rounded-[24px] border transition-all ${formData[opt.key as keyof typeof formData] ? `${opt.bg} ${opt.border} shadow-sm` : 'bg-white border-gray-100 opacity-60'}`}
               >
                  <opt.icon size={18} fill={formData[opt.key as keyof typeof formData] ? "currentColor" : "none"} className={`${formData[opt.key as keyof typeof formData] ? opt.color : "text-gray-300"} ${opt.key === 'isPinned' && 'rotate-45'}`} />
                  <span className={`text-[10px] font-black ${formData[opt.key as keyof typeof formData] ? "text-slate-800" : "text-gray-400"}`}>{opt.label}</span>
               </button>
             ))}
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full h-16 rounded-[24px] bg-rose-500 text-white font-black text-[15px] shadow-xl shadow-rose-500/20 active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} strokeWidth={3} /><span>등록 완료</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
