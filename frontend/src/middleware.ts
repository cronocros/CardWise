import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Skip auth check if Supabase is not configured yet
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/mobile/login')
    const isPublicRoute = ['/', '/login', '/mobile/login'].includes(request.nextUrl.pathname)

    if (!user && !isAuthRoute && !isPublicRoute && !request.nextUrl.pathname.startsWith('/_next')) {
      const redirectUrl = request.nextUrl.pathname.startsWith('/mobile') ? '/mobile/login' : '/login'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    if (user && isAuthRoute) {
      const redirectUrl = request.nextUrl.pathname.startsWith('/mobile') ? '/mobile' : '/web/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  } catch (e) {
    // In case of any unexpected errors during auth (e.g. network timeout),
    // we let the request through to avoid 500-ing the entire app.
    console.warn("Middleware auth check failed:", e)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
