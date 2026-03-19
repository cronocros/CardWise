import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/invitations/[invitationId]">,
) {
  const { groupId, invitationId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/invitations/${invitationId}`, {
    method: "DELETE",
    body: await request.text(),
  });
}
