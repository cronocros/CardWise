import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { backendUrl } from "./cardwise-api";
const DEV_FALLBACK_ACCOUNT_ID = "11111111-1111-1111-1111-111111111111"; // TEST_ACCOUNTS.ADMIN

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

async function getSupabaseSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // read-only in proxy context
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
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

  // Inject Supabase JWT and accountId from session
  const session = await getSupabaseSession(request);

  if (session?.access_token) {
    // Pass JWT to backend for verification
    headers.set("Authorization", `Bearer ${session.access_token}`);
    // Extract accountId (sub) from JWT and inject as X-Account-Id
    const accountId = session.user?.id;
    if (accountId) {
      headers.set("X-Account-Id", accountId);
    }
  } else if (!headers.has("X-Account-Id")) {
    // Fallback for local dev without login
    console.warn("[proxy] No session found, using dev fallback account ID");
    headers.set("X-Account-Id", DEV_FALLBACK_ACCOUNT_ID);
  }

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
