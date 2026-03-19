"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  Chip,
  MetricCard,
  Panel,
  TextField,
} from "@/components/app-shell";
import { CardThumbnail } from "@/components/preview-primitives";
import type { VoucherHistoryEntry, VoucherRecord } from "@/lib/cardwise-api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDaysUntilExpiry,
  unwrapArray,
} from "@/lib/cardwise-api";

type VouchersClientProps = {
  initialActiveVouchers: VoucherRecord[];
  initialExpiredVouchers: VoucherRecord[];
  initialExpiringVouchers: VoucherRecord[];
  initialSelectedCardVouchers: VoucherRecord[];
  seededCards: Array<{ userCardId: number; label: string }>;
  initialSelectedUserCardId: number;
};

type Scope = "all" | "active" | "expired";
type Category = "ALL" | "COUPON" | "SERVICE" | "LOUNGE" | "INSURANCE" | "OTHER";

const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "COUPON", label: "쿠폰" },
  { value: "SERVICE", label: "서비스" },
  { value: "LOUNGE", label: "라운지" },
  { value: "INSURANCE", label: "보험" },
  { value: "OTHER", label: "기타" },
];

function normalizeCategory(value: string | null | undefined) {
  const normalized = (value ?? "OTHER").toUpperCase();
  if (normalized === "COUPON") return "COUPON";
  if (normalized === "SERVICE") return "SERVICE";
  if (normalized === "LOUNGE") return "LOUNGE";
  if (normalized === "INSURANCE") return "INSURANCE";
  return "OTHER";
}

function categoryLabel(value: string | null | undefined) {
  const normalized = normalizeCategory(value);
  const labels: Record<string, string> = {
    COUPON: "쿠폰",
    SERVICE: "서비스",
    LOUNGE: "라운지",
    INSURANCE: "보험",
    OTHER: "기타",
  };
  return labels[normalized] ?? normalized;
}

function categoryTone(value: string | null | undefined) {
  const normalized = normalizeCategory(value);
  if (normalized === "LOUNGE") return "violet";
  if (normalized === "INSURANCE") return "amber";
  if (normalized === "SERVICE") return "emerald";
  if (normalized === "COUPON") return "rose";
  return "slate";
}

function unlockTone(value: string | null | undefined) {
  if (value === "UNLOCKED") return "emerald";
  if (value === "ELIGIBLE") return "amber";
  if (value === "LOCKED") return "rose";
  return "slate";
}

function expiryTone(days: number | null | undefined) {
  if (days === null || days === undefined) return "slate";
  if (days < 0) return "rose";
  if (days <= 7) return "amber";
  return "emerald";
}

function mergeVoucherLists(...lists: VoucherRecord[][]) {
  const map = new Map<number, VoucherRecord>();
  for (const list of lists) {
    for (const item of list) {
      map.set(item.userVoucherId, item);
    }
  }
  return Array.from(map.values());
}

function unlockStateLabel(value: string | null | undefined) {
  if (value === "UNLOCKED") return "사용 가능";
  if (value === "ELIGIBLE") return "조건 충족";
  if (value === "LOCKED") return "잠김";
  return "상태 미상";
}

function periodTypeLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    ANNUAL: "연간",
    MONTHLY: "월간",
    ONCE: "1회성",
  };
  return labels[value ?? ""] ?? (value ?? "기간 미상");
}

function historyActionLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    USE: "사용",
    UNUSE: "사용 취소",
    UPDATE: "수정",
  };
  return labels[value ?? ""] ?? (value ?? "수정");
}

function unlockTypeLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    ANNUAL_PERFORMANCE: "연간 실적",
    MONTHLY_PERFORMANCE: "월간 실적",
    IMMEDIATE: "즉시",
    MANUAL: "수동",
  };
  return labels[value ?? ""] ?? (value ?? "조건");
}

function resolveDaysUntilExpiry(item: VoucherRecord) {
  if (typeof item.daysUntilExpiry === "number" && Number.isFinite(item.daysUntilExpiry)) {
    return item.daysUntilExpiry;
  }

  if (!item.validUntil) {
    return null;
  }

  const diff = Math.ceil((new Date(item.validUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return Number.isFinite(diff) ? diff : null;
}

function toReasonMessage(value: unknown) {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "바우처 처리 중 알 수 없는 오류가 발생했습니다.";
}

async function fetchVoucherList(pathname: string) {
  const response = await fetch(pathname, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return unwrapArray<VoucherRecord>(await response.json());
}

async function fetchVoucherHistory(pathname: string) {
  const response = await fetch(pathname, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return unwrapArray<VoucherHistoryEntry>(await response.json());
}

export function VouchersClient({
  initialActiveVouchers,
  initialExpiredVouchers,
  initialExpiringVouchers,
  initialSelectedCardVouchers,
  seededCards,
  initialSelectedUserCardId,
}: VouchersClientProps) {
  const [scope, setScope] = useState<Scope>("active");
  const [category, setCategory] = useState<Category>("ALL");
  const [selectedUserCardDraft, setSelectedUserCardDraft] = useState(String(initialSelectedUserCardId));
  const [selectedUserCardId, setSelectedUserCardId] = useState(String(initialSelectedUserCardId));
  const [activeVouchers, setActiveVouchers] = useState(initialActiveVouchers);
  const [expiredVouchers, setExpiredVouchers] = useState(initialExpiredVouchers);
  const [expiringVouchers, setExpiringVouchers] = useState(initialExpiringVouchers);
  const [selectedCardVouchers, setSelectedCardVouchers] = useState(initialSelectedCardVouchers);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    initialSelectedCardVouchers[0]?.userVoucherId ?? null,
  );
  const [history, setHistory] = useState<VoucherHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const selectedCardLabel =
    seededCards.find((card) => String(card.userCardId) === selectedUserCardId)?.label ??
    `사용 카드 #${selectedUserCardId}`;

  useEffect(() => {
    void refreshData(selectedUserCardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserCardId]);

  useEffect(() => {
    if (!detailSheetOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailSheetOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [detailSheetOpen]);

  const filteredGlobalVouchers = useMemo(() => {
    const source =
      scope === "all"
        ? mergeVoucherLists(activeVouchers, expiredVouchers)
        : scope === "active"
          ? activeVouchers
          : expiredVouchers;

    return source.filter((item) => {
      if (category === "ALL") return true;
      return normalizeCategory(item.voucherType) === category;
    });
  }, [activeVouchers, expiredVouchers, category, scope]);

  const filteredExpiringVouchers = useMemo(
    () =>
      expiringVouchers.filter((item) => {
        if (category === "ALL") return true;
        return normalizeCategory(item.voucherType) === category;
      }),
    [category, expiringVouchers],
  );

  const filteredSelectedCardVouchers = useMemo(
    () =>
      selectedCardVouchers.filter((item) => {
        if (category === "ALL") return true;
        return normalizeCategory(item.voucherType) === category;
      }),
    [category, selectedCardVouchers],
  );

  const mergedVouchers = useMemo(
    () => mergeVoucherLists(activeVouchers, expiredVouchers, expiringVouchers, selectedCardVouchers),
    [activeVouchers, expiredVouchers, expiringVouchers, selectedCardVouchers],
  );

  const selectedVoucher = useMemo(() => {
    if (selectedVoucherId === null) return null;
    return mergedVouchers.find((item) => item.userVoucherId === selectedVoucherId) ?? null;
  }, [mergedVouchers, selectedVoucherId]);

  const stats = useMemo(() => {
    const locked = selectedCardVouchers.filter((item) => item.unlockState === "LOCKED").length;
    const eligible = selectedCardVouchers.filter((item) => item.unlockState === "ELIGIBLE").length;
    const expiringSoon = filteredExpiringVouchers.length;
    return { locked, eligible, expiringSoon };
  }, [filteredExpiringVouchers.length, selectedCardVouchers]);

  async function loadHistory(userVoucherId: number) {
    setHistoryLoading(true);
    try {
      const nextHistory = await fetchVoucherHistory(`/api/user-vouchers/${userVoucherId}/history`);
      setHistory(nextHistory);
    } catch (err) {
      setHistory([]);
      setError(toReasonMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refreshData(userCardId = selectedUserCardId) {
    setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const [activeResult, expiredResult, expiringResult, cardResult] = await Promise.allSettled([
        fetchVoucherList("/api/vouchers?status=active"),
        fetchVoucherList("/api/vouchers?status=expired"),
        fetchVoucherList("/api/vouchers/expiring?days=7"),
        fetchVoucherList(`/api/user-cards/${userCardId}/vouchers`),
      ]);

      const nextActive = activeResult.status === "fulfilled" ? activeResult.value : [];
      const nextExpired = expiredResult.status === "fulfilled" ? expiredResult.value : [];
      const nextExpiring = expiringResult.status === "fulfilled" ? expiringResult.value : [];
      const nextCardVouchers = cardResult.status === "fulfilled" ? cardResult.value : [];
      const nextMergedVouchers = mergeVoucherLists(
        nextActive,
        nextExpired,
        nextExpiring,
        nextCardVouchers,
      );

      setActiveVouchers(nextActive);
      setExpiredVouchers(nextExpired);
      setExpiringVouchers(nextExpiring);
      setSelectedCardVouchers(nextCardVouchers);

      const nextSelectedVoucherId =
        selectedVoucherId !== null &&
        nextMergedVouchers.some((item) => item.userVoucherId === selectedVoucherId)
          ? selectedVoucherId
          : nextCardVouchers[0]?.userVoucherId ?? nextMergedVouchers[0]?.userVoucherId ?? null;
      setSelectedVoucherId(nextSelectedVoucherId);

      const failures = [activeResult, expiredResult, expiringResult, cardResult].filter(
        (item) => item.status === "rejected",
      ) as PromiseRejectedResult[];

      if (failures.length > 0) {
        setError(toReasonMessage(failures[0].reason));
      }

      if (nextSelectedVoucherId !== null) {
        await loadHistory(nextSelectedVoucherId);
      } else {
        setHistory([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function selectCard(cardId: string) {
    const normalized = cardId.trim();
    if (!normalized) return;
    setSelectedUserCardId(normalized);
  }

  async function selectVoucher(userVoucherId: number) {
    setSelectedVoucherId(userVoucherId);
    setError(null);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setDetailSheetOpen(true);
    }
    await loadHistory(userVoucherId);
  }

  async function applyVoucherAction(action: "use" | "unuse", voucher: VoucherRecord) {
    setActioningId(voucher.userVoucherId);
    setError(null);

    try {
      const response = await fetch(`/api/user-vouchers/${voucher.userVoucherId}/${action}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await refreshData(selectedUserCardId);
    } catch (err) {
      setError(toReasonMessage(err));
    } finally {
      setActioningId(null);
    }
  }

  function canUseVoucher(voucher: VoucherRecord) {
    const remaining = voucher.remainingCount ?? null;
    const isLocked = voucher.unlockState === "LOCKED" || voucher.unlockState === "ELIGIBLE";
    const isExpired =
      voucher.validUntil !== undefined &&
      voucher.validUntil !== null &&
      new Date(voucher.validUntil).getTime() < Date.now();

    return !isLocked && !isExpired && (remaining === null || remaining > 0);
  }

  function canUnuseVoucher(voucher: VoucherRecord) {
    if (voucher.totalCount === null || voucher.totalCount === undefined) return false;
    if (voucher.remainingCount === null || voucher.remainingCount === undefined) return false;
    return voucher.remainingCount < voucher.totalCount;
  }

  function renderVoucherCard(item: VoucherRecord, showActions: boolean) {
    const daysUntilExpiry = resolveDaysUntilExpiry(item);
    const remainingCount = item.remainingCount ?? null;
    const totalCount = item.totalCount ?? null;
    const usedCount =
      remainingCount !== null && totalCount !== null ? Math.max(totalCount - remainingCount, 0) : null;
    const progressPercent =
      remainingCount !== null && totalCount !== null && totalCount > 0
        ? Math.min(100, Math.max(0, (remainingCount / totalCount) * 100))
        : null;
    const isSelected = selectedVoucherId === item.userVoucherId;
    const expired =
      item.validUntil !== undefined &&
      item.validUntil !== null &&
      new Date(item.validUntil).getTime() < Date.now();

    return (
      <article
        key={item.userVoucherId}
        className={`cw-interactive-card cw-voucher-card rounded-[28px] border p-4 shadow-[0_14px_30px_rgba(190,24,60,0.06)] transition ${
          isSelected
            ? "border-[var(--surface-border-strong)] bg-[linear-gradient(180deg,#fff8fa,#ffffff)]"
            : "border-[var(--surface-border)] bg-white hover:-translate-y-0.5 hover:border-[var(--surface-border-strong)]"
        }`}
      >
        <button
          type="button"
          onClick={() => void selectVoucher(item.userVoucherId)}
          className="block w-full text-left"
        >
          <div className="grid gap-4">
            <div className="cw-voucher-flip">
              <div className="cw-voucher-flip__inner">
                <div className="cw-voucher-flip__face rounded-[24px] border border-[var(--surface-border)] bg-[linear-gradient(160deg,#fff8fa,#ffffff)] p-4">
                  <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
                    <CardThumbnail
                      seed={item.userCardId}
                      title={item.cardName}
                      subtitle={item.cardNickname ?? categoryLabel(item.voucherType)}
                      badge={unlockStateLabel(item.unlockState)}
                      compact
                    />

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Chip tone={unlockTone(item.unlockState)}>{unlockStateLabel(item.unlockState)}</Chip>
                        <Chip tone={categoryTone(item.voucherType)}>{categoryLabel(item.voucherType)}</Chip>
                        <Chip tone={expiryTone(daysUntilExpiry)}>
                          {expired ? "만료됨" : formatDaysUntilExpiry(daysUntilExpiry)}
                        </Chip>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                          {item.voucherName}
                        </h3>
                        <p className="mt-1 text-[13px] leading-6 text-[var(--text-body)]">
                          {item.cardName}
                          {item.cardNickname ? ` · ${item.cardNickname}` : ""}
                        </p>
                        <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[var(--text-muted)]">
                          {item.description ?? "설명이 없습니다."}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]">
                          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                            사용량
                          </div>
                          <div className="mt-2 font-medium text-[var(--text-strong)]">
                            {totalCount === null ? "제한 없음" : `${usedCount ?? 0}/${totalCount}`}
                          </div>
                        </div>
                        <div className="rounded-[18px] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-body)]">
                          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                            만료일
                          </div>
                          <div className="mt-2 font-medium text-[var(--text-strong)]">{formatDate(item.validUntil)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cw-voucher-flip__face cw-voucher-flip__face--back rounded-[24px] border border-[var(--surface-border)] bg-[linear-gradient(160deg,#fff2f5,#fffafc)] p-4">
                  <div className="grid h-full gap-4">
                    <div className="flex flex-wrap gap-2">
                      <Chip tone="rose">{unlockTypeLabel(item.unlockType)}</Chip>
                      <Chip tone="slate">{periodTypeLabel(item.periodType)}</Chip>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                        해금 브리프
                      </div>
                      <div className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                        {item.unlockState === "UNLOCKED"
                          ? "이미 사용 가능한 상태입니다."
                          : item.unlockState === "ELIGIBLE"
                            ? "조건은 충족했고, 반영 시점만 남았습니다."
                            : `${formatCurrency(item.remainingAmount)} 더 채우면 열립니다.`}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3 text-sm text-[var(--text-body)]">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                          현재 / 필요 실적
                        </div>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">
                          {formatCurrency(item.currentAnnualPerformance)} / {formatCurrency(item.requiredAnnualPerformance)}
                        </div>
                      </div>
                      <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3 text-sm text-[var(--text-body)]">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                          사용 가능 시점
                        </div>
                        <div className="mt-2 font-medium text-[var(--text-strong)]">
                          {item.availableAt ? formatDate(item.availableAt) : "즉시"}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-white/70 px-4 py-3 text-sm text-[var(--text-body)]">
                      {item.notes ?? "카드를 열면 상세와 사용 이력을 바로 확인할 수 있습니다."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff4f6,#ffffff)] px-4 py-3">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  <span>남은 사용량</span>
                  <span>{totalCount === null ? "제한 없음" : `${remainingCount ?? 0}회 남음`}</span>
                </div>
                {progressPercent !== null ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary-100)]">
                    <div
                      className="cw-progress-fill-animated h-full rounded-full bg-[linear-gradient(90deg,var(--primary-300),var(--primary-400))]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-[var(--text-muted)]">횟수 제한 없음</div>
                )}
              </div>

              <div className="grid gap-1 text-sm text-[var(--text-body)]">
                <div className="flex justify-between gap-4">
                  <span>사용 시작</span>
                  <span>{formatDate(item.validFrom)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>만료일</span>
                  <span>{formatDate(item.validUntil)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>남은 금액</span>
                  <span>{formatCurrency(item.remainingAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {showActions ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton
              kind="primary"
              onClick={(event) => {
                event.stopPropagation();
                void applyVoucherAction("use", item);
              }}
              disabled={actioningId === item.userVoucherId || !canUseVoucher(item)}
            >
              사용
            </ActionButton>
            <ActionButton
              kind="secondary"
              onClick={(event) => {
                event.stopPropagation();
                void applyVoucherAction("unuse", item);
              }}
              disabled={actioningId === item.userVoucherId || !canUnuseVoucher(item)}
            >
              사용 취소
            </ActionButton>
            {item.unlockState === "ELIGIBLE" ? <Chip tone="amber">해금 요청 필요</Chip> : null}
          </div>
        ) : null}
      </article>
    );
  }

  const selectedCardLockedCount = filteredSelectedCardVouchers.filter(
    (item) => item.unlockState === "LOCKED",
  ).length;
  const selectedVoucherDetails = selectedVoucher ? (
    <div className="grid gap-4">
      <div className="rounded-[24px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,#fff5f7,#ffffff)] p-4">
        <div className="flex flex-wrap gap-2">
          <Chip tone={unlockTone(selectedVoucher.unlockState)}>{unlockStateLabel(selectedVoucher.unlockState)}</Chip>
          <Chip tone={categoryTone(selectedVoucher.voucherType)}>{categoryLabel(selectedVoucher.voucherType)}</Chip>
          <Chip tone="slate">{periodTypeLabel(selectedVoucher.periodType)}</Chip>
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
          {selectedVoucher.voucherName}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-body)]">
          {selectedVoucher.cardName}
          {selectedVoucher.cardNickname ? ` · ${selectedVoucher.cardNickname}` : ""}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          {selectedVoucher.description ?? "설명이 없습니다."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MetricCard
          label="잔여 / 전체"
          value={
            selectedVoucher.totalCount === null || selectedVoucher.totalCount === undefined
              ? "제한 없음"
              : `${selectedVoucher.remainingCount ?? 0} / ${selectedVoucher.totalCount}`
          }
          helper="현재 사용 상태"
        />
        <MetricCard
          label="만료"
          value={formatDaysUntilExpiry(resolveDaysUntilExpiry(selectedVoucher))}
          helper={formatDate(selectedVoucher.validUntil)}
        />
      </div>

      <div className="grid gap-2 rounded-[24px] border border-[var(--surface-border)] bg-white p-4 text-sm text-[var(--text-body)]">
        <div className="flex justify-between gap-4">
          <span>연간 조건</span>
          <span>{formatCurrency(selectedVoucher.requiredAnnualPerformance)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>현재 연간 실적</span>
          <span>{formatCurrency(selectedVoucher.currentAnnualPerformance)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>해금까지 남은 금액</span>
          <span>{formatCurrency(selectedVoucher.remainingAmount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>사용 가능 시점</span>
          <span>{selectedVoucher.availableAt ? formatDate(selectedVoucher.availableAt) : "-"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>사용 시작</span>
          <span>{formatDate(selectedVoucher.validFrom)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>만료일</span>
          <span>{formatDate(selectedVoucher.validUntil)}</span>
        </div>
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
          이력
        </div>
        {historyLoading ? (
          <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
            이력을 불러오는 중입니다...
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
            아직 기록된 이력이 없습니다.
          </div>
        ) : (
          <div className="grid gap-3">
            {history.map((entry, index) => (
              <div
                key={`${entry.voucherHistoryId ?? entry.createdAt}-${index}`}
                className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <Chip tone="slate">{historyActionLabel(entry.action)}</Chip>
                  <Chip tone="slate">{formatDateTime(entry.createdAt)}</Chip>
                </div>
                <p className="mt-3 text-sm text-[var(--text-body)]">{entry.memo ?? "-"}</p>
                {entry.beforeRemainingCount !== undefined || entry.afterRemainingCount !== undefined ? (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {entry.beforeRemainingCount ?? "-"} → {entry.afterRemainingCount ?? "-"}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
      목록에서 바우처를 선택하면 상세와 이력을 볼 수 있습니다.
    </div>
  );

  return (
    <div className="grid gap-5">
      <Panel
        title="바우처 제어"
        subtitle="카드를 바꾸고, 카테고리를 필터링하고, 사용 동작까지 화면 안에서 바로 처리합니다."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="활성" value={String(activeVouchers.length)} helper="현재 활성 목록" />
          <MetricCard label="만료 임박" value={String(filteredExpiringVouchers.length)} helper="7일 이내 확인" />
          <MetricCard label="선택 카드" value={String(filteredSelectedCardVouchers.length)} helper={selectedCardLabel} />
          <MetricCard label="잠김" value={String(selectedCardLockedCount)} helper="해금 조건 대기" />
        </div>

        <div className="mt-5 rounded-[26px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#fff8fa,#ffffff)] p-4">
          <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <CardThumbnail
              seed={Number(selectedUserCardId)}
              title={selectedCardLabel}
              subtitle={stats.locked > 0 ? `${stats.locked}개 잠김` : "사용 가능 흐름 점검"}
              badge={stats.expiringSoon > 0 ? `D-7 ${stats.expiringSoon}` : "Deck"}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[var(--surface-border)] bg-white px-4 py-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  조건 충족
                </div>
                <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                  {stats.eligible}
                </div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">반영 시점 확인 필요</div>
              </div>
              <div className="rounded-[20px] border border-[var(--surface-border)] bg-white px-4 py-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  잠김
                </div>
                <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                  {stats.locked}
                </div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">추가 실적 필요</div>
              </div>
              <div className="rounded-[20px] border border-[var(--surface-border)] bg-white px-4 py-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  만료 임박
                </div>
                <div className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                  {stats.expiringSoon}
                </div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">먼저 확인할 항목</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="카드 ID"
              value={selectedUserCardDraft}
              onChange={(event) => setSelectedUserCardDraft(event.target.value)}
              placeholder="1"
            />
            <div className="flex items-end">
              <ActionButton
                kind="ghost"
                onClick={() => void selectCard(selectedUserCardDraft)}
                disabled={loading || refreshing}
                className="w-full"
              >
                {loading || refreshing ? "불러오는 중..." : "카드 바우처 불러오기"}
              </ActionButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {seededCards.map((card) => (
              <button
                key={card.userCardId}
                type="button"
                onClick={() => {
                  setSelectedUserCardDraft(String(card.userCardId));
                  void selectCard(String(card.userCardId));
                }}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  String(card.userCardId) === selectedUserCardId
                    ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"
                }`}
              >
                {card.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["all", "active", "expired"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                scope === value
                  ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"
              }`}
            >
              {value === "all" ? "전체" : value === "active" ? "활성" : "만료"}
            </button>
          ))}
          {categoryOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === item.value
                  ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  : "border-[var(--surface-border)] bg-white text-[var(--text-body)] hover:border-[var(--surface-border-strong)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone="rose">잠김 {stats.locked}</Chip>
          <Chip tone="amber">조건 충족 {stats.eligible}</Chip>
          <Chip tone="emerald">만료 임박 {stats.expiringSoon}</Chip>
        </div>

        {error ? (
          <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="만료 임박" subtitle="7일 이내 만료되는 바우처를 먼저 모아 빠르게 검토할 수 있게 했습니다.">
          <div className="grid gap-3">
            {filteredExpiringVouchers.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                곧 만료되는 바우처가 없습니다.
              </div>
            ) : (
              filteredExpiringVouchers.map((item) => renderVoucherCard(item, false))
            )}
          </div>
        </Panel>

        <Panel
          title={`선택 카드 바우처 · ${selectedCardLabel}`}
          subtitle="선택 카드 목록에서 바로 사용과 사용 취소를 수행할 수 있습니다."
        >
          <div className="grid gap-3">
            {filteredSelectedCardVouchers.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                이 카드에는 불러온 바우처가 없습니다.
              </div>
            ) : (
              filteredSelectedCardVouchers.map((item) => renderVoucherCard(item, true))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="전체 바우처" subtitle="BFF 프록시를 통해 받은 활성 / 만료 목록을 한 번에 보여줍니다.">
          <div className="grid gap-3">
            {filteredGlobalVouchers.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                현재 필터에 맞는 바우처가 없습니다.
              </div>
            ) : (
              filteredGlobalVouchers.map((item) => renderVoucherCard(item, false))
            )}
          </div>
        </Panel>

        <Panel
          className="hidden xl:block"
          title="바우처 상세"
          subtitle="바우처를 열어 해금 상태, 잔여 횟수, 사용 / 사용 취소 이력을 확인할 수 있습니다."
        >
          {selectedVoucherDetails}
        </Panel>
      </div>

      {detailSheetOpen && selectedVoucher ? (
        <div
          className="cw-sheet-backdrop xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="바우처 상세 시트"
        >
          <button
            type="button"
            aria-label="바우처 상세 시트 닫기"
            className="absolute inset-0 h-full w-full cursor-default bg-transparent"
            onClick={() => setDetailSheetOpen(false)}
          />
          <div className="cw-bottom-sheet relative z-[1]">
            <div className="sticky top-0 z-[1] flex items-center justify-between gap-3 border-b border-[var(--surface-border)] bg-[rgba(255,255,255,0.92)] px-5 py-4 backdrop-blur-xl">
              <div className="min-w-0">
                <div className="cw-sheet-handle mb-3" />
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  바우처 상세 시트
                </p>
                <h3 className="mt-1 truncate text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                  {selectedVoucher.voucherName}
                </h3>
              </div>
              <ActionButton kind="ghost" onClick={() => setDetailSheetOpen(false)}>
                닫기
              </ActionButton>
            </div>
            <div className="px-5 pb-6 pt-4">{selectedVoucherDetails}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
