import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
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

  return (
    <AppShell
      active="cards"
      eyebrow="Card deck"
      title="Cards and performance"
      description="This is the app-first card surface: a compact deck of seeded performance snapshots with quick paths into performance detail, inbox triage, and voucher checks."
      actions={
        <>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            Back to home
          </Link>
          <Link
            href={bestCard ? `/performance/${bestCard.userCardId}` : "/performance/1"}
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            Open top card
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tracked cards" value={String(cards.length)} helper="Seeded performance snapshots" />
        <MetricCard label="Annual total" value={formatCurrency(annualTotal)} helper="Combined accumulated spend" />
        <MetricCard label="Monthly avg" value={formatCurrency(averageMonthly)} helper="Current month average" />
        <MetricCard label="Special / grace" value={`${specialCount}/${graceCount}`} helper="Boosted window / grace window" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Card deck" subtitle="Each card acts like a tappable app tile. Use the detail view to inspect tier thresholds, monthly breakdowns, and voucher unlocks.">
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card, index) => (
              <Link
                key={card.userCardId}
                href={`/performance/${card.userCardId}`}
                className="group rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(190,24,60,0.12)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">User card #{card.userCardId}</div>
                    <div className="mt-2 text-[20px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{card.data.cardName}</div>
                  </div>
                  <Chip tone={card.data.specialPeriod?.active ? "emerald" : "slate"}>
                    {card.data.specialPeriod?.active ? "Special" : "Normal"}
                  </Chip>
                </div>

                <div className="mt-4 rounded-[20px] bg-[linear-gradient(135deg,var(--primary-50),#fff)] p-4">
                  <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                    <span>Annual accumulated</span>
                    <span>{formatCurrency(card.data.annual?.accumulated)}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                      style={{ width: `${progressFor(card.data)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[var(--text-soft)]">
                    <span>{card.data.annual?.currentTier?.tierName ?? "Unrated"}</span>
                    <span>{card.data.annual?.nextTier?.tierName ?? "Top tier"}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Current month</span>
                    <span>{card.data.currentMonth?.yearMonth ?? "-"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Monthly spent</span>
                    <span>{formatCurrency(card.data.currentMonth?.monthlySpent)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Change</span>
                    <span>{formatPercent(card.data.currentMonth?.changeRate)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="rose">#{index + 1}</Chip>
                  <Chip tone="slate">{card.data.benefitQualification?.periodLagLabel ?? "Lag -"}</Chip>
                  <Chip tone="amber">{card.data.benefitQualification?.gracePeriod?.active ? "Grace" : "No grace"}</Chip>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Review routes" subtitle="The deck keeps the rest of the app close by so the card flow feels like one continuous task surface.">
          <div className="grid gap-3">
            <Link href="/dashboard" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Home</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Return to the dashboard</div>
            </Link>
            <Link href="/inbox" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Inbox</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Resolve queued actions</div>
            </Link>
            <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Adjustments</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Settle payment corrections</div>
            </Link>
            <Link href="/vouchers" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Vouchers</div>
              <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Inspect unlock conditions</div>
            </Link>
          </div>

          {bestCard ? (
            <div className="mt-4 rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Leading card</div>
              <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{bestCard.data.cardName}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{formatCurrency(bestCard.data.annual?.accumulated)} accumulated, {bestCard.data.specialPeriod?.active ? "special period active" : "normal period"}.</div>
            </div>
          ) : null}
        </Panel>
      </div>
    </AppShell>
  );
}