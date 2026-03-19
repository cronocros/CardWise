"use client";

import { useEffect, useState } from "react";
import { type NotificationUnreadCountEnvelope } from "@/lib/cardwise-api";

export function NotificationBadge({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/notifications/unread-count", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("badge-load");
        }
        const payload = (await response.json()) as NotificationUnreadCountEnvelope;
        if (mounted) {
          setCount(payload.data?.unreadCount ?? 0);
          setIsReady(true);
        }
      } catch {
        if (mounted) {
          setCount(0);
          setIsReady(true);
        }
      }
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 45000);

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener("cardwise-notifications-updated", handleRefresh);

    return () => {
      mounted = false;
      window.clearInterval(timer);
      window.removeEventListener("cardwise-notifications-updated", handleRefresh);
    };
  }, []);

  if (!isReady || count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={`pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full border border-white bg-[var(--accent)] font-semibold text-white shadow-[0_8px_18px_rgba(244,63,94,0.22)] ${
        compact ? "min-h-4 min-w-4 px-1 text-[9px]" : "min-h-5 min-w-5 px-1.5 text-[10px]"
      }`}
      aria-label={`읽지 않은 알림 ${label}개`}
    >
      {label}
    </span>
  );
}
