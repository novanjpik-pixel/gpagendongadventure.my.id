import { NextRequest, NextResponse } from 'next/server';
import { mapRowToPost } from '@/lib/data';
import { requireAdmin, createServiceClient, logActivity } from '@/lib/adminAuth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(mapRowToPost(data as Record<string, unknown>));
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    // Map camelCase to snake_case for DB
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await logActivity(guard.session.user, 'Mengubah kegiatan', 'Kegiatan', String((data as Record<string, unknown>).title ?? id));
    return NextResponse.json(mapRowToPost(data as Record<string, unknown>));
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('posts')
      .select('title')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    await logActivity(guard.session.user, 'Menghapus kegiatan', 'Kegiatan', String(existing?.title ?? id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
