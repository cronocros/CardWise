import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/user-vouchers/[userVoucherId]/history">,
) {
  const { userVoucherId } = await context.params;
  return proxyToBackend(request, `/user-vouchers/${userVoucherId}/history`);
}
