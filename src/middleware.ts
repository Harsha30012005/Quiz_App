import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve session cookie
  const sessionToken = request.cookies.get('session')?.value;

  // Verify JWT session
  const payload = sessionToken ? await verifyJWT(sessionToken) : null;

  // Define route classification
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/verify');
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/path') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/profile');

  // 1. If not logged in and requesting a protected user/admin route -> redirect to /login
  if (!payload && (isUserRoute || isAdminRoute)) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/dashboard' && pathname !== '/admin') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and requesting auth page (/login, /verify) -> redirect based on role
  if (payload && isAuthRoute) {
    if (payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. If logged in but not admin, and requesting admin route -> redirect to user dashboard
  if (payload && isAdminRoute && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. If logged in as admin, and requesting user route -> redirect to admin dashboard
  if (payload && isUserRoute && payload.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - avatars/ (avatars directory)
     * - badges/ (badges directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|avatars|badges).*)',
  ],
};
