import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** GET /api/cards/metadata — 카드사 및 브랜드 목록 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/cards/metadata");
}
