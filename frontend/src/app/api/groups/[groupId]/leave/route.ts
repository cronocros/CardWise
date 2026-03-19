import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/leave">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/leave`, {
    method: "POST",
    body: await request.text(),
  });
}
