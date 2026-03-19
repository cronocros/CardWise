import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/notifications/settings${request.nextUrl.search}`);
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, `/notifications/settings${request.nextUrl.search}`, {
    method: "PATCH",
    body: await request.text(),
  });
}
