import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/user-vouchers/[userVoucherId]/use">,
) {
  const { userVoucherId } = await context.params;
  return proxyToBackend(request, `/user-vouchers/${userVoucherId}/use`);
}
