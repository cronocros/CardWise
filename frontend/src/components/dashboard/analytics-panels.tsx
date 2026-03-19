import { formatCurrency, formatPercent } from "@/lib/cardwise-api";

type CategoryItem = {
  categoryId: number;
  categoryName: string;
  spentAmount: number;
  benefitAmount: number;
  paymentCount: number;
  sharePercent: number;
};

type TagItem = {
  tagId: number;
  tagName: string;
  spentAmount: number;
  paymentCount: number;
  sharePercent: number;
};

type TrendPoint = {
  yearMonth: string;
  totalSpent: number;
  totalBenefit: number;
  paymentCount: number;
};

const donutPalette = ["#fb7185", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#14b8a6", "#94a3b8"];
const tagPalette = ["#fb7185", "#f97316", "#f59e0b", "#10b981", "#3b82f6"];

export function DashboardFilterSummary({
  activeLabel,
  rangeLabel,
  scopeLabel = "개인 가계부",
}: {
  activeLabel: string;
  rangeLabel: string;
  scopeLabel?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">대시보드 기준</div>
          <div className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">{activeLabel}</div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">{rangeLabel}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-[var(--surface-border-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)]">
            이번 달
          </span>
          <span className="inline-flex rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-soft)]">
            이번 주
          </span>
          <span className="inline-flex rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-soft)]">
            커스텀
          </span>
          <span className="inline-flex rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--text-muted)]">
            {scopeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CategoryDonut({
  items,
}: {
  items: CategoryItem[];
}) {
  if (items.length === 0) {
    return <EmptyDashboardState message="카테고리 집계가 없어 도넛 차트를 아직 그리지 못했습니다." />;
  }

  const gradient = buildConicGradient(items.map((item) => item.sharePercent));

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
      <div className="mx-auto flex w-full max-w-[220px] items-center justify-center">
        <div
          className="relative h-[190px] w-[190px] rounded-full"
          style={{ background: gradient }}
        >
          <div className="absolute inset-[18px] rounded-full bg-white/95 shadow-[inset_0_0_0_1px_var(--surface-border)]">
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">카테고리</div>
              <div className="text-[26px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">{items.length}</div>
              <div className="text-sm text-[var(--text-muted)]">상위 지출 분포</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={item.categoryId}
            className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: donutPalette[index % donutPalette.length] }}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--text-strong)]">{item.categoryName}</div>
                  <div className="text-xs text-[var(--text-muted)]">{item.paymentCount}건 · 혜택 {formatCurrency(item.benefitAmount)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[var(--text-strong)]">{formatCurrency(item.spentAmount)}</div>
                <div className="text-xs text-[var(--text-muted)]">{formatPercent(item.sharePercent)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TagRanking({
  items,
}: {
  items: TagItem[];
}) {
  if (items.length === 0) {
    return <EmptyDashboardState message="태그 집계가 없어 랭킹을 표시하지 못했습니다." />;
  }

  const maxValue = Math.max(...items.map((item) => item.spentAmount), 1);

  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const width = Math.max(10, Math.round((item.spentAmount / maxValue) * 100));
        return (
          <div
            key={item.tagId}
            className="rounded-[20px] border border-[var(--surface-border)] bg-white px-4 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tagPalette[index % tagPalette.length] }}
                  />
                  <span className="truncate text-sm font-semibold text-[var(--text-strong)]">{item.tagName}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{item.paymentCount}건</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[var(--text-strong)]">{formatCurrency(item.spentAmount)}</div>
                <div className="text-xs text-[var(--text-muted)]">{formatPercent(item.sharePercent)}</div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${tagPalette[index % tagPalette.length]}, rgba(251,113,133,0.28))`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrendBars({
  items,
}: {
  items: TrendPoint[];
}) {
  if (items.length === 0) {
    return <EmptyDashboardState message="월간 추이 데이터가 없어 막대 차트를 표시하지 못했습니다." />;
  }

  const maxSpent = Math.max(...items.map((item) => item.totalSpent), 1);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => {
          const height = Math.max(14, Math.round((item.totalSpent / maxSpent) * 150));
          return (
            <div
              key={item.yearMonth}
              className="rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-4"
            >
              <div className="flex h-[168px] items-end justify-center">
                <div className="w-full rounded-[16px] bg-[var(--surface-soft)] p-2">
                  <div
                    className="cw-progress-fill-animated rounded-[12px] bg-[linear-gradient(180deg,var(--accent),var(--accent-strong))]"
                    style={{ height }}
                  />
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-[var(--text-strong)]">{item.yearMonth}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{formatCurrency(item.totalSpent)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--text-body)]">
        최근 {items.length}개월 지출 추이와 혜택 집계 기준입니다. 비어 있는 월은 데이터가 아직 집계되지 않은 상태로 간주합니다.
      </div>
    </div>
  );
}

function EmptyDashboardState({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
      {message}
    </div>
  );
}

function buildConicGradient(percentages: number[]) {
  if (percentages.length === 0) {
    return "conic-gradient(#f5d0d7 0deg 360deg)";
  }

  let start = 0;
  const stops = percentages.map((percentage, index) => {
    const sweep = Math.max(percentage, 4) * 3.6;
    const end = Math.min(360, start + sweep);
    const stop = `${donutPalette[index % donutPalette.length]} ${start}deg ${end}deg`;
    start = end;
    return stop;
  });

  if (start < 360) {
    stops.push(`#f8d7df ${start}deg 360deg`);
  }

  return `conic-gradient(${stops.join(", ")})`;
}
