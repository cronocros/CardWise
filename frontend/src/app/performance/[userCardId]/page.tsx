import Link from "next/link";
import { AppShell, Chip, MetricCard, Panel } from "@/components/app-shell";
import { PerformanceCelebration } from "@/components/performance-celebration";
import { CardThumbnail, TierProgressTrack } from "@/components/preview-primitives";
import {
  formatCurrency,
  formatDate,
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

function specialPeriodLabel(data: PerformanceResponse["data"]) {
  return data.specialPeriod?.active ? data.specialPeriod.name ?? "특별 기간" : "일반 기간";
}

export default async function PerformancePage(props: PageProps<"/performance/[userCardId]">) {
  const { userCardId } = await props.params;
  const response = await tryFetchBackendJson<PerformanceResponse>(
    `/cards/${encodeURIComponent(userCardId)}/performance`,
  );
  const data = response?.data;
  const seededIds = [1, 2, 3, 4];
  const unlockedCount = data?.voucherUnlocks.filter((voucher) => voucher.unlockState === "UNLOCKED").length ?? 0;
  const monthlyPeak = Math.max(...(data?.monthlyBreakdown.map((entry) => entry.spent) ?? [0]), 1);

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
            <Panel title="실적 요약" subtitle="카드 히어로, 티어 트랙, 기준 기간을 한 화면에서 읽도록 재구성했습니다.">
              <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <CardThumbnail
                  seed={Number(userCardId)}
                  title={data.cardName}
                  subtitle={data.annual?.currentTier?.tierName ?? "메인 덱"}
                  badge={data.specialPeriod?.active ? "Special" : "Core"}
                />

                <div className="grid gap-3">
                  <TierProgressTrack
                    currentTier={data.annual?.currentTier?.tierName ?? "미등급"}
                    nextTier={data.annual?.nextTier?.tierName ?? "최상위 구간"}
                    progress={progressFor(data)}
                    accumulated={data.annual?.accumulated ?? 0}
                    remainingAmount={data.annual?.nextTier?.remainingAmount}
                  />

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">이번 달</div>
                      <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                        {formatCurrency(data.currentMonth?.monthlySpent)}
                      </div>
                      <div className="mt-2 text-sm text-[var(--text-muted)]">{data.currentMonth?.yearMonth ?? "-"}</div>
                    </div>
                    <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">증감</div>
                      <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                        {formatPercent(data.currentMonth?.changeRate)}
                      </div>
                      <div className="mt-2 text-sm text-[var(--text-muted)]">전월 대비</div>
                    </div>
                    <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">사용 가능</div>
                      <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                        {unlockedCount}
                      </div>
                      <div className="mt-2 text-sm text-[var(--text-muted)]">바우처 즉시 사용 가능</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">연간 기준 기간</div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)]">
                    <div className="flex justify-between gap-4">
                      <span>시작</span>
                      <span>{formatDate(data.annualPeriod?.from)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>종료</span>
                      <span>{formatDate(data.annualPeriod?.to)}</span>
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
                  <Chip tone={data.specialPeriod?.active ? "emerald" : "slate"}>{specialPeriodLabel(data)}</Chip>
                  <Chip tone="rose">{data.currentMonth?.yearMonth ?? "-"}</Chip>
                  <Chip tone="amber">{data.benefitQualification?.periodLagLabel ?? "시차 없음"}</Chip>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)] sm:grid-cols-3">
                  <div className="rounded-[18px] bg-white/80 px-4 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">전월 사용액</div>
                    <div className="mt-2 font-medium text-[var(--text-strong)]">{formatCurrency(data.currentMonth?.previousMonthSpent)}</div>
                  </div>
                  <div className="rounded-[18px] bg-white/80 px-4 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">유예 조건</div>
                    <div className="mt-2 font-medium text-[var(--text-strong)]">
                      {formatCurrency(data.benefitQualification?.gracePeriod?.minSpendPerMonth)}
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-white/80 px-4 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">유예 만료</div>
                    <div className="mt-2 font-medium text-[var(--text-strong)]">
                      {formatDate(data.benefitQualification?.gracePeriod?.expiresAt)}
                    </div>
                  </div>
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

            <Panel title="월별 내역" subtitle="월별 누적 흐름을 바 형태로 보여주고, 현재 위치를 오른쪽 요약 카드로 함께 읽게 구성했습니다.">
              <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="grid gap-3">
                  {(data.monthlyBreakdown ?? []).map((entry) => (
                    <div
                      key={entry.yearMonth}
                      className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-[var(--text-strong)]">{entry.yearMonth}</span>
                        <span className="text-sm text-[var(--text-muted)]">{formatCurrency(entry.spent)}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                        <div
                          className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                          style={{ width: `${Math.max(8, Math.round((entry.spent / monthlyPeak) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[22px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#fff8fa,#ffffff)] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">현재 구간</div>
                    <div className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                      {data.annual?.currentTier?.tierName ?? "-"}
                    </div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">
                      다음 구간 {data.annual?.nextTier?.tierName ?? "-"}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                    <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                      <span>연간 누적 실적</span>
                      <span>{formatCurrency(data.annual?.accumulated)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                      <span>다음 구간</span>
                      <span>{data.annual?.nextTier?.tierName ?? "-"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                      <span>남은 금액</span>
                      <span>{formatCurrency(data.annual?.nextTier?.remainingAmount)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
                      <span>실적 시차</span>
                      <span>{data.benefitQualification?.periodLagLabel ?? "-"}</span>
                    </div>
                  </div>
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
                    className="cw-interactive-card rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4"
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
                    <div className="mt-4 rounded-[20px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff8fa,#ffffff)] p-4">
                      <div className="text-sm font-medium text-[var(--text-strong)]">
                        {voucher.unlockState === "UNLOCKED"
                          ? "이미 사용 가능한 상태입니다."
                          : voucher.unlockState === "ELIGIBLE"
                            ? "조건은 충족했고 반영 시점만 남았습니다."
                            : `${formatCurrency(voucher.remainingAmount)} 더 채우면 열립니다.`}
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                        <div
                          className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                          style={{
                            width: `${
                              voucher.requiredAnnualPerformance && voucher.requiredAnnualPerformance > 0
                                ? Math.min(100, Math.max(0, Math.round(((voucher.currentAnnualPerformance ?? 0) / voucher.requiredAnnualPerformance) * 100)))
                                : voucher.unlockState === "UNLOCKED"
                                  ? 100
                                  : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-2">
                      <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">현재 / 필요 실적</div>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">
                          {formatCurrency(voucher.currentAnnualPerformance)} / {formatCurrency(voucher.requiredAnnualPerformance)}
                        </div>
                      </div>
                      <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">사용 가능 시점</div>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">{formatDate(voucher.availableAt)}</div>
                      </div>
                      <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">잔여 / 전체</div>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">
                          {voucher.remainingCount ?? "-"} / {voucher.totalCount ?? "-"}
                        </div>
                      </div>
                      <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">만료일</div>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">{formatDate(voucher.validUntil)}</div>
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
