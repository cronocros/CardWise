import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest, context: RouteContext<"/api/cards/[userCardId]/performance">) {
  const { userCardId } = await context.params;
  return proxyToBackend(request, `/cards/${userCardId}/performance`);
}
