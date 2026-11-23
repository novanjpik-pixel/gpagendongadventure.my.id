import { NextRequest, NextResponse } from 'next/server';
import { mapRowToPost } from '@/lib/data';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    const posts = (data || []).map((row) => mapRowToPost(row as Record<string, unknown>));
    return NextResponse.json(posts);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { title, slug, category, date, images, image, description, content, featured } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const resolvedImages: string[] = images && Array.isArray(images) && images.length > 0
      ? images
      : image
      ? [image]
      : [];

    const generatedSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug: generatedSlug,
        category: category || 'Umum',
        date: date || new Date().toISOString().split('T')[0],
        images: resolvedImages,
        description: description || '',
        content,
        featured: featured || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    await logActivity(guard.session.user, 'Menambah kegiatan', 'Kegiatan', String(title));
    return NextResponse.json(mapRowToPost(data as Record<string, unknown>), { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
