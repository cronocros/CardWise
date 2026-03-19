"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionButton, Chip, MetricCard, Panel, TextField } from "@/components/app-shell";
import type { PendingAction, PendingActionsResponse } from "@/lib/cardwise-api";
import { formatDateTime, getPendingCount, safeNumber } from "@/lib/cardwise-api";

type InboxRouteProps = {
  initialActions: PendingAction[];
  initialCount: number;
};

const resolveActionMap: Record<string, string> = {
  FX_CORRECTION_NEEDED: "APPLY_FX_CORRECTION",
  BILLING_DISCOUNT_FOUND: "APPLY_BILLING_DISCOUNT",
  PAYMENT_CONFIRMATION: "CONFIRM_PAYMENT",
  DUPLICATE_DETECTED: "RESOLVE_DUPLICATE",
  CATEGORY_UNMAPPED: "MAP_CATEGORY",
  EXCEL_REVIEW: "APPROVE_EXCEL_IMPORT",
  PERFORMANCE_EXCLUSION_CHECK: "APPLY_PERFORMANCE_EXCLUSION",
};

function priorityTone(priority: string) {
  if (priority === "HIGH") return "rose";
  if (priority === "MEDIUM") return "amber";
  return "emerald";
}

function statusTone(status: string) {
  if (status === "RESOLVED") return "emerald";
  if (status === "DISMISSED") return "slate";
  return "rose";
}

export function RouteBInbox({ initialActions, initialCount }: InboxRouteProps) {
  const [status, setStatus] = useState("PENDING");
  const [priority, setPriority] = useState("");
  const [items, setItems] = useState<PendingAction[]>(initialActions);
  const [pendingCount, setPendingCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [adjustedAmounts, setAdjustedAmounts] = useState<Record<number, string>>({});

  const summary = useMemo(
    () => ({
      high: items.filter((item) => item.priority === "HIGH").length,
      medium: items.filter((item) => item.priority === "MEDIUM").length,
      low: items.filter((item) => item.priority === "LOW").length,
    }),
    [items],
  );

  async function load(nextStatus = status, nextPriority = priority) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextStatus) params.set("status", nextStatus);
      if (nextPriority) params.set("priority", nextPriority);
      params.set("limit", "50");

      const [actionsRes, countRes] = await Promise.all([
        fetch(`/api/pending-actions?${params.toString()}`, { cache: "no-store" }),
        fetch(`/api/pending-actions/count?status=PENDING`, { cache: "no-store" }),
      ]);

      if (!actionsRes.ok) throw new Error(await actionsRes.text());
      if (!countRes.ok) throw new Error(await countRes.text());

      const actionsJson = (await actionsRes.json()) as PendingActionsResponse;
      const countJson = await countRes.json();
      setItems(actionsJson.data ?? []);
      setPendingCount(getPendingCount(countJson));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority]);

  async function resolve(action: PendingAction) {
    setResolvingId(action.pendingActionId);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        resolution: {
          action: resolveActionMap[action.actionType] ?? "KEEP_AS_IS",
        },
      };

      const adjustedAmount = adjustedAmounts[action.pendingActionId];
      if (
        (action.actionType === "FX_CORRECTION_NEEDED" ||
          action.actionType === "BILLING_DISCOUNT_FOUND") &&
        (!adjustedAmount || Number.isNaN(Number(adjustedAmount)))
      ) {
        throw new Error("Enter an adjusted amount before resolving this action.");
      }

      if (adjustedAmount && !Number.isNaN(Number(adjustedAmount))) {
        payload.resolution = {
          ...(payload.resolution as Record<string, unknown>),
          adjustedAmount: Number(adjustedAmount),
        };
      }

      const response = await fetch(`/api/pending-actions/${action.pendingActionId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve item");
    } finally {
      setResolvingId(null);
    }
  }

  async function dismiss(actionId: number) {
    setResolvingId(actionId);
    setError(null);
    try {
      const response = await fetch(`/api/pending-actions/${actionId}/dismiss`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error(await response.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dismiss item");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <Panel title="Inbox control" subtitle="A Blossom-style review surface for triage, resolve, and dismiss actions." tone="minimal">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Pending" value={String(pendingCount)} helper="Badge count" />
          <MetricCard label="Visible" value={String(items.length)} helper="Current filter result" />
          <MetricCard label="High" value={String(summary.high)} helper="Priority HIGH" />
          <MetricCard label="Medium/Low" value={`${summary.medium}/${summary.low}`} helper="Lower priority mix" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none">
              <option value="PENDING">PENDING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none">
              <option value="">All</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </label>
          <div className="flex items-end">
            <ActionButton kind="secondary" onClick={() => load(status, priority)} disabled={loading} className="w-full">
              {loading ? "Refreshing..." : "Refresh"}
            </ActionButton>
          </div>
        </div>
        {error ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </Panel>

      <Panel title="Pending actions" subtitle="Resolve or dismiss actions in priority order." tone="minimal">
        <div className="grid gap-4">
          {items.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              No items match the current filter.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.pendingActionId} className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_12px_24px_rgba(190,24,60,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Chip tone={priorityTone(item.priority)}>{item.priority}</Chip>
                      <Chip tone={statusTone(item.status)}>{item.status}</Chip>
                      <Chip tone="slate">{item.actionType}</Chip>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-strong)]">{item.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-body)]">{item.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                      <span>Reference: {item.referenceTable ?? "-"}</span>
                      <span>#{safeNumber(item.referenceId, 0)}</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                    {(item.actionType === "FX_CORRECTION_NEEDED" || item.actionType === "BILLING_DISCOUNT_FOUND") && (
                      <TextField
                        label="Adjusted amount"
                        type="number"
                        value={adjustedAmounts[item.pendingActionId] ?? ""}
                        onChange={(event) =>
                          setAdjustedAmounts((current) => ({
                            ...current,
                            [item.pendingActionId]: event.target.value,
                          }))
                        }
                        placeholder="0"
                      />
                    )}
                    <div className="flex flex-wrap gap-2">
                      <ActionButton kind="primary" onClick={() => resolve(item)} disabled={resolvingId === item.pendingActionId}>
                        {resolvingId === item.pendingActionId ? "Saving..." : "Resolve"}
                      </ActionButton>
                      <ActionButton kind="ghost" onClick={() => dismiss(item.pendingActionId)} disabled={resolvingId === item.pendingActionId}>
                        Dismiss
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
