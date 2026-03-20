import Link from "next/link";
import { getPendingCount, tryFetchBackendJson, type PendingActionCountResponse, type PendingActionsResponse } from "@/lib/cardwise-api";

// ⚠️ 이 페이지는 CardWise 제품 기능이 아닙니다.
// 개발자 전용 OPS 모니터링 도구입니다. (/ops/live)
// CardWise 사용자 대시보드는 /dashboard 입니다.
export const dynamic = "force-dynamic";


function actionTypeLabel(actionType: string) {
  const labels: Record<string, string> = {
    FX_CORRECTION_NEEDED: "환율 보정",
    BILLING_DISCOUNT_FOUND: "할인 탐지",
    PAYMENT_CONFIRMATION: "결제 확인",
    DUPLICATE_DETECTED: "중복 탐지",
    CATEGORY_UNMAPPED: "분류 필요",
    EXCEL_REVIEW: "검토",
    PERFORMANCE_EXCLUSION_CHECK: "실적 제외",
  };
  return labels[actionType] ?? actionType;
}

export default async function DashboardPage() {
  const [pendingCountResponse, pendingResponse] = await Promise.all([
    tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
    tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=6"),
  ]);

  const pendingCount = getPendingCount(pendingCountResponse);
  const pendingItems = pendingResponse?.data ?? [];

  // MOCK DATA for AI Operation Center
  const activeAgents = [
    {
      id: "agent-1",
      name: "Receipt Parser",
      llm: "Gemini 1.5 Pro",
      status: "processing",
      currentTask: "영수증 이미지에서 내역 추출 중...",
      successRate: 98.4,
    },
    {
      id: "agent-2",
      name: "Categorizer",
      llm: "Claude 3.5 Sonnet",
      status: "idle",
      currentTask: "대기 중",
      successRate: 99.1,
    },
    {
      id: "agent-3",
      name: "Benefit Matcher",
      llm: "GPT-4o",
      status: "processing",
      currentTask: "결제 건과 최적 바우처 매칭 분석 중...",
      successRate: 95.7,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      time: "방금 전",
      agent: "Receipt Parser",
      action: "스타벅스 리저브 결제건 (M13401) 파싱 완료",
      llm: "Gemini 1.5 Pro",
      conf: 99,
    },
    {
      id: 2,
      time: "2분 전",
      agent: "Categorizer",
      action: "네이버페이 포인트 결제 (M13400) '쇼핑/디지털'로 자동 분류",
      llm: "Claude 3.5 Sonnet",
      conf: 94,
    },
    {
      id: 3,
      time: "5분 전",
      agent: "Benefit Matcher",
      action: "항공권 결제건에 마일리지 특별 적립 규칙(Rule-X9) 적용 발견",
      llm: "GPT-4o",
      conf: 88,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-slate-300 font-sans selection:bg-rose-500/30">
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        
        {/* Futuristic Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
              <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em]">System Live: Optimal</span>
            </div>
            <h1 className="text-[42px] font-black text-white tracking-tighter leading-none mb-4">
              Agent Control Center <span className="text-rose-500 text-[24px] align-top opacity-50">v4.0</span>
            </h1>
            <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">
              CardWise AI 에이전트의 연산 커널과 실시간 의사결정 프로세스를 모니터링합니다. 
              <span className="text-rose-400/80 ml-2">Human-in-the-loop 개입이 필요한 {pendingCount}개의 세션이 탐지되었습니다.</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Tokens</span>
               <span className="text-[20px] font-black text-white font-display">1,248,392 <span className="text-[12px] opacity-30 text-emerald-400">▲ 12%</span></span>
            </div>
            <Link
              href="/inbox"
              className="px-8 py-5 rounded-[24px] bg-rose-600 text-white font-black text-[15px] shadow-[0_20px_40px_rgba(225,29,72,0.3)] hover:bg-rose-500 active:scale-95 transition-all text-center"
            >
              커널 인박싱 처리
            </Link>
          </div>
        </header>

        {/* Real-time Infrastructure Metrics */}
        <section className="grid gap-6 md:grid-cols-4">
           {[
             { label: 'Latency', value: '42ms', color: 'text-emerald-400', sub: 'P99 Stable', icon: '⚡' },
             { label: 'Active Sessions', value: '842', color: 'text-blue-400', sub: 'Peak 1.2k', icon: '🌐' },
             { label: 'Success Rate', value: '99.2%', color: 'text-rose-400', sub: 'AI Correction On', icon: '🎯' },
             { label: 'Review Queue', value: pendingCount, color: 'text-amber-400', sub: 'Urgent: 2', icon: '🔥' },
           ].map((m, i) => (
             <div key={i} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                   <span className="text-[18px] opacity-80">{m.icon}</span>
                </div>
                <div className={`text-[32px] font-black font-display tracking-tighter ${m.color} mb-1`}>{m.value}</div>
                <div className="text-[10px] font-bold text-slate-500 italic">{m.sub}</div>
             </div>
           ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.26fr_0.74fr]">
           
           {/* Left: Agent Heartbeat & Logs */}
           <div className="space-y-8">
              <div className="rounded-[40px] bg-[#111122] border border-white/5 p-8 shadow-3xl">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[22px] font-black text-white tracking-tight flex items-center gap-3">
                       AI Heartbeat Monitoring
                       <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black animate-pulse uppercase">Active Engine</span>
                    </h2>
                 </div>

                 <div className="space-y-4">
                    {activeAgents.map((agent) => (
                      <div key={agent.id} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all group active:scale-[0.99]">
                         <div className="flex items-center justify-between">
                            <div className="flex items-start gap-5">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-slate-800/50 shadow-inner ${agent.status === 'processing' ? 'animate-spin-slow' : ''}`}>
                                  {agent.name === 'Receipt Parser' ? '📄' : agent.name === 'Categorizer' ? '📁' : '💎'}
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                     <h3 className="text-[18px] font-black text-white">{agent.name}</h3>
                                     <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-400 capitalize">{agent.llm}</span>
                                  </div>
                                  <p className="text-[13px] font-medium text-slate-500 leading-relaxed font-mono">
                                     <span className="text-emerald-500/70 mr-2">➤</span> {agent.currentTask}
                                  </p>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] font-black text-slate-600 uppercase mb-1">Core Integrity</div>
                               <div className="text-[20px] font-black text-emerald-400/90 font-display">{agent.successRate}%</div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Terminal-style Activity Log */}
              <div className="rounded-[40px] bg-black border border-white/5 p-8 font-mono shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-rose-500/20 to-blue-500/20" />
                 <h2 className="text-[14px] font-black text-slate-600 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                    Kernel Activity Log
                 </h2>
                 <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="flex gap-4 group">
                         <span className="text-slate-700 text-[11px] font-bold">{act.time}</span>
                         <div className="flex flex-col gap-1">
                            <p className="text-[13px] leading-relaxed">
                               <span className="text-blue-400 font-bold mr-2">[{act.agent}]</span>
                               <span className="text-slate-300">{act.action}</span>
                            </p>
                            <div className="flex gap-3 scale-90 origin-left opacity-40 group-hover:opacity-100 transition-opacity">
                               <span className="text-[10px] text-slate-500">LLM: {act.llm}</span>
                               <span className="text-[10px] text-emerald-500">CONF: {act.conf}%</span>
                            </div>
                         </div>
                      </div>
                    ))}
                    <div className="flex gap-4 animate-pulse">
                       <span className="text-slate-800 text-[11px] font-bold">NOW</span>
                       <span className="text-emerald-500/50 text-[13px]">Kernel scanning for anomalies... _</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Human Review / Critical Alerts */}
           <div className="space-y-8">
              <div className="rounded-[40px] bg-gradient-to-br from-[#1a1111] to-[#0a0a14] border border-rose-900/20 p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-500/5 rounded-full blur-[80px]" />
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-black text-rose-500 tracking-tight flex items-center gap-3">
                       Pending Intersection
                       <div className="flex gap-1">
                         <div className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                         <div className="w-1 h-1 rounded-full bg-rose-500 animate-ping delay-75" />
                       </div>
                    </h2>
                 </div>

                 <div className="space-y-5">
                    {pendingItems.length === 0 ? (
                      <div className="py-20 text-center text-slate-600 font-medium italic border border-dashed border-white/5 rounded-[32px]">
                         대기 중인 인터셉트 항목이 없습니다
                      </div>
                    ) : (
                      pendingItems.map((item) => (
                        <div key={item.pendingActionId} className="p-5 rounded-[28px] bg-white/5 border border-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer">
                           <div className="flex items-center gap-3 mb-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {item.priority}
                              </span>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{actionTypeLabel(item.actionType)}</span>
                           </div>
                           <h3 className="text-[15px] font-bold text-slate-200 mb-2 leading-snug">{item.title}</h3>
                           <p className="text-[12px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                           <Link href="/inbox" className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-black transition-all flex items-center justify-center gap-2">
                              커널 결정 내리기
                              <span className="text-rose-500">→</span>
                           </Link>
                        </div>
                      ))
                    )}
                 </div>

                 {pendingCount > 6 && (
                   <Link href="/inbox" className="block mt-6 text-center text-[12px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors">
                      View all interlocks ({pendingCount})
                   </Link>
                 )}
              </div>

              {/* System Diagnostics View */}
              <div className="rounded-[40px] bg-[#111122] border border-white/5 p-8">
                 <h2 className="text-[14px] font-black text-slate-500 mb-6 uppercase tracking-widest">Core Diagnostics</h2>
                 <div className="space-y-5">
                    {[
                      { label: 'Neural Engine', pct: 68, color: 'bg-emerald-500' },
                      { label: 'Data Stream', pct: 42, color: 'bg-blue-500' },
                      { label: 'LLM Response', pct: 85, color: 'bg-purple-500' },
                    ].map((d, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                            <span>{d.label}</span>
                            <span>{d.pct}%</span>
                         </div>
                         <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                            <div className={`h-full ${d.color} transition-all duration-1000 ease-out`} style={{ width: `${d.pct}%` }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
