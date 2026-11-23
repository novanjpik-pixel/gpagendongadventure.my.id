import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';
import { getContent, CONTENT_KEYS } from '@/lib/content';
import { ALL_FIELDS } from '@/lib/content-schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  return NextResponse.json({ content: await getContent() });
}

const str = (v: unknown, max = 600) => String(v ?? '').trim().slice(0, max);
const strs = (v: unknown, max = 60, len = 1500) => (Array.isArray(v) ? v.map((x) => str(x, len)).filter(Boolean).slice(0, max) : []);
const noScript = (s: string) => !/^\s*(javascript|data:text|vbscript):/i.test(s);

function sanitizeStruktur(s: Record<string, unknown> = {}) {
  const p = (x: { jabatan?: unknown; nama?: unknown } = {}) => ({ jabatan: str(x.jabatan, 80), nama: str(x.nama, 80) });
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  return {
    ketum: p(s.ketum as never), sekum: p(s.sekum as never), bendum: p(s.bendum as never),
    dpo: arr(s.dpo).map(p).filter((x: { nama: string }) => x.nama).slice(0, 12),
    bidang: arr(s.bidang).slice(0, 8).map((x: { nama?: unknown; kepala?: unknown; anggota?: unknown }) => ({ nama: str(x.nama, 80), kepala: str(x.kepala, 80), anggota: strs(x.anggota, 12, 80) })).filter((x: { nama: string }) => x.nama),
    dasar: str(s.dasar, 400),
  };
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin(request, { roles: ['admin', 'editor'] });
  if (!guard.ok) return guard.response;
  const b = await request.json();
  const rows: { key: string; value: unknown; updated_at: string }[] = [];
  const now = new Date().toISOString();
  for (const key of CONTENT_KEYS as string[]) {
    if (b[key] === undefined) continue;
    let value: unknown;
    if (key === 'struktur') value = sanitizeStruktur(b.struktur);
    else {
      const f = ALL_FIELDS.find((x) => x.key === key);
      if (!f) continue;
      const k = f.kind;
      if (k.t === 'text') value = str(b[key], 300);
      else if (k.t === 'long') value = str(b[key], 1500);
      else if (k.t === 'lines') value = strs(b[key]);
      else if (k.t === 'map') {
        const o: Record<string, string> = {};
        for (const fl of k.fields) { const v = str((b[key] || {})[fl.k], 1500); if (noScript(v)) o[fl.k] = v; }
        value = o;
      } else {
        const src = Array.isArray(b[key]) ? (b[key] as Record<string, unknown>[]) : [];
        value = src.slice(0, 120).map((r) => {
          const o: Record<string, string | boolean> = {};
          for (const fl of k.fields) o[fl.k] = fl.bool ? !!r[fl.k] : str(r[fl.k], fl.long ? 1500 : 300);
          return o;
        }).filter((o) => k.fields.some((fl) => !fl.bool && o[fl.k]));
      }
    }
    rows.push({ key, value, updated_at: now });
  }
  if (!rows.length) return NextResponse.json({ error: 'Tidak ada data.' }, { status: 400 });
  const { error } = await createServiceClient().from('site_content').upsert(rows);
  if (error) return NextResponse.json({ error: 'Gagal menyimpan. Pastikan migrasi site_content sudah dijalankan.' }, { status: 500 });
  await logActivity(guard.session.user, 'Mengubah konten halaman', 'konten', rows.map((r) => r.key).join(', '));
  return NextResponse.json({ ok: true });
}
