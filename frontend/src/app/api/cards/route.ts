import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** GET /api/cards — 카드 검색 및 필터링 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/cards${request.nextUrl.search}`);
}
