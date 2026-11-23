import { NextRequest, NextResponse } from 'next/server';
import {
  ATTEMPT_WINDOW_MS,
  CSRF_COOKIE,
  MAX_FAILED_ATTEMPTS,
  SESSION_COOKIE,
  countRecentFailures,
  createServiceClient,
  createSession,
  csrfCookieOptions,
  getClientIp,
  hasAnyAdmin,
  recordAttempt,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/adminAuth';

const GENERIC_ERROR = 'Username atau sandi salah.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const identifier = String(body?.username ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const remember = Boolean(body?.remember);

    if (!identifier || !password || identifier.length > 100 || password.length > 128) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    // Origin check (login CSRF)
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403 });
      }
    }

    if (!(await hasAnyAdmin())) {
      return NextResponse.json(
        { error: 'Belum ada akun admin.', needsSetup: true },
        { status: 409 }
      );
    }

    const ip = getClientIp(request);

    const failures = await countRecentFailures(identifier, ip);
    if (failures >= MAX_FAILED_ATTEMPTS) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(ATTEMPT_WINDOW_MS / 60000)} menit.`,
        },
        { status: 429 }
      );
    }

    const supabase = createServiceClient();
    const { data: user } = await supabase
      .from('admin_users')
      .select('id, username, name, role, email, password_hash, is_active')
      .or(`username.eq.${identifier.replace(/[,()]/g, '')},email.eq.${identifier.replace(/[,()]/g, '')}`)
      .limit(1)
      .maybeSingle();

    // Always run a bcrypt compare to keep timing similar for unknown users
    const dummyHash = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5pS1wFJ8m8Yk8Z1cQ1o8Zc1y8o8o8o8';
    const valid = await verifyPassword(password, user?.password_hash ?? dummyHash);

    if (!user || !valid || user.is_active === false) {
      await recordAttempt(identifier, ip, false);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    await recordAttempt(identifier, ip, true);
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString(), failed_attempts: 0 })
      .eq('id', user.id);

    const { token, csrfToken, maxAgeMs } = await createSession(user.id, remember, request);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeMs));
    response.cookies.set(CSRF_COOKIE, csrfToken, csrfCookieOptions(maxAgeMs));
    return response;
  } catch (err) {
    console.error('Login error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Login gagal. Coba lagi.' }, { status: 500 });
  }
}
