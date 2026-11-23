import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, requireAdmin } from '@/lib/adminAuth';

/** Latest activity log entries (admin only) */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request, { roles: ['admin'] });
  if (!guard.ok) return guard.response;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, user_name, action, object_type, object_label, created_at')
      .order('created_at', { ascending: false })
      .limit(80);

    if (error) {
      console.error('Activity log error:', error.message);
      return NextResponse.json({ error: 'Gagal memuat log aktivitas.' }, { status: 500 });
    }

    const logs = (data || []).map((l) => ({
      id: l.id,
      userName: l.user_name,
      action: l.action,
      objectType: l.object_type,
      objectLabel: l.object_label,
      createdAt: l.created_at,
    }));
    return NextResponse.json({ logs });
  } catch (err) {
    console.error('Activity log error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Gagal memuat log aktivitas.' }, { status: 500 });
  }
}
