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
      eyebrow="Ledger inbox"
      title="Review and resolve pending actions"
      description="The inbox now follows the Blossom language: soft surfaces, dense but readable cards, and quick triage controls."
    >
      <RouteBInbox initialActions={initialActions} initialCount={initialCount} />
    </AppShell>
  );
}
