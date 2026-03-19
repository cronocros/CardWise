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
      setError(err instanceof Error ? err.message : "Failed to load adjustments");
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
      setError("Payment ID, original amount, and adjusted amount are required.");
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
      setError(err instanceof Error ? err.message : "Failed to create adjustment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Create adjustment" subtitle="FX correction, billing discount, and fee adjustments stay on a simple app-first form." tone="minimal">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Payment ID" value={paymentId} onChange={(event) => setPaymentId(event.target.value)} placeholder="1" />
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">Adjustment type</span>
            <select value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value)} className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none">
              <option value="FX_CORRECTION">FX_CORRECTION</option>
              <option value="BILLING_DISCOUNT">BILLING_DISCOUNT</option>
              <option value="PAYMENT_DEDUCTION">PAYMENT_DEDUCTION</option>
              <option value="CARD_FEE">CARD_FEE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
          <TextField label="Original KRW" type="number" value={originalKrwAmount} onChange={(event) => setOriginalKrwAmount(event.target.value)} placeholder="58500" />
          <TextField label="Adjusted KRW" type="number" value={adjustedKrwAmount} onChange={(event) => setAdjustedKrwAmount(event.target.value)} placeholder="57825" />
        </div>

        <TextAreaField
          label="Reason"
          className="mt-4"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="USD 매입 전표 확정 환율 적용"
        />

        {error ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton kind="primary" onClick={createAdjustment} disabled={submitting}>
            {submitting ? "Creating..." : "Create adjustment"}
          </ActionButton>
          <ActionButton kind="secondary" onClick={() => load(paymentId)} disabled={loading}>
            {loading ? "Loading..." : "Refresh list"}
          </ActionButton>
        </div>
      </Panel>

      <Panel title="Adjustment history" subtitle="Live list for the selected payment." tone="minimal">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard label="Payment" value={paymentId || "-"} helper="Current lookup id" />
            <MetricCard label="Adjustments" value={String(totals.count)} helper={`Net delta ${formatCurrency(totals.totalDelta)}`} />
          </div>

          {adjustments.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              No adjustments found for this payment id.
            </div>
          ) : (
            adjustments.map((item) => (
              <article key={item.adjustmentId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_12px_24px_rgba(190,24,60,0.05)]">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={differenceTone(item.differenceAmount)}>{formatCurrency(item.differenceAmount)}</Chip>
                  <Chip tone="slate">{item.adjustmentType}</Chip>
                  <Chip tone="slate">#{item.adjustmentId}</Chip>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-[var(--text-body)]">
                  <div className="flex justify-between gap-4">
                    <span>Original</span>
                    <span>{formatCurrency(item.originalKrwAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Adjusted</span>
                    <span>{formatCurrency(item.adjustedKrwAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Reason</span>
                    <span className="max-w-full text-right md:max-w-[18rem]">{item.reason ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Created</span>
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
