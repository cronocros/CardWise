import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import {
  formatCurrency,
  formatPercent,
  tryFetchBackendJson,
  type PerformanceResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const seededUserCardIds = [1, 2, 3, 4];

function progressFor(data: PerformanceResponse["data"]) {
  const current = data.annual?.accumulated ?? 0;
  const currentTierMin = data.annual?.currentTier?.minAmount ?? 0;
  const nextTierMin = data.annual?.nextTier?.minAmount;

  if (!nextTierMin) {
    return 100;
  }

  const span = Math.max(nextTierMin - currentTierMin, 1);
  return Math.min(100, Math.max(0, Math.round(((current - currentTierMin) / span) * 100)));
}

export default async function CardsPage() {
  const performanceResults = await Promise.all(
    seededUserCardIds.map(async (userCardId) => ({
      userCardId,
      result: await tryFetchBackendJson<PerformanceResponse>(`/cards/${userCardId}/performance`),
    })),
  );

  const cards = performanceResults
    .map(({ userCardId, result }) => ({ userCardId, data: result?.data }))
    .filter((item): item is { userCardId: number; data: PerformanceResponse["data"] } => Boolean(item.data));

  const annualTotal = cards.reduce((sum, card) => sum + (card.data.annual?.accumulated ?? 0), 0);
  const specialCount = cards.filter((card) => card.data.specialPeriod?.active).length;
  const graceCount = cards.filter((card) => card.data.benefitQualification?.gracePeriod?.active).length;
  const averageMonthly = cards.length
    ? Math.round(cards.reduce((sum, card) => sum + (card.data.currentMonth?.monthlySpent ?? 0), 0) / cards.length)
    : 0;
  const bestCard = [...cards].sort((left, right) => (right.data.annual?.accumulated ?? 0) - (left.data.annual?.accumulated ?? 0))[0];

  return (
    <AppShell
      active="cards"
      eyebrow="카드 덱"
      title="카드와 실적"
      description="카드 실적 스냅샷을 중심으로 상세 보기, 인박스 처리, 바우처 확인까지 이어지는 카드 화면입니다."
      actions={
        <>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            홈으로
          </Link>
          <Link
            href={bestCard ? `/performance/${bestCard.userCardId}` : "/performance/1"}
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            선두 카드 열기
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="추적 카드" value={String(cards.length)} helper="실적 스냅샷 기준" />
        <MetricCard label="연간 누적" value={formatCurrency(annualTotal)} helper="합산 누적 사용액" />
        <MetricCard label="월 평균" value={formatCurrency(averageMonthly)} helper="이번 달 평균 사용액" />
        <MetricCard label="특별 / 유예" value={`${specialCount}/${graceCount}`} helper="특별 기간 / 유예 기간" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="카드 덱" subtitle="각 카드는 앱 타일처럼 동작합니다. 상세에서 구간 기준, 월별 내역, 바우처 해금 조건을 바로 확인할 수 있습니다.">
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card, index) => (
              <Link
                key={card.userCardId}
                href={`/performance/${card.userCardId}`}
                className="cw-interactive-card group rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(190,24,60,0.12)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">사용 카드 #{card.userCardId}</div>
                    <div className="mt-2 text-[20px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{card.data.cardName}</div>
                  </div>
                  <Chip tone={card.data.specialPeriod?.active ? "emerald" : "slate"}>
                    {card.data.specialPeriod?.active ? "특별 기간" : "일반 기간"}
                  </Chip>
                </div>

                <div className="mt-4 rounded-[20px] bg-[linear-gradient(135deg,var(--primary-50),#fff)] p-4">
                  <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                    <span>연간 누적 실적</span>
                    <span>{formatCurrency(card.data.annual?.accumulated)}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                    <div
                      className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                      style={{ width: `${progressFor(card.data)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[var(--text-soft)]">
                    <span>{card.data.annual?.currentTier?.tierName ?? "미등급"}</span>
                    <span>{card.data.annual?.nextTier?.tierName ?? "최상위 구간"}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>이번 달</span>
                    <span>{card.data.currentMonth?.yearMonth ?? "-"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>월 사용액</span>
                    <span>{formatCurrency(card.data.currentMonth?.monthlySpent)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>증감</span>
                    <span>{formatPercent(card.data.currentMonth?.changeRate)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="rose">#{index + 1}</Chip>
                  <Chip tone="slate">{card.data.benefitQualification?.periodLagLabel ?? "시차 없음"}</Chip>
                  <Chip tone="amber">{card.data.benefitQualification?.gracePeriod?.active ? "유예 적용" : "유예 없음"}</Chip>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="주요 동선" subtitle="카드 흐름 안에서 다른 화면으로 자연스럽게 이어지도록 연결했습니다.">
          <div className="grid gap-3">
            <Link href="/dashboard" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">홈</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">대시보드로 돌아가기</div>
            </Link>
            <Link href="/inbox" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">인박스</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">쌓인 작업 처리</div>
            </Link>
            <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">조정</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">결제 조정 확인</div>
            </Link>
            <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">바우처</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">해금 조건 보기</div>
            </Link>
          </div>

          {bestCard ? (
            <div className="mt-4 rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">선두 카드</div>
              <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{bestCard.data.cardName}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">
                {formatCurrency(bestCard.data.annual?.accumulated)} 누적, {bestCard.data.specialPeriod?.active ? "특별 기간 적용 중" : "일반 기간"}입니다.
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
    </AppShell>
  );
}
