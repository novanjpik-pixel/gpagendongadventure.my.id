'use client';

const CSRF_COOKIE = 'gpa_admin_csrf';

export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(CSRF_COOKIE.length + 1)) : '';
}

/**
 * Same-origin fetch that automatically adds the CSRF header on write requests.
 * Redirects to the login page when the server reports an expired/invalid session.
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers || {});
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = getCsrfToken();
    if (token) headers.set('x-csrf-token', token);
  }
  const res = await fetch(input, { ...init, headers, credentials: 'same-origin' });
  if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
    window.location.href = '/admin/login';
  }
  return res;
}

/**
 * Patch window.fetch once so existing admin pages (which call fetch directly)
 * send the CSRF header on same-origin write requests under /api/.
 */
export function installCsrfFetchPatch() {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { __gpa_csrf_patched__?: boolean };
  if (w.__gpa_csrf_patched__) return;
  w.__gpa_csrf_patched__ = true;

  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      const isApi = url.startsWith('/api/') || url.startsWith(`${window.location.origin}/api/`);
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
        const token = getCsrfToken();
        if (token && !headers.has('x-csrf-token')) headers.set('x-csrf-token', token);
        return original(input, { ...(init || {}), headers }).then((res) => {
          if (res.status === 401 && !window.location.pathname.startsWith('/admin/login')) {
            window.location.href = '/admin/login';
          }
          return res;
        });
      }
    } catch {
      // fall through to original fetch
    }
    return original(input, init);
  };
}
