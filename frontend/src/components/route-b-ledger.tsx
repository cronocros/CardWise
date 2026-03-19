import Link from "next/link";
import { Chip, MetricCard, Panel } from "@/components/app-shell";
import type { PendingAction, PaymentAdjustment } from "@/lib/cardwise-api";
import { formatCurrency, formatDateTime } from "@/lib/cardwise-api";

type LedgerHubProps = {
  pendingCount: number;
  pendingActions: PendingAction[];
  paymentId: string;
  adjustments: PaymentAdjustment[];
};

function priorityTone(priority: string) {
  if (priority === "HIGH") return "rose";
  if (priority === "MEDIUM") return "amber";
  return "emerald";
}

function differenceTone(value: number) {
  if (value > 0) return "emerald";
  if (value < 0) return "rose";
  return "slate";
}

export function LedgerHub({ pendingCount, pendingActions, paymentId, adjustments }: LedgerHubProps) {
  const recentActions = pendingActions.slice(0, 4);
  const recentAdjustments = adjustments.slice(0, 4);
  const totalDelta = adjustments.reduce((sum, item) => sum + item.differenceAmount, 0);

  return (
    <div className="grid gap-5">
      <section className="cw-stagger grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Ledger hub"
          subtitle="The ledger surface now acts as the control point for inbox review and payment adjustments."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Pending actions" value={String(pendingCount)} helper="Inbox queue depth" />
            <MetricCard label="Selected payment" value={paymentId || "-"} helper="Adjustment history lookup" />
            <MetricCard label="Net delta" value={formatCurrency(totalDelta)} helper="Recent adjustment total" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/inbox" className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              Open inbox
            </Link>
            <Link href={`/adjustments?paymentId=${encodeURIComponent(paymentId || "1")}`} className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              Review adjustments
            </Link>
            <Link href="/vouchers" className="cw-interactive-card rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)] hover:shadow-[var(--surface-shadow)]">
              Voucher workbench
            </Link>
          </div>
        </Panel>

        <Panel title="Route map" subtitle="Shortcuts to the surfaces that sit underneath the ledger workstream." tone="minimal">
          <div className="grid gap-3">
            <Link href="/inbox" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>Inbox review</span>
              <span className="text-[var(--text-muted)]">{pendingCount}</span>
            </Link>
            <Link href={`/adjustments?paymentId=${encodeURIComponent(paymentId || "1")}`} className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>Payment adjustments</span>
              <span className="text-[var(--text-muted)]">Open</span>
            </Link>
            <Link href="/performance/1" className="flex items-center justify-between rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)]">
              <span>Performance proofing</span>
              <span className="text-[var(--text-muted)]">Seeded</span>
            </Link>
          </div>
          <div className="mt-4 rounded-[20px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,rgba(255,241,242,.96),rgba(255,255,255,.96))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">Ledger note</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              Use this hub as the entry point for review-first flows. The visuals stay Blossom-like, while dense lists fall back to Minimal cards.
            </p>
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Pending actions" subtitle="A compact preview of the inbox queue, ordered for the most urgent work." tone="minimal">
          <div className="grid gap-3">
            {recentActions.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                No pending actions are available.
              </div>
            ) : (
              recentActions.map((item) => (
                <article key={item.pendingActionId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_10px_24px_rgba(190,24,60,0.05)]">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={priorityTone(item.priority)}>{item.priority}</Chip>
                    <Chip tone="slate">{item.actionType}</Chip>
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

        <Panel title="Adjustment history" subtitle="The selected payment snapshot keeps the adjustment workflow grounded." tone="minimal">
          <div className="grid gap-3">
            {recentAdjustments.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                No adjustments loaded for payment {paymentId || "-"}.
              </div>
            ) : (
              recentAdjustments.map((item) => (
                <article key={item.adjustmentId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_10px_24px_rgba(190,24,60,0.05)]">
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
                      <span>Created</span>
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
