"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell, ActionButton, Chip, MetricCard, Panel, TextField } from "@/components/app-shell";
import { MatchGauge } from "@/components/preview-primitives";

type BenefitItem = {
  id: string;
  title: string;
  provider: string;
  category: "카드" | "생활" | "여행" | "멤버십" | "정기구독";
  status: "추천" | "보유" | "검토";
  match: number;
  summary: string;
  bestUse: string;
  deadline: string;
};

const benefitItems: BenefitItem[] = [
  {
    id: "b-1",
    title: "호텔 라운지 패스",
    provider: "Premium Lounge",
    category: "여행",
    status: "추천",
    match: 96,
    summary: "연회비 대비 사용성이 높고, 월간 출장/여행 패턴이 있는 카드와 궁합이 좋습니다.",
    bestUse: "공항 / 프리미엄 라운지",
    deadline: "이번 달 말까지",
  },
  {
    id: "b-2",
    title: "주유 캐시백 플러스",
    provider: "CardWise AI",
    category: "생활",
    status: "보유",
    match: 91,
    summary: "실적 기준이 비교적 낮고 월 고정 지출이 잘 맞습니다. 유지 우선순위가 높습니다.",
    bestUse: "주유 / 주행 많은 달",
    deadline: "상시 유지",
  },
  {
    id: "b-3",
    title: "OTT 번들 할인",
    provider: "Streaming Club",
    category: "정기구독",
    status: "검토",
    match: 84,
    summary: "중복 구독이 있는지 점검 후 적용하면 체감 절감액이 큽니다.",
    bestUse: "넷플릭스 / 유튜브 프리미엄",
    deadline: "다음 결제일 전",
  },
  {
    id: "b-4",
    title: "카페 적립 업그레이드",
    provider: "Daily Rose",
    category: "생활",
    status: "추천",
    match: 88,
    summary: "출퇴근 패턴과 맞물릴 때 누적 혜택이 큽니다. 자잘한 사용 빈도에 강합니다.",
    bestUse: "아침 커피 / 디저트",
    deadline: "7일 후 검토",
  },
  {
    id: "b-5",
    title: "렌터카 보험 업그레이드",
    provider: "Travel Guard",
    category: "여행",
    status: "검토",
    match: 79,
    summary: "장거리 이동이 있는 달에만 가치가 올라갑니다. 필수는 아니지만 이벤트성으로 좋습니다.",
    bestUse: "단기 렌트 / 장거리 운전",
    deadline: "예약 전 확인",
  },
  {
    id: "b-6",
    title: "프리미엄 멤버십 연장",
    provider: "Member Plus",
    category: "멤버십",
    status: "보유",
    match: 92,
    summary: "상시 할인과 조합이 좋고, 혜택을 묶어 쓰기 쉬운 유형입니다.",
    bestUse: "쇼핑 / 배송 / 멤버십",
    deadline: "연장 가능",
  },
];

const categoryOptions = ["전체", "카드", "생활", "여행", "멤버십", "정기구독"] as const;

function toneForStatus(status: BenefitItem["status"]) {
  if (status === "추천") return "rose";
  if (status === "보유") return "emerald";
  return "amber";
}

export default function BenefitsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>("전체");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return benefitItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.provider, item.summary, item.bestUse].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesCategory = category === "전체" || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, query]);

  const recommendedCount = benefitItems.filter((item) => item.status === "추천").length;
  const ownedCount = benefitItems.filter((item) => item.status === "보유").length;
  const reviewCount = benefitItems.filter((item) => item.status === "검토").length;
  const avgMatch = Math.round(
    benefitItems.reduce((sum, item) => sum + item.match, 0) / benefitItems.length,
  );
  const topPick = filteredItems[0] ?? benefitItems[0];
  const keepPick = benefitItems.find((item) => item.status === "보유") ?? benefitItems[1];
  const reviewPick = benefitItems.find((item) => item.status === "검토") ?? benefitItems[2];

  return (
    <AppShell
      active="benefits"
      eyebrow="혜택 탐색"
      title="혜택을 검색하고, 추천받고, 적용 여부를 바로 판단하는 화면"
      description="문서 기준으로 혜택 화면은 검색 중심 구조를 유지합니다. 추천, 보유, 검토 상태를 한 번에 비교하고, 필요한 항목만 좁혀 볼 수 있게 구성했습니다."
      actions={
        <>
          <Link
            href="/vouchers"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            바우처 보기
          </Link>
          <Link
            href="/settings"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            설정
          </Link>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="추천" value={String(recommendedCount)} helper="AI 우선순위 포함" />
        <MetricCard label="보유" value={String(ownedCount)} helper="현재 활성 혜택" />
        <MetricCard label="검토" value={String(reviewCount)} helper="조건 확인 필요" />
        <MetricCard label="평균 매칭" value={`${avgMatch}%`} helper="시뮬레이션 적합도" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel
          title="혜택 검색"
          subtitle="검색어와 카테고리를 상단 툴바에 고정해 두고, 아래 카드에서 추천 이유와 적합도를 바로 읽게 구성했습니다."
          className="overflow-visible"
        >
          <div className="grid gap-4">
            <div className="sticky top-[6.1rem] z-10 rounded-[24px] border border-[var(--surface-border)] bg-[rgba(255,255,255,0.88)] p-4 shadow-[0_18px_34px_rgba(190,24,60,0.1)] backdrop-blur-xl">
              <div className="grid gap-4">
                <TextField
                  label="혜택 검색"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="라운지, 주유, OTT, 멤버십..."
                />
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        category === option
                          ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                          : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="rose">검색 결과 {filteredItems.length}</Chip>
                  <Chip tone="emerald">추천 {filteredItems.filter((item) => item.status === "추천").length}</Chip>
                  <Chip tone="amber">검토 {filteredItems.filter((item) => item.status === "검토").length}</Chip>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {filteredItems.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                  조건에 맞는 혜택이 없습니다.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="cw-interactive-card rounded-[26px] border border-[var(--surface-border)] bg-white p-4 shadow-[0_14px_28px_rgba(190,24,60,0.05)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <Chip tone={toneForStatus(item.status)}>{item.status}</Chip>
                          <Chip tone="slate">{item.category}</Chip>
                        </div>
                        <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{item.provider}</p>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{item.summary}</p>
                      </div>
                      <div className="rounded-[22px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#fff8fa,#ffffff)] px-4 py-4">
                        <MatchGauge value={item.match} helper={item.deadline} />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                      <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]">
                        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                          추천 사용처
                        </span>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">{item.bestUse}</div>
                      </div>
                      <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3 text-sm text-[var(--text-body)]">
                        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                          적용 시점
                        </span>
                        <div className="mt-2 font-medium text-[var(--accent-strong)]">{item.deadline}</div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="AI 추천" subtitle="추천 흐름을 카드형으로 묶고, 적합도와 추천 이유를 먼저 읽게 구성했습니다.">
            <div className="grid gap-3">
              <article className="cw-interactive-card rounded-[26px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff7f8,#ffffff)] p-5">
                <div className="flex flex-wrap gap-2">
                  <Chip tone="rose">추천 1위</Chip>
                  <Chip tone="slate">{topPick.category}</Chip>
                </div>
                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[var(--text-strong)]">{topPick.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{topPick.summary}</p>
                  </div>
                  <div className="rounded-[22px] border border-[var(--surface-border)] bg-white px-4 py-4">
                    <MatchGauge value={topPick.match} helper={topPick.bestUse} />
                  </div>
                </div>
              </article>
              <article className="cw-interactive-card rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone="emerald">유지 권장</Chip>
                  <Chip tone="slate">{keepPick.category}</Chip>
                </div>
                <h3 className="mt-3 text-base font-semibold text-[var(--text-strong)]">
                  {keepPick.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  {keepPick.summary}
                </p>
              </article>
              <article className="cw-interactive-card rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone="amber">검토 필요</Chip>
                  <Chip tone="slate">{reviewPick.category}</Chip>
                </div>
                <h3 className="mt-3 text-base font-semibold text-[var(--text-strong)]">{reviewPick.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  {reviewPick.summary}
                </p>
              </article>
            </div>
          </Panel>

          <Panel title="빠른 작업" subtitle="혜택 화면에서 자주 쓰는 작업을 바로 열 수 있게 정리했습니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionButton kind="primary">혜택 시뮬레이션</ActionButton>
              <ActionButton kind="secondary">즐겨찾기 저장</ActionButton>
              <ActionButton kind="ghost">카드 실적 열기</ActionButton>
              <ActionButton kind="ghost">바우처와 비교</ActionButton>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
