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

function priorityLabel(priority: string) {
  if (priority === "HIGH") return "높음";
  if (priority === "MEDIUM") return "보통";
  if (priority === "LOW") return "낮음";
  return priority;
}

function statusLabel(status: string) {
  if (status === "PENDING") return "대기";
  if (status === "RESOLVED") return "해결";
  if (status === "DISMISSED") return "제외";
  return status;
}

function actionTypeLabel(actionType: string) {
  const labels: Record<string, string> = {
    FX_CORRECTION_NEEDED: "환율 보정 필요",
    BILLING_DISCOUNT_FOUND: "청구 할인 확인",
    PAYMENT_CONFIRMATION: "결제 확인",
    DUPLICATE_DETECTED: "중복 거래 확인",
    CATEGORY_UNMAPPED: "카테고리 분류 필요",
    EXCEL_REVIEW: "엑셀 검토",
    PERFORMANCE_EXCLUSION_CHECK: "실적 제외 검토",
  };
  return labels[actionType] ?? actionType;
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
      setError(err instanceof Error ? err.message : "인박스를 불러오지 못했습니다.");
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
        throw new Error("이 작업을 처리하려면 조정 금액을 먼저 입력하세요.");
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
      setError(err instanceof Error ? err.message : "작업을 처리하지 못했습니다.");
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
      setError(err instanceof Error ? err.message : "작업을 제외하지 못했습니다.");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <Panel title="인박스 제어" subtitle="검토, 처리, 제외 동작을 한 화면에서 수행하는 로즈 미니멀 인박스입니다." tone="minimal">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="대기" value={String(pendingCount)} helper="배지 건수" />
          <MetricCard label="표시 중" value={String(items.length)} helper="현재 필터 결과" />
          <MetricCard label="높음" value={String(summary.high)} helper="우선순위 높음" />
          <MetricCard label="보통/낮음" value={`${summary.medium}/${summary.low}`} helper="나머지 우선순위" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">상태</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none">
              <option value="PENDING">대기</option>
              <option value="RESOLVED">해결</option>
              <option value="DISMISSED">제외</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">우선순위</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-12 rounded-[16px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-strong)] outline-none">
              <option value="">전체</option>
              <option value="HIGH">높음</option>
              <option value="MEDIUM">보통</option>
              <option value="LOW">낮음</option>
            </select>
          </label>
          <div className="flex items-end">
            <ActionButton kind="secondary" onClick={() => load(status, priority)} disabled={loading} className="w-full">
              {loading ? "새로고침 중..." : "새로고침"}
            </ActionButton>
          </div>
        </div>
        {error ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </Panel>

      <Panel title="대기 작업" subtitle="우선순위 순서대로 작업을 처리하거나 제외할 수 있습니다." tone="minimal">
        <div className="grid gap-4">
          {items.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              현재 필터에 맞는 작업이 없습니다.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.pendingActionId} className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-4 shadow-[0_12px_24px_rgba(190,24,60,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Chip tone={priorityTone(item.priority)}>{priorityLabel(item.priority)}</Chip>
                      <Chip tone={statusTone(item.status)}>{statusLabel(item.status)}</Chip>
                      <Chip tone="slate">{actionTypeLabel(item.actionType)}</Chip>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-strong)]">{item.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-body)]">{item.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                      <span>참조: {item.referenceTable ?? "-"}</span>
                      <span>#{safeNumber(item.referenceId, 0)}</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                    {(item.actionType === "FX_CORRECTION_NEEDED" || item.actionType === "BILLING_DISCOUNT_FOUND") && (
                      <TextField
                        label="조정 금액"
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
                        {resolvingId === item.pendingActionId ? "저장 중..." : "처리"}
                      </ActionButton>
                      <ActionButton kind="ghost" onClick={() => dismiss(item.pendingActionId)} disabled={resolvingId === item.pendingActionId}>
                        제외
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
