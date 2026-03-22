import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  return proxyToBackend(request, `/community/posts/${params.postId}/bookmark`);
}
