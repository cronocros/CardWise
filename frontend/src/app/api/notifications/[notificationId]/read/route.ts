import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/notifications/[notificationId]/read">,
) {
  const { notificationId } = await context.params;
  return proxyToBackend(request, `/notifications/${notificationId}/read`, {
    method: "PATCH",
    body: await request.text(),
  });
}
