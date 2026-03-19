import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  const backendPath = `/pending-actions${request.nextUrl.search}`;
  return proxyToBackend(request, backendPath);
}
