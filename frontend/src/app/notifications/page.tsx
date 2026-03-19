"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell, ActionButton, Chip, MetricCard, Panel } from "@/components/app-shell";
import { formatDateTime, type NotificationItem, type NotificationListEnvelope, type NotificationUnreadCountEnvelope } from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const filterOptions = [
  { value: "", label: "전체" },
  { value: "GROUP", label: "그룹" },
  { value: "PERFORMANCE", label: "실적" },
  { value: "VOUCHER", label: "바우처" },
  { value: "SYSTEM", label: "시스템" },
] as const;

function resolveTone(type: string): "slate" | "emerald" | "rose" | "amber" | "violet" {
  if (type === "GROUP") return "rose";
  if (type === "PERFORMANCE") return "violet";
  if (type === "VOUCHER") return "amber";
  return "slate";
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (nextFilter: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const query = nextFilter ? `?type=${encodeURIComponent(nextFilter)}&limit=100` : "?limit=100";
      const [listResponse, unreadResponse] = await Promise.all([
        fetch(`/api/notifications${query}`, { cache: "no-store" }),
        fetch("/api/notifications/unread-count", { cache: "no-store" }),
      ]);

      if (!listResponse.ok || !unreadResponse.ok) {
        throw new Error("notification-load");
      }

      const listPayload = (await listResponse.json()) as NotificationListEnvelope;
      const unreadPayload = (await unreadResponse.json()) as NotificationUnreadCountEnvelope;
      setItems(listPayload.data ?? []);
      setUnreadCount(unreadPayload.data?.unreadCount ?? 0);
    } catch {
      setError("알림을 불러오지 못했습니다.");
      setItems([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications(filter);
  }, [filter, loadNotifications]);

  const totalCount = items.length;
  const readCount = useMemo(() => items.filter((item) => item.isRead).length, [items]);

  async function markRead(notificationId: number) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
      if (!response.ok) {
        throw new Error("mark-read");
      }
      window.dispatchEvent(new Event("cardwise-notifications-updated"));
      await loadNotifications(filter);
    } catch {
      setError("읽음 처리에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function markAllRead() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (!response.ok) {
        throw new Error("mark-all");
      }
      window.dispatchEvent(new Event("cardwise-notifications-updated"));
      await loadNotifications(filter);
    } catch {
      setError("전체 읽음 처리에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell
      active="notifications"
      theme="minimal"
      eyebrow="알림 센터"
      title="읽을 것과 처리할 것을 한 곳에 모았습니다"
      description="F7 기준으로 그룹, 실적, 바우처, 시스템 알림을 읽고, 바로 읽음 처리하거나 관련 화면으로 이동할 수 있습니다."
      actions={
        <>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            대시보드
          </Link>
          <ActionButton kind="primary" onClick={markAllRead} disabled={isLoading || isSaving || unreadCount === 0}>
            전체 읽음
          </ActionButton>
        </>
      }
    >
      <section className="cw-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="읽지 않음" value={String(unreadCount)} helper="실시간 배지와 동일" />
        <MetricCard label="전체" value={String(totalCount)} helper="현재 필터 기준" />
        <MetricCard label="읽음" value={String(readCount)} helper="이미 처리한 알림" />
        <MetricCard label="필터" value={filterOptions.find((option) => option.value === filter)?.label ?? "전체"} helper="알림 유형" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel title="필터" subtitle="유형별로 빠르게 좁혀서 봅니다.">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-[18px] border px-4 py-3 text-left text-sm font-medium transition ${
                  filter === option.value
                    ? "border-[var(--surface-border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "border-[var(--surface-border)] bg-white text-[var(--text-strong)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {error ? <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <div className="mt-4 rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--text-body)]">
            알림은 서버 저장 후 실시간 배지와 동기화됩니다. 버튼을 누르면 읽음 상태가 바로 반영됩니다.
          </div>
        </Panel>

        <Panel title="알림 목록" subtitle="읽음 전 알림은 강조하고, 바로 연결되는 화면이 있으면 이동 링크를 제공합니다." tone="minimal">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="h-4 w-32 rounded-full bg-[var(--surface-soft)]" />
                  <div className="mt-3 h-4 w-4/5 rounded-full bg-[var(--surface-soft)]" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              선택한 필터에 해당하는 알림이 없습니다.
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.notificationId}
                  className={`rounded-[24px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
                    item.isRead
                      ? "border-[var(--surface-border)] bg-white"
                      : "border-[var(--surface-border-strong)] bg-[linear-gradient(180deg,#fff8fb,#ffffff)]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Chip tone={resolveTone(item.notificationType)}>
                        {item.notificationType}
                      </Chip>
                      <Chip tone={item.isRead ? "slate" : "rose"}>{item.isRead ? "읽음" : "새 알림"}</Chip>
                    </div>
                    <div className="text-right text-xs text-[var(--text-muted)]">{formatDateTime(item.createdAt)}</div>
                  </div>

                  <div className="mt-3 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                    {item.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--text-body)]">{item.body}</div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.actionUrl ? (
                      item.actionUrl.startsWith("/") ? (
                        <Link href={item.actionUrl} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">
                          {item.actionLabel ?? "바로가기"}
                        </Link>
                      ) : (
                        <a href={item.actionUrl} className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]">
                          {item.actionLabel ?? "바로가기"}
                        </a>
                      )
                    ) : null}
                    {!item.isRead ? (
                      <ActionButton kind="ghost" onClick={() => markRead(item.notificationId)} disabled={isSaving}>
                        읽음 처리
                      </ActionButton>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
