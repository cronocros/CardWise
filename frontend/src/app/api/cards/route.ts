import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL ?? "http://localhost:8080/api/v1";

/** GET /api/cards — 내 카드 목록 */
export async function GET(request: NextRequest) {
  const accountId = request.headers.get("x-account-id");
  if (!accountId) {
    return NextResponse.json({ error: "X-Account-Id 헤더가 필요합니다." }, { status: 401 });
  }

  const res = await fetch(`${BACKEND}/my-cards`, {
    headers: { "X-Account-Id": accountId },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** POST /api/cards — 카드 등록 */
export async function POST(request: NextRequest) {
  const accountId = request.headers.get("x-account-id");
  if (!accountId) {
    return NextResponse.json({ error: "X-Account-Id 헤더가 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const res = await fetch(`${BACKEND}/my-cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Account-Id": accountId,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
