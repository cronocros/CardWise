import Link from "next/link";
import { AppShell, MetricCard, Panel } from "@/components/app-shell";
import { DashboardFilterSummary, TagRanking } from "@/components/dashboard/analytics-panels";
import {
  formatCurrency,
  formatPercent,
  tryFetchBackendJson,
  type DashboardTagSummaryResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function DashboardTagsPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearMonthLabel = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const monthStart = `${yearMonthLabel}-01`;
  const monthEnd = `${yearMonthLabel}-31`;

  const tagResponse = await tryFetchBackendJson<DashboardTagSummaryResponse>(
    `/tags/stats?from=${monthStart}&to=${monthEnd}`,
  );
  const tagItems = tagResponse?.data ?? [];
  const totalSpent = tagItems.reduce((sum, item) => sum + item.spentAmount, 0);
  const totalCount = tagItems.reduce((sum, item) => sum + item.paymentCount, 0);
  const topTag = tagItems[0] ?? null;

  return (
    <AppShell
      active="dashboard"
      eyebrow="태그 분석"
      title="태그 통계"
      description="대시보드의 태그 랭킹을 별도 화면으로 분리해, 상위 태그 지출과 건수를 더 길게 읽도록 정리했습니다."
      actions={
        <>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            홈으로
          </Link>
          <Link
            href="/dashboard/tags/cross"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            교차 분석
          </Link>
        </>
      }
    >
      <DashboardFilterSummary activeLabel="태그 통계" rangeLabel={`${yearMonthLabel} 기준 · 개인 가계부`} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="표시 태그" value={`${tagItems.length}개`} helper="상위 지출 순" />
        <MetricCard label="총 태그 지출" value={formatCurrency(totalSpent)} helper="이번 달 합계" />
        <MetricCard label="총 결제 건수" value={`${totalCount}건`} helper="태그가 달린 품목 기준" />
        <MetricCard label="리드 태그" value={topTag?.tagName ?? "-"} helper={topTag ? formatPercent(topTag.sharePercent) : "데이터 없음"} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <Panel
          title="상위 태그 랭킹"
          subtitle="F8/TAG 명세 기준으로 태그별 총 지출, 건수, 비율을 한 화면에서 읽을 수 있게 구성했습니다."
        >
          <TagRanking items={tagItems} />
        </Panel>

        <Panel
          title="태그 상세 목록"
          subtitle="명세의 태그 통계 화면처럼 목록과 액션을 함께 제공해 교차 분석으로 이어지게 만들었습니다."
        >
          <div className="grid gap-3">
            {tagItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                태그 집계가 아직 없어 상세 목록을 표시하지 못했습니다.
              </div>
            ) : (
              tagItems.map((item) => (
                <article
                  key={item.tagId}
                  className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                        태그 #{item.tagId}
                      </div>
                      <div className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                        {item.tagName}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/tags/cross?type=category&tagIds=${item.tagId}`}
                      className="rounded-full border border-[var(--surface-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:bg-white"
                    >
                      교차 분석
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">지출</div>
                      <div className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{formatCurrency(item.spentAmount)}</div>
                    </div>
                    <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">건수</div>
                      <div className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{item.paymentCount}건</div>
                    </div>
                    <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">비중</div>
                      <div className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{formatPercent(item.sharePercent)}</div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
