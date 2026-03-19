import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/tags">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/tags`);
}

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/groups/[groupId]/tags">,
) {
  const { groupId } = await context.params;
  return proxyToBackend(request, `/groups/${groupId}/tags`, {
    method: "POST",
    body: await request.text(),
  });
}
