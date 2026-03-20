import { AppShell, MetricCard, Panel } from "@/components/app-shell";
import { LedgerHub } from "@/components/route-b-ledger";
import {
  tryFetchBackendJson,
  type GroupSummaryEnvelope,
  type PendingActionsResponse,
  type NotificationItemResponse,
  type NotificationUnreadCountResponse,
  type PaymentAdjustmentsResponse,
  type PaymentListResponse,
  type UserCardsResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LedgerPage({ searchParams }: PageProps<"/ledger">) {
  const [actionsResponse, notificationUnreadCountResponse, adjustmentsResponse, groupsResponse, _notificationsResponse, paymentsResponse, userCardsResponse] = await Promise.all([
    tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=8"),
    tryFetchBackendJson<NotificationUnreadCountResponse>("/notifications/unread-count"),
    tryFetchBackendJson<PaymentAdjustmentsResponse>("/payments/adjustments"),
    tryFetchBackendJson<GroupSummaryEnvelope>("/groups"),
    tryFetchBackendJson<NotificationItemResponse[]>("/notifications"),
    tryFetchBackendJson<PaymentListResponse>("/payments?limit=40"),
    tryFetchBackendJson<UserCardsResponse>("/my-cards"),
  ]);

  return (
    <AppShell
      active="ledger"
      eyebrow="가계부 및 사후 관리"
      title="가계부 허브"
      description="가계부 화면은 로즈 미니멀 톤으로 정리해 검토, 정정, 결제 후속 작업을 한 번에 이어서 처리할 수 있게 구성했습니다."
    >
      <LedgerHub
        actions={actionsResponse?.data ?? []}
        actionCount={notificationUnreadCountResponse?.unreadCount ?? 0}
        adjustments={adjustmentsResponse?.data ?? []}
        groups={groupsResponse?.data ?? []}
        payments={paymentsResponse?.data ?? []}
        userCards={userCardsResponse?.data ?? []}
      />
    </AppShell>
  );
}
