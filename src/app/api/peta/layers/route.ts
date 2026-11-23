import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';
import { analyzeGeojson, cleanStyle, MAX_GEOJSON_BYTES } from '@/lib/peta';

export const dynamic = 'force-dynamic';

const META = 'id,nama,grup,warna,gaya,opacity,garis,ukuran,ket,sumber,aktif,awal,sort_order,tipe,n,bbox,title_key,warna_oleh,created_at,updated_at';


export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const sb = createServiceClient();
  const { data, error } = await sb.from('peta_layers').select(META).order('sort_order').order('created_at');
  if (error) return NextResponse.json({ error: 'Gagal memuat lapisan. Pastikan migrasi peta sudah dijalankan.' }, { status: 500 });
  return NextResponse.json({ layers: data });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  try {
    const form = await request.formData();
    const file = form.get('file');
    const text = file instanceof File ? await file.text() : String(form.get('geojson') || '');
    if (!text.trim()) return NextResponse.json({ error: 'Pilih berkas GeoJSON atau tempel isinya.' }, { status: 400 });
    if (text.length > MAX_GEOJSON_BYTES) return NextResponse.json({ error: 'Berkas terlalu besar (maks 3,5 MB). Sederhanakan geometri atau pecah menjadi beberapa lapisan.' }, { status: 413 });
    let meta;
    try { meta = analyzeGeojson(JSON.parse(text)); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'GeoJSON tidak valid.' }, { status: 400 }); }
    const style = cleanStyle(Object.fromEntries(Array.from(form.entries()).filter(([, v]) => typeof v === 'string').map(([k, v]) => {
      if (k === 'aktif' || k === 'awal') return [k, v === 'true'];
      return [k, v];
    })));
    if (!style.nama) style.nama = file instanceof File ? file.name.replace(/\.(geo)?json$/i, '') : 'Lapisan baru';
    const sb = createServiceClient();
    const { data: last } = await sb.from('peta_layers').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    const { data, error } = await sb.from('peta_layers').insert({
      ...style, sort_order: ((last?.[0]?.sort_order as number) ?? 0) + 1,
      tipe: meta.tipe, n: meta.n, bbox: meta.bbox, title_key: meta.title_key, geojson: meta.geojson,
    }).select(META).single();
    if (error) throw error;
    await logActivity(guard.session.user, 'Menambah lapisan peta', 'peta', String(style.nama));
    return NextResponse.json({ layer: data }, { status: 201 });
  } catch (e) {
    console.error('peta upload', e);
    return NextResponse.json({ error: 'Gagal menyimpan lapisan.' }, { status: 500 });
  }
}
