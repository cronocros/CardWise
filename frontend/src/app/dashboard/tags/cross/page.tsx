import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { DashboardFilterSummary } from "@/components/dashboard/analytics-panels";
import {
  formatCurrency,
  tryFetchBackendJson,
  type DashboardTagCrossResponse,
  type DashboardTagSummaryResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

type CrossType = "category" | "period" | "tag";

function normalizeCrossType(value: string | undefined): CrossType {
  if (value === "period" || value === "tag") {
    return value;
  }
  return "category";
}

function crossTypeLabel(value: CrossType) {
  if (value === "period") return "태그×기간";
  if (value === "tag") return "태그×태그";
  return "태그×카테고리";
}

function readTagIds(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => entry.split(","))
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry) && entry > 0);
  }

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry) && entry > 0);
}

function queryFor(type: CrossType, tagIds: number[]) {
  const params = new URLSearchParams({ type });
  for (const tagId of tagIds) {
    params.append("tagIds", String(tagId));
  }
  return params.toString();
}

export default async function DashboardTagsCrossPage(props: {
  searchParams: Promise<{ type?: string; tagIds?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
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
  const requestedType = normalizeCrossType(searchParams.type);
  const requestedTagIds = readTagIds(searchParams.tagIds);
  const defaultTagIds =
    requestedType === "tag"
      ? tagItems.slice(0, 2).map((item) => item.tagId)
      : tagItems.slice(0, 1).map((item) => item.tagId);
  const selectedTagIds = (requestedTagIds.length > 0 ? requestedTagIds : defaultTagIds).slice(
    0,
    requestedType === "tag" ? 2 : 1,
  );
  const crossResponse =
    selectedTagIds.length > 0
      ? await tryFetchBackendJson<DashboardTagCrossResponse>(
          `/tags/stats/cross?${queryFor(requestedType, selectedTagIds)}&from=${monthStart}&to=${monthEnd}`,
        )
      : null;
  const crossData = crossResponse?.data ?? null;
  const maxAmount = Math.max(...(crossData?.breakdown.map((item) => item.amount) ?? [0]), 1);
  const firstTag = tagItems[0]?.tagId;
  const secondTag = tagItems[1]?.tagId;

  return (
    <AppShell
      active="dashboard"
      eyebrow="태그 교차 분석"
      title="태그 교차 분석"
      description="태그 통계에서 한 단계 더 들어가 카테고리, 기간, 태그 교집합 기준으로 지출을 읽는 분석 화면입니다."
      actions={
        <>
          <Link
            href="/dashboard/tags"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            태그 통계
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            홈으로
          </Link>
        </>
      }
    >
      <DashboardFilterSummary activeLabel={crossTypeLabel(requestedType)} rangeLabel={`${yearMonthLabel} 기준 · 개인 가계부`} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="분석 유형" value={crossTypeLabel(requestedType)} helper="대시보드 F8/TAG" />
        <MetricCard
          label="선택 태그"
          value={crossData?.selectedTags.map((item) => item.tagName).join(", ") || "-"}
          helper={`${crossData?.selectedTags.length ?? 0}개 선택`}
        />
        <MetricCard label="지출 합계" value={formatCurrency(crossData?.totalSpent)} helper="선택 교차 조건 기준" />
        <MetricCard label="매칭 건수" value={`${crossData?.paymentCount ?? 0}건`} helper="품목 기준" />
      </section>

      <Panel title="분석 모드" subtitle="명세의 교차 분석 셀렉터를 링크형 토글로 먼저 반영했습니다.">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/tags/cross?${queryFor("category", selectedTagIds.slice(0, 1))}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              requestedType === "category"
                ? "border-[var(--surface-border)] bg-[var(--accent)] text-white"
                : "border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]"
            }`}
          >
            태그×카테고리
          </Link>
          <Link
            href={`/dashboard/tags/cross?${queryFor("period", selectedTagIds.slice(0, 1))}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              requestedType === "period"
                ? "border-[var(--surface-border)] bg-[var(--accent)] text-white"
                : "border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]"
            }`}
          >
            태그×기간
          </Link>
          {firstTag && secondTag ? (
            <Link
              href={`/dashboard/tags/cross?${queryFor("tag", [firstTag, secondTag])}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                requestedType === "tag"
                  ? "border-[var(--surface-border)] bg-[var(--accent)] text-white"
                  : "border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              태그×태그
            </Link>
          ) : null}
          <Chip tone="slate">그룹 멤버 교차는 그룹 가계부 구현 시 확장</Chip>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Panel title="선택 가능한 태그" subtitle="상위 태그를 한 번 더 눌러 단일 태그 기준으로 분석을 좁힐 수 있습니다.">
          <div className="flex flex-wrap gap-2">
            {tagItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                태그 집계가 없어 교차 분석을 시작하지 못했습니다.
              </div>
            ) : (
              tagItems.map((item) => (
                <Link
                  key={item.tagId}
                  href={`/dashboard/tags/cross?${queryFor(requestedType, requestedType === "tag" ? [item.tagId, secondTag ?? item.tagId] : [item.tagId])}`}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedTagIds.includes(item.tagId)
                      ? "border-[var(--surface-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  {item.tagName}
                </Link>
              ))
            )}
          </div>
        </Panel>

        <Panel title="교차 분석 결과" subtitle="현재는 카테고리, 기간, 태그 교집합 기준을 우선 제공하고 결과가 없으면 비어 있는 상태를 명시합니다.">
          <div className="grid gap-3">
            {crossData?.breakdown.length ? (
              crossData.breakdown.map((item) => (
                <article
                  key={`${crossData.crossType}-${item.label}`}
                  className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                        {crossTypeLabel(requestedType)}
                      </div>
                      <div className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                        {item.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[var(--text-strong)]">{formatCurrency(item.amount)}</div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">{item.paymentCount}건</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                    <div
                      className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
                      style={{ width: `${Math.max(10, Math.round((item.amount / maxAmount) * 100))}%` }}
                    />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                선택한 조건에 해당하는 교차 분석 데이터가 없습니다.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
