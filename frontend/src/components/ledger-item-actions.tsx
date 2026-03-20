"use client";

import { useState } from "react";
import { deletePayment } from "@/app/ledger/actions";

export function DeletePaymentButton({ paymentId }: { paymentId: number }) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("이 결제 내역을 삭제하시겠습니까? (소프트 삭제)")) return;

    setIsPending(true);
    try {
      await deletePayment(paymentId);
    } catch (err) {
      console.error(err);
      alert("결제 내역 삭제에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-semibold text-[var(--error)] opacity-0 transition group-hover:opacity-100 hover:underline disabled:opacity-50"
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
