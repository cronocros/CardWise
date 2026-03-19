import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import {
  formatCurrency,
  formatPercent,
  tryFetchBackendJson,
  type PerformanceResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

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

function tierLabel(value: PerformanceResponse["data"]) {
  return value.annual?.currentTier?.tierName ?? "Unrated";
}

export default async function PerformancePage(props: PageProps<"/performance/[userCardId]">) {
  const { userCardId } = await props.params;
  const response = await tryFetchBackendJson<PerformanceResponse>(
    `/cards/${encodeURIComponent(userCardId)}/performance`,
  );
  const data = response?.data;
  const seededIds = [1, 2, 3, 4];

  return (
    <AppShell
      active="performance"
      eyebrow="Performance detail"
      title={data ? `${data.cardName}` : `User card #${userCardId}`}
      description="This card detail keeps the backend contract intact while presenting the annual basis, monthly lag, grace period, and voucher unlock state in a denser app layout."
      actions={seededIds.map((id) => (
        <Link
          key={id}
          href={`/performance/${id}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            String(id) === String(userCardId)
              ? "border-[var(--surface-border)] bg-[var(--accent)] text-white"
              : "border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]"
          }`}
        >
          #{id}
        </Link>
      ))}
    >
      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Annual accumulated" value={formatCurrency(data.annual?.accumulated)} helper={tierLabel(data)} />
            <MetricCard label="Current month" value={data.currentMonth?.yearMonth ?? "-"} helper={formatCurrency(data.currentMonth?.monthlySpent)} />
            <MetricCard label="Grace period" value={data.benefitQualification?.gracePeriod?.active ? "Active" : "Off"} helper={data.benefitQualification?.referenceMonth ?? "-"} />
            <MetricCard label="Special period" value={data.specialPeriod?.active ? "On" : "Off"} helper={data.specialPeriod?.name ?? "-"} />
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Panel title="Performance summary" subtitle="The card detail sits in the app shell now, so it reads like a task surface rather than a standalone report.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Annual period</div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)]">
                    <div className="flex justify-between gap-4">
                      <span>From</span>
                      <span>{data.annualPeriod?.from ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>To</span>
                      <span>{data.annualPeriod?.to ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Basis</span>
                      <span>{data.annualPeriod?.basis ?? "-"}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">Benefit qualification</div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)]">
                    <div className="flex justify-between gap-4">
                      <span>Reference month</span>
                      <span>{data.benefitQualification?.referenceMonth ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Qualified tier</span>
                      <span>{data.benefitQualification?.qualifiedTierName ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Period lag</span>
                      <span>{data.benefitQualification?.periodLagLabel ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Grace period</span>
                      <span>{data.benefitQualification?.gracePeriod?.active ? "Active" : "Off"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={data.specialPeriod?.active ? "emerald" : "slate"}>
                    {data.specialPeriod?.active ? "Special period" : "Normal period"}
                  </Chip>
                  <Chip tone="rose">{data.currentMonth?.yearMonth ?? "-"}</Chip>
                  <Chip tone="amber">{data.benefitQualification?.periodLagLabel ?? "Lag -"}</Chip>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                    style={{ width: `${progressFor(data)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>Monthly spent</span>
                  <span>{formatCurrency(data.currentMonth?.monthlySpent)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>Previous month</span>
                  <span>{formatCurrency(data.currentMonth?.previousMonthSpent)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>Change</span>
                  <span>{formatPercent(data.currentMonth?.changeRate)}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Home</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Back to dashboard</div>
                </Link>
                <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Cards</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Compare the deck</div>
                </Link>
                <Link href="/inbox" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Inbox</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Review pending actions</div>
                </Link>
                <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">Adjustments</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">Open correction flow</div>
                </Link>
              </div>
            </Panel>

            <Panel title="Monthly breakdown" subtitle="Use this to verify the seeded card history and annual accumulation path.">
              <div className="grid gap-3">
                {(data.monthlyBreakdown ?? []).map((entry) => (
                  <div
                    key={entry.yearMonth}
                    className="flex items-center justify-between rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-3"
                  >
                    <span className="text-sm text-[var(--text-muted)]">{entry.yearMonth}</span>
                    <span className="text-sm font-medium text-[var(--text-strong)]">{formatCurrency(entry.spent)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>Annual accumulated</span>
                  <span>{formatCurrency(data.annual?.accumulated)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>Current tier</span>
                  <span>{data.annual?.currentTier?.tierName ?? "-"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>Next tier</span>
                  <span>{data.annual?.nextTier?.tierName ?? "-"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>Remaining</span>
                  <span>{formatCurrency(data.annual?.nextTier?.remainingAmount)}</span>
                </div>
              </div>
            </Panel>
          </div>

          <Panel
            title="Voucher unlock conditions"
            subtitle="Unlock state is derived from the card voucher rules and the current annual performance."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {data.voucherUnlocks.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)] md:col-span-2">
                  No voucher unlock rules are configured for this card.
                </div>
              ) : (
                data.voucherUnlocks.map((voucher) => (
                  <article
                    key={voucher.voucherName}
                    className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold tracking-[-0.03em] text-[var(--text-strong)]">{voucher.voucherName}</div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">{voucher.notes ?? "No extra notes"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          tone={
                            voucher.unlockState === "UNLOCKED"
                              ? "emerald"
                              : voucher.unlockState === "ELIGIBLE"
                                ? "amber"
                                : "rose"
                          }
                        >
                          {voucher.unlockState}
                        </Chip>
                        <Chip tone="slate">{voucher.unlockType}</Chip>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                      <div className="flex justify-between gap-4">
                        <span>Annual requirement</span>
                        <span>{formatCurrency(voucher.requiredAnnualPerformance)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Current annual</span>
                        <span>{formatCurrency(voucher.currentAnnualPerformance)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Remaining to unlock</span>
                        <span>{formatCurrency(voucher.remainingAmount)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Available at</span>
                        <span>{voucher.availableAt ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Remaining / total</span>
                        <span>{voucher.remainingCount ?? "-"} / {voucher.totalCount ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Valid until</span>
                        <span>{voucher.validUntil ?? "-"}</span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </>
      ) : (
        <Panel
          title="Performance unavailable"
          subtitle="The backend endpoint did not return data yet. Check the seeded user card ids or bring the backend up."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {seededIds.map((id) => (
              <Link
                key={id}
                href={`/performance/${id}`}
                className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]"
              >
                Seeded card #{id}
              </Link>
            ))}
            <Link href="/dashboard" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]">
              Back to dashboard
            </Link>
            <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]">
              Open card deck
            </Link>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}