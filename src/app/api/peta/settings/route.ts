import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';
import { DEFAULT_SETTINGS } from '@/lib/peta';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const sb = createServiceClient();
  const { data } = await sb.from('peta_settings').select('*').eq('id', 1).maybeSingle();
  return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...(data || {}) } });
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const b = await request.json();
  const num = (v: unknown, d: number, lo: number, hi: number) => { const n = Number(v); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const row = {
    id: 1,
    judul: String(b.judul ?? DEFAULT_SETTINGS.judul).slice(0, 120) || DEFAULT_SETTINGS.judul,
    deskripsi: String(b.deskripsi ?? '').slice(0, 300),
    lon: num(b.lon, DEFAULT_SETTINGS.lon, -180, 180), lat: num(b.lat, DEFAULT_SETTINGS.lat, -90, 90), zoom: num(b.zoom, DEFAULT_SETTINGS.zoom, 3, 14),
    metodologi: String(b.metodologi ?? '').slice(0, 6000),
    f_sentinel: !!b.f_sentinel, f_cloudless: !!b.f_cloudless, f_tutupan: !!b.f_tutupan, f_gfw: !!b.f_gfw, f_udara: !!b.f_udara,
    updated_at: new Date().toISOString(),
  };
  const sb = createServiceClient();
  const { error } = await sb.from('peta_settings').upsert(row);
  if (error) return NextResponse.json({ error: 'Gagal menyimpan pengaturan.' }, { status: 500 });
  await logActivity(guard.session.user, 'Mengubah pengaturan peta', 'peta', 'Peta ETTRS');
  return NextResponse.json({ ok: true });
}
