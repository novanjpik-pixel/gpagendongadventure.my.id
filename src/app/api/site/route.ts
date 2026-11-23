import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

// Informasi publik untuk header/footer (kontak dan logo).
export async function GET() {
  const c = await getContent();
  return Response.json({ kontak: c.kontak, media: c.media }, { headers: { 'Cache-Control': 'no-store' } });
}
