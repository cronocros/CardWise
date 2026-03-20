"use client";

import Link from "next/link";
import { Chip, MetricCard, Panel } from "@/components/app-shell";
import type { PendingAction, PaymentAdjustment, PaymentRecord, UserCardSummaryResponse } from "@/lib/cardwise-api";
import { formatCurrency, formatDateTime } from "@/lib/cardwise-api";
import { DeletePaymentButton } from "@/components/ledger-item-actions";
import { createPayment } from "@/app/ledger/actions";
import { useState } from "react";

type LedgerHubProps = {
  actions: PendingAction[];
  actionCount: number;
  adjustments: PaymentAdjustment[];
  groups: any[];
  payments: PaymentRecord[];
  userCards: UserCardSummaryResponse[];
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
  actions,
  actionCount,
  adjustments,
  groups,
  payments,
  userCards,
}: LedgerHubProps) {
  const [showForm, setShowForm] = useState(false);
  const recentActions = actions.slice(0, 4);
  const recentAdjustments = adjustments.slice(0, 4);
  const totalDelta = adjustments.reduce((sum, item) => sum + item.differenceAmount, 0);

  return (
    <div className="grid gap-5">
      <section className="cw-stagger grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="가계부 허브"
          subtitle="가계부 화면을 인박스 검토와 결제 조정의 출발점으로 사용합니다."
          actions={
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              {showForm ? "닫기" : "결제 직접 입력"}
            </button>
          }
        >
          {showForm && (
            <div className="mb-6">
              <ManualPaymentForm userCards={userCards} onComplete={() => setShowForm(false)} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="대기 작업" value={String(actionCount)} helper="알림 및 대기 작업 수" />
            <MetricCard label="등록 카드" value={String(userCards.length)} helper="추적 중인 카드 대수" />
            <MetricCard label="순 증감" value={formatCurrency(totalDelta)} helper="최근 조정 합계" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Link href="/inbox" className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              인박스 열기
            </Link>
            <Link href="/adjustments" className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
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
              <span className="text-[var(--text-muted)]">{actionCount}</span>
            </Link>
            <Link href="/adjustments" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>결제 조정</span>
              <span className="text-[var(--text-muted)]">열기</span>
            </Link>
            <Link href="/performance/1" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>실적 검토</span>
              <span className="text-[var(--text-muted)]">시드</span>
            </Link>
            <Link href="/groups" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>그룹 목록</span>
              <span className="text-[var(--text-muted)]">{groups.length}</span>
            </Link>
          </div>
          <div className="mt-4 rounded-[20px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,rgba(255,241,242,.96),rgba(255,255,255,.96))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">가계부 메모</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              결제 내역을 직접 입력하면 관련 카드 혜택과 실적 반영 여부를 시스템이 추후 검토합니다.
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

        <Panel title="조정 이력" subtitle="최근 발생한 결제 조정 흐름을 확인할 수 있습니다." tone="minimal">
          <div className="grid gap-3">
            {recentAdjustments.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                최근 조정 내역이 없습니다.
              </div>
            ) : (
              recentAdjustments.map((item: PaymentAdjustment) => (
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

      <section>
        <Panel title="모든 결제 내역" subtitle="수동 입력된 최근 거래 목록입니다." tone="minimal">
          <div className="grid gap-2">
            {payments.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                최근 결제 내역이 없습니다.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] shadow-[var(--surface-shadow)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--surface-soft)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">
                    <tr>
                      <th className="px-6 py-4">날짜</th>
                      <th className="px-6 py-4">가맹점</th>
                      <th className="px-6 py-4 text-right">금액</th>
                      <th className="px-6 py-4">상태</th>
                      <th className="px-6 py-4 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--surface-border)]">
                    {payments.map((p) => (
                      <tr key={p.paymentId} className="group transition hover:bg-[var(--surface-soft)]">
                        <td className="whitespace-nowrap px-6 py-4 text-[var(--text-muted)]">
                          {formatDateTime(p.paidAt)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[var(--text-strong)]">
                          {p.merchantName}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[var(--text-strong)]">
                          {formatCurrency(p.finalKrwAmount ?? p.krwAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <Chip tone={p.isAdjusted ? "emerald" : "slate"}>
                            {p.isAdjusted ? "조정됨" : "일반"}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DeletePaymentButton paymentId={p.paymentId} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ManualPaymentForm({ userCards, onComplete }: { userCards: UserCardSummaryResponse[], onComplete: () => void }) {
  const [userCardId, setUserCardId] = useState(userCards[0]?.userCardId.toString() ?? "");
  const [merchantName, setMerchantName] = useState("");
  const [krwAmount, setKrwAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCardId || !merchantName || !krwAmount) return;

    setIsPending(true);
    try {
      await createPayment({
        userCardId: parseInt(userCardId),
        merchantName,
        krwAmount: parseInt(krwAmount),
        paidAt: new Date(paidAt).toISOString(),
      });
      onComplete();
    } catch (err) {
      console.error(err);
      alert("결제 등록에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cw-stagger grid gap-4 rounded-3xl border border-[var(--surface-border-strong)] bg-white p-6 shadow-xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">카드 선택</label>
          <select
            value={userCardId}
            onChange={(e) => setUserCardId(e.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          >
            {userCards.map(c => (
              <option key={c.userCardId} value={c.userCardId}>
                {c.cardNickname || c.cardName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">결제 일시</label>
          <input
            type="datetime-local"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">가맹점명</label>
          <input
            type="text"
            placeholder="예: 스타벅스 강남점"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-soft)]">결제 금액 (원)</label>
          <input
            type="number"
            placeholder="0"
            value={krwAmount}
            onChange={(e) => setKrwAmount(e.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-[var(--text-soft)] transition hover:text-[var(--text-strong)]"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--accent)] px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
        >
          {isPending ? "등록 중..." : "결제 내역 등록"}
        </button>
      </div>
    </form>
  );
}
