'use client';

import React from 'react';

type MascotPose = 'waving' | 'celebrating' | 'thinking';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
}

export function Mascot({
  pose = 'waving',
  size = 48,
  className = '',
  animate = true,
}: MascotProps) {
  if (pose === 'celebrating') {
    return <CelebratingMascot size={size} className={className} animate={animate} />;
  }
  if (pose === 'thinking') {
    return <ThinkingMascot size={size} className={className} animate={animate} />;
  }

  // Waving Pose (Exact from 시안)
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
    >
      <ellipse cx="52" cy="58" rx="27" ry="23" fill="#1f1721"/>
      <path d="M30 50C31 29 44 16 61 18C71 19 79 28 79 43V56H33L30 50Z" fill="#f8fafc"/>
      <ellipse cx="49" cy="48" rx="23" ry="18" fill="#fffafc"/>
      <circle cx="45" cy="46" r="3.6" fill="#0f172a"/>
      <circle cx="63" cy="46" r="3.6" fill="#0f172a"/>
      <circle cx="44.2" cy="44.5" r="1.3" fill="white"/>
      <circle cx="62.2" cy="44.5" r="1.3" fill="white"/>
      <path d="M50 57C53 59 57 59 60 57" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round"/>
      
      {/* Left arm */}
      <path d="M31 60C25 58 20 60 18 66" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Right arm — waving high with animation if requested */}
      <g className={animate ? 'animate-wave' : ''} style={{ transformOrigin: '71px 58px' }}>
        <path d="M71 58C77 46 82 30 87 34" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round"/>
        <path d="M84 32C87 29 90 31 89 35" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round"/>
      </g>
      
      {/* Legs */}
      <path d="M37 77C36 84 34 88 30 92" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      <path d="M63 77C63 84 66 88 70 92" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

function CelebratingMascot({ size, className, animate }: any) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className} ${animate ? 'animate-bounce' : ''}`}
    >
      <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,.09)"/>
      <ellipse cx="52" cy="58" rx="27" ry="23" fill="#1f1721"/>
      <path d="M30 50C31 29 44 16 61 18C71 19 79 28 79 43V56H33L30 50Z" fill="#f8fafc"/>
      <ellipse cx="49" cy="48" rx="23" ry="18" fill="#fffafc"/>
      <circle cx="45" cy="46" r="3.6" fill="#0f172a"/>
      <circle cx="63" cy="46" r="3.6" fill="#0f172a"/>
      <circle cx="44.2" cy="44.5" r="1.3" fill="white"/>
      <circle cx="62.2" cy="44.5" r="1.3" fill="white"/>
      
      {/* Big smile from 시안 */}
      <path d="M48 55C51 59 56 59 62 55" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round"/>
      
      {/* Both arms raised from 시안 */}
      <path d="M30 58C23 44 19 26 16 20" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M71 56C76 42 80 24 83 18" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Legs */}
      <path d="M37 77C36 84 34 88 30 92" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      <path d="M63 77C63 84 66 88 70 92" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Sparkles from 시안 */}
      <circle cx="17" cy="17" r="3.2" fill="rgba(251,113,133,.85)"/>
      <circle cx="83" cy="14" r="3.2" fill="rgba(245,158,11,.85)"/>
      <circle cx="88" cy="38" r="2" fill="rgba(16,185,129,.85)"/>
      <circle cx="12" cy="40" r="2" fill="rgba(59,130,246,.85)"/>
    </svg>
  );
}

function ThinkingMascot({ size, className, animate }: any) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
    >
      <circle cx="50" cy="50" r="46" fill="rgba(251,113,133,.12)"/>
      <ellipse cx="52" cy="58" rx="27" ry="23" fill="#1f1721"/>
      <path d="M30 50C31 29 44 16 61 18C71 19 79 28 79 43V56H33L30 50Z" fill="#f8fafc"/>
      <ellipse cx="49" cy="48" rx="23" ry="18" fill="#fffafc"/>
      <circle cx="45" cy="46" r="3.6" fill="#0f172a"/>
      <circle cx="63" cy="46" r="3.6" fill="#0f172a"/>
      
      {/* Thinking expression from 시안 */}
      <path d="M52 59C54 60 56 60 58 59" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round"/>
      
      {/* Arms in thinking pose from 시안 */}
      <path d="M31 60C25 58 20 60 18 66" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      <path d="M71 59C73 56 74 54 73 52" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round"/>
      <path d="M60 58C64 60 66 65 66 70" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round"/>
      
      {/* Legs */}
      <path d="M37 77C36 84 34 88 30 92" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      <path d="M63 77C63 84 66 88 70 92" stroke="#1f1721" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Thinking bubbles from 시안 */}
      <circle cx="76" cy="48" r="2.8" fill="#f8fafc"/>
      <circle cx="79" cy="42" r="2" fill="#f8fafc" opacity=".65"/>
      <circle cx="81" cy="37" r="1.3" fill="#f8fafc" opacity=".4"/>
    </svg>
  );
}
