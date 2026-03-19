import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL ?? "http://localhost:8080/api/v1";

type RouteParams = { params: Promise<{ userCardId: string }> };

/** GET /api/cards/[userCardId] — 카드 상세 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { userCardId } = await params;
  const accountId = request.headers.get("x-account-id");
  if (!accountId) {
    return NextResponse.json({ error: "X-Account-Id 헤더가 필요합니다." }, { status: 401 });
  }

  const res = await fetch(`${BACKEND}/my-cards/${userCardId}`, {
    headers: { "X-Account-Id": accountId },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** PATCH /api/cards/[userCardId] — 카드 수정 (별칭/발급일) */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userCardId } = await params;
  const accountId = request.headers.get("x-account-id");
  if (!accountId) {
    return NextResponse.json({ error: "X-Account-Id 헤더가 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const res = await fetch(`${BACKEND}/my-cards/${userCardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Account-Id": accountId,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** DELETE /api/cards/[userCardId] — 카드 삭제 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userCardId } = await params;
  const accountId = request.headers.get("x-account-id");
  if (!accountId) {
    return NextResponse.json({ error: "X-Account-Id 헤더가 필요합니다." }, { status: 401 });
  }

  const res = await fetch(`${BACKEND}/my-cards/${userCardId}`, {
    method: "DELETE",
    headers: { "X-Account-Id": accountId },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
