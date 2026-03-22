'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Gift, Clock, History, CheckCircle2, 
  AlertCircle, ChevronRight, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { tryFetchBackendJson } from '@/lib/cardwise-api';

interface VoucherRecord {
  userVoucherId: number;
  voucherName: string;
  cardName: string;
  remainingCount: number;
  totalCount: number;
  validUntil: string;
  unlockState: 'LOCKED' | 'ELIGIBLE' | 'UNLOCKED';
}

export function VoucherManagementView() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      const res = await tryFetchBackendJson<{ data: VoucherRecord[] }>('/vouchers');
      if (res?.data) {
        setVouchers(res.data);
      }
      setLoading(false);
    };
    fetchVouchers();
  }, []);

  const filtered = vouchers.filter(v => 
    v.voucherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="px-6 py-8 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-[100] shadow-sm">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center active:scale-95 transition-all text-slate-800">
           <ChevronLeft size={22} />
        </button>
        <h1 className="text-[22px] font-black text-slate-900 tracking-tighter">바우처 관리</h1>
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-[430px] mx-auto w-full pb-32">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="바우처 또는 카드사 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-rose-100/50 outline-none font-bold transition-all"
          />
        </div>

        {/* Voucher List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[17px] font-black text-slate-800">보유 바우처 ({filtered.length})</h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center py-20 opacity-40">
                <div className="w-10 h-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mb-4" />
                <p className="font-black text-xs uppercase tracking-widest text-rose-500">Syncing Vouchers...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-[40px] p-12 text-center border border-gray-100 shadow-xl">
                 <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                    <Gift size={32} className="text-gray-200" />
                 </div>
                 <p className="text-gray-400 font-bold">사용 가능한 바우처가 없습니다.</p>
                 <p className="text-[12px] text-gray-300 mt-2">카드 실적을 달성하고 바우처를 획득해보세요!</p>
              </div>
            ) : (
              filtered.map((v) => (
                <div key={v.userVoucherId} className="group relative bg-white rounded-[40px] border border-gray-100 shadow-lg p-7 active:scale-[0.98] transition-all overflow-hidden cursor-pointer">
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 px-8 py-2 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest ${
                    v.unlockState === 'UNLOCKED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {v.unlockState}
                  </div>

                  <div className="flex items-center gap-5 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                      v.unlockState === 'UNLOCKED' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Gift size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{v.cardName}</p>
                      <h3 className="text-[18px] font-black text-slate-900 tracking-tight leading-none">{v.voucherName}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-3xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 opacity-50">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Remaining</span>
                      </div>
                      <p className="text-[16px] font-black text-slate-800">{v.remainingCount} <span className="text-[11px] opacity-40">/ {v.totalCount}회</span></p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 opacity-50">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Expires</span>
                      </div>
                      <p className="text-[14px] font-black text-slate-800">{new Date(v.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                     <button className="flex items-center gap-2 group-hover:text-rose-500 transition-colors">
                        <History size={16} className="text-slate-300 group-hover:text-rose-400" />
                        <span className="text-[12px] font-black text-slate-600">사용 내역 보기</span>
                     </button>
                     <ChevronRight size={18} className="text-slate-200 group-hover:text-rose-300 translate-x-0 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Info Card */}
        <section className="bg-slate-900 rounded-[48px] p-9 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]" />
           <div className="relative z-10">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit mb-6">
                 <AlertCircle size={22} className="text-rose-400" />
              </div>
              <h3 className="text-[20px] font-black mb-4 tracking-tighter">바우처 사용 시 유의사항</h3>
              <ul className="space-y-3">
                 {[
                   '바우처는 유효기간 내에만 사용 가능합니다.',
                   '일부 가맹점에서는 사용이 제한될 수 있습니다.',
                   '사용 완료된 바우처는 취소가 어려울 수 있습니다.'
                 ].map((text, i) => (
                   <li key={i} className="flex gap-3 text-[13px] font-medium text-gray-400">
                      <span className="text-rose-500 font-black">·</span>
                      {text}
                   </li>
                 ))}
              </ul>
           </div>
        </section>
      </main>
    </div>
  );
}
