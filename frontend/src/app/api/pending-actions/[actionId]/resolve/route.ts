import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/pending-actions/[actionId]/resolve">) {
  const { actionId } = await context.params;
  return proxyToBackend(request, `/pending-actions/${actionId}/resolve`);
}
