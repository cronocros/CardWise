import { AppShell } from "@/components/app-shell";
import { VouchersClient } from "@/components/vouchers-client";
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
      eyebrow="Voucher management"
      title="Track voucher usage, expiry, and unlock state"
      description="This page wires the documented voucher APIs into a single surface: expiring vouchers, selected-card voucher lists, use / unuse actions, and history."
    >
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
