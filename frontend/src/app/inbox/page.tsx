import { AppShell } from "@/components/app-shell";
import { RouteBInbox } from "@/components/route-b-inbox";
import {
  getPendingCount,
  tryFetchBackendJson,
  type PendingActionCountResponse,
  type PendingActionsResponse,
} from "@/lib/cardwise-api";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [actions, count] = await Promise.all([
    tryFetchBackendJson<PendingActionsResponse>("/pending-actions?status=PENDING&limit=50"),
    tryFetchBackendJson<PendingActionCountResponse>("/pending-actions/count?status=PENDING"),
  ]);

  const initialActions = actions?.data ?? [];
  const initialCount = getPendingCount(count);

  return (
    <AppShell
      active="inbox"
      theme="minimal"
      eyebrow="가계부 인박스"
      title="대기 작업을 검토하고 처리하는 화면"
      description="인박스는 로즈 미니멀 톤으로 정리해 작업 카드 밀도를 높이고, 빠르게 검토하고 처리할 수 있게 구성했습니다."
    >
      <RouteBInbox initialActions={initialActions} initialCount={initialCount} />
    </AppShell>
  );
}
