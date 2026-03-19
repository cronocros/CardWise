import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/members/[memberAccountId]">,
) {
  const { groupId, memberAccountId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/members/${memberAccountId}`, {
    method: "DELETE",
    body: await request.text(),
  });
}
