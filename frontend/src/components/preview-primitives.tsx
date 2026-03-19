import type { CSSProperties } from "react";
import { formatCurrency } from "@/lib/cardwise-api";

type PaletteKey = "rose" | "ocean" | "forest" | "violet" | "gold" | "slate";

const paletteMap: Record<
  PaletteKey,
  {
    background: string;
    glow: string;
    accent: string;
  }
> = {
  rose: {
    background: "linear-gradient(135deg, #fb7185 0%, #f43f5e 44%, #9f1239 100%)",
    glow: "rgba(244, 63, 94, 0.34)",
    accent: "rgba(255, 241, 242, 0.82)",
  },
  ocean: {
    background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 44%, #1d4ed8 100%)",
    glow: "rgba(37, 99, 235, 0.3)",
    accent: "rgba(239, 246, 255, 0.82)",
  },
  forest: {
    background: "linear-gradient(135deg, #34d399 0%, #10b981 44%, #047857 100%)",
    glow: "rgba(16, 185, 129, 0.28)",
    accent: "rgba(236, 253, 245, 0.82)",
  },
  violet: {
    background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 44%, #6d28d9 100%)",
    glow: "rgba(139, 92, 246, 0.28)",
    accent: "rgba(245, 243, 255, 0.82)",
  },
  gold: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 44%, #b45309 100%)",
    glow: "rgba(245, 158, 11, 0.28)",
    accent: "rgba(255, 251, 235, 0.84)",
  },
  slate: {
    background: "linear-gradient(135deg, #64748b 0%, #334155 44%, #0f172a 100%)",
    glow: "rgba(51, 65, 85, 0.3)",
    accent: "rgba(241, 245, 249, 0.82)",
  },
};

const paletteKeys = Object.keys(paletteMap) as PaletteKey[];

function resolvePalette(seed: number, palette?: PaletteKey) {
  if (palette) {
    return paletteMap[palette];
  }
  return paletteMap[paletteKeys[Math.abs(seed) % paletteKeys.length]];
}

function maskCardNumber(seed: number) {
  const lastFour = String((seed * 1729 + 4173) % 10000).padStart(4, "0");
  return `**** **** **** ${lastFour}`;
}

function expiryLabel(seed: number) {
  const month = String(((seed * 3) % 12) + 1).padStart(2, "0");
  const year = String(27 + (seed % 4));
  return `${month}/${year}`;
}

export function CardThumbnail({
  seed,
  title,
  subtitle,
  badge,
  palette,
  compact = false,
}: {
  seed: number;
  title: string;
  subtitle?: string;
  badge?: string;
  palette?: PaletteKey;
  compact?: boolean;
}) {
  const colors = resolvePalette(seed, palette);
  const style = {
    "--card-thumb-bg": colors.background,
    "--card-thumb-glow": colors.glow,
    "--card-thumb-accent": colors.accent,
  } as CSSProperties;

  return (
    <div className={`cw-card-thumbnail ${compact ? "cw-card-thumbnail--compact" : ""}`} style={style}>
      <div className="cw-card-thumbnail__noise" />
      <div className="relative z-[1] flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/72">
              CardWise Flow
            </div>
            <div className="mt-2 max-w-[12rem] text-[18px] font-semibold tracking-[-0.05em] text-white">
              {title}
            </div>
          </div>
          <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white/88">
            {badge ?? "Active"}
          </div>
        </div>

        <div className="mt-auto">
          <div className="text-[13px] font-medium tracking-[0.18em] text-white/90">{maskCardNumber(seed)}</div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/64">Holder</div>
              <div className="mt-1 text-sm font-medium text-white/92">{subtitle ?? "Main Deck"}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/64">Valid</div>
              <div className="mt-1 text-sm font-medium text-white/92">{expiryLabel(seed)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TierProgressTrack({
  currentTier,
  nextTier,
  progress,
  accumulated,
  remainingAmount,
}: {
  currentTier: string;
  nextTier: string;
  progress: number;
  accumulated: number;
  remainingAmount?: number | null;
}) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="rounded-[22px] border border-[var(--surface-border)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
          실적 트랙
        </div>
        <div className="text-sm font-medium text-[var(--text-strong)]">{formatCurrency(accumulated)}</div>
      </div>

      <div className="relative mt-4 h-7">
        <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[var(--primary-100)]" />
        <div
          className="cw-progress-fill-animated absolute left-0 top-3 h-1 rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-500))]"
          style={{ width: `${safeProgress}%` }}
        />
        <span className="absolute left-0 top-[0.35rem] h-5 w-5 rounded-full border-4 border-white bg-[var(--primary-300)] shadow-[0_8px_18px_rgba(244,63,94,0.22)]" />
        <span
          className="absolute top-[0.18rem] h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-[var(--primary-500)] shadow-[0_12px_22px_rgba(244,63,94,0.28)]"
          style={{ left: `${safeProgress}%` }}
        />
        <span className="absolute right-0 top-[0.35rem] h-5 w-5 rounded-full border-4 border-white bg-[var(--neutral-200)]" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-[var(--text-muted)]">
        <div>
          <div className="font-medium text-[var(--text-strong)]">{currentTier}</div>
          <div className="mt-1">현재 구간</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-[var(--accent-strong)]">{safeProgress}%</div>
          <div className="mt-1">도달률</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-[var(--text-strong)]">{nextTier}</div>
          <div className="mt-1">
            {remainingAmount && remainingAmount > 0 ? `${formatCurrency(remainingAmount)} 남음` : "다음 구간 도달"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchGauge({
  value,
  label = "매칭",
  helper,
}: {
  value: number;
  label?: string;
  helper?: string;
}) {
  const normalized = Math.min(100, Math.max(0, value));
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[84px] w-[84px] shrink-0">
        <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke="rgba(253, 164, 175, 0.18)"
            strokeWidth="8"
          />
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[22px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
            {normalized}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
            %
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
          {label}
        </div>
        <div className="mt-1 text-sm font-medium text-[var(--text-strong)]">
          지금 패턴과 가장 잘 맞는 혜택
        </div>
        {helper ? <div className="mt-1 text-sm text-[var(--text-muted)]">{helper}</div> : null}
      </div>
    </div>
  );
}
