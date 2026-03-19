import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { CardThumbnail, TierProgressTrack } from "@/components/preview-primitives";
import {
  formatCurrency,
  formatDateTime,
  getPendingCount,
  tryFetchBackendJson,
  type PendingActionCountResponse,
  type PendingActionsResponse,
  type PerformanceResponse,
  type VoucherListResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const seededUserCardIds = [1, 2, 3, 4];

function progressFor(data: PerformanceResponse["data"]) {
  const current = data.annual?.accumulated ?? 0;
  const floor = data.annual?.currentTier?.minAmount ?? 0;
  const ceiling = data.annual?.nextTier?.minAmount;

  if (!ceiling) {
    return 100;
  }

  const span = Math.max(ceiling - floor, 1);
  return Math.min(100, Math.max(0, Math.round(((current - floor) / span) * 100)));
}

function priorityLabel(priority: string) {
  if (priority === "HIGH") return "높음";
  if (priority === "MEDIUM") return "보통";
  if (priority === "LOW") return "낮음";
  return priority;
}

function pendingStatusLabel(status: string) {
  if (status === "PENDING") return "대기";
  if (status === "RESOLVED") return "해결";
  if (status === "DISMISSED") return "제외";
  return status;
}

function actionTypeLabel(actionType: string) {
  const labels: Record<string, string> = {
    FX_CORRECTION_NEEDED: "환율 보정 필요",
    BILLING_DISCOUNT_FOUND: "청구 할인 확인",
    PAYMENT_CONFIRMATION: "결제 확인",
    DUPLICATE_DETECTED: "중복 거래 확인",
    CATEGORY_UNMAPPED: "카테고리 분류 필요",
    EXCEL_REVIEW: "엑셀 검토",
    PERFORMANCE_EXCLUSION_CHECK: "실적 제외 검토",
  };
  return labels[actionType] ?? actionType;
}

function specialPeriodLabel(data: PerformanceResponse["data"]) {
  return data.specialPeriod?.active ? data.specialPeriod.name ?? "특별 기간" : "일반 기간";
}

export default async function DashboardPage() {
  const [pendingCountResponse, pendingResponse, activeVouchersResponse, expiringVouchersResponse, performanceResults] =
    await Promise.all([
      tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
      tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=4"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers?status=active"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers/expiring?days=7"),
      Promise.all(
        seededUserCardIds.map(async (userCardId) => ({
          userCardId,
          result: await tryFetchBackendJson<PerformanceResponse>(`/cards/${userCardId}/performance`),
        })),
      ),
    ]);

  const pendingCount = getPendingCount(pendingCountResponse);
  const pendingItems = pendingResponse?.data ?? [];
  const activeVouchers = activeVouchersResponse?.data ?? [];
  const expiringVouchers = expiringVouchersResponse?.data ?? [];
  const cards = performanceResults
    .map(({ userCardId, result }) => ({ userCardId, data: result?.data }))
    .filter((item): item is { userCardId: number; data: PerformanceResponse["data"] } => Boolean(item.data));
  const specialCount = cards.filter((card) => card.data.specialPeriod?.active).length;
  const graceCount = cards.filter((card) => card.data.benefitQualification?.gracePeriod?.active).length;
  const topCard = [...cards].sort((left, right) => (right.data.annual?.accumulated ?? 0) - (left.data.annual?.accumulated ?? 0))[0];
  const nextFocusCard = [...cards].sort(
    (left, right) =>
      (left.data.annual?.nextTier?.remainingAmount ?? Number.MAX_SAFE_INTEGER) -
      (right.data.annual?.nextTier?.remainingAmount ?? Number.MAX_SAFE_INTEGER),
  )[0];
  const unlockedVoucherCount = cards.reduce(
    (sum, card) => sum + card.data.voucherUnlocks.filter((voucher) => voucher.unlockState === "UNLOCKED").length,
    0,
  );
  const urgentPending = pendingItems.length > 0 ? pendingItems.filter((item) => item.priority === "HIGH").length : pendingCount;

  return (
    <AppShell
      active="dashboard"
      eyebrow="앱 홈"
      title="카드와이즈 홈"
      description="인박스 확인, 카드 실적, 바우처 점검을 한 화면에 모은 모바일 우선 홈입니다."
      actions={
        <>
          <Link
            href="/inbox"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            인박스 열기
          </Link>
          <Link
            href="/cards"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            카드 보기
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="대기 작업" value={String(pendingCount)} helper="서버 대기 건수" />
        <MetricCard label="사용 가능 바우처" value={String(activeVouchers.length)} helper="현재 활성 목록" />
        <MetricCard label="곧 만료" value={String(expiringVouchers.length)} helper="7일 이내 확인" />
        <MetricCard label="추적 카드" value={String(cards.length)} helper="실적 스냅샷 기준" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel title="오늘의 브리프" subtitle="가장 강한 카드 흐름과 바로 처리할 일을 한 번에 읽도록 홈 구조를 재배치했습니다.">
          <div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
            {topCard ? (
              <div className="rounded-[28px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,244,246,0.98))] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">리드 카드</div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                      {topCard.data.cardName}
                    </div>
                  </div>
                  <Chip tone={topCard.data.specialPeriod?.active ? "emerald" : "slate"}>
                    {specialPeriodLabel(topCard.data)}
                  </Chip>
                </div>

                <div className="mt-4">
                  <CardThumbnail
                    seed={topCard.userCardId}
                    title={topCard.data.cardName}
                    subtitle={topCard.data.annual?.currentTier?.tierName ?? "메인 덱"}
                    badge={topCard.data.specialPeriod?.active ? "Special" : "Lead"}
                  />
                </div>

                <div className="mt-4">
                  <TierProgressTrack
                    currentTier={topCard.data.annual?.currentTier?.tierName ?? "미등급"}
                    nextTier={topCard.data.annual?.nextTier?.tierName ?? "최상위 구간"}
                    progress={progressFor(topCard.data)}
                    accumulated={topCard.data.annual?.accumulated ?? 0}
                    remainingAmount={topCard.data.annual?.nextTier?.remainingAmount}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] p-6 text-sm text-[var(--text-muted)]">
                아직 카드 실적 데이터를 불러오지 못했습니다.
              </div>
            )}

            <div className="grid gap-3">
              <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">오늘 우선</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">급한 작업</div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{urgentPending}</div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">우선순위 높음</div>
                  </div>
                  <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">사용 가능</div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{unlockedVoucherCount}</div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">즉시 쓸 수 있는 바우처</div>
                  </div>
                  <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">특별 기간</div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{specialCount}</div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">가중 적용 카드</div>
                  </div>
                  <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">유예 보호</div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{graceCount}</div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">실적 보호 상태</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff7f8,#ffffff)] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">다음 구간 집중</div>
                <div className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                  {nextFocusCard?.data.cardName ?? "데이터 없음"}
                </div>
                <div className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  {nextFocusCard
                    ? `${formatCurrency(nextFocusCard.data.annual?.nextTier?.remainingAmount)}만 채우면 ${
                        nextFocusCard.data.annual?.nextTier?.tierName ?? "다음 구간"
                      }에 들어갑니다.`
                    : "집중 카드 정보를 불러오지 못했습니다."}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/ledger" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">가계부</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">허브 열기</div>
                </Link>
                <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">바우처</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">해금 상태 보기</div>
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="빠른 실행" subtitle="홈에서 바로 다음 액션으로 이어지도록 앱 기준 단축 동선을 묶었습니다.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/inbox" className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 transition hover:bg-[var(--surface-soft)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">인박스</div>
              <div className="mt-2 text-[17px] font-semibold text-[var(--text-strong)]">대기 작업 처리</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{pendingCount}건 대기 중</div>
            </Link>
            <Link href="/cards" className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 transition hover:bg-[var(--surface-soft)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">카드</div>
              <div className="mt-2 text-[17px] font-semibold text-[var(--text-strong)]">카드 묶음 보기</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">실적 트랙과 다음 구간 확인</div>
            </Link>
            <Link href="/adjustments" className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 transition hover:bg-[var(--surface-soft)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">조정</div>
              <div className="mt-2 text-[17px] font-semibold text-[var(--text-strong)]">정산 조정 보기</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">수정/보정 흐름 검토</div>
            </Link>
            <Link href="/benefits" className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 transition hover:bg-[var(--surface-soft)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">혜택</div>
              <div className="mt-2 text-[17px] font-semibold text-[var(--text-strong)]">추천 혜택 보기</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">매칭 높은 항목부터 점검</div>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone="rose">기본 스킨 · 로즈 블로섬</Chip>
            <Chip tone="amber">앱 기준</Chip>
            <Chip tone="slate">390px 기준</Chip>
            <Chip tone="emerald">BFF 연동</Chip>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Panel title="대기 작업 레인" subtitle="홈을 벗어나지 않고도 미해결 작업을 밀도 있게 훑을 수 있도록 카드형 레인으로 정리했습니다.">
          <div className="grid gap-3">
            {pendingItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                {pendingCount > 0
                  ? `상세 작업 목록은 아직 못 불러왔지만 대기 건수는 ${pendingCount}건입니다.`
                  : "아직 백엔드에서 대기 작업을 불러오지 못했습니다."}
              </div>
            ) : (
              pendingItems.map((item) => (
                <article key={item.pendingActionId} className="cw-interactive-card rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Chip tone={item.priority === "HIGH" ? "rose" : item.priority === "MEDIUM" ? "amber" : "emerald"}>{priorityLabel(item.priority)}</Chip>
                      <Chip tone="slate">{pendingStatusLabel(item.status)}</Chip>
                    </div>
                    <Chip tone="slate">{actionTypeLabel(item.actionType)}</Chip>
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-[-0.03em] text-[var(--text-strong)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{item.description}</p>
                  <div className="mt-3 grid gap-2 text-xs text-[var(--text-soft)] sm:grid-cols-3">
                    <span>{item.referenceTable ?? "-"}</span>
                    <span>#{item.referenceId ?? "-"}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>

        <Panel title="카드 플로우" subtitle="홈에서도 카드별 현재 위치와 다음 구간까지의 거리를 빠르게 읽을 수 있게 구성했습니다.">
          <div className="grid gap-3">
            {cards.map((card) => (
              <Link
                key={card.userCardId}
                href={`/performance/${card.userCardId}`}
                className="cw-interactive-card rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                      카드 #{card.userCardId}
                    </div>
                    <div className="mt-2 text-[17px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                      {card.data.cardName}
                    </div>
                  </div>
                  <Chip tone={card.data.specialPeriod?.active ? "emerald" : "slate"}>
                    {specialPeriodLabel(card.data)}
                  </Chip>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                  <div
                    className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                    style={{ width: `${progressFor(card.data)}%` }}
                  />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-[var(--text-body)] sm:grid-cols-3">
                  <span>{card.data.annual?.currentTier?.tierName ?? "미등급"}</span>
                  <span className="text-center">{formatCurrency(card.data.annual?.accumulated)}</span>
                  <span className="text-right">{formatCurrency(card.data.annual?.nextTier?.remainingAmount)} 남음</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
