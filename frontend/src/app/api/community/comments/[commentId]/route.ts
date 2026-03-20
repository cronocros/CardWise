import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  return proxyToBackend(request, `/community/comments/${params.commentId}`);
}
