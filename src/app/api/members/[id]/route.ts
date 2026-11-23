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

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function activeAdminCountExcluding(excludeId: string): Promise<number> {
  const supabase = createServiceClient();
  const { count } = await supabase
    .from('admin_users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
    .eq('is_active', true)
    .neq('id', excludeId);
  return count ?? 0;
}

/** Update member (admin only) */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const guard = await requireAdmin(request, { roles: ['admin'] });
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const supabase = createServiceClient();

    const { data: target } = await supabase
      .from('admin_users')
      .select('id, username, name, role, is_active')
      .eq('id', id)
      .maybeSingle();
    if (!target) return NextResponse.json({ error: 'Anggota tidak ditemukan.' }, { status: 404 });

    const update: Record<string, unknown> = {};

    if (body?.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2 || name.length > 80) {
        return NextResponse.json({ error: 'Nama harus 2–80 karakter.' }, { status: 400 });
      }
      update.name = name;
    }

    if (body?.username !== undefined) {
      const username = String(body.username).trim().toLowerCase();
      const usernameError = validateUsername(username);
      if (usernameError) return NextResponse.json({ error: usernameError }, { status: 400 });
      if (username !== target.username) {
        const { data: dup } = await supabase
          .from('admin_users')
          .select('id')
          .eq('username', username)
          .neq('id', id)
          .maybeSingle();
        if (dup) return NextResponse.json({ error: 'Username sudah dipakai.' }, { status: 409 });
      }
      update.username = username;
    }

    if (body?.email !== undefined) {
      const email = String(body.email ?? '').trim().toLowerCase();
      const emailError = validateEmail(email);
      if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });
      if (email) {
        const { data: dup } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', email)
          .neq('id', id)
          .maybeSingle();
        if (dup) return NextResponse.json({ error: 'Email sudah dipakai.' }, { status: 409 });
      }
      update.email = email || null;
    }

    const nextRole = body?.role !== undefined ? String(body.role) : target.role;
    if (body?.role !== undefined) {
      if (!(ROLES as readonly string[]).includes(nextRole)) {
        return NextResponse.json({ error: 'Peran tidak valid.' }, { status: 400 });
      }
      update.role = nextRole;
    }

    const nextActive = body?.isActive !== undefined ? Boolean(body.isActive) : target.is_active !== false;
    if (body?.isActive !== undefined) update.is_active = nextActive;

    if (body?.allowedPages !== undefined || body?.role !== undefined) {
      update.allowed_pages = nextRole === 'admin' ? [] : sanitizePages(body?.allowedPages);
    }

    if (body?.password) {
      const passwordError = validatePassword(String(body.password));
      if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
      update.password_hash = await hashPassword(String(body.password));
    }

    // Protect the account of the current admin from locking themselves out
    const isSelf = id === guard.session.user.id;
    if (isSelf && (nextRole !== 'admin' || !nextActive)) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menurunkan peran atau menonaktifkan akun sendiri.' },
        { status: 400 }
      );
    }

    // At least one active admin must always remain
    const wasActiveAdmin = target.role === 'admin' && target.is_active !== false;
    const staysActiveAdmin = nextRole === 'admin' && nextActive;
    if (wasActiveAdmin && !staysActiveAdmin && (await activeAdminCountExcluding(id)) < 1) {
      return NextResponse.json(
        { error: 'Minimal harus ada satu Admin aktif.' },
        { status: 400 }
      );
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.' }, { status: 400 });
    }

    const { error } = await supabase.from('admin_users').update(update).eq('id', id);
    if (error) {
      console.error('Member update error:', error.message);
      return NextResponse.json({ error: 'Gagal menyimpan anggota.' }, { status: 500 });
    }

    // Force re-login when credentials, role or status change
    if (update.password_hash || update.role !== undefined || update.is_active === false) {
      await supabase.from('admin_sessions').delete().eq('user_id', id);
    }

    const label = `${(update.name as string) ?? target.name} (@${(update.username as string) ?? target.username})`;
    await logActivity(
      guard.session.user,
      update.is_active === false && target.is_active !== false ? 'Menonaktifkan anggota' : 'Mengubah anggota',
      'Anggota',
      label
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Member update error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal menyimpan anggota.' }, { status: 500 });
  }
}

/** Delete member (admin only) */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const guard = await requireAdmin(request, { roles: ['admin'] });
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;

    if (id === guard.session.user.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun sendiri.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: target } = await supabase
      .from('admin_users')
      .select('id, username, name, role, is_active')
      .eq('id', id)
      .maybeSingle();
    if (!target) return NextResponse.json({ error: 'Anggota tidak ditemukan.' }, { status: 404 });

    if (target.role === 'admin' && target.is_active !== false && (await activeAdminCountExcluding(id)) < 1) {
      return NextResponse.json({ error: 'Minimal harus ada satu Admin aktif.' }, { status: 400 });
    }

    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) {
      console.error('Member delete error:', error.message);
      return NextResponse.json({ error: 'Gagal menghapus anggota.' }, { status: 500 });
    }

    await logActivity(guard.session.user, 'Menghapus anggota', 'Anggota', `${target.name} (@${target.username})`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Member delete error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal menghapus anggota.' }, { status: 500 });
  }
}
