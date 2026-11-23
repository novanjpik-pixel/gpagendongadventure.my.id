import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Unggah PDF ke Supabase Storage (bucket "gallery", folder riset/). Maks 4 MB (batas fungsi serverless Vercel).
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Tidak ada berkas.' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Hanya berkas PDF.' }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'PDF lebih dari 4 MB. Simpan di Google Drive lalu tempel tautannya.' }, { status: 413 });
  const name = `riset/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
  const sb = createServiceClient();
  const { data, error } = await sb.storage.from('gallery').upload(name, Buffer.from(await file.arrayBuffer()), { contentType: 'application/pdf', upsert: false });
  if (error) return NextResponse.json({ error: 'Gagal mengunggah PDF.' }, { status: 500 });
  const { data: u } = sb.storage.from('gallery').getPublicUrl(data.path);
  return NextResponse.json({ url: u.publicUrl });
}
