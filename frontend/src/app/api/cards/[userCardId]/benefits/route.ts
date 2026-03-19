import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userCardId: string }> },
) {
  const { userCardId } = await params;
  return proxyToBackend(request, `/cards/${userCardId}/benefits${request.nextUrl.search}`);
}
