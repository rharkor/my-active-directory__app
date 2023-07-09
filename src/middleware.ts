import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserSession } from './lib/auth';
import { logger } from './lib/logger';

export async function middleware(request: NextRequest) {
  const {
    nextUrl: { pathname },
  } = request;

  //* Verify the user session
  if (!pathname.startsWith('/auth')) {
    //? Get the sessions
    const response = NextResponse.next();
    const session = await getUserSession(request.cookies, response, {
      'user-agent': request.headers.get('user-agent') || 'Next.js Middleware',
    });
    //? Determine where to redirect the user if there is no session
    if (!session) {
      //? redirect to the login page
      logger.debug('[middleware] redirect to login page');
      return NextResponse.redirect(new URL('/auth/login', request.url), {
        status: 303, //? See Other
      });
    }
  }

  return NextResponse.next();
}

//? Match all paths except /auth/:path* and static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
