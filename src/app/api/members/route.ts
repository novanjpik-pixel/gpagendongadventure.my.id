import { NextRequest, NextResponse } from 'next/server';
import {
  ROLES,
  createServiceClient,
  hashPassword,
  logActivity,
  requireAdmin,
  sanitizePages,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/adminAuth';

const MEMBER_FIELDS =
  'id, username, name, email, role, is_active, allowed_pages, last_login_at, created_at';

/** List members (admin only) */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request, { roles: ['admin'] });
  if (!guard.ok) return guard.response;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select(MEMBER_FIELDS)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Members list error:', error.message);
      return NextResponse.json({ error: 'Gagal memuat anggota.' }, { status: 500 });
    }

    const members = (data || []).map((m) => ({
      id: m.id,
      username: m.username,
      name: m.name,
      email: m.email ?? '',
      role: m.role,
      isActive: m.is_active !== false,
      allowedPages: Array.isArray(m.allowed_pages) ? m.allowed_pages : [],
      lastLoginAt: m.last_login_at,
      createdAt: m.created_at,
    }));
    return NextResponse.json({ members, currentUserId: guard.session.user.id });
  } catch (err) {
    console.error('Members list error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal memuat anggota.' }, { status: 500 });
  }
}

/** Create member (admin only) */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request, { roles: ['admin'] });
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const name = String(body?.name ?? '').trim();
    const username = String(body?.username ?? '').trim().toLowerCase();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const role = String(body?.role ?? '');
    const isActive = body?.isActive !== false;
    const allowedPages = role === 'admin' ? [] : sanitizePages(body?.allowedPages);

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'Nama harus 2–80 karakter.' }, { status: 400 });
    }
    const usernameError = validateUsername(username);
    if (usernameError) return NextResponse.json({ error: usernameError }, { status: 400 });
    const emailError = validateEmail(email);
    if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });
    const passwordError = validatePassword(password);
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (!(ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ error: 'Peran tidak valid.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: dupUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (dupUser) return NextResponse.json({ error: 'Username sudah dipakai.' }, { status: 409 });

    if (email) {
      const { data: dupEmail } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (dupEmail) return NextResponse.json({ error: 'Email sudah dipakai.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        name,
        username,
        email: email || null,
        password_hash: await hashPassword(password),
        role,
        is_active: isActive,
        allowed_pages: allowedPages,
      })
      .select(MEMBER_FIELDS)
      .single();

    if (error || !data) {
      console.error('Member create error:', error?.message);
      return NextResponse.json({ error: 'Gagal menambah anggota.' }, { status: 500 });
    }

    await logActivity(guard.session.user, 'Menambah anggota', 'Anggota', `${name} (@${username})`);
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('Member create error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal menambah anggota.' }, { status: 500 });
  }
}
