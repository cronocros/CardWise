"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionButton, Chip } from "@/components/app-shell";
import { formatCurrency } from "@/lib/cardwise-api";

type PerformanceCelebrationProps = {
  cardName: string;
  currentTier: string;
  nextTier: string | null;
  progress: number;
  specialActive: boolean;
  graceActive: boolean;
  unlockedCount: number;
  remainingAmount?: number | null;
};

export function PerformanceCelebration({
  cardName,
  currentTier,
  nextTier,
  progress,
  specialActive,
  graceActive,
  unlockedCount,
  remainingAmount,
}: PerformanceCelebrationProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const headline = useMemo(() => {
    if (unlockedCount > 0) return `${unlockedCount}개 바우처를 바로 사용할 수 있습니다`;
    if (progress >= 100) return "현재 구간을 안정적으로 확보했습니다";
    if (nextTier) return `${nextTier} 구간이 눈앞입니다`;
    return "연간 실적 흐름이 안정적으로 유지되고 있습니다";
  }, [nextTier, progress, unlockedCount]);

  const helper = useMemo(() => {
    if (remainingAmount && remainingAmount > 0) {
      return `다음 구간까지 ${formatCurrency(remainingAmount)} 남았습니다`;
    }
    if (nextTier) {
      return "실적 상세를 깊게 보기 전에 핵심 상태를 먼저 확인하세요";
    }
    return "현재 구간 요약과 바우처 해금 상태를 빠르게 확인할 수 있습니다";
  }, [nextTier, remainingAmount]);

  return (
    <>
      <div className="rounded-[24px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff2f6,#fffafc)] p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
              구간 브리프
            </div>
            <div className="mt-2 text-[20px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
              {headline}
            </div>
            <div className="mt-2 text-sm text-[var(--text-muted)]">{helper}</div>
          </div>

          <ActionButton
            kind="primary"
            className={progress >= 85 || unlockedCount > 0 || specialActive ? "animate-soft-pulse" : ""}
            onClick={() => setOpen(true)}
            >
            구간 브리프 열기
          </ActionButton>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone="rose">{currentTier}</Chip>
          <Chip tone={specialActive ? "emerald" : "slate"}>
            {specialActive ? "특별 기간" : "일반 기간"}
          </Chip>
          <Chip tone={graceActive ? "amber" : "slate"}>{graceActive ? "유예 적용" : "유예 없음"}</Chip>
          <Chip tone={unlockedCount > 0 ? "emerald" : "slate"}>{`사용 가능 ${unlockedCount}`}</Chip>
        </div>
      </div>

      {open ? (
        <div
          className="cw-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="실적 구간 브리프"
          onClick={() => setOpen(false)}
        >
          <div className="cw-modal-card p-6 sm:p-7" onClick={(event) => event.stopPropagation()}>
            <div className="cw-celebration-confetti" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="relative z-[1]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    구간 브리프
                  </div>
                  <h3 className="mt-2 text-[26px] font-semibold tracking-[-0.06em] text-[var(--text-strong)]">
                    {cardName}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                    {headline}. 아래의 상세 내역으로 들어가기 전에 구간, 특별 기간, 해금 상태를 먼저 빠르게 확인할 수 있도록 정리했습니다.
                  </p>
                </div>
                <ActionButton kind="ghost" onClick={() => setOpen(false)}>
                  닫기
                </ActionButton>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                    진행률
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.06em] text-[var(--text-strong)]">
                    {progress}%
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                    <div
                      className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                    구간 상태
                  </div>
                  <div className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                    {currentTier}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">
                    {nextTier ? `다음: ${nextTier}` : "이미 최상위 구간에 도달했습니다"}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">
                    {remainingAmount && remainingAmount > 0
                      ? `${formatCurrency(remainingAmount)} 남음`
                      : "남은 차감액이 없습니다"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Chip tone="rose">{currentTier}</Chip>
                <Chip tone={specialActive ? "emerald" : "slate"}>
                  {specialActive ? "특별 기간 적용 중" : "기본 주기"}
                </Chip>
                <Chip tone={graceActive ? "amber" : "slate"}>
                  {graceActive ? "유예가 혜택을 보호 중" : "유예 없음"}
                </Chip>
                <Chip tone={unlockedCount > 0 ? "emerald" : "slate"}>{`사용 가능 ${unlockedCount}`}</Chip>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
