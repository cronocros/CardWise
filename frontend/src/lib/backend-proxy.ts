import { NextResponse, type NextRequest } from "next/server";
import { backendUrl } from "./cardwise-api";

function copyHeaders(source: Headers) {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (
      key !== "connection" &&
      key !== "content-length" &&
      key !== "host" &&
      key !== "keep-alive" &&
      key !== "transfer-encoding"
    ) {
      headers.set(key, value);
    }
  });
  return headers;
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  init?: { method?: string; body?: BodyInit | null },
) {
  const method = init?.method ?? request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (key === "host" || key === "content-length") {
      return;
    }
    headers.set(key, value);
  });

  const response = await fetch(backendUrl(backendPath), {
    method,
    headers,
    body: hasBody ? init?.body ?? (await request.text()) : undefined,
    cache: "no-store",
  });

  const responseHeaders = copyHeaders(response.headers);
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}
