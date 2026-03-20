"use client";

import { useState } from "react";
import { ActionButton } from "@/components/app-shell";
import { updateCardAlias, deleteCard } from "@/app/cards/actions";

type CardActionsMenuProps = {
  userCardId: number;
  currentAlias: string;
};

export function CardActionsMenu({ userCardId, currentAlias }: CardActionsMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newAlias, setNewAlias] = useState(currentAlias);
  const [isPending, setIsPending] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlias.trim()) return;
    
    setIsPending(true);
    try {
      await updateCardAlias(userCardId, newAlias);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("별칭 수정에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 카드를 삭제하시겠습니까? (소프트 삭제)")) return;
    
    setIsPending(true);
    try {
      await deleteCard(userCardId);
    } catch (err) {
      console.error(err);
      alert("카드 삭제에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--surface-border)] pt-4" onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex flex-1 gap-2">
          <input
            type="text"
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--surface-border-strong)] bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
            autoFocus
          />
          <ActionButton type="submit" kind="primary" disabled={isPending} className="!px-3 !py-1 text-xs">
            저장
          </ActionButton>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-[var(--text-soft)] hover:text-[var(--text-strong)]"
          >
            취소
          </button>
        </form>
      ) : (
        <>
          <div className="text-xs font-medium text-[var(--text-soft)]">카드 옵션</div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-border)]"
            >
              별칭 수정
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full bg-[var(--danger-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--error)] transition hover:bg-[var(--danger-soft)] hover:brightness-95"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
