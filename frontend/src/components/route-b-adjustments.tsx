"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionButton, Chip, MetricCard, Panel, TextAreaField, TextField } from "@/components/app-shell";
import type { PaymentAdjustment, PaymentAdjustmentsResponse } from "@/lib/cardwise-api";
import { formatCurrency, formatDateTime } from "@/lib/cardwise-api";

type AdjustmentsRouteProps = {
  initialPaymentId: string;
};

function differenceTone(value: number) {
  if (value > 0) return "emerald";
  if (value < 0) return "rose";
  return "slate";
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

export function RouteBAdjustments({ initialPaymentId }: AdjustmentsRouteProps) {
  const [paymentId, setPaymentId] = useState(initialPaymentId);
  const [adjustmentType, setAdjustmentType] = useState("FX_CORRECTION");
  const [originalKrwAmount, setOriginalKrwAmount] = useState("");
  const [adjustedKrwAmount, setAdjustedKrwAmount] = useState("");
  const [reason, setReason] = useState("");
  const [adjustments, setAdjustments] = useState<PaymentAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const sum = adjustments.reduce((acc, item) => acc + item.differenceAmount, 0);
    return { count: adjustments.length, totalDelta: sum };
  }, [adjustments]);

  async function load(currentPaymentId = paymentId) {
    if (!currentPaymentId) {
      setAdjustments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/payments/${encodeURIComponent(currentPaymentId)}/adjustments`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error(await response.text());

      const json = (await response.json()) as PaymentAdjustmentsResponse | { data?: unknown };
      const list = Array.isArray(json.data) ? json.data : [];
      setAdjustments(list as PaymentAdjustment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "조정 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(initialPaymentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAdjustment() {
    const original = Number(originalKrwAmount);
    const adjusted = Number(adjustedKrwAmount);
    if (!paymentId || Number.isNaN(original) || Number.isNaN(adjusted)) {
      setError("결제 ID, 원 금액, 조정 금액은 필수입니다.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/payments/${encodeURIComponent(paymentId)}/adjustments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adjustmentType,
          originalKrwAmount: original,
          adjustedKrwAmount: adjusted,
          reason,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      setOriginalKrwAmount("");
      setAdjustedKrwAmount("");
      setReason("");
      await load(paymentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "조정 내역을 생성하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="조정 생성" subtitle="환율 보정, 청구 할인, 수수료 조정을 앱형 입력 폼으로 단순하게 처리합니다." tone="minimal">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="결제 ID" value={paymentId} onChange={(event) => setPaymentId(event.target.value)} placeholder="1" />
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">조정 유형</span>
            <select value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value)} className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none">
              <option value="FX_CORRECTION">환율 보정</option>
              <option value="BILLING_DISCOUNT">청구 할인</option>
              <option value="PAYMENT_DEDUCTION">결제 차감</option>
              <option value="CARD_FEE">카드 수수료</option>
              <option value="OTHER">기타</option>
            </select>
          </label>
          <TextField label="원 금액" type="number" value={originalKrwAmount} onChange={(event) => setOriginalKrwAmount(event.target.value)} placeholder="58500" />
          <TextField label="조정 금액" type="number" value={adjustedKrwAmount} onChange={(event) => setAdjustedKrwAmount(event.target.value)} placeholder="57825" />
        </div>

        <TextAreaField
          label="사유"
          className="mt-4"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="USD 매입 전표 확정 환율 적용"
        />

        {error ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton kind="primary" onClick={createAdjustment} disabled={submitting}>
            {submitting ? "생성 중..." : "조정 생성"}
          </ActionButton>
          <ActionButton kind="secondary" onClick={() => load(paymentId)} disabled={loading}>
            {loading ? "불러오는 중..." : "목록 새로고침"}
          </ActionButton>
        </div>
      </Panel>

      <Panel title="조정 이력" subtitle="선택한 결제 기준의 실시간 조정 목록입니다." tone="minimal">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard label="결제" value={paymentId || "-"} helper="현재 조회 ID" />
            <MetricCard label="조정 건수" value={String(totals.count)} helper={`순 증감 ${formatCurrency(totals.totalDelta)}`} />
          </div>

          {adjustments.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              이 결제 ID에 대한 조정 내역이 없습니다.
            </div>
          ) : (
            adjustments.map((item) => (
              <article key={item.adjustmentId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_12px_24px_rgba(190,24,60,0.05)]">
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
                    <span>사유</span>
                    <span className="max-w-full text-right md:max-w-[18rem]">{item.reason ?? "-"}</span>
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
    </div>
  );
}
