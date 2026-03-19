"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  Chip,
  MetricCard,
  Panel,
  TextField,
} from "@/components/app-shell";
import type {
  VoucherHistoryEntry,
  VoucherRecord,
} from "@/lib/cardwise-api";
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
  { value: "ALL", label: "All" },
  { value: "COUPON", label: "Coupon" },
  { value: "SERVICE", label: "Service" },
  { value: "LOUNGE", label: "Lounge" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "OTHER", label: "Other" },
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
    COUPON: "Coupon",
    SERVICE: "Service",
    LOUNGE: "Lounge",
    INSURANCE: "Insurance",
    OTHER: "Other",
  };
  return labels[normalized] ?? normalized;
}

function categoryTone(value: string | null | undefined) {
  const normalized = normalizeCategory(value);
  if (normalized === "LOUNGE") return "violet";
  if (normalized === "INSURANCE") return "amber";
  if (normalized === "SERVICE") return "emerald";
  if (normalized === "COUPON") return "slate";
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

function resolveDaysUntilExpiry(item: VoucherRecord) {
  if (typeof item.daysUntilExpiry === "number" && Number.isFinite(item.daysUntilExpiry)) {
    return item.daysUntilExpiry;
  }

  if (!item.validUntil) {
    return null;
  }

  const diff = Math.ceil(
    (new Date(item.validUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );

  return Number.isFinite(diff) ? diff : null;
}

function toReasonMessage(value: unknown) {
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === "string") {
    return value;
  }
  return "Unexpected voucher error";
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

  const selectedCardLabel =
    seededCards.find((card) => String(card.userCardId) === selectedUserCardId)?.label ??
    `User card #${selectedUserCardId}`;

  useEffect(() => {
    void refreshData(selectedUserCardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserCardId]);

  const filteredGlobalVouchers = useMemo(() => {
    const source =
      scope === "all"
        ? mergeVoucherLists(activeVouchers, expiredVouchers)
        : scope === "active"
          ? activeVouchers
          : expiredVouchers;

    return source.filter((item) => {
      if (category === "ALL") {
        return true;
      }
      return normalizeCategory(item.voucherType) === category;
    });
  }, [activeVouchers, expiredVouchers, category, scope]);

  const filteredExpiringVouchers = useMemo(
    () =>
      expiringVouchers.filter((item) => {
        if (category === "ALL") {
          return true;
        }
        return normalizeCategory(item.voucherType) === category;
      }),
    [category, expiringVouchers],
  );

  const filteredSelectedCardVouchers = useMemo(
    () =>
      selectedCardVouchers.filter((item) => {
        if (category === "ALL") {
          return true;
        }
        return normalizeCategory(item.voucherType) === category;
      }),
    [category, selectedCardVouchers],
  );

  const selectedVoucher = useMemo(() => {
    if (selectedVoucherId === null) {
      return null;
    }

    return (
      selectedCardVouchers.find((item) => item.userVoucherId === selectedVoucherId) ??
      mergeVoucherLists(activeVouchers, expiredVouchers, expiringVouchers, selectedCardVouchers).find(
        (item) => item.userVoucherId === selectedVoucherId,
      ) ??
      null
    );
  }, [activeVouchers, expiredVouchers, expiringVouchers, selectedCardVouchers, selectedVoucherId]);

  async function loadHistory(userVoucherId: number) {
    setHistoryLoading(true);
    setError(null);
    try {
      const items = await fetchVoucherHistory(`/api/user-vouchers/${userVoucherId}/history`);
      setHistory(items);
    } catch (err) {
      setHistory([]);
      setError(toReasonMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refreshData(nextSelectedUserCardId = selectedUserCardId) {
    setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const [activeResult, expiredResult, expiringResult, cardResult] = await Promise.allSettled([
        fetchVoucherList("/api/vouchers?status=active"),
        fetchVoucherList("/api/vouchers?status=expired"),
        fetchVoucherList("/api/vouchers/expiring?days=7"),
        nextSelectedUserCardId
          ? fetchVoucherList(`/api/user-cards/${encodeURIComponent(nextSelectedUserCardId)}/vouchers`)
          : Promise.resolve([] as VoucherRecord[]),
      ]);

      const nextActive =
        activeResult.status === "fulfilled" ? activeResult.value : initialActiveVouchers;
      const nextExpired =
        expiredResult.status === "fulfilled" ? expiredResult.value : initialExpiredVouchers;
      const nextExpiring =
        expiringResult.status === "fulfilled" ? expiringResult.value : initialExpiringVouchers;
      const nextCardVouchers =
        cardResult.status === "fulfilled" ? cardResult.value : [];

      setActiveVouchers(nextActive);
      setExpiredVouchers(nextExpired);
      setExpiringVouchers(nextExpiring);
      setSelectedCardVouchers(nextCardVouchers);

      const selectedStillExists =
        selectedVoucherId !== null &&
        nextCardVouchers.some((item) => item.userVoucherId === selectedVoucherId);
      const nextSelectedVoucherId = selectedStillExists
        ? selectedVoucherId
        : nextCardVouchers[0]?.userVoucherId ?? null;
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
    if (!normalized) {
      return;
    }

    setSelectedUserCardId(normalized);
  }

  async function selectVoucher(userVoucherId: number) {
    setSelectedVoucherId(userVoucherId);
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
    if (voucher.totalCount === null || voucher.totalCount === undefined) {
      return false;
    }

    if (voucher.remainingCount === null || voucher.remainingCount === undefined) {
      return false;
    }

    return voucher.remainingCount < voucher.totalCount;
  }

  function renderVoucherCard(item: VoucherRecord, showActions: boolean) {
    const daysUntilExpiry = resolveDaysUntilExpiry(item);
    const remainingCount = item.remainingCount ?? null;
    const totalCount = item.totalCount ?? null;
    const usedCount =
      remainingCount !== null && totalCount !== null
        ? Math.max(totalCount - remainingCount, 0)
        : null;
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
        className={`rounded-[22px] border p-4 transition ${
          isSelected
            ? "border-emerald-300/30 bg-emerald-300/10"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => void selectVoucher(item.userVoucherId)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              void selectVoucher(item.userVoucherId);
            }
          }}
          className="block w-full cursor-pointer text-left outline-none"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Chip tone={unlockTone(item.unlockState)}>{item.unlockState ?? "UNKNOWN"}</Chip>
                <Chip tone={categoryTone(item.voucherType)}>{categoryLabel(item.voucherType)}</Chip>
                <Chip tone={expiryTone(daysUntilExpiry)}>
                  {expired ? "Expired" : formatDaysUntilExpiry(daysUntilExpiry)}
                </Chip>
                <Chip tone="slate">{item.periodType ?? "UNKNOWN"}</Chip>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{item.voucherName}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {item.cardName}
                  {item.cardNickname ? ` · ${item.cardNickname}` : ""}
                </p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                  {item.description ?? "No description available."}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 lg:w-64">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Usage</span>
                  <span>{totalCount === null ? "Unlimited" : `${usedCount ?? 0}/${totalCount}`}</span>
                </div>
                {progressPercent !== null ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-300/80"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-300">No fixed counter</div>
                )}
              </div>
              <div className="grid gap-1 text-sm text-slate-300">
                <div className="flex justify-between gap-4">
                  <span>Valid from</span>
                  <span>{formatDate(item.validFrom)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Valid until</span>
                  <span>{formatDate(item.validUntil)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              Use
            </ActionButton>
            <ActionButton
              kind="secondary"
              onClick={(event) => {
                event.stopPropagation();
                void applyVoucherAction("unuse", item);
              }}
              disabled={actioningId === item.userVoucherId || !canUnuseVoucher(item)}
            >
              Unuse
            </ActionButton>
            {item.unlockState === "ELIGIBLE" ? (
              <Chip tone="amber">Unlock request needed</Chip>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  }

  const selectedCardLockedCount = filteredSelectedCardVouchers.filter(
    (item) => item.unlockState === "LOCKED",
  ).length;

  return (
    <div className="grid gap-5">
      <Panel
        title="Voucher control"
        subtitle="Switch between all vouchers and the selected card, then open history, use, or unuse actions directly from the list."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Active" value={String(activeVouchers.length)} helper="Current live list" />
          <MetricCard
            label="Expiring"
            value={String(filteredExpiringVouchers.length)}
            helper="D-7 window"
          />
          <MetricCard
            label="Selected card"
            value={String(filteredSelectedCardVouchers.length)}
            helper={selectedCardLabel}
          />
          <MetricCard
            label="Locked"
            value={String(selectedCardLockedCount)}
            helper="Unlock conditions pending"
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="User card ID"
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
                {loading || refreshing ? "Loading..." : "Load card vouchers"}
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
                    ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-50"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
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
                  ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-50"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {value === "all" ? "All" : value === "active" ? "Active" : "Expired"}
            </button>
          ))}
          {categoryOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === item.value
                  ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-50"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel
          title="Expiring soon"
          subtitle="Vouchers due within seven days are surfaced here for quick review."
        >
          <div className="grid gap-3">
            {filteredExpiringVouchers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
                No vouchers are expiring soon.
              </div>
            ) : (
              filteredExpiringVouchers.map((item) => renderVoucherCard(item, false))
            )}
          </div>
        </Panel>

        <Panel
          title={`Selected card vouchers · ${selectedCardLabel}`}
          subtitle="Use and unuse actions are available from the selected card view."
        >
          <div className="grid gap-3">
            {filteredSelectedCardVouchers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
                This card currently has no vouchers loaded.
              </div>
            ) : (
              filteredSelectedCardVouchers.map((item) => renderVoucherCard(item, true))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="All vouchers" subtitle="Combined active and expired lists from the BFF proxy.">
          <div className="grid gap-3">
            {filteredGlobalVouchers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
                No vouchers match the current filter.
              </div>
            ) : (
              filteredGlobalVouchers.map((item) => renderVoucherCard(item, false))
            )}
          </div>
        </Panel>

        <Panel
          title="Voucher details"
          subtitle="Open a voucher to inspect unlock state, remaining counts, and the use / unuse history timeline."
        >
          {selectedVoucher ? (
            <div className="grid gap-4">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={unlockTone(selectedVoucher.unlockState)}>
                    {selectedVoucher.unlockState ?? "UNKNOWN"}
                  </Chip>
                  <Chip tone={categoryTone(selectedVoucher.voucherType)}>
                    {categoryLabel(selectedVoucher.voucherType)}
                  </Chip>
                  <Chip tone="slate">{selectedVoucher.periodType ?? "UNKNOWN"}</Chip>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{selectedVoucher.voucherName}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedVoucher.cardName}
                  {selectedVoucher.cardNickname ? ` · ${selectedVoucher.cardNickname}` : ""}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {selectedVoucher.description ?? "No description available."}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <MetricCard
                  label="Remaining / total"
                  value={
                    selectedVoucher.totalCount === null || selectedVoucher.totalCount === undefined
                      ? "Unlimited"
                      : `${selectedVoucher.remainingCount ?? 0} / ${selectedVoucher.totalCount}`
                  }
                  helper="Current usage state"
                />
                <MetricCard
                  label="Expiry"
                  value={formatDaysUntilExpiry(resolveDaysUntilExpiry(selectedVoucher))}
                  helper={formatDate(selectedVoucher.validUntil)}
                />
              </div>

              <div className="grid gap-2 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex justify-between gap-4">
                  <span>Annual requirement</span>
                  <span>{formatCurrency(selectedVoucher.requiredAnnualPerformance)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Current annual</span>
                  <span>{formatCurrency(selectedVoucher.currentAnnualPerformance)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Remaining to unlock</span>
                  <span>{formatCurrency(selectedVoucher.remainingAmount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Available at</span>
                  <span>{selectedVoucher.availableAt ? formatDate(selectedVoucher.availableAt) : "-"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Valid from</span>
                  <span>{formatDate(selectedVoucher.validFrom)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Valid until</span>
                  <span>{formatDate(selectedVoucher.validUntil)}</span>
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  History
                </div>
                {historyLoading ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
                    Loading history...
                  </div>
                ) : history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
                    No history entries yet.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {history.map((entry, index) => (
                      <div
                        key={`${entry.voucherHistoryId ?? entry.createdAt}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-wrap gap-2">
                          <Chip tone="slate">{entry.action ?? "UPDATE"}</Chip>
                          <Chip tone="slate">{formatDateTime(entry.createdAt)}</Chip>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">{entry.memo ?? "-"}</p>
                        {entry.beforeRemainingCount !== undefined ||
                        entry.afterRemainingCount !== undefined ? (
                          <p className="mt-2 text-xs text-slate-400">
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
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
              Select a voucher from the list to inspect its details and history.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
