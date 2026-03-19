import Link from "next/link";
import { Chip, MetricCard, Panel } from "@/components/app-shell";
import type { PendingAction, PaymentAdjustment } from "@/lib/cardwise-api";
import { formatCurrency, formatDateTime } from "@/lib/cardwise-api";

type LedgerHubProps = {
  pendingCount: number;
  pendingActions: PendingAction[];
  paymentId: string;
  adjustments: PaymentAdjustment[];
  groupCount: number;
  groupInvitationCount: number;
};

function priorityTone(priority: string) {
  if (priority === "HIGH") return "rose";
  if (priority === "MEDIUM") return "amber";
  return "emerald";
}

function priorityLabel(priority: string) {
  if (priority === "HIGH") return "높음";
  if (priority === "MEDIUM") return "보통";
  if (priority === "LOW") return "낮음";
  return priority;
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

function adjustmentTypeLabel(value: string) {
  const labels: Record<string, string> = {
    FX_CORRECTION: "환율 보정",
    BILLING_DISCOUNT: "청구 할인",
    PAYMENT_DEDUCTION: "결제 차감",
    CARD_FEE: "카드 수수료",
    OTHER: "기타",
  };
  return labels[value] ?? value;
}

function differenceTone(value: number) {
  if (value > 0) return "emerald";
  if (value < 0) return "rose";
  return "slate";
}

export function LedgerHub({
  pendingCount,
  pendingActions,
  paymentId,
  adjustments,
  groupCount,
  groupInvitationCount,
}: LedgerHubProps) {
  const recentActions = pendingActions.slice(0, 4);
  const recentAdjustments = adjustments.slice(0, 4);
  const totalDelta = adjustments.reduce((sum, item) => sum + item.differenceAmount, 0);

  return (
    <div className="grid gap-5">
      <section className="cw-stagger grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="가계부 허브"
          subtitle="가계부 화면을 인박스 검토와 결제 조정의 출발점으로 사용합니다."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="대기 작업" value={String(pendingCount)} helper="인박스 대기 수" />
            <MetricCard label="선택 결제" value={paymentId || "-"} helper="조정 이력 조회 기준" />
            <MetricCard label="순 증감" value={formatCurrency(totalDelta)} helper="최근 조정 합계" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Link href="/inbox" className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              인박스 열기
            </Link>
            <Link href={`/adjustments?paymentId=${encodeURIComponent(paymentId || "1")}`} className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              조정 이력 보기
            </Link>
            <Link href="/groups" className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              그룹 가계부 보기
            </Link>
          </div>
        </Panel>

        <Panel title="연결 화면" subtitle="가계부 흐름 아래에 연결된 화면으로 바로 이동할 수 있습니다." tone="minimal">
          <div className="grid gap-3">
            <Link href="/inbox" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>인박스 검토</span>
              <span className="text-[var(--text-muted)]">{pendingCount}</span>
            </Link>
            <Link href={`/adjustments?paymentId=${encodeURIComponent(paymentId || "1")}`} className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>결제 조정</span>
              <span className="text-[var(--text-muted)]">열기</span>
            </Link>
            <Link href="/performance/1" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>실적 검토</span>
              <span className="text-[var(--text-muted)]">시드</span>
            </Link>
            <Link href="/groups" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>그룹 목록</span>
              <span className="text-[var(--text-muted)]">{groupCount}</span>
            </Link>
            <Link href="/groups/invitations" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>그룹 초대</span>
              <span className="text-[var(--text-muted)]">{groupInvitationCount}</span>
            </Link>
          </div>
          <div className="mt-4 rounded-[20px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,rgba(255,241,242,.96),rgba(255,255,255,.96))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">가계부 메모</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              검토가 먼저인 흐름은 이 허브에서 시작합니다. 카드형 요약은 로즈 블로섬 결을 유지하고, 밀도 높은 리스트는 로즈 미니멀 카드로 정리합니다.
            </p>
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="대기 작업" subtitle="가장 급한 순서로 인박스 대기열을 미리 볼 수 있습니다." tone="minimal">
          <div className="grid gap-3">
            {recentActions.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                현재 표시할 대기 작업이 없습니다.
              </div>
            ) : (
              recentActions.map((item) => (
                <article key={item.pendingActionId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_10px_24px_rgba(190,24,60,0.05)]">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={priorityTone(item.priority)}>{priorityLabel(item.priority)}</Chip>
                    <Chip tone="slate">{actionTypeLabel(item.actionType)}</Chip>
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-strong)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-body)]">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                    <span>{item.referenceTable ?? "-"}</span>
                    <span>#{item.referenceId ?? "-"}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>

        <Panel title="조정 이력" subtitle="선택한 결제를 기준으로 조정 흐름을 이어서 확인할 수 있습니다." tone="minimal">
          <div className="grid gap-3">
            {recentAdjustments.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                결제 {paymentId || "-"} 에 대한 조정 내역이 없습니다.
              </div>
            ) : (
              recentAdjustments.map((item) => (
                <article key={item.adjustmentId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_10px_24px_rgba(190,24,60,0.05)]">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={differenceTone(item.differenceAmount)}>{formatCurrency(item.differenceAmount)}</Chip>
                    <Chip tone="slate">{adjustmentTypeLabel(item.adjustmentType)}</Chip>
                    <Chip tone="slate">#{item.adjustmentId}</Chip>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-body)]">
                    <div className="flex justify-between gap-4">
                      <span>원 금액</span>
                      <span>{formatCurrency(item.originalKrwAmount)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>조정 금액</span>
                      <span>{formatCurrency(item.adjustedKrwAmount)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>생성 시각</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
