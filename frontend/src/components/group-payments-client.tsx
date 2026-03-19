"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton, Chip, Panel, SelectField, TextAreaField, TextField } from "@/components/app-shell";
import { formatCurrency, formatDateTime, type GroupPaymentRecord, type GroupTagRecord } from "@/lib/cardwise-api";

type CardOption = {
  userCardId: number;
  cardName: string;
  tierName: string | null;
};

export function GroupPaymentsClient({
  groupId,
  groupName,
  role,
  initialPayments,
  initialTags,
  cardOptions,
}: {
  groupId: string;
  groupName: string;
  role: string;
  initialPayments: GroupPaymentRecord[];
  initialTags: GroupTagRecord[];
  cardOptions: CardOption[];
}) {
  const router = useRouter();
  const [payments, setPayments] = useState<GroupPaymentRecord[]>(initialPayments);
  const [tags, setTags] = useState<GroupTagRecord[]>(initialTags);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [userCardId, setUserCardId] = useState(String(cardOptions[0]?.userCardId ?? ""));
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [memo, setMemo] = useState("");
  const [tagNames, setTagNames] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  async function refreshData() {
    try {
      const [paymentsResponse, tagsResponse] = await Promise.all([
        fetch(`/api/groups/${groupId}/payments?limit=100`, { cache: "no-store" }),
        fetch(`/api/groups/${groupId}/tags`, { cache: "no-store" }),
      ]);

      if (paymentsResponse.ok) {
        const payload = (await paymentsResponse.json()) as { data: GroupPaymentRecord[] };
        setPayments(payload.data ?? []);
      }

      if (tagsResponse.ok) {
        const payload = (await tagsResponse.json()) as { data: GroupTagRecord[] };
        setTags(payload.data ?? []);
      }
    } catch {
      // keep prior state if refresh fails
    }
  }

  function fillForm(payment: GroupPaymentRecord) {
    setSelectedPaymentId(payment.paymentId);
    setUserCardId(String(payment.userCardId));
    setMerchantName(payment.merchantName);
    setAmount(String(payment.amount));
    setPaidAt(payment.paidAt.slice(0, 16));
    setMemo(payment.memo ?? "");
    setTagNames(payment.tagNames.join(", "));
  }

  function clearForm() {
    setSelectedPaymentId(null);
    setUserCardId(String(cardOptions[0]?.userCardId ?? ""));
    setMerchantName("");
    setAmount("");
    setPaidAt(new Date().toISOString().slice(0, 16));
    setMemo("");
    setTagNames("");
  }

  async function submit() {
    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const payload = {
        userCardId: Number(userCardId),
        merchantName: merchantName.trim(),
        amount: Number(amount),
        paidAt: paidAt ? new Date(paidAt).toISOString() : null,
        memo: memo.trim() || null,
        tagNames: tagNames
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        selectedPaymentId
          ? `/api/groups/${groupId}/payments/${selectedPaymentId}`
          : `/api/groups/${groupId}/payments`,
        {
          method: selectedPaymentId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("payment-save");
      }

      setStatus(selectedPaymentId ? "결제를 수정했습니다." : "결제를 등록했습니다.");
      clearForm();
      await refreshData();
      router.refresh();
      window.dispatchEvent(new Event("cardwise-notifications-updated"));
    } catch {
      setError("결제 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removePayment(paymentId: number) {
    if (!confirm("이 그룹 결제를 삭제할까요?")) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/payments/${paymentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("payment-delete");
      }
      if (selectedPaymentId === paymentId) {
        clearForm();
      }
      setStatus("결제를 삭제했습니다.");
      await refreshData();
      router.refresh();
    } catch {
      setError("결제 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  const totalSpent = useMemo(() => payments.reduce((sum, payment) => sum + payment.amount, 0), [payments]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="결제 입력" subtitle="그룹 결제를 새로 등록하거나 기존 결제를 수정합니다.">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField label="카드" value={userCardId} onChange={(event) => setUserCardId(event.target.value)}>
              {cardOptions.map((card) => (
                <option key={card.userCardId} value={card.userCardId}>
                  #{card.userCardId} {card.cardName}{card.tierName ? ` · ${card.tierName}` : ""}
                </option>
              ))}
            </SelectField>
            <TextField label="금액" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="12000" />
          </div>
          <TextField label="가맹점" value={merchantName} onChange={(event) => setMerchantName(event.target.value)} placeholder="예: 스타벅스" />
          <TextField label="결제 시각" type="datetime-local" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
          <TextAreaField label="메모" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="공동 식비, 여행 숙박, 정산 메모..." />
          <TextField label="태그" value={tagNames} onChange={(event) => setTagNames(event.target.value)} placeholder={tags.map((tag) => tag.tagName).slice(0, 4).join(", ")} />

          {error ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {status ? <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div> : null}

          <div className="flex flex-wrap gap-3">
            <ActionButton kind="primary" onClick={submit} disabled={isSaving || !merchantName.trim() || !amount || !userCardId}>
              {selectedPaymentId ? "수정 저장" : "결제 등록"}
            </ActionButton>
            <ActionButton kind="secondary" onClick={clearForm} disabled={isSaving}>
              입력 초기화
            </ActionButton>
          </div>
        </div>
      </Panel>

      <Panel title={`${groupName} 결제 내역`} subtitle={`현재 ${role === "OWNER" ? "관리 가능" : "조회 중심"} 상태로 최근 결제를 보여줍니다.`} tone="minimal">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">합계</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">건수</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{payments.length}건</div>
          </div>
          <div className="rounded-[18px] border border-[var(--surface-border)] bg-white px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-soft)]">태그</div>
            <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{tags.length}개</div>
          </div>
        </div>

        <div className="grid gap-3">
          {payments.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[var(--surface-border)] bg-[var(--surface-soft)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              아직 등록된 그룹 결제가 없습니다.
            </div>
          ) : (
            payments.map((payment) => (
              <article key={payment.paymentId} className="rounded-[24px] border border-[var(--surface-border)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={payment.canEdit ? "rose" : "slate"}>{payment.canEdit ? "수정 가능" : "조회 전용"}</Chip>
                    <Chip tone="slate">{payment.payerName}</Chip>
                    {payment.tagNames.slice(0, 2).map((tagName) => (
                      <Chip key={tagName} tone="amber">{tagName}</Chip>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(payment.amount)}</div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(payment.paidAt)}</div>
                  </div>
                </div>

                <div className="mt-3 text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                  {payment.merchantName}
                </div>
                <div className="mt-1 text-sm text-[var(--text-body)]">
                  카드 #{payment.userCardId} · {payment.currency} · {payment.memo ?? "메모 없음"}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <ActionButton kind="ghost" onClick={() => fillForm(payment)} disabled={isSaving}>
                    수정
                  </ActionButton>
                  <ActionButton kind="ghost" onClick={() => removePayment(payment.paymentId)} disabled={isSaving || !payment.canEdit}>
                    삭제
                  </ActionButton>
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
