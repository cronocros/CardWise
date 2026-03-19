"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton, Chip, Panel, SelectField, TextAreaField, TextField } from "@/components/app-shell";
import {
  formatDateTime,
  type GroupDetailEnvelope,
  type GroupInvitationEnvelope,
  type GroupTagRecord,
} from "@/lib/cardwise-api";

export function GroupSettingsClient({
  groupId,
  initialDetail,
  initialTags,
  initialInvitations,
}: {
  groupId: string;
  initialDetail: GroupDetailEnvelope["data"];
  initialTags: GroupTagRecord[];
  initialInvitations: GroupInvitationEnvelope["data"];
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initialDetail);
  const [tags, setTags] = useState(initialTags);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [groupName, setGroupName] = useState(initialDetail.groupName);
  const [description, setDescription] = useState(initialDetail.description ?? "");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#fb7185");
  const [targetAccountId, setTargetAccountId] = useState(initialDetail.members.find((member) => member.role !== "OWNER")?.accountId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDetail(initialDetail);
    setGroupName(initialDetail.groupName);
    setDescription(initialDetail.description ?? "");
    setTargetAccountId(initialDetail.members.find((member) => member.role !== "OWNER")?.accountId ?? "");
  }, [initialDetail]);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    setInvitations(initialInvitations);
  }, [initialInvitations]);

  const ownerCount = useMemo(() => detail.members.filter((member) => member.role === "OWNER").length, [detail.members]);

  async function refreshData() {
    try {
      const [detailResponse, tagsResponse, invitationsResponse] = await Promise.all([
        fetch(`/api/groups/${groupId}`, { cache: "no-store" }),
        fetch(`/api/groups/${groupId}/tags`, { cache: "no-store" }),
        fetch(`/api/groups/${groupId}/invitations`, { cache: "no-store" }),
      ]);

      if (detailResponse.ok) {
        const payload = (await detailResponse.json()) as GroupDetailEnvelope;
        setDetail(payload.data);
      }
      if (tagsResponse.ok) {
        const payload = (await tagsResponse.json()) as { data: GroupTagRecord[] };
        setTags(payload.data ?? []);
      }
      if (invitationsResponse.ok) {
        const payload = (await invitationsResponse.json()) as GroupInvitationEnvelope;
        setInvitations(payload.data ?? []);
      }
    } catch {
      // keep current view on refresh failure
    }
  }

  async function saveGroup() {
    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupName: groupName.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("group-update");
      }

      setStatus("그룹 정보를 저장했습니다.");
      await refreshData();
      router.refresh();
    } catch {
      setError("그룹 정보 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createTag() {
    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/tags`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tagName: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (!response.ok) {
        throw new Error("tag-create");
      }

      setNewTagName("");
      setStatus("태그를 생성했습니다.");
      await refreshData();
      router.refresh();
    } catch {
      setError("태그 생성에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeMember(accountId: string) {
    if (!confirm("이 멤버를 그룹에서 제외할까요?")) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${accountId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("member-remove");
      }
      setStatus("멤버를 제외했습니다.");
      await refreshData();
      router.refresh();
    } catch {
      setError("멤버 제외에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function transferOwnership() {
    if (!targetAccountId) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/transfer-ownership`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetAccountId }),
      });

      if (!response.ok) {
        throw new Error("ownership-transfer");
      }
      setStatus("OWNER 권한을 양도했습니다.");
      await refreshData();
      router.refresh();
    } catch {
      setError("권한 양도에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelInvitation(invitationId: number) {
    if (!confirm("이 초대를 취소할까요?")) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/invitations/${invitationId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("invitation-cancel");
      }
      setStatus("초대를 취소했습니다.");
      await refreshData();
      router.refresh();
    } catch {
      setError("초대 취소에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGroup() {
    if (!confirm("그룹을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("group-delete");
      }
      router.push("/groups");
      router.refresh();
    } catch {
      setError("그룹 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function leaveGroup() {
    if (!confirm("이 그룹에서 나가시겠습니까?")) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, { method: "POST" });
      if (!response.ok) {
        throw new Error("group-leave");
      }
      router.push("/groups");
      router.refresh();
    } catch {
      setError("그룹 탈퇴에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
      <Panel title="그룹 정보" subtitle="이름과 설명을 직접 수정하고 저장합니다.">
        <div className="grid gap-4">
          <TextField label="그룹명" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          <TextAreaField label="설명" value={description} onChange={(event) => setDescription(event.target.value)} />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">역할</div>
              <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">{detail.role}</div>
            </div>
            <div className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">멤버</div>
              <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">{detail.memberCount} / {detail.maxMembers}명</div>
            </div>
            <div className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">OWNER 수</div>
              <div className="mt-2 text-base font-semibold text-[var(--text-strong)]">{ownerCount}명</div>
            </div>
          </div>

          {error ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {status ? <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}

          <div className="flex flex-wrap gap-3">
            <ActionButton kind="primary" onClick={saveGroup} disabled={isSaving || !groupName.trim()}>
              저장
            </ActionButton>
            <ActionButton kind="secondary" onClick={leaveGroup} disabled={isSaving || detail.role === "OWNER"}>
              그룹 탈퇴
            </ActionButton>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel title="멤버와 권한" subtitle="OWNER는 멤버 제외와 권한 양도를 수행할 수 있습니다." tone="minimal">
          <div className="grid gap-3">
            {detail.members.map((member) => (
              <article key={member.accountId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[var(--text-strong)]">{member.displayName}</div>
                    <div className="mt-1 text-sm text-[var(--text-body)]">{member.email}</div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(member.joinedAt)}</div>
                  </div>
                  <Chip tone={member.role === "OWNER" ? "rose" : "slate"}>{member.role}</Chip>
                </div>
                {detail.canManageSettings && member.role !== "OWNER" ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton kind="ghost" onClick={() => removeMember(member.accountId)} disabled={isSaving}>
                      제외
                    </ActionButton>
                    <button
                      type="button"
                      onClick={() => setTargetAccountId(member.accountId)}
                      className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
                    >
                      OWNER 후보
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {detail.canManageSettings ? (
            <div className="mt-4 rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-soft)] p-4">
              <SelectField label="OWNER 양도 대상" value={targetAccountId} onChange={(event) => setTargetAccountId(event.target.value)}>
                <option value="">선택</option>
                {detail.members
                  .filter((member) => member.role !== "OWNER")
                  .map((member) => (
                    <option key={member.accountId} value={member.accountId}>
                      {member.displayName}
                    </option>
                  ))}
              </SelectField>
              <div className="mt-3 flex flex-wrap gap-3">
                <ActionButton kind="primary" onClick={transferOwnership} disabled={isSaving || !targetAccountId}>
                  OWNER 양도
                </ActionButton>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel title="태그" subtitle="그룹 결제에 붙일 태그를 등록합니다.">
          <div className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <TextField label="태그명" value={newTagName} onChange={(event) => setNewTagName(event.target.value)} placeholder="식비, 여행, 공유..." />
              <TextField label="색상" type="color" value={newTagColor} onChange={(event) => setNewTagColor(event.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton kind="primary" onClick={createTag} disabled={isSaving || !newTagName.trim()}>
                태그 생성
              </ActionButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Chip key={tag.tagId} tone="amber">
                  {tag.tagName}
                </Chip>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="초대" subtitle="대기 중인 초대를 확인하고 필요하면 취소합니다." tone="minimal">
          <div className="grid gap-3">
            {invitations.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                대기 중인 초대가 없습니다.
              </div>
            ) : (
              invitations.map((invitation) => (
                <article key={invitation.invitationId} className="rounded-[22px] border border-[var(--surface-border)] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-[var(--text-strong)]">{invitation.inviteeEmail}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{invitation.inviterName}님이 보낸 초대</div>
                      <div className="mt-1 text-xs text-[var(--text-soft)]">{formatDateTime(invitation.createdAt)}</div>
                    </div>
                    <Chip tone={invitation.invitationStatus === "PENDING" ? "amber" : "slate"}>{invitation.invitationStatus}</Chip>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton kind="ghost" onClick={() => cancelInvitation(invitation.invitationId)} disabled={isSaving}>
                      취소
                    </ActionButton>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>

        <Panel title="위험 작업" subtitle="삭제와 탈퇴는 별도로 분리했습니다.">
          <div className="flex flex-wrap gap-3">
            <ActionButton kind="ghost" onClick={deleteGroup} disabled={isSaving || detail.role !== "OWNER"}>
              그룹 삭제
            </ActionButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}
