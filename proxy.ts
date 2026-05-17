import { type NextRequest, NextResponse } from 'next/server'

// Auth is in localStorage — cannot check on server side.
// The dashboard layout client component handles the auth guard.
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
