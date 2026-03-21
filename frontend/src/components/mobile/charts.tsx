'use client';

import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────
// Utility: Format Currency to Man-won / Chun-won
// ─────────────────────────────────────────────────────────────
const formatKRWFull = (amount: number) => {
  if (amount === 0) return '0원';
  
  const man = Math.floor(amount / 10000);
  const rest = Math.round((amount % 10000) / 1000);
  
  if (man > 0 && rest > 0) return `${man}만 ${rest}천원`;
  if (man > 0) return `${man}만원`;
  if (rest > 0) return `${rest}천원`;
  return `${amount.toLocaleString()}원`;
};

// ─────────────────────────────────────────────────────────────
// Donut Chart
// ─────────────────────────────────────────────────────────────
interface DonutData {
  name: string;
  percent: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  totalAmountText?: string;
  subText?: string;
}

export function DonutChart({ data, totalAmountText = '31만 2천원', subText = '이번달 지출' }: DonutChartProps) {
  const [animated, setAnimated] = useState(false);
  const circumference = 251.3;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[180px] mb-8 animate-spring group active:scale-[0.98] transition-transform">
        <svg width="180" height="180" viewBox="0 0 110 110" className="transform -rotate-90">
          <circle cx="55" cy="55" r="40" fill="none" stroke="#f1f5f9" strokeWidth="18" />
          
          {data.map((item, i) => {
            const prevPercentSum = data.slice(0, i).reduce((sum, d) => sum + d.percent, 0);
            const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((prevPercentSum / 100) * circumference);

            return (
              <circle
                key={i}
                cx="55"
                cy="55"
                r="40"
                fill="none"
                stroke={item.color}
                strokeWidth="18"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={animated ? strokeDashoffset : 0}
                strokeLinecap="round"
                className="donut-seg transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ animationDelay: `${i * 0.15}s`, opacity: animated ? 1 : 0 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-2">
           <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mb-2" />
           <span className="text-[20px] font-black text-var(--text-strong) tracking-tighter leading-none">{totalAmountText}</span>
           <span className="text-[10px] font-black text-var(--text-soft) uppercase tracking-[0.2em] mt-2 opacity-50">{subText}</span>
        </div>
      </div>
      
      <div className="w-full grid grid-cols-2 gap-3 px-1">
        {data.map((cat) => (
          <div key={cat.name} className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-gray-100 hover:border-rose-200 transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="w-3.5 h-3.5 rounded-[5px] flex-shrink-0 shadow-sm" style={{ background: cat.color }} />
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-var(--text-soft) uppercase tracking-tighter leading-none mb-1">{cat.name}</span>
              <span className="text-[14px] font-black text-var(--text-strong) tracking-tight">{cat.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Weekly Bar Chart (Staggered)
// ─────────────────────────────────────────────────────────────
export function WeeklyBarChart() {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const values = [40, 65, 30, 85, 45, 95, 70];
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-end justify-between h-[180px] px-2 py-4">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-3 group">
          <div className="relative w-10 flex flex-col items-center justify-end h-[120px]">
             {/* Tooltip */}
             <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 translate-y-2 group-hover:translate-y-0">
                <div className="bg-var(--text-strong) text-white text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                  {v}만
                </div>
                <div className="w-2 h-2 bg-var(--text-strong) rotate-45 mx-auto -mt-1" />
             </div>

             <div 
               className="w-1.5 rounded-full relative transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
               style={{ 
                 height: animated ? `${v}%` : '0%', 
                 background: i === 5 || i === 6 ? 'var(--primary-gradient)' : '#f1f5f9',
                 transitionDelay: `${i * 0.1}s`
               }}
             >
                {i >= 5 && <div className="absolute inset-0 bg-rose-400 blur-md opacity-40" />}
                {animated && v > 60 && (
                   <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-rose-500 shadow-lg scale-75 animate-pulse" />
                )}
             </div>
          </div>
          <span className={`text-[12px] font-black ${i >= 5 ? 'text-rose-500' : 'text-var(--text-soft)'} tracking-tighter opacity-80 uppercase`}>
            {days[i]}
          </span>
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// 3D-Styled Bucket Chart
// ─────────────────────────────────────────────────────────────
interface BucketData {
  label: string;
  pct: number;
  achieved: boolean;
  value?: string;
  target?: number;
}

export function BucketChart({ buckets, compact = false }: { buckets: BucketData[], compact?: boolean }) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2">
         <div className="relative w-12 h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200/50 shadow-inner">
            <div 
              className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out"
              style={{ 
                height: animated ? `${buckets[0].pct}%` : '0%',
                background: 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)',
                boxShadow: '0 0 10px rgba(244, 63, 94, 0.3)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30 blur-[1px]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
         </div>
         <div className="text-[14px] font-black text-rose-500">{buckets[0].pct}%</div>
      </div>
    );
  }

  return (
    <div className="flex justify-around items-end gap-3 py-10 px-2 bg-slate-50/30 rounded-[40px] border border-gray-50 shadow-inner overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-white to-transparent opacity-50" />
      
      {buckets.map((bucket, i) => (
        <div key={i} className="flex flex-col items-center gap-6 animate-spring group relative">
           <div className="relative">
             <svg width="100" height="160" viewBox="0 0 100 160" fill="none" className="flex-shrink-0 drop-shadow-2xl overflow-visible">
              <defs>
                <linearGradient id={`waterG-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185"/>
                  <stop offset="100%" stopColor="#e11d48"/>
                </linearGradient>
                <filter id="liquidGlow">
                  <feGaussianBlur stdDeviation="3" result="glow"/>
                  <feComposite in="SourceGraphic" in2="glow" operator="over"/>
                </filter>
                <clipPath id={`cylClip-${i}`}>
                  <rect x="10" y="15" width="80" height="130" rx="18"/>
                </clipPath>
              </defs>

              {/* Base Cylinder Glass */}
              <rect x="10" y="15" width="80" height="130" rx="18" fill="white" fillOpacity="0.8" stroke="#fecdd3" strokeWidth="1.5" />
              <rect x="15" y="20" width="70" height="120" rx="14" fill="#f8fafc" opacity="0.5" />

              {/* Liquid System */}
              <g style={{ clipPath: `url(#cylClip-${i})` }}>
                <rect 
                  x="10" 
                  y={145 - (1.3 * (animated ? bucket.pct : 0))} 
                  width="80" 
                  height={1.3 * (animated ? bucket.pct : 0)} 
                  fill={`url(#waterG-${i})`} 
                  className="transition-all duration-[2000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                />
                {/* Surface highlight */}
                <ellipse 
                  cx="50" 
                  cy={145 - (1.3 * (animated ? bucket.pct : 0))} 
                  rx="40" 
                  ry="8" 
                  fill="white" 
                  opacity="0.3" 
                  className="transition-all duration-[2000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                />
              </g>

              {/* 3D Vertical Gloss */}
              <rect x="25" y="15" width="8" height="130" fill="white" fillOpacity="0.4" />
              <rect x="75" y="15" width="4" height="130" fill="white" fillOpacity="0.2" />

              {/* Ticks */}
              {[45, 80, 115].map((y) => (
                 <line key={y} x1="85" y1={y} x2="90" y2={y} stroke="#fecdd3" strokeWidth="1" />
              ))}

              <text x="50" y={105} textAnchor="middle" fontSize="24" fontWeight="black" fill={bucket.pct > 60 ? "white" : "var(--primary-500)"} className="font-display tracking-tighter drop-shadow-md z-30 transition-all duration-[2000ms]">
                {animated ? Math.round(bucket.pct) : 0}%
              </text>
             </svg>
             
             {/* Dynamic Glow based on level */}
             {animated && bucket.pct > 70 && (
               <div className="absolute inset-0 bg-rose-500/20 blur-3xl animate-pulse rounded-full pointer-events-none" />
             )}
           </div>

           <div className="text-center">
             <p className="text-[15px] font-display font-black text-slate-800 mb-0.5">{bucket.value || formatKRWFull(bucket.target || 0)}</p>
             <div className="flex items-center justify-center gap-1.5 opacity-60">
               <span className="w-2 h-2 rounded-full bg-rose-400" />
               <p className="text-[9px] text-var(--text-soft) font-black uppercase tracking-widest">{bucket.label}</p>
             </div>
           </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Radial Gauge (Styling Polished)
// ─────────────────────────────────────────────────────────────
export function RadialGauge({ percent, size = 64, color = "white" }: { percent: number; size?: number; color?: string }) {
  const [animatedDash, setAnimatedDash] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedDash((percent / 100) * 150), 500);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="flex-shrink-0 drop-shadow-md group active:scale-95 transition-transform">
      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="12" strokeDasharray="150 51" strokeDashoffset="-75" strokeLinecap="round" />
      <circle
        cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${animatedDash} ${201 - animatedDash}`}
        strokeDashoffset="-75" strokeLinecap="round"
        className="transition-all duration-[1800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xl"
      />
      <g className="translate-y-0.5">
        <text x="40" y="44" textAnchor="middle" fill={color === "white" ? "white" : "#1e293b"} fontSize="24" fontWeight="black" className="font-display tracking-tight drop-shadow-md">{percent}</text>
        <text x="40" y="56" textAnchor="middle" fill={color === "white" ? "rgba(255,255,255,0.7)" : "#64748b"} fontSize="7" fontWeight="black" className="uppercase tracking-[0.2em] opacity-80">%</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Area Trend Chart
// ─────────────────────────────────────────────────────────────
export function AreaTrendChart() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[200px] group">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 340 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Shadow Area */}
        <path 
          d={animated ? "M20,150 L75,110 L130,125 L185,80 L240,70 L295,50 L295,190 L20,190 Z" : "M20,190 L75,190 L130,190 L185,190 L240,190 L295,190 L295,190 L20,190 Z"} 
          fill="url(#areaGrad)"
          className="transition-all duration-[2000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
        
        {/* Main Line */}
        <path
          d={animated ? "M20,150 L75,110 L130,125 L185,80 L240,70 L295,50" : "M20,190 L75,190 L130,190 L185,190 L240,190 L295,190"}
          fill="none" 
          stroke="var(--primary-gradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#glow)"
          className="transition-all duration-[2000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />

        {/* Highlight Points with Labels */}
        {animated && [
          { x: 295, y: 50, label: '최고 81.4만', color: '#f43f5e', up: true },
          { x: 130, y: 125, label: '최저 28.9만', color: '#f43f5e', up: false }
        ].map((p, i) => (
          <g key={i} className="animate-fade-in group/point cursor-pointer" style={{ animationDelay: `${1.5 + i * 0.3}s` }}>
            <circle cx={p.x} cy={p.y} r="14" fill={p.color} opacity="0.15" className="animate-pulse" />
            <circle cx={p.x} cy={p.y} r="6" fill="white" className="shadow-sm" />
            <circle cx={p.x} cy={p.y} r="3" fill={p.color} />
            
            <foreignObject x={p.x - 40} y={p.up ? p.y - 45 : p.y + 15} width="80" height="30">
              <div className="flex flex-col items-center">
                 {p.up ? (
                   <>
                    <div className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md">{p.label}</div>
                    <div className="w-[1px] h-2 bg-rose-500/50" />
                   </>
                 ) : (
                   <>
                    <div className="w-[1px] h-2 bg-rose-300/50" />
                    <div className="bg-white border border-rose-100 text-rose-500 text-[9px] font-black px-2 py-1 rounded-lg shadow-sm">{p.label}</div>
                   </>
                 )}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Simple Pie Chart (Full Segment)
// ─────────────────────────────────────────────────────────────
export function SimplePieChart({ data, onHoverChange }: { data: DonutData[], onHoverChange?: (idx: number | null) => void }) {
  const [animated, setAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleHoverChange = (idx: number | null) => {
    setHoveredIndex(idx);
    if (onHoverChange) onHoverChange(idx);
  };
  
  const radius = 35;

  const circumference = 2 * Math.PI * radius;

  // Vibrant, distinctive colors for better visibility
  const VIBRANT_MAP: Record<string, string> = {
    '식비': '#f43f5e',
    '카페': '#ec4899',
    '교통': '#8b5cf6',
    '쇼핑': '#3b82f6',
    '수입': '#10b981'
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center group">
      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-2xl overflow-visible">
          {data.map((item, i) => {
            const prevSum = data.slice(0, i).reduce((sum, d) => sum + d.percent, 0);
            const dashArray = `${(item.percent / 100) * circumference} ${circumference}`;
            const dashOffset = -((prevSum / 100) * circumference);
            const isHovered = hoveredIndex === i;
            const sliceColor = VIBRANT_MAP[item.name] || item.color;

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={sliceColor}
                strokeWidth={isHovered ? "28" : "20"}
                strokeDasharray={dashArray}
                strokeDashoffset={animated ? dashOffset : 0}
                strokeLinecap="butt"
                onMouseEnter={() => handleHoverChange(i)}
                onMouseLeave={() => handleHoverChange(null)}
                onTouchStart={() => handleHoverChange(i)}
                onClick={() => handleHoverChange(hoveredIndex === i ? null : i)}
                className="transition-all duration-300 ease-out origin-center cursor-pointer opacity-90 hover:opacity-100"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  filter: isHovered ? 'brightness(1.1) drop-shadow(0 0 10px rgba(0,0,0,0.15))' : 'none',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)'
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className={`w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-50 transition-all duration-500 scale-100`}>
              {hoveredIndex !== null ? (
                <>
                  <span className="text-[9px] font-black text-gray-400 tracking-tight leading-none mb-0.5">{data[hoveredIndex].name}</span>
                  <span className="text-[14px] font-black text-slate-800 tracking-tighter leading-none">{data[hoveredIndex].percent}%</span>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">지출</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Word Cloud Component ( spending Insights )
// ─────────────────────────────────────────────────────────────
export function WordCloud() {
  const [mounted, setMounted] = useState(false);
  const [animationsDone, setAnimationsDone] = useState(false);
  
  useEffect(() => {
    // Add a tiny delay to ensure CSS transitions trigger nicely
    const timer = setTimeout(() => setMounted(true), 100);
    const timer2 = setTimeout(() => setAnimationsDone(true), 1200);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  const tags = [
    { text: '편의점', size: 24, color: 'text-rose-500' },
    { text: '스타벅스', size: 18, color: 'text-blue-500' },
    { text: '배달의민족', size: 22, color: 'text-emerald-500' },
    { text: '교통', size: 14, color: 'text-slate-400' },
    { text: '넷플릭스', size: 16, color: 'text-rose-400' },
    { text: '쇼핑', size: 20, color: 'text-purple-500' },
    { text: '자기계발', size: 13, color: 'text-amber-500' },
    { text: '점심식사', size: 22, color: 'text-rose-600' },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 py-4 px-3 min-h-[100px] bg-gradient-to-b from-transparent to-rose-50/20 rounded-[32px] border border-dashed border-rose-100/50">
       {tags.map((tag, i) => {
         const rotateDeg = (i % 2 === 0 ? 1 : -1) * 20;
         const inlineTransform = mounted ? 'scale(1) rotate(0deg) translateY(0)' : `scale(0.5) rotate(${rotateDeg}deg) translateY(10px)`;
         
         return (
           <span 
             key={i} 
             className={`font-black tracking-tight ${tag.color} inline-block select-none cursor-pointer hover:!scale-[1.3] hover:!-translate-y-2 hover:!rotate-3 hover:text-opacity-80 active:scale-95`} 
             style={{ 
               fontSize: `${tag.size}px`,
               opacity: mounted ? 1 : 0,
               transform: animationsDone ? undefined : inlineTransform,
               transition: animationsDone ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s' : `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s`,
             }}
           >
             #{tag.text}
           </span>
         );
       })}
    </div>
  );
}
