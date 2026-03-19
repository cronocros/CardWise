import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { PerformanceCelebration } from "@/components/performance-celebration";
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
  return value.annual?.currentTier?.tierName ?? "미등급";
}

function unlockStateLabel(value: string) {
  if (value === "UNLOCKED") return "사용 가능";
  if (value === "ELIGIBLE") return "조건 충족";
  if (value === "LOCKED") return "잠김";
  return value;
}

function unlockTypeLabel(value: string) {
  const labels: Record<string, string> = {
    ANNUAL_SPEND: "연간 실적",
    BENEFIT_TIER: "혜택 구간",
    EVENT: "이벤트",
    MANUAL: "수동",
  };
  return labels[value] ?? value;
}

export default async function PerformancePage(props: PageProps<"/performance/[userCardId]">) {
  const { userCardId } = await props.params;
  const response = await tryFetchBackendJson<PerformanceResponse>(
    `/cards/${encodeURIComponent(userCardId)}/performance`,
  );
  const data = response?.data;
  const seededIds = [1, 2, 3, 4];
  const unlockedCount = data?.voucherUnlocks.filter((voucher) => voucher.unlockState === "UNLOCKED").length ?? 0;

  return (
    <AppShell
      active="performance"
      eyebrow="실적 상세"
      title={data ? `${data.cardName}` : `사용 카드 #${userCardId}`}
      description="연간 기준, 월별 시차, 유예 상태, 바우처 해금 상태를 카드 중심 앱 레이아웃으로 촘촘하게 보여주는 화면입니다."
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
            <MetricCard label="연간 누적 실적" value={formatCurrency(data.annual?.accumulated)} helper={tierLabel(data)} />
            <MetricCard label="이번 달" value={data.currentMonth?.yearMonth ?? "-"} helper={formatCurrency(data.currentMonth?.monthlySpent)} />
            <MetricCard label="유예 상태" value={data.benefitQualification?.gracePeriod?.active ? "활성" : "없음"} helper={data.benefitQualification?.referenceMonth ?? "-"} />
            <MetricCard label="특별 기간" value={data.specialPeriod?.active ? "적용" : "없음"} helper={data.specialPeriod?.name ?? "-"} />
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Panel title="실적 요약" subtitle="실적 상세를 단독 리포트가 아니라 앱 안의 작업 화면처럼 읽히도록 정리했습니다.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">연간 기준 기간</div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)]">
                    <div className="flex justify-between gap-4">
                      <span>시작</span>
                      <span>{data.annualPeriod?.from ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>종료</span>
                      <span>{data.annualPeriod?.to ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>기준</span>
                      <span>{data.annualPeriod?.basis ?? "-"}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">혜택 실적 기준</div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)]">
                    <div className="flex justify-between gap-4">
                      <span>기준 월</span>
                      <span>{data.benefitQualification?.referenceMonth ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>적용 구간</span>
                      <span>{data.benefitQualification?.qualifiedTierName ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>실적 시차</span>
                      <span>{data.benefitQualification?.periodLagLabel ?? "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>유예 상태</span>
                      <span>{data.benefitQualification?.gracePeriod?.active ? "활성" : "없음"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={data.specialPeriod?.active ? "emerald" : "slate"}>
                    {data.specialPeriod?.active ? "특별 기간" : "일반 기간"}
                  </Chip>
                  <Chip tone="rose">{data.currentMonth?.yearMonth ?? "-"}</Chip>
                  <Chip tone="amber">{data.benefitQualification?.periodLagLabel ?? "시차 없음"}</Chip>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                    style={{ width: `${progressFor(data)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>월 사용액</span>
                  <span>{formatCurrency(data.currentMonth?.monthlySpent)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>전월 사용액</span>
                  <span>{formatCurrency(data.currentMonth?.previousMonthSpent)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                  <span>증감</span>
                  <span>{formatPercent(data.currentMonth?.changeRate)}</span>
                </div>
              </div>

              <div className="mt-4">
                <PerformanceCelebration
                  cardName={data.cardName}
                  currentTier={data.annual?.currentTier?.tierName ?? "미등급"}
                  nextTier={data.annual?.nextTier?.tierName ?? null}
                  progress={progressFor(data)}
                  specialActive={Boolean(data.specialPeriod?.active)}
                  graceActive={Boolean(data.benefitQualification?.gracePeriod?.active)}
                  unlockedCount={unlockedCount}
                  remainingAmount={data.annual?.nextTier?.remainingAmount ?? null}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">홈</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">대시보드로 돌아가기</div>
                </Link>
                <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">카드</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">카드 덱 비교</div>
                </Link>
                <Link href="/inbox" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">인박스</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">대기 작업 검토</div>
                </Link>
                <Link href="/adjustments" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 transition hover:bg-[var(--surface-elevated)]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">조정</div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--text-strong)]">조정 흐름 열기</div>
                </Link>
              </div>
            </Panel>

            <Panel title="월별 내역" subtitle="월별 누적 흐름과 실적 이력을 확인하는 구간입니다.">
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
                  <span>연간 누적 실적</span>
                  <span>{formatCurrency(data.annual?.accumulated)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>현재 구간</span>
                  <span>{data.annual?.currentTier?.tierName ?? "-"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>다음 구간</span>
                  <span>{data.annual?.nextTier?.tierName ?? "-"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>남은 금액</span>
                  <span>{formatCurrency(data.annual?.nextTier?.remainingAmount)}</span>
                </div>
              </div>
            </Panel>
          </div>

          <Panel
            title="바우처 해금 조건"
            subtitle="카드별 바우처 규칙과 현재 연간 실적을 기준으로 해금 상태를 계산합니다."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {data.voucherUnlocks.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)] md:col-span-2">
                  이 카드에는 설정된 바우처 해금 규칙이 없습니다.
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
                        <div className="mt-1 text-sm text-[var(--text-muted)]">{voucher.notes ?? "추가 메모가 없습니다"}</div>
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
                          {unlockStateLabel(voucher.unlockState)}
                        </Chip>
                        <Chip tone="slate">{unlockTypeLabel(voucher.unlockType)}</Chip>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                      <div className="flex justify-between gap-4">
                        <span>연간 조건</span>
                        <span>{formatCurrency(voucher.requiredAnnualPerformance)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>현재 연간 실적</span>
                        <span>{formatCurrency(voucher.currentAnnualPerformance)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>해금까지 남은 금액</span>
                        <span>{formatCurrency(voucher.remainingAmount)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>사용 가능 시점</span>
                        <span>{voucher.availableAt ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>잔여 / 전체</span>
                        <span>{voucher.remainingCount ?? "-"} / {voucher.totalCount ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>만료일</span>
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
          title="실적 데이터를 불러오지 못했습니다"
          subtitle="백엔드에서 아직 데이터를 반환하지 않았습니다. 시드 카드 ID와 백엔드 상태를 점검하세요."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {seededIds.map((id) => (
              <Link
                key={id}
                href={`/performance/${id}`}
                className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]"
              >
                시드 카드 #{id}
              </Link>
            ))}
            <Link href="/dashboard" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]">
              대시보드로 돌아가기
            </Link>
            <Link href="/cards" className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]">
              카드 덱 열기
            </Link>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
