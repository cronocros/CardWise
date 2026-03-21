import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/payments${request.nextUrl.search}`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/payments");
}
