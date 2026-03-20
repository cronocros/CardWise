'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, User, Eye, EyeOff, ChevronLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// CardWise Premium Login · Fully Redesigned
// 6 OAuth + Email, No Mascot, Abstract Visual Hero
// ─────────────────────────────────────────────────────────────

// No unused providers
export default function MobileLoginPage() {
  const [mode, setMode] = useState<'main' | 'email-login' | 'email-signup'>('main');
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const router = useRouter();

  const handleAuth = () => router.push('/mobile');

  return (
    <div className="mobile-container relative bg-[#080010] overflow-hidden flex flex-col h-screen text-white">

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[380px] h-[380px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.28) 0%, transparent 70%)' }} />
        <div className="absolute top-[5%] right-[-15%] w-[280px] h-[280px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[25%] left-[5%] w-[250px] h-[250px] rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)' }} />
        {/* Floating card shapes */}
        <div className="absolute top-[12%] right-[8%] w-32 h-20 rounded-2xl border border-white/5 opacity-20 rotate-12"
          style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.3), rgba(139,92,246,0.2))' }} />
        <div className="absolute top-[22%] right-[20%] w-24 h-14 rounded-xl border border-white/5 opacity-15 -rotate-6"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))' }} />
        <div className="absolute top-[8%] left-[15%] w-20 h-12 rounded-xl border border-white/5 opacity-10 rotate-6"
          style={{ background: 'linear-gradient(135deg, rgba(251,207,232,0.15), rgba(244,63,94,0.1))' }} />
        
      </div>

      {/* Top Nav */}
      <div className="relative z-20 flex items-center justify-between px-7 pt-14 pb-4">
        {mode !== 'main' ? (
          <button onClick={() => { setMode('main'); setStep(1); }}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft size={22} />
          </button>
        ) : <div className="w-11" />}
        <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em]">
          {mode === 'main' ? 'CARDWISE' : mode === 'email-login' ? 'Sign In' : `Sign Up · ${step}/2`}
        </span>
        <div className="w-11" />
      </div>

      <div className="relative z-10 flex-1 px-7 overflow-y-auto scrollbar-hide">

        {/* ─── MAIN SCREEN ─── */}
        {mode === 'main' && (
          <div className="flex flex-col animate-fade-in">
        <div className="flex flex-col items-center mb-10 animate-fade-in px-4">
          <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-[0_25px_50px_-12px_rgba(244,63,94,0.5)] relative group overflow-hidden border-t border-white/20" 
            style={{ 
              background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
              boxShadow: '0 20px 40px -10px rgba(225,29,72,0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
            }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-12 h-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
              <rect x="2" y="5" width="20" height="14" rx="3" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-[40px] font-black text-white tracking-tighter leading-tight mb-2 drop-shadow-sm">CardWise</h1>
            <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full mb-3" />
            <p className="text-[11px] font-black text-rose-500/80 uppercase tracking-[0.3em] leading-relaxed">Premium Finance Asset</p>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-[42px] font-black tracking-tighter leading-[1.05] text-white mb-5">
            자산 관리의<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-rose-500 to-rose-600 animate-gradient-x">
              새로운 차원
            </span>
          </h1>
          <p className="text-[17px] text-white/40 font-medium leading-relaxed max-w-[280px] mx-auto">
            당신의 모든 카드를 한 곳에서<br />
            가장 직관적으로 즐겨보세요.
          </p>
        </div>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 px-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] whitespace-nowrap">Express Access</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[{ id: 'google', icon: 'G', color: '#fff', bg: 'rgba(255,255,255,0.05)', shadow: 'rgba(255,255,255,0.1)' },
                  { id: 'apple', icon: '', color: '#fff', bg: 'rgba(0,0,0,0.3)', shadow: 'rgba(0,0,0,0.4)' },
                  { id: 'kakao', icon: 'K', color: '#3c1e1e', bg: '#fee500', shadow: 'rgba(254,229,0,0.3)' }].map(p => (
                  <button key={p.id}
                    onClick={handleAuth}
                    className="flex flex-col items-center justify-center h-20 rounded-[28px] active:scale-90 transition-all border-t border-white/10 shadow-xl"
                    style={{ 
                      background: p.bg,
                      boxShadow: `0 12px 24px -6px ${p.shadow}`
                    }}>
                    <span className="text-2xl font-black" style={{ color: p.color }}>{p.icon}</span>
                  </button>
                ))}
                
                <button onClick={() => setMode('email-login')}
                  className="col-span-3 flex items-center justify-center gap-4 h-16 rounded-[24px] active:scale-95 transition-all group overflow-hidden relative shadow-lg"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Mail className="w-5 h-5 text-rose-500" />
                  <span className="text-[15px] font-black text-white/80">이메일 계정으로 로그인</span>
                </button>
              </div>
            </div>

            <div className="text-center pb-10">
              <p className="text-[12px] text-white/25 font-medium">
                가입 시 <span className="text-rose-500/80">이용약관</span> 및 <span className="text-rose-500/80">개인정보처리방침</span>에 동의하게 됩니다.
              </p>
            </div>
          </div>
        )}

        {/* ─── EMAIL LOGIN ─── */}
        {mode === 'email-login' && (
          <div className="flex flex-col animate-spring">
            <div className="mb-10 mt-4">
              <h2 className="text-[36px] font-black tracking-tighter text-white mb-3">반가워요!</h2>
              <p className="text-[15px] text-white/40 font-medium leading-relaxed">디지털 자산 관리의 시작,<br/>로그인 정보를 입력해주세요.</p>
            </div>

            <div className="space-y-6 mb-10">
              {/* Email */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-7 flex items-center text-white/20 group-focus-within:text-rose-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input type="email" placeholder="이메일 주소"
                  className="w-full h-[72px] rounded-[28px] pl-16 pr-8 outline-none font-bold text-[16px] transition-all border-t border-white/5 shadow-inner"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'white' }}
                  onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 20px rgba(244,63,94,0.1)'; }}
                  onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }} />
              </div>

              {/* Password */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-7 flex items-center text-white/20 group-focus-within:text-rose-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input type={showPass ? 'text' : 'password'} placeholder="비밀번호"
                  className="w-full h-[72px] rounded-[28px] pl-16 pr-14 outline-none font-bold text-[16px] transition-all border-t border-white/5 shadow-inner"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'white' }}
                  onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 20px rgba(244,63,94,0.1)'; }}
                  onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }} />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-7 flex items-center text-white/20 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 mb-10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <div className={`w-2.5 h-2.5 rounded-sm bg-rose-500 transition-opacity ${autoLogin ? 'opacity-100' : 'opacity-0'}`} />
                  <input type="checkbox" className="hidden" checked={autoLogin} onChange={() => setAutoLogin(!autoLogin)} />
                </div>
                <span className="text-[13px] font-bold text-white/40 group-hover:text-white/60 transition-colors">자동 로그인</span>
              </label>
              <button className="text-[13px] font-bold text-rose-500/80 hover:text-rose-500 transition-colors">비밀번호 찾기</button>
            </div>

            <button onClick={handleAuth}
              className="w-full h-[72px] rounded-[28px] text-white font-black text-[18px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl relative overflow-hidden group mb-8"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span>로그인</span>
              <ArrowRight size={22} className="relative z-10" />
            </button>

            <button onClick={() => setMode('email-signup')}
              className="w-full text-center py-2 text-[14px] font-bold text-white/30 hover:text-white/60 transition-colors">
              아직 계정이 없으신가요? <span className="text-rose-500/80">회원가입</span>
            </button>
          </div>
        )}

        {/* ─── EMAIL SIGNUP ─── */}
        {mode === 'email-signup' && (
          <div className="flex flex-col animate-spring">
            <div className="mb-12 mt-4">
              <div className="flex gap-2 mb-6">
                {[1, 2].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-rose-500' : 'bg-white/10'}`} />
                ))}
              </div>
              <h2 className="text-[34px] font-black tracking-tighter text-white mb-2">
                {step === 1 ? '기본 정보 입력' : '비밀번호 설정'}
              </h2>
              <p className="text-[15px] text-white/40 font-medium">
                {step === 1 ? '이름과 이메일을 입력해 주세요.' : '안전한 비밀번호를 설정하세요.'}
              </p>
            </div>

            {step === 1 ? (
              <div className="space-y-6 mb-10">
                {[{ icon: <User size={20} />, type: 'text', placeholder: '이름 (닉네임)' },
                  { icon: <Mail size={20} />, type: 'email', placeholder: '이메일 주소' }].map((f, i) => (
                    <div key={i} className="group relative">
                      <div className="absolute inset-y-0 left-7 flex items-center text-white/20 group-focus-within:text-rose-500 transition-colors">{f.icon}</div>
                      <input type={f.type} placeholder={f.placeholder}
                        className="w-full h-[72px] rounded-[28px] pl-16 pr-8 outline-none font-bold text-[16px] transition-all border-t border-white/5 shadow-inner"
                        style={{ background: 'rgba(255,255,255,0.03)', color: 'white' }}
                        onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 20px rgba(244,63,94,0.1)'; }}
                        onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-6 mb-10">
                {['비밀번호 (8자 이상)', '비밀번호 확인'].map((ph, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute inset-y-0 left-7 flex items-center text-white/20 group-focus-within:text-rose-500 transition-colors"><Lock size={20} /></div>
                    <input type="password" placeholder={ph}
                      className="w-full h-[72px] rounded-[28px] pl-16 pr-8 outline-none font-bold text-[16px] transition-all border-t border-white/5 shadow-inner"
                      style={{ background: 'rgba(255,255,255,0.03)', color: 'white' }}
                      onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 20px rgba(244,63,94,0.1)'; }}
                      onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                ))}
              </div>
            )}

            <button onClick={step === 1 ? () => setStep(2) : handleAuth}
              className="w-full h-[72px] rounded-[28px] text-white font-black text-[18px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl relative overflow-hidden group mb-8"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span>{step === 1 ? '다음 단계' : '계정 만들기'}</span>
              <ArrowRight size={22} className="relative z-10" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
