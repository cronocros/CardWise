import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/groups/invitations/[invitationId]/decline">,
) {
  const { invitationId } = await context.params;
  return proxyToBackend(request, `/groups/invitations/${invitationId}/decline`);
}
