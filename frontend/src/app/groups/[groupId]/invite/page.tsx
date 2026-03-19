"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton, AppShell, Chip, Panel, TextField } from "@/components/app-shell";
import { formatDateTime, type GroupInvitationEnvelope, type GroupSummaryEnvelope } from "@/lib/cardwise-api";

type InvitationItem = GroupInvitationEnvelope["data"][number];
type GroupItem = GroupSummaryEnvelope["data"][number];

export default function GroupInvitePage({ params }: { params: Promise<{ groupId: string }> }) {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>("");
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [items, setItems] = useState<InvitationItem[]>([]);
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void params.then((value) => setGroupId(value.groupId));
  }, [params]);

  useEffect(() => {
    if (!groupId) return;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [groupsResponse, invitationResponse] = await Promise.all([
          fetch("/api/groups", { cache: "no-store" }),
          fetch(`/api/groups/${groupId}/invite`, { cache: "no-store" }),
        ]);
        if (!groupsResponse.ok || !invitationResponse.ok) {
          throw new Error("group-invite-load");
        }
        const groupsPayload = (await groupsResponse.json()) as GroupSummaryEnvelope;
        const invitationPayload = (await invitationResponse.json()) as GroupInvitationEnvelope;
        setGroup(groupsPayload.data.find((item) => String(item.groupId) === groupId) ?? null);
        setItems(invitationPayload.data ?? []);
      } catch {
        setError("초대 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [groupId]);

  async function handleInvite() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteeEmail }),
      });
      if (!response.ok) {
        throw new Error("invite-send");
      }
      setInviteeEmail("");
      router.refresh();
      const payload = (await response.json()) as { data: InvitationItem };
      setItems((current) => [payload.data, ...current]);
    } catch {
      setError("초대 전송에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      active="ledger"
      eyebrow="멤버 초대"
      title={group ? `${group.groupName} 초대 관리` : "멤버 초대"}
      description="OWNER만 이메일로 멤버를 초대할 수 있고, 대기 중 초대를 한 화면에서 확인합니다."
    >
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="초대 보내기" subtitle="이메일 기준으로 7일 만료 초대를 생성합니다.">
          <div className="grid gap-4 md:max-w-xl">
            <TextField
              label="초대할 이메일"
              value={inviteeEmail}
              onChange={(event) => setInviteeEmail(event.target.value)}
              placeholder="family@example.com"
            />
            {error ? <div className="text-sm text-rose-600">{error}</div> : null}
            <div className="flex flex-wrap gap-3">
              <ActionButton kind="primary" onClick={handleInvite} disabled={isSubmitting || inviteeEmail.trim().length === 0}>
                {isSubmitting ? "전송 중..." : "초대 보내기"}
              </ActionButton>
              <ActionButton kind="ghost" onClick={() => router.push(`/groups/${groupId}/payments`)}>
                그룹 결제 보기
              </ActionButton>
            </div>
          </div>
        </Panel>

        <Panel title="대기 중 초대" subtitle="현재 만료 전 상태의 초대만 보여줍니다." tone="minimal">
          <div className="grid gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="h-4 w-36 rounded-full bg-[var(--surface-soft)]" />
                  <div className="mt-3 h-4 w-48 rounded-full bg-[var(--surface-soft)]" />
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                대기 중인 초대가 없습니다.
              </div>
            ) : (
              items.map((item) => (
                <article key={item.invitationId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone="amber">{item.invitationStatus}</Chip>
                    <Chip tone="slate">{item.groupName}</Chip>
                  </div>
                  <div className="mt-3 text-sm text-[var(--text-body)]">{item.inviteeEmail}</div>
                  <div className="mt-1 text-sm text-[var(--text-muted)]">생성 시각: {formatDateTime(item.createdAt)}</div>
                </article>
              ))
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
