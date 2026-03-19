"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActionButton, AppShell, Chip, MetricCard, Panel, TextField } from "@/components/app-shell";
import { CardThumbnail, MatchGauge } from "@/components/preview-primitives";
import {
  formatCurrency,
  type BenefitCategoryEnvelope,
  type BenefitRecommendationEnvelope,
  type BenefitSearchEnvelope,
  type CardBenefitDetailEnvelope,
} from "@/lib/cardwise-api";

type BenefitTypeFilter = "ALL" | "DISCOUNT" | "POINT" | "CASHBACK" | "MILEAGE" | "INTEREST_FREE";
type BenefitItem = BenefitSearchEnvelope["data"][number];
type BenefitCategory = BenefitCategoryEnvelope["data"][number];
type BenefitRecommendation = BenefitRecommendationEnvelope["data"];
type CardBenefitDetail = CardBenefitDetailEnvelope["data"];

const benefitTypeOptions: Array<{ value: BenefitTypeFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "DISCOUNT", label: "할인" },
  { value: "POINT", label: "적립" },
  { value: "CASHBACK", label: "캐시백" },
  { value: "MILEAGE", label: "마일리지" },
  { value: "INTEREST_FREE", label: "무이자" },
];

function toneFor(item: BenefitItem) {
  if (item.isMyCard && item.isEligible) return "rose" as const;
  if (item.isMyCard) return "amber" as const;
  return "slate" as const;
}

function scopeLabel(scope: string) {
  if (scope === "MY_CARDS") return "내 카드 추천";
  if (scope === "ALL_CARDS") return "전체 카드 추천";
  return "추천 없음";
}

function categoryLabel(item: BenefitItem) {
  return item.categoryName ?? item.merchantName ?? "전체 가맹점";
}

export default function BenefitsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categories, setCategories] = useState<BenefitCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<BenefitTypeFilter>("ALL");
  const [myCardsOnly, setMyCardsOnly] = useState(false);
  const [results, setResults] = useState<BenefitItem[]>([]);
  const [recommendation, setRecommendation] = useState<BenefitRecommendation | null>(null);
  const [detail, setDetail] = useState<CardBenefitDetail | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const normalized = query.trim();
      setDebouncedQuery(normalized.length >= 2 ? normalized : "");
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories?limit=14", { cache: "no-store" });
        if (!response.ok) throw new Error("category");
        const payload = (await response.json()) as BenefitCategoryEnvelope;
        if (!ignore) setCategories(payload.data ?? []);
      } catch {
        if (!ignore) setCategories([]);
      }
    }
    void loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadBenefits() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (selectedCategoryId !== null) params.set("categoryId", String(selectedCategoryId));
        if (selectedType !== "ALL") params.set("type", selectedType);
        if (myCardsOnly) params.set("myCardsOnly", "true");
        params.set("limit", "24");

        const [resultResponse, recommendationResponse] = await Promise.all([
          fetch(`/api/benefits/search?${params.toString()}`, { cache: "no-store", signal: controller.signal }),
          fetch(`/api/benefits/recommend?${params.toString()}`, { cache: "no-store", signal: controller.signal }),
        ]);

        if (!resultResponse.ok || !recommendationResponse.ok) throw new Error("benefits");
        const resultPayload = (await resultResponse.json()) as BenefitSearchEnvelope;
        const recommendationPayload = (await recommendationResponse.json()) as BenefitRecommendationEnvelope;
        setResults(resultPayload.data ?? []);
        setRecommendation(recommendationPayload.data ?? null);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLoadError("혜택 데이터를 불러오지 못했습니다.");
        setResults([]);
        setRecommendation(null);
      } finally {
        setIsLoading(false);
      }
    }
    void loadBenefits();
    return () => controller.abort();
  }, [debouncedQuery, selectedCategoryId, selectedType, myCardsOnly]);

  useEffect(() => {
    if (!detailOpen || selectedCardId === null) return undefined;
    const controller = new AbortController();
    async function loadDetail() {
      setIsDetailLoading(true);
      try {
        const response = await fetch(`/api/cards/${selectedCardId}/benefits`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("detail");
        const payload = (await response.json()) as CardBenefitDetailEnvelope;
        setDetail(payload.data ?? null);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setDetail(null);
      } finally {
        setIsDetailLoading(false);
      }
    }
    void loadDetail();
    return () => controller.abort();
  }, [detailOpen, selectedCardId]);

  const topPick = recommendation?.recommendation ?? results[0] ?? null;
  const ownedCount = results.filter((item) => item.isMyCard).length;
  const eligibleCount = results.filter((item) => item.isEligible).length;
  const reviewCount = results.filter((item) => item.isMyCard && !item.isEligible).length;
  const avgMatch = results.length ? Math.round(results.reduce((sum, item) => sum + item.matchScore, 0) / results.length) : 0;
  const keepPick = useMemo(() => results.find((item) => item.isMyCard && item.isEligible) ?? topPick, [results, topPick]);
  const reviewPick = useMemo(() => results.find((item) => item.isMyCard && !item.isEligible) ?? results.find((item) => !item.isMyCard) ?? topPick, [results, topPick]);

  return (
    <AppShell
      active="benefits"
      eyebrow="혜택 탐색"
      title="가맹점과 카테고리 기준으로 지금 쓸 수 있는 혜택을 찾습니다"
      description="F5 설계 기준으로 검색, 카테고리, 혜택 유형, 내 카드 토글을 묶었습니다. 실적 충족 여부까지 같이 보여줘 실제 적용 가능성도 바로 판단할 수 있습니다."
      actions={
        <>
          <Link href="/vouchers" className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]">바우처 보기</Link>
          <Link href="/cards" className="rounded-full border border-[var(--surface-border)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]">내 카드 보기</Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="검색 결과" value={String(results.length)} helper="현재 필터 기준" />
        <MetricCard label="내 카드" value={String(ownedCount)} helper="보유 카드 혜택" />
        <MetricCard label="적용 가능" value={String(eligibleCount)} helper="실적 조건 충족" />
        <MetricCard label="평균 매칭" value={`${avgMatch}%`} helper="추천 우선순위" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel title="혜택 검색" subtitle="검색어는 300ms debounce로 처리하고, 카테고리/유형/내 카드 토글을 함께 적용합니다." className="overflow-visible">
          <div className="grid gap-4">
            <div className="sticky top-[6.1rem] z-10 rounded-[24px] border border-[var(--surface-border)] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_18px_34px_rgba(190,24,60,0.1)] backdrop-blur-xl">
              <div className="grid gap-4">
                <TextField label="가맹점 또는 카테고리 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="스타벅스, 주유, OTT, 항공..." />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSelectedCategoryId(null)} className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategoryId === null ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"}`}>전체</button>
                  {categories.map((category) => (
                    <button key={category.categoryId} type="button" onClick={() => setSelectedCategoryId(category.categoryId)} className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategoryId === category.categoryId ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"}`}>{category.categoryName}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {benefitTypeOptions.map((option) => (
                    <button key={option.value} type="button" onClick={() => setSelectedType(option.value)} className={`rounded-full border px-4 py-2 text-sm transition ${selectedType === option.value ? "border-rose-200 bg-rose-50 text-rose-600" : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"}`}>{option.label}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setMyCardsOnly((value) => !value)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${myCardsOnly ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[var(--surface-border)] bg-white text-[var(--text-body)]"}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${myCardsOnly ? "bg-emerald-500" : "bg-[var(--surface-border-strong)]"}`} />내 카드만
                  </button>
                  <Chip tone="rose">적용 가능 {eligibleCount}</Chip>
                  <Chip tone="emerald">보유 카드 {ownedCount}</Chip>
                  <Chip tone="amber">검토 필요 {reviewCount}</Chip>
                </div>
              </div>
            </div>

            {loadError ? <div className="rounded-[22px] border border-dashed border-rose-200 bg-rose-50 px-5 py-8 text-sm text-rose-700">{loadError}</div> : null}

            <div className="grid gap-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => <div key={index} className="animate-pulse rounded-[26px] border border-[var(--surface-border)] bg-white p-5"><div className="h-4 w-32 rounded-full bg-[var(--surface-soft)]" /><div className="mt-4 h-6 w-52 rounded-full bg-[var(--surface-soft)]" /><div className="mt-3 h-4 w-full rounded-full bg-[var(--surface-soft)]" /></div>)
              ) : results.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center"><div className="text-base font-semibold text-[var(--text-strong)]">조건에 맞는 혜택이 없습니다</div><div className="mt-2 text-sm text-[var(--text-muted)]">검색어를 바꾸거나 필터를 넓혀보세요.</div></div>
              ) : (
                results.map((item) => (
                  <button key={item.cardBenefitId} type="button" onClick={() => { setSelectedCardId(item.cardId); setDetailOpen(true); }} className="cw-interactive-card w-full rounded-[26px] border border-[var(--surface-border)] bg-white p-4 text-left shadow-[0_14px_28px_rgba(190,24,60,0.05)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <Chip tone={toneFor(item)}>{item.isMyCard ? (item.isEligible ? "내 카드 · 적용 가능" : "내 카드 · 실적 미달") : "전체 카드"}</Chip>
                          <Chip tone="slate">{item.benefitLabel}</Chip>
                          <Chip tone="violet">{categoryLabel(item)}</Chip>
                        </div>
                        <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">{item.cardName}</h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{item.cardCompanyName}{item.cardNickname ? ` · ${item.cardNickname}` : ""}</p>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{item.description ?? `${item.targetLabel}에서 ${item.benefitLabel} 조건을 적용합니다.`}</p>
                      </div>
                      <div className="rounded-[22px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#fff8fa,#ffffff)] px-4 py-4"><MatchGauge value={item.matchScore} helper={item.targetLabel} /></div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">실적 기준</div><div className="mt-2 font-medium text-[var(--text-strong)]">{item.eligibilityLabel}</div><div className="mt-1 text-[13px] text-[var(--text-muted)]">{item.requiredPerformanceAmount ? `기준 ${formatCurrency(item.requiredPerformanceAmount)}` : "실적 조건 없음"}</div></div>
                      <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3 text-sm text-[var(--text-body)]"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">월 한도</div><div className="mt-2 font-medium text-[var(--text-strong)]">{item.monthlyLimitAmount ? formatCurrency(item.monthlyLimitAmount) : item.monthlyLimitCount ? `${item.monthlyLimitCount}회` : "별도 한도 없음"}</div><div className="mt-1 text-[13px] text-[var(--text-muted)]">{item.minPaymentAmount ? `최소 ${formatCurrency(item.minPaymentAmount)}` : "최소 결제 조건 없음"}</div></div>
                      <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3 text-sm text-[var(--text-body)]"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">현재 실적</div><div className="mt-2 font-medium text-[var(--accent-strong)]">{item.currentSpent !== null ? formatCurrency(item.currentSpent) : "미연동"}</div><div className="mt-1 text-[13px] text-[var(--text-muted)]">{item.latestPerformanceMonth ?? "최근 기준 없음"}</div></div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="AI 추천" subtitle="내 카드 우선으로 비교하고, 없을 때만 전체 카드 기준으로 추천합니다.">
            {topPick ? (
              <div className="grid gap-3">
                <article className="cw-interactive-card rounded-[26px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff7f8,#ffffff)] p-5">
                  <div className="flex flex-wrap gap-2"><Chip tone={toneFor(topPick)}>{scopeLabel(recommendation?.scope ?? "EMPTY")}</Chip><Chip tone="slate">{topPick.benefitLabel}</Chip></div>
                  <div className="mt-4 grid gap-4">
                    <CardThumbnail seed={topPick.cardId} title={topPick.cardName} subtitle={topPick.cardCompanyName} badge={topPick.isMyCard ? "My Card" : "Open"} compact />
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1"><h3 className="text-base font-semibold text-[var(--text-strong)]">{topPick.targetLabel}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{recommendation?.reason ?? `${topPick.cardName}가 현재 조건에서 가장 높은 우선순위를 가집니다.`}</p></div>
                      <div className="rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-4"><MatchGauge value={topPick.matchScore} helper={topPick.eligibilityLabel} /></div>
                    </div>
                  </div>
                </article>
                {keepPick ? <article className="cw-interactive-card rounded-[24px] border border-[var(--surface-border)] bg-white p-4"><div className="flex flex-wrap gap-2"><Chip tone="emerald">유지 권장</Chip><Chip tone="slate">{keepPick.benefitLabel}</Chip></div><h3 className="mt-3 text-base font-semibold text-[var(--text-strong)]">{keepPick.cardName}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{keepPick.isEligible ? "이미 실적 기준을 충족한 상태라 실제 적용 가능성이 높습니다." : "보유 카드 중에서는 유리하지만, 실적 조건은 한 번 더 확인해야 합니다."}</p></article> : null}
                {reviewPick ? <article className="cw-interactive-card rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4"><div className="flex flex-wrap gap-2"><Chip tone="amber">검토 필요</Chip><Chip tone="slate">{reviewPick.benefitLabel}</Chip></div><h3 className="mt-3 text-base font-semibold text-[var(--text-strong)]">{reviewPick.cardName}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{reviewPick.isMyCard ? reviewPick.eligibilityLabel : "보유하지 않은 카드라 신규 발급 검토용으로만 참고하세요."}</p></article> : null}
              </div>
            ) : <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">추천할 혜택이 아직 없습니다.</div>}
          </Panel>

          <Panel title="빠른 작업" subtitle="혜택 검색에서 자주 이어지는 흐름을 바로 열 수 있게 정리했습니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="contents"><ActionButton kind="primary">홈 브리프 보기</ActionButton></Link>
              <Link href="/cards" className="contents"><ActionButton kind="secondary">내 카드 실적 열기</ActionButton></Link>
              <Link href="/vouchers" className="contents"><ActionButton kind="ghost">바우처와 비교</ActionButton></Link>
              <Link href="/settings" className="contents"><ActionButton kind="ghost">알림/설정 보기</ActionButton></Link>
            </div>
          </Panel>
        </div>
      </div>

      {detailOpen ? (
        <div className="cw-sheet-backdrop" role="presentation">
          <button type="button" aria-label="닫기" className="absolute inset-0 cursor-default bg-black/20" onClick={() => setDetailOpen(false)} />
          <div className="cw-bottom-sheet relative mx-auto w-full max-w-[860px] rounded-t-[30px] border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 pb-7 pt-4 shadow-[0_-20px_50px_rgba(15,23,42,0.18)] xl:rounded-[32px] xl:p-6">
            <div className="flex justify-center xl:hidden"><div className="cw-sheet-handle" /></div>
            <div className="mt-4 flex items-center justify-between gap-3"><div><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">카드 혜택 상세</div><div className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">{detail?.cardName ?? "불러오는 중"}</div></div><ActionButton kind="ghost" onClick={() => setDetailOpen(false)}>닫기</ActionButton></div>
            <BenefitDetailBody detail={detail} isLoading={isDetailLoading} />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function BenefitDetailBody({ detail, isLoading }: { detail: CardBenefitDetail | null; isLoading: boolean }) {
  if (isLoading) {
    return <div className="mt-6 grid gap-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="animate-pulse rounded-[22px] border border-[var(--surface-border)] bg-white p-4"><div className="h-4 w-36 rounded-full bg-[var(--surface-soft)]" /><div className="mt-3 h-4 w-full rounded-full bg-[var(--surface-soft)]" /></div>)}</div>;
  }
  if (!detail) {
    return <div className="mt-6 rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">카드 혜택 상세를 불러오지 못했습니다.</div>;
  }
  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <CardThumbnail seed={detail.cardId} title={detail.cardName} subtitle={detail.cardNickname ?? detail.cardCompanyName} badge={detail.isMyCard ? "My Card" : "Open"} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">현재 실적</div><div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{detail.currentSpent !== null ? formatCurrency(detail.currentSpent) : "미연동"}</div><div className="mt-1 text-sm text-[var(--text-muted)]">{detail.latestPerformanceMonth ?? "최근 기준 없음"}</div></div>
          <div className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">보유 상태</div><div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{detail.isMyCard ? "보유 카드" : "미보유 카드"}</div><div className="mt-1 text-sm text-[var(--text-muted)]">{detail.cardCompanyName}</div></div>
          <div className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">혜택 수</div><div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{detail.benefits.length}개</div><div className="mt-1 text-sm text-[var(--text-muted)]">현재 활성 기준</div></div>
        </div>
      </div>
      <div className="grid gap-3">{detail.benefits.map((benefit) => <article key={benefit.cardBenefitId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4"><div className="flex flex-wrap gap-2"><Chip tone={toneFor(benefit)}>{benefit.eligibilityLabel}</Chip><Chip tone="slate">{benefit.benefitLabel}</Chip><Chip tone="violet">{benefit.targetLabel}</Chip></div><div className="mt-3 text-base font-semibold text-[var(--text-strong)]">{benefit.description ?? `${benefit.targetLabel}에 적용되는 ${benefit.benefitTypeLabel} 혜택`}</div><div className="mt-3 grid gap-3 md:grid-cols-3"><div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">실적 조건</div><div className="mt-2 font-medium text-[var(--text-strong)]">{benefit.requiredPerformanceAmount ? formatCurrency(benefit.requiredPerformanceAmount) : "없음"}</div></div><div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">월 한도</div><div className="mt-2 font-medium text-[var(--text-strong)]">{benefit.monthlyLimitAmount ? formatCurrency(benefit.monthlyLimitAmount) : benefit.monthlyLimitCount ? `${benefit.monthlyLimitCount}회` : "없음"}</div></div><div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]"><div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">최소 결제</div><div className="mt-2 font-medium text-[var(--text-strong)]">{benefit.minPaymentAmount ? formatCurrency(benefit.minPaymentAmount) : "없음"}</div></div></div></article>)}</div>
    </div>
  );
}
