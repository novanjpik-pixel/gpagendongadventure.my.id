'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createClient } from '@/lib/supabase/client';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

interface FileEntry {
  file: File;
  previewUrl: string;
  title: string;
  caption: string;
}

export default function AdminGalleryPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('gallery')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!fetchError) {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB per file (nginx limit)
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setError(
        `File terlalu besar: ${oversized.map((f) => f.name).join(', ')}. Maksimal 1MB per file.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newEntries: FileEntry[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: '',
      caption: '',
    }));

    setFileEntries((prev) => [...prev, ...newEntries]);
    // Reset input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeEntry = (index: number) => {
    setFileEntries((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateEntry = (index: number, field: 'title' | 'caption', value: string) => {
    setFileEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileEntries.length === 0) {
      setError('Pilih minimal satu gambar terlebih dahulu.');
      return;
    }

    // Check total batch size before sending (nginx limit ~1MB per file)
    const MAX_FILE_SIZE = 1 * 1024 * 1024;
    const oversized = fileEntries.filter((entry) => entry.file.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setError(
        `File terlalu besar: ${oversized.map((e) => e.file.name).join(', ')}. Maksimal 1MB per file.`
      );
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(`Mengunggah 0 / ${fileEntries.length}...`);

    try {
      const formData = new FormData();
      fileEntries.forEach((entry) => {
        formData.append('files', entry.file);
        formData.append('titles', entry.title ?? '');
        formData.append('captions', entry.caption ?? '');
      });
      formData.append('sortOrderBase', String(items.length));

      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      // Handle 413 explicitly — nginx rejects before reaching Next.js
      if (res.status === 413) {
        throw new Error(
          'File terlalu besar untuk diunggah. Pastikan setiap file tidak melebihi 1MB.'
        );
      }

      let data: { error?: string; successCount?: number; failCount?: number; results?: { success: boolean; name: string; error?: string }[] } = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response from upload API:', text.slice(0, 200));
        throw new Error(`Server error (${res.status}): Respons tidak valid dari server.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto.');
      }

      const { successCount = 0, failCount = 0, results = [] } = data;

      if (failCount > 0) {
        const failedNames = results
          .filter((r) => !r.success)
          .map((r) => r.name)
          .join(', ');
        setError(`${failCount} foto gagal diunggah: ${failedNames}`);
      }

      if (successCount > 0) {
        setSuccess(`${successCount} foto berhasil ditambahkan ke galeri!`);
        fileEntries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
        setFileEntries([]);
        await fetchGallery();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;

    try {
      const res = await fetch('/api/gallery/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, imageUrl: item.image_url }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from delete API:', text.slice(0, 200));
        throw new Error(`Server error (${res.status}): Respons tidak valid dari server.`);
      }

      let data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus foto.');
      }

      setSuccess('Foto berhasil dihapus.');
      await fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus foto.');
    }
  };

  return (
    <AdminLayout title="Kelola Galeri">
      <div className="space-y-8">
        {/* Upload Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-6">Tambah Foto Baru</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-lime/10 border border-lime/20 rounded-xl text-lime text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-lime/40 transition-colors"
            >
              <div className="flex flex-col items-center gap-3 text-white/40">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="text-sm font-medium text-white/60">Klik untuk pilih gambar</p>
                <p className="text-xs">Bisa pilih beberapa file sekaligus — JPG, PNG, WebP, GIF — maks. 1MB/file</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Selected files preview */}
            {fileEntries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm">{fileEntries.length} file dipilih</p>
                  <button
                    type="button"
                    onClick={() => {
                      fileEntries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
                      setFileEntries([]);
                    }}
                    className="text-red-400 text-xs hover:text-red-300 transition-colors"
                  >
                    Hapus semua
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {fileEntries.map((entry, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <div className="relative">
                        <img
                          src={entry.previewUrl}
                          alt={`Preview ${entry.file.name}`}
                          className="w-full h-36 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeEntry(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                          title="Hapus file ini"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-forest-dark/60 px-2 py-1">
                          <p className="text-white/60 text-xs truncate">{entry.file.name}</p>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={entry.title}
                          onChange={(e) => updateEntry(index, 'title', e.target.value)}
                          placeholder="Judul (opsional)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 text-xs focus:outline-none focus:border-lime/40"
                        />
                        <input
                          type="text"
                          value={entry.caption}
                          onChange={(e) => updateEntry(index, 'caption', e.target.value)}
                          placeholder="Keterangan (opsional)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 text-xs focus:outline-none focus:border-lime/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || fileEntries.length === 0}
              className="px-6 py-3 bg-lime text-forest-dark rounded-xl font-bold text-sm hover:bg-lime-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {uploadProgress || 'Mengunggah...'}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V0C5.373 0 0 5.373 0 12h4z"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Unggah {fileEntries.length > 0 ? `${fileEntries.length} Foto` : 'Foto'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">Foto Galeri</h2>
            <span className="text-white/40 text-sm">{items.length} foto</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/40">Memuat galeri...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p>Belum ada foto. Tambahkan foto pertama di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <img
                    src={item.image_url}
                    alt={item.title || 'Foto galeri GPA Gendong Adventure'}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-forest-dark/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                      title="Hapus foto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                  {item.title && (
                    <div className="p-2">
                      <p className="text-white/70 text-xs truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
