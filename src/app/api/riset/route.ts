import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';
import { getRiset, cleanRiset } from '@/lib/riset';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  return NextResponse.json({ items: await getRiset(true) });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;
  const row = cleanRiset(await request.json());
  if (!row.judul || !row.file_url) return NextResponse.json({ error: 'Judul dan berkas/tautan PDF wajib diisi.' }, { status: 400 });
  const { data, error } = await createServiceClient().from('riset_publications').insert(row).select('id').single();
  if (error) return NextResponse.json({ error: 'Gagal menyimpan. Pastikan migrasi riset sudah dijalankan.' }, { status: 500 });
  await logActivity(guard.session.user, 'Menambah publikasi riset', 'riset', String(row.judul));
  return NextResponse.json({ id: data.id }, { status: 201 });
}
