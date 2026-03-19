import { AppShell } from "@/components/app-shell";
import { LedgerHub } from "@/components/route-b-ledger";
import {
  getPendingCount,
  tryFetchBackendJson,
  type PendingActionCountResponse,
  type PendingActionsResponse,
  type PaymentAdjustmentsResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LedgerPage(props: PageProps<"/ledger">) {
  const searchParams = await props.searchParams;
  const paymentId = firstSearchValue(searchParams.paymentId) ?? "1";

  const [actionsResponse, countResponse, adjustmentsResponse] = await Promise.all([
    tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=8"),
    tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
    tryFetchBackendJson<PaymentAdjustmentsResponse>(`/payments/${encodeURIComponent(paymentId)}/adjustments`),
  ]);

  return (
    <AppShell
      active="ledger"
      eyebrow="Ledger hub"
      title="Ledger, inbox, and adjustment flow"
      description="The ledger surface now coordinates review, correction, and payment follow-up in one app-first entry point."
    >
      <LedgerHub
        pendingCount={getPendingCount(countResponse)}
        pendingActions={actionsResponse?.data ?? []}
        paymentId={paymentId}
        adjustments={adjustmentsResponse?.data ?? []}
      />
    </AppShell>
  );
}
