import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  formatCurrency,
  formatSignedCurrency,
  formatPercent,
  tryFetchBackendJson,
  type DashboardMonthlySummaryResponse,
  type DashboardCardSummaryResponse,
  type DashboardCategorySummaryResponse,
  type DashboardTrendResponse,
} from "@/lib/cardwise-api";

// F8 - 사용자 소비 대시보드 (월간 요약, 카드별, 카테고리별)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const yearMonth = `${year}-${String(month).padStart(2, "0")}`;
  
  // 이번 달 시작일/종료일 구하기 (ISO.DATE 형식 YYYY-MM-DD)
  const fromDate = `${yearMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const toDate = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;

  const [monthlySummary, cardSummary, categorySummary, trend] = await Promise.all([
    tryFetchBackendJson<DashboardMonthlySummaryResponse>(`/dashboard/monthly?year=${year}&month=${month}`),
    tryFetchBackendJson<DashboardCardSummaryResponse>(`/dashboard/cards?from=${fromDate}&to=${toDate}`),
    tryFetchBackendJson<DashboardCategorySummaryResponse>(`/dashboard/categories?from=${fromDate}&to=${toDate}`),
    tryFetchBackendJson<DashboardTrendResponse>(`/dashboard/trends?period=monthly&limit=6`),
  ]);

  const summary = monthlySummary?.data;
  const cards = cardSummary?.data ?? [];
  const categories = categorySummary?.data ?? [];
  const trendData = trend?.data ?? [];

  return (
    <AppShell
      active="dashboard"
      eyebrow="F8 · 소비 대시보드"
      title="이번 달 소비 현황"
      description="카드별·카테고리별 소비 패턴과 혜택 수령 현황을 한눈에 확인합니다."
      actions={
        <Link
          href="/ledger"
          className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-soft)] transition hover:bg-[var(--accent-strong)] transform hover:scale-105"
        >
          결제 입력
        </Link>
      }
    >
      {/* 월간 요약 지표 */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">이번 달 총 지출</div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--text-strong)]">
            {summary ? formatCurrency(summary.totalSpent) : "—"}
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">{yearMonth} 기준</div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">혜택 수령</div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--success)]">
            {summary ? formatCurrency(summary.totalBenefit) : "—"}
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">이번 달 혜택 합계</div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">결제 건수</div>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--text-strong)]">
            {summary ? `${summary.paymentCount}건` : "—"}
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">이번 달 총 결제</div>
        </div>

        <div className={`relative overflow-hidden rounded-[24px] border bg-[var(--surface-elevated)] p-5 backdrop-blur-xl ${summary && summary.changeAmount < 0 ? "border-[var(--success-soft)]" : "border-[var(--surface-border)]"}`}>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">전월 대비</div>
          <div className={`mt-3 text-[28px] font-semibold tracking-tight ${summary && summary.changeAmount < 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
            {summary ? formatSignedCurrency(summary.changeAmount) : "—"}
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            {summary?.changeRate != null ? `${formatPercent(summary.changeRate)} 변동` : "비교 데이터 없음"}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* 왼쪽: 카드별 사용 현황 + 추이 */}
        <div className="flex flex-col gap-6">
          {/* 카드별 현황 */}
          <div className="rounded-[32px] border border-[var(--surface-border-strong)] bg-white/70 backdrop-blur-2xl p-6 shadow-xl shadow-[var(--surface-shadow)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-strong)] tracking-tight">카드별 사용 현황</h2>
                <p className="mt-1 text-sm text-[var(--text-body)]">이번 달 카드별 지출과 혜택 현황입니다.</p>
              </div>
              <Link href="/cards" className="text-sm font-semibold text-[var(--accent-strong)] hover:underline">카드 관리 →</Link>
            </div>

            {cards.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">등록된 카드가 없습니다.</p>
                <Link href="/cards/register" className="mt-3 inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white">
                  + 카드 등록하기
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {cards.map((card) => (
                  <div key={card.userCardId} className="group relative overflow-hidden rounded-[20px] border border-[var(--surface-border)] bg-gradient-to-br from-white to-[var(--surface-soft)] p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-base text-[var(--text-strong)]">{card.cardName}</h3>
                        <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-body)]">
                          <span>지출 {formatCurrency(card.spentAmount)}</span>
                          <span className="text-[var(--success)] font-medium">혜택 {formatCurrency(card.benefitAmount)}</span>
                        </div>
                        {card.currentTierName && (
                          <span className="mt-2 inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-strong)]">
                            {card.currentTierName} 달성
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-soft)] tracking-widest">결제</div>
                        <div className="mt-1 text-base font-bold text-[var(--text-strong)]">{card.paymentCount}건</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 월별 추이 */}
          {trendData.length > 0 && (
            <div className="rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6">
              <h2 className="text-lg font-bold text-[var(--text-strong)] tracking-tight mb-5">최근 6개월 추이</h2>
              <div className="flex gap-2 items-end h-32">
                {trendData.map((t) => {
                  const maxSpent = Math.max(...trendData.map((x) => x.totalSpent), 1);
                  const height = Math.max((t.totalSpent / maxSpent) * 100, 4);
                  return (
                    <div key={t.yearMonth} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-[8px] bg-[var(--accent-soft)] hover:bg-[var(--accent)] transition-colors cursor-default"
                        style={{ height: `${height}%` }}
                        title={`${t.yearMonth}: ${formatCurrency(t.totalSpent)}`}
                      />
                      <span className="text-[10px] text-[var(--text-muted)]">{t.yearMonth.slice(5)}월</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 카테고리별 분포 */}
        <div>
          <div className="sticky top-[100px] rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[var(--text-strong)] tracking-tight">카테고리별 분포</h2>
              <p className="mt-1 text-sm text-[var(--text-body)]">이번 달 소비 카테고리 분석</p>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-white/50 px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                아직 분류된 결제 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 6).map((cat) => (
                  <div key={cat.categoryId} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-[var(--text-strong)]">{cat.categoryName}</span>
                      <span className="text-sm font-bold text-[var(--text-body)]">{formatCurrency(cat.spentAmount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all"
                        style={{ width: `${cat.sharePercent}%` }}
                      />
                    </div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{cat.sharePercent.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <Link href="/ledger" className="flex-1 rounded-[16px] bg-[var(--text-strong)] py-2.5 text-center text-xs font-bold text-white transition hover:bg-black">
                결제 내역 보기
              </Link>
              <Link href="/benefits" className="flex-1 rounded-[16px] border border-[var(--accent)] py-2.5 text-center text-xs font-bold text-[var(--accent-strong)] transition hover:bg-[var(--accent-soft)]">
                혜택 탐색
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
