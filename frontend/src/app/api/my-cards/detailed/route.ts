import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** POST /api/my-cards/detailed — 카드 상세 등록 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/my-cards/detailed");
}
