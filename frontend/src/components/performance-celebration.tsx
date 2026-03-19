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
    if (unlockedCount > 0) return `${unlockedCount} voucher unlock${unlockedCount > 1 ? "s" : ""} ready`;
    if (progress >= 100) return "Current tier fully secured";
    if (nextTier) return `${nextTier} is within reach`;
    return "Annual performance is on track";
  }, [nextTier, progress, unlockedCount]);

  const helper = useMemo(() => {
    if (remainingAmount && remainingAmount > 0) {
      return `${formatCurrency(remainingAmount)} left to close the gap`;
    }
    if (nextTier) {
      return `Use this brief before opening the full performance detail`;
    }
    return "Current tier summary and unlock posture";
  }, [nextTier, remainingAmount]);

  return (
    <>
      <div className="rounded-[24px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff2f6,#fffafc)] p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
              Milestone brief
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
            Open milestone brief
          </ActionButton>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone="rose">{currentTier}</Chip>
          <Chip tone={specialActive ? "emerald" : "slate"}>
            {specialActive ? "Special period" : "Normal period"}
          </Chip>
          <Chip tone={graceActive ? "amber" : "slate"}>{graceActive ? "Grace on" : "Grace off"}</Chip>
          <Chip tone={unlockedCount > 0 ? "emerald" : "slate"}>{`Unlocked ${unlockedCount}`}</Chip>
        </div>
      </div>

      {open ? (
        <div
          className="cw-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Performance milestone brief"
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
                    Milestone brief
                  </div>
                  <h3 className="mt-2 text-[26px] font-semibold tracking-[-0.06em] text-[var(--text-strong)]">
                    {cardName}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                    {headline}. The modal keeps the tier, special-period, and unlock posture visible before you dive into the denser breakdown below.
                  </p>
                </div>
                <ActionButton kind="ghost" onClick={() => setOpen(false)}>
                  Close
                </ActionButton>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                    Progress
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
                    Tier posture
                  </div>
                  <div className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                    {currentTier}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">
                    {nextTier ? `Next: ${nextTier}` : "Top tier already reached"}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">
                    {remainingAmount && remainingAmount > 0
                      ? `${formatCurrency(remainingAmount)} remaining`
                      : "No remaining gap"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Chip tone="rose">{currentTier}</Chip>
                <Chip tone={specialActive ? "emerald" : "slate"}>
                  {specialActive ? "Special period active" : "Standard cycle"}
                </Chip>
                <Chip tone={graceActive ? "amber" : "slate"}>
                  {graceActive ? "Grace is protecting benefits" : "No grace period"}
                </Chip>
                <Chip tone={unlockedCount > 0 ? "emerald" : "slate"}>{`Unlocked ${unlockedCount}`}</Chip>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
