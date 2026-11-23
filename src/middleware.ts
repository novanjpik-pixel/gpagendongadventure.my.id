import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'gpa_admin_session';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

// Admin pages reachable without a session
const PUBLIC_ADMIN_PAGES = ['/admin/login', '/admin/setup'];
// Auth API routes reachable without a session (each validates itself)
const PUBLIC_AUTH_APIS = ['/api/auth/login', '/api/auth/setup', '/api/auth/me', '/api/auth/logout'];
// API prefixes whose GET is public (used by the public website)
const PUBLIC_GET_APIS = ['/api/posts', '/api/settings', '/api/peta/data'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // 1) Admin pages: require a session cookie, otherwise redirect to login (server-side)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const isPublicPage = PUBLIC_ADMIN_PAGES.some((p) => pathname === p);
    if (!isPublicPage && !hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
    if (pathname === '/admin') {
      const url = request.nextUrl.clone();
      url.pathname = hasSession ? '/admin/dashboard' : '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // 2) Admin APIs: reject early without a session (route handlers re-validate against the DB)
  if (pathname.startsWith('/api/')) {
    const isAuthApi = PUBLIC_AUTH_APIS.some((p) => pathname === p);
    const isPublicGet =
      request.method === 'GET' && PUBLIC_GET_APIS.some((p) => pathname === p || pathname.startsWith(p + '/'));
    const isProtectedApi =
      pathname.startsWith('/api/auth/account') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/gallery/upload') ||
      pathname.startsWith('/api/posts') ||
      pathname.startsWith('/api/settings') ||
      pathname.startsWith('/api/members') ||
      pathname.startsWith('/api/peta') ||
      pathname.startsWith('/api/riset') ||
      pathname.startsWith('/api/content') ||
      pathname.startsWith('/api/activity');

    if (isProtectedApi && !isAuthApi && !isPublicGet && !hasSession) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }
  }

  injectTokenFromHeader(request);
  const supabaseResponse = NextResponse.next({ request });

  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
