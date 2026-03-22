import Image from 'next/image'
import { login, signup } from './actions'
import { SocialLogins } from '@/components/auth/SocialLogins'

type SearchParams = {
  error?: string
  message?: string
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] relative overflow-hidden px-4">
      <div className="absolute -top-10 -right-10 w-[400px] h-[400px] rounded-full bg-[var(--app-orb-a)] blur-[120px] opacity-40" />
      <div className="absolute -bottom-10 -left-10 w-[350px] h-[350px] rounded-full bg-[var(--app-orb-b)] blur-[100px] opacity-40" />

      <div className="relative w-full max-w-[380px] p-7 md:p-8 rounded-[40px] border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="relative mb-3 w-24 h-24 transform transition-transform duration-700 hover:scale-110">
            <span className="absolute inset-4 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-50"></span>
            <Image
              src="/mascot.png"
              alt="CardWise Mascot"
              fill
              className="object-contain drop-shadow-2xl animate-[bounce_5s_ease-in-out_infinite]"
              priority
            />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-[var(--text-strong)] leading-none">
            CardWise
          </h1>
          <p className="mt-2.5 text-[13px] font-medium text-[var(--text-muted)] text-center opacity-80 leading-relaxed">
            AI 기반 스마트 소비 관리의 시작.<br/>간편하게 로그인하세요.
          </p>
        </div>

        {resolvedParams.error && (
          <div className="mb-4 rounded-[20px] bg-[var(--danger-soft)] p-3.5 text-center text-xs font-bold text-[var(--error)] animate-in fade-in slide-in-from-top-2 border border-[var(--error)]/10">
            {resolvedParams.error}
          </div>
        )}

        {resolvedParams.message && (
          <div className="mb-4 rounded-[20px] bg-[var(--success-soft)] p-3.5 text-center text-xs font-bold text-[var(--success)] animate-in fade-in slide-in-from-top-2 border border-[var(--success)]/10">
            {resolvedParams.message}
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-5 rounded-[24px] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/10 p-2.5">
            <div className="mb-2.5 text-center text-[10px] font-black text-[var(--accent-strong)] uppercase tracking-[0.2em] opacity-60">Quick Login</div>
            <div className="grid grid-cols-4 gap-1.5 px-0.5">
              {[
                { label: 'Admin', email: 'admin@cardwise.com' },
                { label: 'UserA', email: 'userA@cardwise.com' },
                { label: 'UserB', email: 'userB@cardwise.com' },
                { label: 'Test', email: 'random@cardwise.com' }
              ].map((acc) => (
                <form key={acc.email} action={login} className="w-full">
                  <input type="hidden" name="email" value={acc.email} />
                  <input type="hidden" name="password" value="password123!" />
                  <button className="w-full rounded-[14px] bg-white/40 py-1.5 text-[9px] font-black text-[var(--text-strong)] hover:bg-white transition-all border border-white/50 shadow-sm active:scale-95 uppercase tracking-tighter">
                    {acc.label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}

        <form className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-[var(--text-soft)] uppercase tracking-widest pl-2 opacity-60">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-[22px] border border-[var(--surface-border-strong)] bg-white/50 backdrop-blur-sm px-5 py-3.5 text-sm text-[var(--text-strong)] placeholder-[var(--text-soft)]/50 outline-none transition-all focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              placeholder="user@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-[var(--text-soft)] uppercase tracking-widest pl-2 opacity-60">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-[22px] border border-[var(--surface-border-strong)] bg-white/50 backdrop-blur-sm px-5 py-3.5 text-sm text-[var(--text-strong)] placeholder-[var(--text-soft)]/50 outline-none transition-all focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              placeholder="••••••••"
            />
          </div>
          
          <div className="mt-3 flex gap-2.5">
            <button
              formAction={login}
              className="flex-1 rounded-[22px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] py-3.5 text-sm font-black text-white shadow-xl shadow-[var(--accent-soft)]/40 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              로그인
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-[22px] border-2 border-[var(--accent-soft)] bg-white/30 py-3.5 text-sm font-black text-[var(--accent-strong)] transition-all hover:bg-[var(--accent-soft)] hover:scale-[1.03] active:scale-[0.97]"
            >
              가입하기
            </button>
          </div>
        </form>

        <div className="mt-6 relative px-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--surface-border)]"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-[var(--surface-card)] px-3 text-[var(--text-soft)] font-black uppercase tracking-[0.2em] opacity-40">간편 인증</span>
          </div>
        </div>

        <SocialLogins />

        <div className="mt-8 text-center text-[9px] text-[var(--text-soft)] opacity-30 font-black uppercase tracking-[0.3em] pointer-events-none">
          Secured by CardWise AI
        </div>
      </div>
    </div>
  )
}
