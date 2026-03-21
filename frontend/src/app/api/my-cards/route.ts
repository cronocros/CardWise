import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** GET /api/my-cards — 내 보유 카드 목록 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/my-cards");
}

/** POST /api/my-cards — 내 카드 등록 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/my-cards");
}
