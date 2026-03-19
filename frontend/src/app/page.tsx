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
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const seededUserCardIds = [1, 2, 3, 4];

export default async function Home() {
  const [pendingCountResponse, pendingResponse, performanceResults] =
    await Promise.all([
      tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
      tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=4"),
      Promise.all(
        seededUserCardIds.map(async (userCardId) => ({
          userCardId,
          result: await tryFetchBackendJson<PerformanceResponse>(
            `/cards/${userCardId}/performance`,
          ),
        })),
      ),
    ]);

  const pendingCount = getPendingCount(pendingCountResponse);
  const pendingItems = pendingResponse?.data ?? [];
  const loadedCards = performanceResults.filter((item) => item.result !== null);

  return (
    <AppShell
      active="home"
      eyebrow="CardWise Control Surface"
      title="Live ledger, performance, and inbox view"
      description="The frontend now surfaces the same operational flow as the docs: inbox work, payment adjustments, and performance tracking all sit behind the BFF layer."
      actions={
        <>
          <Link
            href="/inbox"
            className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:bg-emerald-300/25"
          >
            Open inbox
          </Link>
          <Link
            href="/adjustments"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            Create adjustment
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Pending actions" value={String(pendingCount)} helper="Badge count via BFF" />
        <MetricCard label="Open items" value={String(pendingItems.length)} helper="Visible on this snapshot" />
        <MetricCard label="Seed cards" value={String(loadedCards.length)} helper="Seeded performance probes" />
        <MetricCard label="Backend base" value="8080/api/v1" helper="Default fallback target" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <Panel title="Quick links" subtitle="Jump straight into the work areas that matter now.">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inbox"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Inbox / pending actions
            </Link>
            <Link
              href="/adjustments"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Payment adjustments
            </Link>
            {seededUserCardIds.map((id) => (
              <Link
                key={id}
                href={`/performance/${id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Performance #{id}
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip tone="emerald">BFF enabled</Chip>
            <Chip tone="amber">Seeded data ready</Chip>
            <Chip tone="rose">Resolve / dismiss actions</Chip>
          </div>
        </Panel>

        <Panel title="Pending work" subtitle="Top unresolved items from the linked project.">
          <div className="grid gap-3">
            {pendingItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
                No pending items loaded from the backend yet.
              </div>
            ) : (
              pendingItems.map((item) => (
                <article key={item.pendingActionId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={item.priority === "HIGH" ? "rose" : item.priority === "MEDIUM" ? "amber" : "emerald"}>
                      {item.priority}
                    </Chip>
                    <Chip tone="slate">{item.actionType}</Chip>
                    <Chip tone="slate">{item.status}</Chip>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{item.referenceTable ?? "-"}</span>
                    <span>#{item.referenceId ?? "-"}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Performance snapshots" subtitle="Seeded cards help you verify the annual basis, lag, and grace period rules.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {performanceResults.map(({ userCardId, result }) => {
            const data = result?.data;
            return (
              <Link
                key={userCardId}
                href={`/performance/${userCardId}`}
                className="rounded-[22px] border border-white/10 bg-white/5 p-4 transition hover:border-emerald-300/30 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      User card #{userCardId}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {data?.cardName ?? "Performance unavailable"}
                    </div>
                  </div>
                  <Chip tone={data?.specialPeriod?.active ? "emerald" : "slate"}>
                    {data?.specialPeriod?.active ? "Special" : "Normal"}
                  </Chip>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <span>Annual</span>
                    <span>{formatCurrency(data?.annual?.accumulated)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Tier</span>
                    <span>{data?.annual?.currentTier?.tierName ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Lag</span>
                    <span>{data?.benefitQualification?.periodLagLabel ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Grace</span>
                    <span>{data?.benefitQualification?.gracePeriod?.active ? "Active" : "Off"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>
    </AppShell>
  );
}
