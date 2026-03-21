'use client'

import { signInWithOAuth } from '@/app/login/actions'

export function SocialLogins() {
  const providers = [
    { 
      id: 'kakao', 
      label: '카카오', 
      bgColor: 'bg-[#FEE500]', 
      hoverColor: 'hover:shadow-[#FEE500]/30',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" className="text-[#3E1A1A] fill-current">
          <path d="M12 3c-5.52 0-10 3.55-10 7.93 0 2.82 1.83 5.3 4.67 6.64l-1.22 4.49c-.14.53.47.87.91.54l5.1-3.42c.18.01.36.02.54.02 5.52 0 10-3.55 10-7.93S17.52 3 12 3z"/>
        </svg>
      )
    },
    { 
      id: 'naver', 
      label: '네이버', 
      bgColor: 'bg-[#03C75A]', 
      hoverColor: 'hover:shadow-[#03C75A]/20',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" className="text-white fill-current">
          <path d="M16.14 19.986L7.042 6.52V19.986H2V4h5.114l9.086 13.43V4h5.05v15.986h-5.11z"/>
        </svg>
      )
    },
    { 
      id: 'google', 
      label: '구글', 
      bgColor: 'bg-white', 
      hoverColor: 'hover:shadow-gray-200',
      border: 'border border-gray-100',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    },
    { 
      id: 'apple', 
      label: '애플', 
      bgColor: 'bg-[#1D1D1F]', 
      hoverColor: 'hover:shadow-black/20',
      icon: (
        <svg viewBox="0 0 256 315" width="20" height="20" className="text-white fill-current mb-[2px]">
          <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.623-.335 1.05-6.568 22.56-21.716 44.72-13.124 19.207-26.702 38.32-48.185 38.71-21.103.395-27.894-12.483-52.042-12.483-24.153 0-31.593 12.103-52.042 12.888-20.843.782-36.31-20.81-49.565-39.884-27.054-39.082-47.657-110.3-19.905-158.423 13.76-23.89 38.408-39.017 65.33-39.403 20.443-.394 39.81 13.71 52.32 13.71s35.347-16.926 59.943-14.438c10.287.422 39.216 4.133 57.82 31.433-1.5 1.05-34.464 20.1-34.464 59.757zm-53.15-115.71c11.02-13.35 18.44-31.95 16.41-51.32-15.938.64-35.347 10.66-46.77 24.017-10.247 11.83-19.23 30.844-16.784 49.793 17.82 1.383 36.12-9.14 47.143-22.492z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="mt-8 flex justify-center gap-4">
      {providers.map((p) => (
        <button 
          key={p.id}
          onClick={() => signInWithOAuth(p.id as any)}
          className={`
            relative w-[52px] h-[52px] rounded-[20px] flex items-center justify-center 
            ${p.bgColor} ${p.border || ''}
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            transition-all duration-300 
            hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] ${p.hoverColor}
            active:scale-95 active:translate-y-0
            group
          `}
          aria-label={`${p.label} 로그인`}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-[20px]" />
          
          <div className="relative transform transition-all duration-500 group-hover:scale-110 group-active:scale-90">
            {p.icon}
          </div>

          {/* Label Tooltip (Tiny) */}
          <span className="absolute -bottom-6 text-[8px] font-black text-[var(--text-soft)] opacity-0 group-hover:opacity-40 transition-opacity uppercase tracking-widest whitespace-nowrap">
            {p.label}
          </span>
        </button>
      ))}
    </div>
  )
}
