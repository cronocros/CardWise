import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/payments/[paymentId]">,
) {
  const { groupId, paymentId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/payments/${paymentId}`, {
    method: "PATCH",
    body: await request.text(),
  });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/payments/[paymentId]">,
) {
  const { groupId, paymentId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/payments/${paymentId}`, {
    method: "DELETE",
    body: await request.text(),
  });
}
