import { createServiceClient } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('{"error":"id tidak valid"}', { status: 400 });
  const sb = createServiceClient();
  const { data } = await sb.from('peta_layers').select('geojson,aktif').eq('id', id).maybeSingle();
  if (!data || !data.aktif) return new Response('{"error":"tidak ditemukan"}', { status: 404 });
  return new Response(JSON.stringify(data.geojson), {
    headers: { 'Content-Type': 'application/geo+json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
