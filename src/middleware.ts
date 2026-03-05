import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-store, max-age=0')

  if (!token && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl, { headers: response.headers })
  }

  if (token && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl, { headers: response.headers })
  }

  if (pathname === '/') {
    const redirectPath = token ? '/dashboard' : '/login'
    const redirectUrl = new URL(redirectPath, request.url)
    return NextResponse.redirect(redirectUrl, { headers: response.headers })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg).*)']
}

