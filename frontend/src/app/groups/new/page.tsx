"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton, AppShell, Panel, TextAreaField, TextField } from "@/components/app-shell";

export default function NewGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupName: groupName.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("group-create");
      }

      router.push("/groups");
      router.refresh();
    } catch {
      setError("그룹 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      active="ledger"
      eyebrow="그룹 생성"
      title="새 그룹 만들기"
      description="그룹명과 설명만 입력하면 OWNER로 그룹이 생성되고 바로 그룹 목록에 반영됩니다."
    >
      <Panel title="그룹 생성 폼" subtitle="F12 스펙 기준 최소 입력만 먼저 받습니다.">
        <div className="grid gap-4 md:max-w-2xl">
          <TextField
            label="그룹명"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="예: 우리 가족"
          />
          <TextAreaField
            label="그룹 설명"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="공동 생활비, 여행 경비, 프로젝트 비용..."
          />
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <div className="flex flex-wrap gap-3">
            <ActionButton kind="primary" onClick={handleSubmit} disabled={isSubmitting || groupName.trim().length === 0}>
              {isSubmitting ? "생성 중..." : "만들기"}
            </ActionButton>
            <ActionButton kind="ghost" onClick={() => router.push("/groups")}>
              취소
            </ActionButton>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
