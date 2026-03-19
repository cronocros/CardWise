import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/user-cards/[userCardId]/vouchers">,
) {
  const { userCardId } = await context.params;
  return proxyToBackend(request, `/user-cards/${userCardId}/vouchers`);
}
