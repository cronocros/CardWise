import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { formatDateTime, getPendingCount, tryFetchBackendJson, type PendingActionCountResponse, type PendingActionsResponse } from "@/lib/cardwise-api";

// ⚠️ 이 페이지는 CardWise 제품 기능이 아닙니다.
// 개발자 전용 OPS 모니터링 도구입니다. (/ops/live)
// CardWise 사용자 대시보드는 /dashboard 입니다.
export const dynamic = "force-dynamic";

function priorityLabel(priority: string) {
  if (priority === "HIGH") return "높음";
  if (priority === "MEDIUM") return "보통";
  if (priority === "LOW") return "낮음";
  return priority;
}

function pendingStatusLabel(status: string) {
  if (status === "PENDING") return "대기 중";
  if (status === "RESOLVED") return "해결됨";
  if (status === "DISMISSED") return "제외됨";
  return status;
}

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
    <AppShell
      active="dashboard"
      eyebrow="Intelligence Hub"
      title="운영 대시보드"
      description="CardWise 내부의 AI 에이전트 동작 상태와 인간 개입(Human-in-the-loop)이 필요한 작업을 모니터링합니다."
      actions={
        <Link
          href="/inbox"
          className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-soft)] transition hover:bg-[var(--accent-strong)] transform hover:scale-105"
        >
          인박스 일괄 처리
        </Link>
      }
    >
      {/* Top System Metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            System Status
          </div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--text-strong)] flex items-center justify-between">
            Optimal
            <Image
              src="/mascot.png"
              alt="CardWise Mascot"
              width={64}
              height={64}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-90 animate-[bounce_3s_infinite]"
              priority
            />
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)] relative z-10">모든 에이전트 정상 동작 중</div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">
            Active Agents
          </div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--text-strong)]">
            {activeAgents.length}
          </div>
          <div className="mt-1 text-sm text-[var(--success)]">활성 상태의 특화 AI</div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">
            Tokens Processed
          </div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--text-strong)]">
            1.2M
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">이번 달 사용량 (비용 최적화)</div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl ring-2 ring-[var(--warning-soft)]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--warning)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)]"></span>
            Human Review
          </div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--text-strong)]">
            {pendingCount}
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">사용자 승인 대기 건</div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left Column: Active Agents & Recent Activity */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[32px] border border-[var(--surface-border-strong)] bg-white/70 backdrop-blur-2xl p-6 shadow-xl shadow-[var(--surface-shadow)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-strong)] tracking-tight">AI 에이전트 모니터링</h2>
                <p className="mt-1 text-sm text-[var(--text-body)]">현재 백그라운드에서 동작 중인 LLM 에이전트 상태입니다.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {activeAgents.map((agent) => (
                <div key={agent.id} className="group relative overflow-hidden rounded-[20px] border border-[var(--surface-border)] bg-gradient-to-br from-white to-[var(--surface-soft)] p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${agent.status === "processing" ? "bg-[var(--accent)] animate-pulse" : "bg-[var(--neutral-300)]"}`} />
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg text-[var(--text-strong)]">{agent.name}</h3>
                          <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-strong)]">
                            {agent.llm}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-[var(--text-body)] font-medium">
                          {agent.currentTask}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[var(--text-soft)] tracking-widest">정확도</div>
                      <div className="mt-1 text-base font-bold text-[var(--success)]">{agent.successRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-strong)] tracking-tight mb-5">실시간 결정 로그</h2>
            <div className="border-l-2 border-[var(--surface-border-strong)] ml-3 pl-5 space-y-6">
              {recentActivities.map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--accent)] bg-white"></div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-[var(--accent-strong)]">{act.agent}</span>
                    <span className="text-xs text-[var(--text-muted)]">{act.time}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-strong)] leading-relaxed">{act.action}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-block rounded-md bg-[var(--surface-soft)] px-2 py-1 text-[11px] text-[var(--text-body)] border border-[var(--surface-border)]">⚙ {act.llm}</span>
                    <span className="inline-block rounded-md bg-[var(--success-soft)] px-2 py-1 text-[11px] text-[var(--success)] border border-[var(--success-soft)]">신뢰도 {act.conf}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Human-in-the-loop */}
        <div>
          <div className="sticky top-[100px] rounded-[32px] border border-[var(--warning-soft)] bg-gradient-to-b from-[#fffaf0] to-white p-6 shadow-2xl shadow-[var(--warning-soft)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--warning)] tracking-tight flex items-center gap-2">
                  Human-in-the-Loop
                </h2>
                <p className="mt-1 text-sm text-[var(--text-body)]">AI가 인간의 확정을 기다리고 있는 항목</p>
              </div>
            </div>

            <div className="space-y-4">
              {pendingItems.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-[var(--warning-soft)] bg-white/50 px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                  현재 AI가 요청한 검토 대기열이 비어 있습니다.
                </div>
              ) : (
                pendingItems.map((item) => (
                  <article key={item.pendingActionId} className="group relative overflow-hidden rounded-[20px] border border-[var(--warning-soft)] bg-white p-4 transition-all hover:border-[var(--warning)] hover:shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${item.priority === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                          {priorityLabel(item.priority)}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {actionTypeLabel(item.actionType)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-strong)] leading-snug">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--text-body)]">{item.description}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/inbox" className="flex-1 rounded-[12px] bg-[var(--text-strong)] py-2 text-center text-xs font-bold text-white transition hover:bg-black">
                        결정하기
                      </Link>
                      <button className="flex-1 rounded-[12px] border border-[var(--surface-border-strong)] bg-white py-2 text-center text-xs font-bold text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">
                        자세히
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {pendingCount > 6 && (
              <div className="mt-5 text-center">
                <Link href="/inbox" className="text-sm font-bold text-[var(--accent-strong)] hover:underline">
                  +{pendingCount - 6}개의 대기 항목 전체 보기
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
