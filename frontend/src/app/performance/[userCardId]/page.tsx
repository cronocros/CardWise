import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import {
  formatCurrency,
  formatPercent,
  tryFetchBackendJson,
  type PerformanceResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

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
      eyebrow="Performance tracking"
      title={`Card performance for user card #${userCardId}`}
      description="Annual basis, benefit lag, grace period, and special period state are all surfaced from the backend contract."
      actions={seededIds.map((id) => (
        <Link
          key={id}
          href={`/performance/${id}`}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          #{id}
        </Link>
      ))}
    >
      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Card" value={data.cardName} helper={`User card ${data.userCardId}`} />
            <MetricCard label="Annual" value={formatCurrency(data.annual?.accumulated)} helper={data.annual?.currentTier?.tierName ?? "-"} />
            <MetricCard label="Lag" value={data.benefitQualification?.periodLagLabel ?? "-"} helper={data.benefitQualification?.referenceMonth ?? "-"} />
            <MetricCard label="Special" value={data.specialPeriod?.active ? "Active" : "Off"} helper={data.specialPeriod?.name ?? "-"} />
          </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
            <Panel title="Performance summary" subtitle="The response should line up with the documented annual basis and monthly lag rules.">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Annual period</div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-300">
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
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Benefit qualification</div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-300">
                    <div className="flex justify-between gap-4">
                      <span>Reference month</span>
                      <span>{data.benefitQualification?.referenceMonth ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Qualified tier</span>
                      <span>{data.benefitQualification?.qualifiedTierName ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Grace period</span>
                      <span>{data.benefitQualification?.gracePeriod?.active ? "Active" : "Off"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={data.specialPeriod?.active ? "emerald" : "slate"}>
                    {data.specialPeriod?.active ? "Special period" : "Normal period"}
                  </Chip>
                  <Chip tone="slate">{data.annualPeriod?.basis ?? "-"}</Chip>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <span>Current month</span>
                    <span>{data.currentMonth?.yearMonth ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Monthly spent</span>
                    <span>{formatCurrency(data.currentMonth?.monthlySpent)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Previous month</span>
                    <span>{formatCurrency(data.currentMonth?.previousMonthSpent)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Change</span>
                    <span>{formatPercent(data.currentMonth?.changeRate)}</span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Monthly breakdown" subtitle="Use this to verify the seeded card history and annual accumulation path.">
              <div className="grid gap-3">
                {(data.monthlyBreakdown ?? []).map((entry) => (
                  <div
                    key={entry.yearMonth}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">{entry.yearMonth}</span>
                    <span className="text-sm font-medium text-white">{formatCurrency(entry.spent)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Annual accumulated</span>
                  <span>{formatCurrency(data.annual?.accumulated)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Next tier</span>
                  <span>{data.annual?.nextTier?.tierName ?? "-"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Remaining</span>
                  <span>{formatCurrency(data.annual?.nextTier?.remainingAmount)}</span>
                </div>
              </div>
            </Panel>
          </div>

          <Panel
            title="Voucher unlock conditions"
            subtitle="Unlock state is derived from card_voucher.unlock_conditions and the current annual performance."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {data.voucherUnlocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400 md:col-span-2">
                  No voucher unlock rules are configured for this card.
                </div>
              ) : (
                data.voucherUnlocks.map((voucher) => (
                  <article
                    key={voucher.voucherName}
                    className="rounded-[22px] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-white">{voucher.voucherName}</div>
                        <div className="mt-1 text-sm text-slate-300">{voucher.notes ?? "No extra notes"}</div>
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
                    <div className="mt-4 grid gap-2 text-sm text-slate-300">
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
                        <span>
                          {voucher.remainingCount ?? "-"} / {voucher.totalCount ?? "-"}
                        </span>
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
          <div className="grid gap-3 md:grid-cols-4">
            {seededIds.map((id) => (
              <Link
                key={id}
                href={`/performance/${id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition hover:bg-white/10"
              >
                Seeded card #{id}
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
