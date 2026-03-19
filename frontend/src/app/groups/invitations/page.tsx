"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton, AppShell, Chip, Panel } from "@/components/app-shell";
import { formatDateTime, type GroupInvitationEnvelope } from "@/lib/cardwise-api";

type InvitationItem = GroupInvitationEnvelope["data"][number];

export default function GroupInvitationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<InvitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  async function loadInvitations() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/groups/invitations", { cache: "no-store" });
      if (!response.ok) throw new Error("invitation-load");
      const payload = (await response.json()) as GroupInvitationEnvelope;
      setItems(payload.data ?? []);
    } catch {
      setError("초대 목록을 불러오지 못했습니다.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInvitations();
  }, []);

  async function handleDecision(invitationId: number, action: "accept" | "decline") {
    setSubmittingId(invitationId);
    try {
      const response = await fetch(`/api/groups/invitations/${invitationId}/${action}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("invitation-action");
      await loadInvitations();
      router.refresh();
    } catch {
      setError(action === "accept" ? "초대 수락에 실패했습니다." : "초대 거절에 실패했습니다.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <AppShell
      active="ledger"
      eyebrow="그룹 초대"
      title="수락 또는 거절할 초대"
      description="현재 계정 이메일로 도착한 그룹 초대를 처리합니다."
    >
      <Panel title="초대 목록" subtitle="수락하면 그룹 목록에 바로 추가되고, 거절하면 대기열에서 제거됩니다.">
        {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}
        <div className="grid gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-[24px] border border-[var(--surface-border)] bg-white p-5">
                <div className="h-4 w-32 rounded-full bg-[var(--surface-soft)]" />
                <div className="mt-3 h-4 w-52 rounded-full bg-[var(--surface-soft)]" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              처리할 초대가 없습니다.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.invitationId} className="rounded-[24px] border border-[var(--surface-border)] bg-white p-5 shadow-[0_14px_28px_rgba(190,24,60,0.05)]">
                <div className="flex flex-wrap gap-2">
                  <Chip tone="amber">대기 중</Chip>
                  <Chip tone="slate">{item.groupName}</Chip>
                </div>
                <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">
                  &quot;{item.groupName}&quot; 그룹에 초대되었습니다
                </div>
                <div className="mt-2 text-sm text-[var(--text-body)]">초대자: {item.inviterName}</div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">생성 시각: {formatDateTime(item.createdAt)}</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ActionButton
                    kind="ghost"
                    onClick={() => handleDecision(item.invitationId, "decline")}
                    disabled={submittingId === item.invitationId}
                  >
                    거절
                  </ActionButton>
                  <ActionButton
                    kind="primary"
                    onClick={() => handleDecision(item.invitationId, "accept")}
                    disabled={submittingId === item.invitationId}
                  >
                    수락
                  </ActionButton>
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
