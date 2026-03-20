import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  return proxyToBackend(request, `/community/posts/${params.postId}`);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  return proxyToBackend(request, `/community/posts/${params.postId}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  return proxyToBackend(request, `/community/posts/${params.postId}`);
}
