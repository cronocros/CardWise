import { AppShell } from "@/components/app-shell";
import { LedgerHub } from "@/components/route-b-ledger";
import {
  getPendingCount,
  tryFetchBackendJson,
  type GroupInvitationEnvelope,
  type GroupSummaryEnvelope,
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

  const [actionsResponse, countResponse, adjustmentsResponse, groupsResponse, invitationsResponse] = await Promise.all([
    tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=8"),
    tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
    tryFetchBackendJson<PaymentAdjustmentsResponse>(`/payments/${encodeURIComponent(paymentId)}/adjustments`),
    tryFetchBackendJson<GroupSummaryEnvelope>("/groups"),
    tryFetchBackendJson<GroupInvitationEnvelope>("/groups/invitations"),
  ]);

  return (
    <AppShell
      active="ledger"
      theme="minimal"
      eyebrow="가계부 허브"
      title="가계부, 인박스, 조정 흐름"
      description="가계부 화면은 로즈 미니멀 톤으로 정리해 검토, 정정, 결제 후속 작업을 한 번에 이어서 처리할 수 있게 구성했습니다."
    >
      <LedgerHub
        pendingCount={getPendingCount(countResponse)}
        pendingActions={actionsResponse?.data ?? []}
        paymentId={paymentId}
        adjustments={adjustmentsResponse?.data ?? []}
        groupCount={groupsResponse?.data?.length ?? 0}
        groupInvitationCount={invitationsResponse?.data?.length ?? 0}
      />
    </AppShell>
  );
}
