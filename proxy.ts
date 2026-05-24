import { type NextRequest, NextResponse } from 'next/server';

// NOTE: Admin auth token is stored in localStorage via Zustand persist —
// Edge middleware cannot read localStorage. This proxy checks for a session
// marker cookie ('admin-session') that must be set on login:
//   document.cookie = 'admin-session=1; path=/; SameSite=Strict'
// and cleared on logout. Without it, the client-side guard in
// (dashboard)/layout.tsx handles the redirect as a fallback.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth routes, static files, and API routes
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api');

  if (!isPublic) {
    const token =
      request.cookies.get('admin-session')?.value ??
      request.cookies.get('adminToken')?.value ??
      request.cookies.get('accessToken')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
