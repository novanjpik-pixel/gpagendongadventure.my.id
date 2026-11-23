import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';
import { cleanRiset } from '@/lib/riset';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const upd = { ...cleanRiset(await request.json()), updated_at: new Date().toISOString() };
  const { data, error } = await createServiceClient().from('riset_publications').update(upd).eq('id', id).select('judul').maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Gagal menyimpan.' }, { status: 500 });
  await logActivity(guard.session.user, 'Mengubah publikasi riset', 'riset', String(data.judul));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const { data } = await createServiceClient().from('riset_publications').delete().eq('id', id).select('judul').maybeSingle();
  if (data) await logActivity(guard.session.user, 'Menghapus publikasi riset', 'riset', String(data.judul));
  return NextResponse.json({ ok: true });
}
