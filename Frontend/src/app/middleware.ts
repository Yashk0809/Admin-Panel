// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Redirect unknown users to /login if trying to access /dashboard pages
  const protectedRoutes = ['/dashboard', '/upload-csv', '/add'];

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/upload-csv',
    '/upload-csv/:path*',
    '/add',
    '/add/:path*',
  ],
};