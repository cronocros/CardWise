"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

interface CardCatalogItem {
  cardId: number;
  cardName: string;
}

// 시드 카드 목록 (실제로는 /api/v1/cards 카탈로그에서 조회)
const CARD_CATALOG: CardCatalogItem[] = [
  { cardId: 1, cardName: "현대카드 M Edition3" },
  { cardId: 2, cardName: "신한카드 Air 1.5+" },
  { cardId: 3, cardName: "국민 KB Pay카드" },
  { cardId: 4, cardName: "삼성카드 taptap O" },
  { cardId: 5, cardName: "롯데카드 LOCA FLEX" },
  { cardId: 6, cardName: "우리카드 카드의정석 POINT" },
];

export default function RegisterCardPage() {
  const router = useRouter();
  const [selectedCardId, setSelectedCardId] = useState<number | "">("");
  const [issuedAt, setIssuedAt] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCardId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Account-Id": "11111111-1111-1111-1111-111111111111", // 로컬 개발용 fallback
        },
        body: JSON.stringify({
          cardId: selectedCardId,
          issuedAt,
          cardNickname: nickname || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? err.message ?? "카드 등록 실패");
      }

      router.push("/cards");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell active="cards" eyebrow="카드 관리" title="카드 등록" description="새 신용/체크카드를 등록하고 실적 추적을 시작합니다.">
      <div className="mx-auto max-w-lg">
        <div className="rounded-[28px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6">
          <form onSubmit={handleSubmit} className="grid gap-5">
            {/* 카드 선택 */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--text-strong)]">카드 선택 *</label>
              <select
                id="card-select"
                required
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(Number(e.target.value) || "")}
                className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
                <option value="">카드를 선택해 주세요</option>
                {CARD_CATALOG.map((c) => (
                  <option key={c.cardId} value={c.cardId}>
                    {c.cardName}
                  </option>
                ))}
              </select>
            </div>

            {/* 발급일 */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--text-strong)]">카드 발급일 *</label>
              <input
                id="issued-at"
                type="date"
                required
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              <p className="text-xs text-[var(--text-muted)]">연간 실적 기준일 계산에 사용됩니다.</p>
            </div>

            {/* 별칭 */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--text-strong)]">카드 별칭 (선택)</label>
              <input
                id="card-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={30}
                placeholder="예: 회사 법인카드, 주 사용카드"
                className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>

            {/* 에러 */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] py-3 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--surface-elevated)]"
              >
                취소
              </button>
              <button
                id="register-card-submit"
                type="submit"
                disabled={loading || !selectedCardId || !issuedAt}
                className="flex-1 rounded-full bg-[var(--accent)] py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "등록 중…" : "카드 등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
