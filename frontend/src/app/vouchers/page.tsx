import { AppShell } from "@/components/app-shell";
import { VouchersClient } from "@/components/vouchers-client";
import { Chip, MetricCard, Panel } from "@/components/app-shell";
import Link from "next/link";
import {
  tryFetchBackendJson,
  type PerformanceResponse,
  type VoucherListResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

const seededUserCardIds = [1, 2, 3, 4];

export default async function VouchersPage() {
  const [seededCards, activeVouchers, expiredVouchers, expiringVouchers, initialSelectedCardVouchers] =
    await Promise.all([
      Promise.all(
        seededUserCardIds.map(async (userCardId) => {
          const result = await tryFetchBackendJson<PerformanceResponse>(
            `/cards/${userCardId}/performance`,
          );
          return {
            userCardId,
            label: result?.data?.cardName ? `${result.data.cardName} #${userCardId}` : `User card #${userCardId}`,
          };
        }),
      ),
      tryFetchBackendJson<VoucherListResponse>("/vouchers?status=active"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers?status=expired"),
      tryFetchBackendJson<VoucherListResponse>("/vouchers/expiring?days=7"),
      tryFetchBackendJson<VoucherListResponse>(`/user-cards/${seededUserCardIds[0]}/vouchers`),
    ]);

  return (
    <AppShell
      active="vouchers"
      eyebrow="Voucher system"
      title="바우처를 카드 중심으로 보고, 상태와 사용 흐름을 바로 확인하는 화면"
      description="Rose Blossom 카드 시스템으로 재구성한 바우처 표면입니다. 선택 카드, 만료 임박, 사용 이력, use / unuse 동작을 유지하면서 더 읽기 쉬운 구조로 정리했습니다."
      actions={
        <>
          <Link
            href="/benefits"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            혜택
          </Link>
          <Link
            href="/settings"
            className="rounded-full border border-[var(--surface-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-soft)]"
          >
            설정
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Active" value={String(activeVouchers?.data?.length ?? 0)} helper="Current live list" />
        <MetricCard label="Expiring" value={String(expiringVouchers?.data?.length ?? 0)} helper="D-7 window" />
        <MetricCard
          label="Selected card"
          value={String(initialSelectedCardVouchers?.data?.length ?? 0)}
          helper={seededCards[0]?.label ?? "User card #1"}
        />
        <MetricCard label="Expired" value={String(expiredVouchers?.data?.length ?? 0)} helper="Archive view" />
      </section>

      <Panel
        title="Quick context"
        subtitle="If you are checking the voucher surface end-to-end, start from the selected card list and the expiring window."
      >
        <div className="flex flex-wrap gap-2">
          <Chip tone="rose">Blossom cards</Chip>
          <Chip tone="slate">Use / unuse preserved</Chip>
          <Chip tone="emerald">History preserved</Chip>
          <Chip tone="amber">Expiring window</Chip>
        </div>
      </Panel>

      <VouchersClient
        initialActiveVouchers={activeVouchers?.data ?? []}
        initialExpiredVouchers={expiredVouchers?.data ?? []}
        initialExpiringVouchers={expiringVouchers?.data ?? []}
        initialSelectedCardVouchers={initialSelectedCardVouchers?.data ?? []}
        seededCards={seededCards}
        initialSelectedUserCardId={seededUserCardIds[0]}
      />
    </AppShell>
  );
}
