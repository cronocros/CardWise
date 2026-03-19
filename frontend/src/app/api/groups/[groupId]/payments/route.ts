import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/payments">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/payments${request.nextUrl.search}`);
}
