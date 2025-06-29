// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value// or 'Authorization' or any key you use
  console.log('Middleware token:', token)
  const protectedPaths = ['/dashboard', '/add', '/upload-csv']
  const pathIsProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (pathIsProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/add', '/upload-csv', '/dashboard/:path*']
}
