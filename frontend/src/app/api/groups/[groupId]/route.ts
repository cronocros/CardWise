import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}`);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}`, {
    method: "PATCH",
    body: await request.text(),
  });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}`, {
    method: "DELETE",
    body: await request.text(),
  });
}
