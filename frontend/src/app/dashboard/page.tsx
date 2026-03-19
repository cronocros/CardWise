import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import {
  CategoryDonut,
  DashboardFilterSummary,
  TagRanking,
  TrendBars,
} from "@/components/dashboard/analytics-panels";
import { CardThumbnail, TierProgressTrack } from "@/components/preview-primitives";
import {
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatSignedCurrency,
  getPendingCount,
  tryFetchBackendJson,
  type DashboardCardSummaryResponse,
  type DashboardCategorySummaryResponse,
  type DashboardMonthlySummaryResponse,
  type DashboardTagSummaryResponse,
  type DashboardTrendResponse,
  type GroupStatsEnvelope,
  type GroupSummaryEnvelope,
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

type DashboardPageProps = {
  searchParams?: Promise<{
    groupId?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedGroupIdParam = Array.isArray(resolvedSearchParams.groupId)
    ? resolvedSearchParams.groupId[0]
    : resolvedSearchParams.groupId;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const monthEnd = `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`;
  const yearMonthLabel = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const [
    pendingCountResponse,
    pendingResponse,
    activeVouchersResponse,
    expiringVouchersResponse,
    groupsResponse,
    monthlySummaryResponse,
    cardSummaryResponse,
    categorySummaryResponse,
    tagSummaryResponse,
    trendResponse,
    performanceResults,
  ] =
    await Promise.all([
      tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
      tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=4"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers?status=active"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers/expiring?days=7"),
      tryFetchBackendJson<GroupSummaryEnvelope>("/groups"),
      tryFetchBackendJson<DashboardMonthlySummaryResponse>(`/dashboard/monthly?year=${currentYear}&month=${currentMonth}`),
      tryFetchBackendJson<DashboardCardSummaryResponse>(`/dashboard/cards?from=${monthStart}&to=${monthEnd}`),
      tryFetchBackendJson<DashboardCategorySummaryResponse>(`/dashboard/categories?from=${monthStart}&to=${monthEnd}`),
      tryFetchBackendJson<DashboardTagSummaryResponse>(`/tags/stats?from=${monthStart}&to=${monthEnd}`),
      tryFetchBackendJson<DashboardTrendResponse>("/dashboard/trends?period=monthly&limit=6"),
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
  const groups = groupsResponse?.data ?? [];
  const monthlySummary = monthlySummaryResponse?.data ?? null;
  const cardSummaries = cardSummaryResponse?.data ?? [];
  const categorySummaries = categorySummaryResponse?.data ?? [];
  const tagSummaries = tagSummaryResponse?.data ?? [];
  const trendPoints = trendResponse?.data ?? [];
  const selectedGroup =
    groups.find((group) => String(group.groupId) === selectedGroupIdParam) ?? null;
  const selectedGroupStatsResponse =
    selectedGroup !== null
      ? await tryFetchBackendJson<GroupStatsEnvelope>(
          `/groups/${selectedGroup.groupId}/stats?from=${monthStart}&to=${monthEnd}`,
        )
      : null;
  const selectedGroupStats = selectedGroupStatsResponse?.data ?? null;
  const cardSummaryMap = new Map(cardSummaries.map((item) => [item.userCardId, item]));
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
      <DashboardFilterSummary
        activeLabel={selectedGroup ? `${selectedGroup.groupName} 그룹 대시보드` : "이번 달 대시보드"}
        rangeLabel={
          selectedGroup
            ? `${yearMonthLabel} 기준 집계 · 그룹 가계부 모드`
            : `${yearMonthLabel} 기준 집계 · 개인 가계부`
        }
        scopeLabel={selectedGroup ? `${selectedGroup.groupName} 그룹` : "개인 가계부"}
      />

      <Panel
        title="가계부 선택"
        subtitle="F8 문서 기준으로 개인 가계부와 그룹 가계부를 대시보드에서 직접 전환합니다."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedGroup
                ? "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"
                : "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
            }`}
          >
            개인
          </Link>
          {groups.map((group) => {
            const isActive = selectedGroup?.groupId === group.groupId;
            return (
              <Link
                key={group.groupId}
                href={`/dashboard?groupId=${group.groupId}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"
                }`}
              >
                {group.groupName}
              </Link>
            );
          })}
          <Link
            href="/groups"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--surface-border-strong)]"
          >
            그룹 관리
          </Link>
        </div>
        {selectedGroup && selectedGroupStats ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <MetricCard label="그룹 총 지출" value={formatCurrency(selectedGroupStats.totalSpent)} helper={`${selectedGroup.groupName} · 이번 달`} />
              <MetricCard label="멤버 수" value={`${selectedGroup.memberCount}명`} helper={`${selectedGroup.role} 참여 중`} />
              <MetricCard label="그룹 결제" value={`${selectedGroupStats.paymentCount}건`} helper="선택 기간 기준" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">멤버별 지출 비교</div>
                <div className="mt-4 grid gap-3">
                  {selectedGroupStats.memberStats.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-6 text-sm text-[var(--text-muted)]">
                      아직 그룹 결제가 없어 멤버 비교를 표시하지 못했습니다.
                    </div>
                  ) : (
                    selectedGroupStats.memberStats.map((member) => (
                      <div key={member.accountId} className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-strong)]">{member.displayName}</div>
                            <div className="mt-1 text-xs text-[var(--text-muted)]">{member.paymentCount}건 · {formatPercent(member.sharePercent)}</div>
                          </div>
                          <div className="text-sm font-semibold text-[var(--text-strong)]">{formatCurrency(member.spentAmount)}</div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]" style={{ width: `${Math.max(member.sharePercent, 6)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">그룹 태그 분포</div>
                <div className="mt-4 grid gap-3">
                  {selectedGroupStats.tagStats.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-6 text-sm text-[var(--text-muted)]">
                      아직 태그가 연결된 그룹 결제가 없습니다.
                    </div>
                  ) : (
                    selectedGroupStats.tagStats.slice(0, 5).map((tag) => (
                      <div key={tag.tagName} className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-strong)]">{tag.tagName}</div>
                            <div className="mt-1 text-xs text-[var(--text-muted)]">{tag.paymentCount}건 · {formatPercent(tag.sharePercent)}</div>
                          </div>
                          <div className="text-sm font-semibold text-[var(--text-strong)]">{formatCurrency(tag.spentAmount)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/groups/${selectedGroup.groupId}/stats`}
                    className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
                  >
                    그룹 통계 전체 보기
                  </Link>
                  <Link
                    href={`/groups/${selectedGroup.groupId}/payments`}
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--surface-border-strong)]"
                  >
                    그룹 결제 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : groups.length > 0 ? (
          <div className="mt-4 rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-6 text-sm text-[var(--text-muted)]">
            그룹을 선택하면 멤버별 지출 비교와 그룹 태그 분포를 이 화면에서 바로 확인할 수 있습니다.
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-6 text-sm text-[var(--text-muted)]">
            아직 참여 중인 그룹이 없습니다. 그룹을 만들면 대시보드에서 개인/그룹 모드를 전환할 수 있습니다.
          </div>
        )}
      </Panel>

      <section className="cw-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="총 지출"
          value={formatCurrency(monthlySummary?.totalSpent ?? 0)}
          helper={`${monthlySummary?.yearMonth ?? yearMonthLabel} 월간 집계`}
        />
        <MetricCard
          label="결제 건수"
          value={`${monthlySummary?.paymentCount ?? 0}건`}
          helper="월간 결제 기준"
        />
        <MetricCard
          label="혜택 절약"
          value={formatCurrency(monthlySummary?.totalBenefit ?? 0)}
          helper="적용된 혜택 합계"
        />
        <MetricCard
          label="전월 대비"
          value={formatSignedCurrency(monthlySummary?.changeAmount ?? 0)}
          helper={
            monthlySummary?.changeRate !== null && monthlySummary?.changeRate !== undefined
              ? `${formatPercent(monthlySummary.changeRate)} 변화`
              : "비교 데이터 없음"
          }
        />
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
        <Panel
          title="카테고리 분포"
          subtitle="문서 기준 F8 대시보드의 카테고리 섹션을 맞춰, 이번 달 지출 비중과 혜택 기여를 함께 읽도록 정리했습니다."
        >
          <CategoryDonut items={categorySummaries} />
        </Panel>

        <Panel
          title="태그 통계"
          subtitle="상위 태그 지출 랭킹과 태그 통계/교차 분석 진입을 한 번에 제공하도록 정리했습니다."
        >
          <TagRanking items={tagSummaries} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/tags"
              className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
            >
              태그 통계 더보기
            </Link>
            <Link
              href="/dashboard/tags/cross"
              className="rounded-full border border-[var(--surface-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:bg-white"
            >
              교차 분석 열기
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel
          title="월간 추이"
          subtitle="최근 월별 지출 흐름을 막대 차트로 노출해 전월 대비 감각을 홈에서 바로 읽게 했습니다."
        >
          <TrendBars items={trendPoints} />
        </Panel>

        <Panel
          title="작업 상태"
          subtitle="문서형 월간 통계와 운영형 작업 지표를 함께 볼 수 있도록 홈 상태를 따로 정리했습니다."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">대기 작업</div>
              <div className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{pendingCount}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">확인 필요한 서버 대기 건수</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">사용 가능 바우처</div>
              <div className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{activeVouchers.length}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">현재 즉시 사용 가능한 목록</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">곧 만료</div>
              <div className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{expiringVouchers.length}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">7일 이내 확인 대상</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">추적 카드</div>
              <div className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{cards.length}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">실적 스냅샷 기준</div>
            </div>
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
                {(() => {
                  const summary = cardSummaryMap.get(card.userCardId);
                  return (
                    <>
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
                        <span>{summary?.currentTierName ?? card.data.annual?.currentTier?.tierName ?? "미등급"}</span>
                        <span className="text-center">{formatCurrency(summary?.spentAmount ?? card.data.currentMonth?.monthlySpent)}</span>
                        <span className="text-right">{formatCurrency(card.data.annual?.nextTier?.remainingAmount)} 남음</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-[var(--text-soft)] sm:grid-cols-3">
                        <span>월 결제 {summary?.paymentCount ?? 0}건</span>
                        <span className="text-center">혜택 {formatCurrency(summary?.benefitAmount ?? 0)}</span>
                        <span className="text-right">연간 누적 {formatCurrency(summary?.annualAccumulated ?? card.data.annual?.accumulated)}</span>
                      </div>
                    </>
                  );
                })()}
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
