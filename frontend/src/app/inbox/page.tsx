import { AppShell } from "@/components/app-shell";
import { InboxClient } from "@/components/inbox-client";
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
      title="Confirm or dismiss system actions"
      description="This page mirrors the pending-actions workflow from the spec: FX correction, billing discount, duplicate detection, category mapping, Excel review, and performance exclusion checks."
    >
      <InboxClient initialActions={initialActions} initialCount={initialCount} />
    </AppShell>
  );
}
