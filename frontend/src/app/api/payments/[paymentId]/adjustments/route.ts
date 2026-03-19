import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest, context: RouteContext<"/api/payments/[paymentId]/adjustments">) {
  const { paymentId } = await context.params;
  return proxyToBackend(request, `/payments/${paymentId}/adjustments`);
}

export async function POST(request: NextRequest, context: RouteContext<"/api/payments/[paymentId]/adjustments">) {
  const { paymentId } = await context.params;
  return proxyToBackend(request, `/payments/${paymentId}/adjustments`);
}
