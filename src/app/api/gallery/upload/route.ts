import { NextRequest } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/adminAuth';

function safeJson(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return safeJson({ error: 'Tidak terautentikasi.' }, guard.response.status);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return safeJson({ error: 'Gagal membaca data form. Coba lagi.' }, 400);
  }

  try {
    const files = formData.getAll('files') as File[];
    const titles = formData.getAll('titles') as string[];
    const captions = formData.getAll('captions') as string[];
    const sortOrderBase = parseInt((formData.get('sortOrderBase') as string) || '0', 10);

    if (!files || files.length === 0) {
      return safeJson({ error: 'Tidak ada file yang dikirim.' }, 400);
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 1 * 1024 * 1024; // 1MB — matches nginx client_max_body_size

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return safeJson(
          { error: `Tipe file tidak didukung: ${file.name}. Gunakan JPG, PNG, WebP, atau GIF.` },
          400
        );
      }
      if (file.size > maxSize) {
        return safeJson(
          { error: `File terlalu besar: ${file.name}. Maksimal 1MB per file.` },
          400
        );
      }
    }

    const supabase = createServiceClient();
    const results: { success: boolean; name: string; error?: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = String(titles[i] ?? '');
      const caption = String(captions[i] ?? '');

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, buffer, { contentType: file.type, upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from('gallery')
          .insert({
            title: title.trim(),
            image_url: urlData.publicUrl,
            caption: caption.trim(),
            sort_order: sortOrderBase + i,
          });

        if (insertError) throw insertError;

        results.push({ success: true, name: file.name });
      } catch (err: unknown) {
        results.push({
          success: false,
          name: file.name,
          error: err instanceof Error ? err.message : 'Gagal mengunggah.',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return safeJson({ results, successCount, failCount }, 200);
  } catch (error) {
    console.error('Gallery upload error:', error);
    return safeJson({ error: 'Gagal memproses upload.' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return safeJson({ error: 'Tidak terautentikasi.' }, guard.response.status);
  }

  let body: { id?: string; imageUrl?: string };

  try {
    body = await request.json();
  } catch {
    return safeJson({ error: 'Request body tidak valid.' }, 400);
  }

  try {
    const { id, imageUrl } = body;
    if (!id) {
      return safeJson({ error: 'ID tidak ditemukan.' }, 400);
    }

    const supabase = createServiceClient();

    // Remove from storage
    if (imageUrl) {
      try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/gallery/');
        if (pathParts.length > 1) {
          await supabase.storage.from('gallery').remove([pathParts[1]]);
        }
      } catch {
        // ignore storage removal errors
      }
    }

    const { error: deleteError } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return safeJson({ success: true }, 200);
  } catch (error) {
    console.error('Gallery delete error:', error);
    return safeJson({ error: 'Gagal menghapus foto.' }, 500);
  }
}
