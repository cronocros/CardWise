import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { CardThumbnail, TierProgressTrack } from "@/components/preview-primitives";
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

function periodLabel(data: PerformanceResponse["data"]) {
  return data.specialPeriod?.active ? data.specialPeriod.name ?? "특별 기간" : "일반 기간";
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
  const nextFocusCard = [...cards].sort(
    (left, right) =>
      (left.data.annual?.nextTier?.remainingAmount ?? Number.MAX_SAFE_INTEGER) -
      (right.data.annual?.nextTier?.remainingAmount ?? Number.MAX_SAFE_INTEGER),
  )[0];

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

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="대표 카드 포커스"
          subtitle="이번 달 가장 앞서 있는 카드와 다음 구간에 가장 가까운 카드를 분리해서 보여줍니다."
        >
          <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
            {bestCard ? (
              <div className="rounded-[28px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,244,246,0.96))] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                      리드 카드
                    </div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                      {bestCard.data.cardName}
                    </div>
                  </div>
                  <Chip tone={bestCard.data.specialPeriod?.active ? "emerald" : "slate"}>
                    {periodLabel(bestCard.data)}
                  </Chip>
                </div>

                <div className="mt-4">
                  <CardThumbnail
                    seed={bestCard.userCardId}
                    title={bestCard.data.cardName}
                    subtitle={bestCard.data.annual?.currentTier?.tierName ?? "메인 덱"}
                    badge={bestCard.data.specialPeriod?.active ? "Special" : "Core"}
                  />
                </div>

                <div className="mt-4">
                  <TierProgressTrack
                    currentTier={bestCard.data.annual?.currentTier?.tierName ?? "미등급"}
                    nextTier={bestCard.data.annual?.nextTier?.tierName ?? "최상위 구간"}
                    progress={progressFor(bestCard.data)}
                    accumulated={bestCard.data.annual?.accumulated ?? 0}
                    remainingAmount={bestCard.data.annual?.nextTier?.remainingAmount}
                  />
                </div>
              </div>
            ) : null}

            <div className="grid gap-3">
              <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  다음 구간 집중
                </div>
                <div className="mt-3 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                  {nextFocusCard?.data.cardName ?? "데이터 없음"}
                </div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  {nextFocusCard
                    ? `${formatCurrency(nextFocusCard.data.annual?.nextTier?.remainingAmount)}만 채우면 ${
                        nextFocusCard.data.annual?.nextTier?.tierName ?? "다음 구간"
                      }에 진입합니다.`
                    : "다음 구간 포커스 카드를 계산할 수 없습니다."}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    이번 달 평균
                  </div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                    {formatCurrency(averageMonthly)}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">모든 카드 기준 평균 사용액</div>
                </div>
                <div className="rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    유예 적용
                  </div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                    {graceCount}장
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">실적 기준 보정이 필요한 카드</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  바로 이동
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Link href="/dashboard" className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                    <div className="text-xs font-medium text-[var(--text-soft)]">홈</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--text-strong)]">대시보드</div>
                  </Link>
                  <Link href="/vouchers" className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                    <div className="text-xs font-medium text-[var(--text-soft)]">해금 조건</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--text-strong)]">바우처</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="카드 덱"
          subtitle="모바일에서는 덱을 넘기듯 훑고, 큰 화면에서는 카드 두 장씩 비교할 수 있게 정리했습니다."
        >
          <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-1 2xl:grid-cols-2">
            {cards.map((card, index) => (
              <Link
                key={card.userCardId}
                href={`/performance/${card.userCardId}`}
                className="cw-interactive-card group min-w-[308px] snap-center rounded-[28px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(190,24,60,0.12)] md:min-w-0"
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

                <div className="mt-4">
                  <CardThumbnail
                    seed={card.userCardId}
                    title={card.data.cardName}
                    subtitle={card.data.benefitQualification?.periodLagLabel ?? "실적 기준"}
                    badge={card.data.specialPeriod?.active ? "Special" : `Deck ${index + 1}`}
                    compact
                  />
                </div>

                <div className="mt-4">
                  <TierProgressTrack
                    currentTier={card.data.annual?.currentTier?.tierName ?? "미등급"}
                    nextTier={card.data.annual?.nextTier?.tierName ?? "최상위 구간"}
                    progress={progressFor(card.data)}
                    accumulated={card.data.annual?.accumulated ?? 0}
                    remainingAmount={card.data.annual?.nextTier?.remainingAmount}
                  />
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
                  <Chip tone="rose">덱 #{index + 1}</Chip>
                  <Chip tone="slate">{card.data.benefitQualification?.periodLagLabel ?? "시차 없음"}</Chip>
                  <Chip tone="amber">{card.data.benefitQualification?.gracePeriod?.active ? "유예 적용" : "유예 없음"}</Chip>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
