import Link from "next/link";
import { AppShell, MetricCard, Panel } from "@/components/app-shell";
import { formatCurrency, tryFetchBackendJson, type GroupStatsEnvelope } from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function GroupStatsPage(props: PageProps<"/groups/[groupId]/stats">) {
  const { groupId } = await props.params;
  const currentMonth = new Date();
  const year = currentMonth.getFullYear();
  const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
  const from = `${year}-${month}-01`;
  const to = `${year}-${month}-31`;
  const statsResponse = await tryFetchBackendJson<GroupStatsEnvelope>(`/groups/${groupId}/stats?from=${from}&to=${to}`);
  const stats = statsResponse?.data ?? null;

  return (
    <AppShell
      active="ledger"
      eyebrow="그룹 통계"
      title={stats?.groupName ?? `그룹 #${groupId} 통계`}
      description="멤버별 지출, 태그별 지출, 월별 추이를 같은 기간 기준으로 보여줍니다."
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-3">
        <MetricCard label="총 지출" value={formatCurrency(stats?.totalSpent ?? 0)} helper={`${stats?.from ?? from} ~ ${stats?.to ?? to}`} />
        <MetricCard label="결제 건수" value={`${stats?.paymentCount ?? 0}건`} helper="선택 기간 기준" />
        <MetricCard label="멤버 수" value={String(stats?.memberStats.length ?? 0)} helper="통계 포함 멤버" />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="멤버별 지출" subtitle="멤버별 합계와 비중을 함께 보여줍니다.">
          <div className="grid gap-3">
            {(stats?.memberStats ?? []).map((member) => (
              <article key={member.accountId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[var(--text-strong)]">{member.displayName}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{member.paymentCount}건 결제</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(member.spentAmount)}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{member.sharePercent}%</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="태그별 지출" subtitle="그룹 결제에 부착된 태그 기준 상위 10개를 보여줍니다.">
          <div className="grid gap-3">
            {(stats?.tagStats ?? []).map((tag) => (
              <article key={tag.tagName} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[var(--text-strong)]">{tag.tagName}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{tag.paymentCount}건 결제</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(tag.spentAmount)}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{tag.sharePercent}%</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="월별 추이" subtitle="최근 6개월 그룹 지출 합계를 간단히 확인합니다." tone="minimal">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(stats?.monthlyTrend ?? []).map((point) => (
            <article key={point.yearMonth} className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
              <div className="text-sm font-medium text-[var(--text-muted)]">{point.yearMonth}</div>
              <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(point.totalSpent)}</div>
              <div className="mt-1 text-sm text-[var(--text-muted)]">{point.paymentCount}건</div>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/groups/${groupId}/payments`} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">결제 목록</Link>
          <Link href="/groups" className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">그룹 목록</Link>
        </div>
      </Panel>
    </AppShell>
  );
}
