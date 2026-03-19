import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, "/notifications/read-all", {
    method: "PATCH",
    body: await request.text(),
  });
}
