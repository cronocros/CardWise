import Image from 'next/image'
import { login, signup } from './actions'

type SearchParams = {
  error?: string
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[var(--app-orb-a)] blur-[120px]" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[var(--app-orb-b)] blur-[100px]" />

      <div className="relative w-full max-w-sm p-8 rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-[var(--surface-shadow-strong)] backdrop-blur-2xl">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="relative mb-4 w-28 h-28 transform transition-transform duration-700 hover:scale-110">
            <span className="absolute inset-4 rounded-full bg-[var(--accent-soft)] blur-xl"></span>
            <Image
              src="/mascot.png"
              alt="CardWise Mascot"
              fill
              className="object-contain drop-shadow-2xl animate-[bounce_4s_ease-in-out_infinite]"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-strong)]">
            CardWise
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)] text-center">
            AI 기반 스마트 소비 관리의 시작.<br/>간편하게 로그인하세요.
          </p>
        </div>

        {resolvedParams.error && (
          <div className="mb-4 rounded-[14px] bg-[var(--danger-soft)] p-3 text-center text-sm font-semibold text-[var(--error)] animate-in fade-in slide-in-from-top-2">
            {resolvedParams.error}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--text-body)] pl-1">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-[18px] border border-[var(--surface-border-strong)] bg-white/70 px-4 py-3.5 text-sm text-[var(--text-strong)] placeholder-[var(--text-soft)] outline-none transition-all focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              placeholder="user@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--text-body)] pl-1">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-[18px] border border-[var(--surface-border-strong)] bg-white/70 px-4 py-3.5 text-sm text-[var(--text-strong)] placeholder-[var(--text-soft)] outline-none transition-all focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              placeholder="••••••••"
            />
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              formAction={login}
              className="flex-1 rounded-[20px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent-soft)] transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              로그인
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-[20px] border border-[var(--accent)] bg-transparent py-3.5 text-sm font-bold text-[var(--accent-strong)] transition-all hover:bg-[var(--accent-soft)] hover:scale-[1.02] active:scale-[0.98]"
            >
              가입하기
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-[var(--text-soft)]">
          Protected by CardWise AI Intelligence
        </div>
      </div>
    </div>
  )
}
