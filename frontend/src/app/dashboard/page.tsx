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
      eyebrow="App Home"
      title="CardWise home"
      description="A soft Rose Blossom control surface that keeps inbox work, card performance, and voucher review on one mobile-first landing screen."
      actions={
        <>
          <Link
            href="/inbox"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            Open inbox
          </Link>
          <Link
            href="/cards"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            Card deck
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending actions" value={String(pendingCount)} helper="BFF badge count" />
        <MetricCard label="Active vouchers" value={String(activeVouchers.length)} helper="Current live list" />
        <MetricCard label="Expiring soon" value={String(expiringVouchers.length)} helper="D-7 review window" />
        <MetricCard label="Cards tracked" value={String(cards.length)} helper="Seeded performance snapshots" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Command strip" subtitle="The home surface keeps the next work right at the top.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Active cards</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{cards.length}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Deck ready for performance review</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Annual total</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{formatCurrency(annualTotal)}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Combined accumulated spend</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Special periods</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{specialCount}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Cards in a boosted window</div>
            </div>
            <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Grace active</div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{graceCount}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Qualification grace period</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone="rose">Rose Blossom</Chip>
            <Chip tone="amber">App-first</Chip>
            <Chip tone="slate">390px baseline</Chip>
            <Chip tone="emerald">BFF live</Chip>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/ledger" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Ledger</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Open the hub</div>
            </Link>
            <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Cards</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Review the deck</div>
            </Link>
            <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Adjustments</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Settle corrections</div>
            </Link>
            <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Vouchers</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Review unlocks</div>
            </Link>
          </div>
        </Panel>

        <Panel title="Top card" subtitle="The largest accumulated card is promoted as the primary action target.">
          {topCard ? (
            <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Leading card</div>
                  <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{topCard.data.cardName}</div>
                </div>
                <Chip tone={topCard.data.specialPeriod?.active ? "emerald" : "slate"}>
                  {topCard.data.specialPeriod?.active ? "Special" : "Normal"}
                </Chip>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Annual accumulated</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{formatCurrency(topCard.data.annual?.accumulated)}</div>
                </div>
                <div className="rounded-[20px] bg-[var(--surface-soft)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Current tier</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{topCard.data.annual?.currentTier?.tierName ?? "Unrated"}</div>
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
                  <span>Reference month</span>
                  <span>{topCard.data.benefitQualification?.referenceMonth ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Next tier</span>
                  <span>{topCard.data.annual?.nextTier?.tierName ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Grace period</span>
                  <span>{topCard.data.benefitQualification?.gracePeriod?.active ? "Active" : "Off"}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/performance/${topCard.userCardId}`} className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]">
                  Open performance
                </Link>
                <Link href="/cards" className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">
                  Compare cards
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] p-6 text-sm text-[var(--text-muted)]">
              Card performance is not available yet.
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Pending work" subtitle="Surface the unresolved queue without leaving home.">
          <div className="grid gap-3">
            {pendingItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                No pending actions loaded from the backend yet.
              </div>
            ) : (
              pendingItems.map((item) => (
                <article key={item.pendingActionId} className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={item.priority === "HIGH" ? "rose" : item.priority === "MEDIUM" ? "amber" : "emerald"}>{item.priority}</Chip>
                    <Chip tone="slate">{item.actionType}</Chip>
                    <Chip tone="slate">{item.status}</Chip>
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

        <Panel title="Need-to-know links" subtitle="Keep the operational paths one tap away.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/inbox" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Inbox</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Resolve pending actions</div>
            </Link>
            <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Adjustments</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Settle payment corrections</div>
            </Link>
            <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Cards</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Compare card performance</div>
            </Link>
            <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Vouchers</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Review unlock state</div>
            </Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
