import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';

export const SESSION_COOKIE = 'gpa_admin_session';
export const CSRF_COOKIE = 'gpa_admin_csrf';
export const SESSION_SHORT_MS = 12 * 60 * 60 * 1000; // 12 hours
export const SESSION_LONG_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
export const MAX_FAILED_ATTEMPTS = 6;
export const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const MIN_PASSWORD_LENGTH = 8;

export interface AdminSessionUser {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string | null;
  allowedPages: string[];
}

export interface AdminSession {
  sessionId: string;
  csrfToken: string;
  user: AdminSessionUser;
}

function cleanEnv(value: string | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function createServiceClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, '');
  const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL belum diatur.');
  }
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diatur. Isi dengan kunci "service_role" dari proyek Supabase yang sama.');
  }
  const looksValid = serviceKey.startsWith('sb_secret_') || serviceKey.split('.').length === 3;
  if (!looksValid) {
    throw new Error(
      'Format SUPABASE_SERVICE_ROLE_KEY tidak valid. Salin ulang kunci "service_role" (diawali "eyJ..." atau "sb_secret_...") dari Supabase → Project Settings → API.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (password.length > 128) return 'Sandi terlalu panjang.';
  return null;
}

export function validateUsername(username: unknown): string | null {
  if (typeof username !== 'string' || !/^[a-z0-9._-]{3,30}$/.test(username)) {
    return 'Username 3–30 karakter: huruf kecil, angka, titik, strip, atau garis bawah.';
  }
  return null;
}

export function getClientIp(request: NextRequest | Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function sessionCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

export function csrfCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: false,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
  response.cookies.set(CSRF_COOKIE, '', { ...csrfCookieOptions(0), maxAge: 0 });
}

export async function createSession(
  userId: string,
  remember: boolean,
  request: NextRequest
): Promise<{ token: string; csrfToken: string; maxAgeMs: number }> {
  const supabase = createServiceClient();
  const token = generateToken();
  const csrfToken = generateToken();
  const maxAgeMs = remember ? SESSION_LONG_MS : SESSION_SHORT_MS;

  const { error } = await supabase.from('admin_sessions').insert({
    user_id: userId,
    token_hash: hashToken(token),
    csrf_token: csrfToken,
    remember,
    ip: getClientIp(request),
    user_agent: (request.headers.get('user-agent') || '').slice(0, 255),
    expires_at: new Date(Date.now() + maxAgeMs).toISOString(),
  });

  if (error) throw new Error(error.message);

  // Opportunistic cleanup of expired sessions
  await supabase.from('admin_sessions').delete().lt('expires_at', new Date().toISOString());

  return { token, csrfToken, maxAgeMs };
}

async function loadSessionByToken(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null;
  const supabase = createServiceClient();

  const { data: session, error: sessionError } = await supabase
    .from('admin_sessions')
    .select('id, csrf_token, expires_at, user_id')
    .eq('token_hash', hashToken(token))
    .maybeSingle();

  if (sessionError) {
    console.error('Session lookup error:', sessionError.message || sessionError.code || 'unknown');
    return null;
  }
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await supabase.from('admin_sessions').delete().eq('id', session.id);
    return null;
  }

  const { data: user } = await supabase
    .from('admin_users')
    .select('id, username, name, role, email, is_active, allowed_pages')
    .eq('id', session.user_id)
    .maybeSingle();

  if (!user || user.is_active === false) return null;

  return {
    sessionId: session.id,
    csrfToken: session.csrf_token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email ?? null,
      allowedPages: Array.isArray(user.allowed_pages) ? user.allowed_pages : [],
    },
  };
}

/** Read the session from an API route request. */
export async function getSessionFromRequest(request: NextRequest | Request): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
  return loadSessionByToken(token);
}

/** Read the session in Server Components / layouts. */
export async function getServerSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return loadSessionByToken(store.get(SESSION_COOKIE)?.value);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Origin check + double-submit CSRF token for state-changing requests. */
export function verifyCsrf(request: NextRequest | Request, session: AdminSession): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return false;
    } catch {
      return false;
    }
  }
  const headerToken = request.headers.get('x-csrf-token');
  if (!headerToken) return false;
  return safeEqual(headerToken, session.csrfToken);
}

type GuardResult =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

/**
 * Guard for admin API routes. Rejects with 401 when no valid session,
 * 403 on CSRF failure (for non-GET) or insufficient role.
 */
export async function requireAdmin(
  request: NextRequest | Request,
  options: { csrf?: boolean; roles?: string[] } = {}
): Promise<GuardResult> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 }) };
  }

  const method = request.method.toUpperCase();
  const needsCsrf = options.csrf ?? !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (needsCsrf && !verifyCsrf(request, session)) {
    return { ok: false, response: NextResponse.json({ error: 'Permintaan tidak valid (CSRF).' }, { status: 403 }) };
  }

  if (options.roles && !options.roles.includes(session.user.role)) {
    return { ok: false, response: NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 }) };
  }

  return { ok: true, session };
}

export async function destroySession(sessionId: string) {
  const supabase = createServiceClient();
  await supabase.from('admin_sessions').delete().eq('id', sessionId);
}

export async function hasAnyAdmin(): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .limit(1);
  if (error) {
    const detail = [error.message, error.code, error.details, error.hint].filter(Boolean).join(' | ');
    if (/invalid api key/i.test(detail)) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY ditolak Supabase (Invalid API key). Pastikan memakai kunci "service_role" dari proyek yang sama dengan NEXT_PUBLIC_SUPABASE_URL, tanpa spasi atau tanda kutip.'
      );
    }
    throw new Error(detail || 'Gagal membaca tabel admin_users (periksa SUPABASE_SERVICE_ROLE_KEY dan migrasi).');
  }
  return (data?.length ?? 0) > 0;
}

/** Count recent failed attempts for an identifier or an IP. */
export async function countRecentFailures(identifier: string, ip: string): Promise<number> {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS).toISOString();

  const [byId, byIp] = await Promise.all([
    supabase
      .from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('success', false)
      .gte('created_at', since),
    supabase
      .from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('success', false)
      .gte('created_at', since),
  ]);

  return Math.max(byId.count ?? 0, byIp.count ?? 0);
}

export async function recordAttempt(identifier: string, ip: string, success: boolean) {
  const supabase = createServiceClient();
  await supabase.from('login_attempts').insert({ identifier, ip, success });
  // Cleanup old attempts
  await supabase
    .from('login_attempts')
    .delete()
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}

export async function getRequestHeaders() {
  return headers();
}

export const ROLES = ['admin', 'editor', 'contributor'] as const;

export const SITE_PAGES: { key: string; label: string }[] = [
  { key: 'home', label: 'Beranda' },
  { key: 'about', label: 'Tentang Kami' },
  { key: 'activities', label: 'Kegiatan' },
  { key: 'gallery', label: 'Galeri' },
  { key: 'peta', label: 'Peta ETTRS' },
  { key: 'donation', label: 'Donasi' },
  { key: 'contact', label: 'Kontak' },
];

export function sanitizePages(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const valid = new Set(SITE_PAGES.map((p) => p.key));
  return Array.from(new Set(input.filter((p): p is string => typeof p === 'string' && valid.has(p))));
}

export function validateEmail(email: unknown): string | null {
  if (email === undefined || email === null || email === '') return null;
  if (typeof email !== 'string' || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Format email tidak valid.';
  }
  return null;
}

/** Record an entry in the activity log. Never throws. */
export async function logActivity(
  user: { id: string; name: string } | null,
  action: string,
  objectType: string,
  objectLabel: string
): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from('activity_logs').insert({
      user_id: user?.id ?? null,
      user_name: user?.name ?? '',
      action,
      object_type: objectType,
      object_label: objectLabel.slice(0, 200),
    });
    // Keep only the latest 80 entries
    const { data: old } = await supabase
      .from('activity_logs')
      .select('id')
      .order('created_at', { ascending: false })
      .range(80, 1000);
    if (old && old.length > 0) {
      await supabase
        .from('activity_logs')
        .delete()
        .in('id', old.map((r) => r.id));
    }
  } catch (err) {
    console.error('Activity log error:', err instanceof Error ? err.message : err);
  }
}
