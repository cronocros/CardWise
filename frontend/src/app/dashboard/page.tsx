import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
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
  const annualTotal = cards.reduce((sum, card) => sum + (card.data.annual?.accumulated ?? 0), 0);
  const specialCount = cards.filter((card) => card.data.specialPeriod?.active).length;
  const graceCount = cards.filter((card) => card.data.benefitQualification?.gracePeriod?.active).length;
  const topCard = [...cards].sort((left, right) => (right.data.annual?.accumulated ?? 0) - (left.data.annual?.accumulated ?? 0))[0];

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

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="빠른 실행" subtitle="다음 작업으로 바로 이어질 수 있게 홈 상단에 핵심 동선을 배치했습니다.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">활성 카드</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{cards.length}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">실적 점검 가능한 카드 수</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">연간 누적</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{formatCurrency(annualTotal)}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">합산 누적 사용액</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">특별 기간</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{specialCount}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">실적 가중 기간 적용 카드</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">유예 적용</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{graceCount}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">실적 유예 상태</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone="rose">기본 스킨 · 로즈 블로섬</Chip>
            <Chip tone="amber">앱 기준</Chip>
            <Chip tone="slate">390px 기준</Chip>
            <Chip tone="emerald">BFF 연동</Chip>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/ledger" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">가계부</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">허브 열기</div>
            </Link>
            <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">카드</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">카드 묶음 보기</div>
            </Link>
            <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">조정</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">정산 조정 보기</div>
            </Link>
            <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">바우처</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">해금 상태 보기</div>
            </Link>
          </div>
        </Panel>

        <Panel title="우선 확인 카드" subtitle="누적 실적이 가장 높은 카드를 우선 점검 대상으로 올려둡니다.">
          {topCard ? (
            <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">선두 카드</div>
                  <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{topCard.data.cardName}</div>
                </div>
                <Chip tone={topCard.data.specialPeriod?.active ? "emerald" : "slate"}>
                  {topCard.data.specialPeriod?.active ? "특별 기간" : "일반 기간"}
                </Chip>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">연간 누적 실적</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{formatCurrency(topCard.data.annual?.accumulated)}</div>
                </div>
                <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">현재 구간</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{topCard.data.annual?.currentTier?.tierName ?? "미등급"}</div>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                <div
                  className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                  style={{ width: `${progressFor(topCard.data)}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                <div className="flex items-center justify-between gap-4">
                  <span>기준 월</span>
                  <span>{topCard.data.benefitQualification?.referenceMonth ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>다음 구간</span>
                  <span>{topCard.data.annual?.nextTier?.tierName ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>유예 상태</span>
                  <span>{topCard.data.benefitQualification?.gracePeriod?.active ? "활성" : "없음"}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/performance/${topCard.userCardId}`} className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]">
                  실적 상세 열기
                </Link>
                <Link href="/cards" className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">
                  카드 비교
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] p-6 text-sm text-[var(--text-muted)]">
              아직 카드 실적 데이터를 불러오지 못했습니다.
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="대기 작업" subtitle="홈을 벗어나지 않고도 미해결 작업을 바로 확인할 수 있습니다.">
          <div className="grid gap-3">
            {pendingItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                아직 백엔드에서 대기 작업을 불러오지 못했습니다.
              </div>
            ) : (
              pendingItems.map((item) => (
                <article key={item.pendingActionId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={item.priority === "HIGH" ? "rose" : item.priority === "MEDIUM" ? "amber" : "emerald"}>{priorityLabel(item.priority)}</Chip>
                    <Chip tone="slate">{actionTypeLabel(item.actionType)}</Chip>
                    <Chip tone="slate">{pendingStatusLabel(item.status)}</Chip>
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-[-0.03em] text-[var(--text-strong)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-soft)]">
                    <span>{item.referenceTable ?? "-"}</span>
                    <span>#{item.referenceId ?? "-"}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>

        <Panel title="바로 이동" subtitle="자주 쓰는 화면을 한 번에 이동할 수 있게 정리했습니다.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/inbox" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">인박스</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">대기 작업 처리</div>
            </Link>
            <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">조정</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">결제 조정 확인</div>
            </Link>
            <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">카드</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">카드 실적 비교</div>
            </Link>
            <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">바우처</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">바우처 해금 확인</div>
            </Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
