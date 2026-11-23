import { NextRequest, NextResponse } from 'next/server';
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  createServiceClient,
  createSession,
  csrfCookieOptions,
  hashPassword,
  requireAdmin,
  sessionCookieOptions,
  validatePassword,
  verifyPassword,
} from '@/lib/adminAuth';

/** Update display name */
export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const name = String(body?.name ?? '').trim();
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'Nama harus 2–80 karakter.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('admin_users')
      .update({ name })
      .eq('id', guard.session.user.id);

    if (error) {
      console.error('Profile update error:', error.message);
      return NextResponse.json({ error: 'Gagal menyimpan nama.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, name });
  } catch (err) {
    console.error('Profile error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal menyimpan nama.' }, { status: 500 });
  }
}

/** Change password: requires old password; signs out other sessions */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const currentPassword = String(body?.currentPassword ?? '');
    const newPassword = String(body?.newPassword ?? '');

    if (!currentPassword) {
      return NextResponse.json({ error: 'Sandi lama wajib diisi.' }, { status: 400 });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'Sandi baru harus berbeda dari sandi lama.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: user } = await supabase
      .from('admin_users')
      .select('id, password_hash')
      .eq('id', guard.session.user.id)
      .maybeSingle();

    if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
      return NextResponse.json({ error: 'Sandi lama salah.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash: await hashPassword(newPassword) })
      .eq('id', user.id);

    if (error) {
      console.error('Password update error:', error.message);
      return NextResponse.json({ error: 'Gagal mengganti sandi.' }, { status: 500 });
    }

    // Sign out everywhere (including this device), then issue a fresh session here.
    await supabase.from('admin_sessions').delete().eq('user_id', user.id);
    const { token, csrfToken, maxAgeMs } = await createSession(user.id, false, request);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeMs));
    response.cookies.set(CSRF_COOKIE, csrfToken, csrfCookieOptions(maxAgeMs));
    return response;
  } catch (err) {
    console.error('Password error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal mengganti sandi.' }, { status: 500 });
  }
}
