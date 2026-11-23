import { NextRequest, NextResponse } from 'next/server';
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  createServiceClient,
  createSession,
  csrfCookieOptions,
  hasAnyAdmin,
  hashPassword,
  sessionCookieOptions,
  validatePassword,
  validateUsername,
} from '@/lib/adminAuth';

export async function GET() {
  try {
    const exists = await hasAnyAdmin();
    return NextResponse.json({ needsSetup: !exists });
  } catch (err) {
    const message = err instanceof Error && err.message ? err.message : 'Gagal memeriksa status.';
    console.error('Setup status error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Setup only works while there is no admin at all.
    if (await hasAnyAdmin()) {
      return NextResponse.json({ error: 'Setup sudah selesai.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const name = String(body?.name ?? '').trim();
    const username = String(body?.username ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'Nama harus 2–80 karakter.' }, { status: 400 });
    }
    const usernameError = validateUsername(username);
    if (usernameError) return NextResponse.json({ error: usernameError }, { status: 400 });
    const passwordError = validatePassword(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

    const supabase = createServiceClient();
    const passwordHash = await hashPassword(password);

    const { data: user, error } = await supabase
      .from('admin_users')
      .insert({ username, name, password_hash: passwordHash, role: 'admin', is_active: true })
      .select('id, username, name, role')
      .single();

    if (error || !user) {
      console.error('Setup insert error:', error?.message);
      const detail = error?.message ? ` (${error.message})` : '';
      return NextResponse.json({ error: `Gagal membuat akun admin.${detail}` }, { status: 500 });
    }

    // Race guard: if more than one admin exists now, keep only the earliest.
    const { data: all } = await supabase
      .from('admin_users')
      .select('id, created_at')
      .order('created_at', { ascending: true });
    if (all && all.length > 1 && all[0].id !== user.id) {
      await supabase.from('admin_users').delete().eq('id', user.id);
      return NextResponse.json({ error: 'Setup sudah selesai.' }, { status: 403 });
    }

    const { token, csrfToken, maxAgeMs } = await createSession(user.id, false, request);
    const response = NextResponse.json({ success: true, user });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeMs));
    response.cookies.set(CSRF_COOKIE, csrfToken, csrfCookieOptions(maxAgeMs));
    return response;
  } catch (err) {
    console.error('Setup error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Setup gagal. Coba lagi.' }, { status: 500 });
  }
}
