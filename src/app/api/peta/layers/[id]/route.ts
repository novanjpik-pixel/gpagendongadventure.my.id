import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';
import { analyzeGeojson, cleanStyle, MAX_GEOJSON_BYTES } from '@/lib/peta';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  try {
    const body = await request.json();
    const upd: Record<string, unknown> = { ...cleanStyle(body), updated_at: new Date().toISOString() };
    if (typeof body.geojson === 'string' && body.geojson.trim()) {
      if (body.geojson.length > MAX_GEOJSON_BYTES) return NextResponse.json({ error: 'Berkas terlalu besar (maks 3,5 MB).' }, { status: 413 });
      try {
        const m = analyzeGeojson(JSON.parse(body.geojson));
        Object.assign(upd, { tipe: m.tipe, n: m.n, bbox: m.bbox, title_key: m.title_key, geojson: m.geojson });
      } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'GeoJSON tidak valid.' }, { status: 400 }); }
    }
    const sb = createServiceClient();
    const { data, error } = await sb.from('peta_layers').update(upd).eq('id', id).select('id,nama').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Lapisan tidak ditemukan.' }, { status: 404 });
    await logActivity(guard.session.user, 'Mengubah lapisan peta', 'peta', String(data.nama));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('peta patch', e);
    return NextResponse.json({ error: 'Gagal menyimpan perubahan.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const sb = createServiceClient();
  const { data } = await sb.from('peta_layers').delete().eq('id', id).select('nama').maybeSingle();
  if (data) await logActivity(guard.session.user, 'Menghapus lapisan peta', 'peta', String(data.nama));
  return NextResponse.json({ ok: true });
}
