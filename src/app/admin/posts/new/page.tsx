'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [form, setForm] = useState({
    title: '',
    category: 'Lingkungan',
    date: new Date().toISOString().split('T')[0],
    images: [''],
    description: '',
    content: '',
    featured: false,
  });

  const categories = ['Lingkungan', 'Pendidikan', 'Sosial', 'Umum'];

  const addImage = () => setForm({ ...form, images: [...form.images, ''] });

  const removeImage = (index: number) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updated.length > 0 ? updated : [''] });
  };

  const updateImage = (index: number, value: string) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm({ ...form, images: updated });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const updated = [...form.images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= updated.length) return;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setForm({ ...form, images: updated });
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengupload gambar');
        return;
      }
      updateImage(index, data.url);
    } catch {
      setError('Gagal mengupload gambar. Coba lagi.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        images: form.images.filter((img) => img.trim() !== ''),
      };
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan postingan');
        setSaving(false);
        return;
      }
      router.push('/admin/posts');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Postingan Baru">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-white font-bold text-xl">Buat Postingan Baru</h2>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Judul *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Judul postingan"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-forest-dark">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
            </div>

            {/* Multi-Image Manager with Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/70 font-medium text-sm">
                  Gambar <span className="text-white/40 font-normal">(gambar pertama = thumbnail)</span>
                </label>
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-lime/10 border border-lime/30 text-lime text-xs font-medium rounded-lg hover:bg-lime/20 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Tambah Gambar
                </button>
              </div>

              <div className="space-y-3">
                {form.images.map((img, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 mt-2">
                      <button
                        type="button"
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-white/30 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Geser ke atas"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === form.images.length - 1}
                        className="p-1 text-white/30 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Geser ke bawah"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                    </div>

                    {/* Index badge */}
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white/40 bg-white/5 rounded-lg shrink-0 mt-2">
                      {index + 1}
                    </span>

                    {/* Upload area or preview */}
                    <div className="flex-1">
                      {img.trim() ? (
                        <div className="relative group">
                          <div className="flex items-center gap-2 p-2 bg-white/10 border border-white/20 rounded-xl">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                              <img src={img} alt={`Preview gambar ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/70 text-xs truncate">{img}</p>
                              <p className="text-white/40 text-xs mt-0.5">
                                {index === 0 ? 'Thumbnail utama' : `Gambar ${index + 1}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateImage(index, '');
                                if (fileInputRefs.current[index]) {
                                  fileInputRefs.current[index]!.value = '';
                                }
                              }}
                              className="px-2 py-1 text-xs text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/30 rounded-lg transition-colors shrink-0"
                            >
                              Ganti
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-lime/40 transition-colors cursor-pointer"
                          onClick={() => fileInputRefs.current[index]?.click()}
                        >
                          {uploadingIndex === index ? (
                            <div className="flex items-center justify-center gap-2 text-white/50 text-sm py-2">
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                              Mengupload...
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21 15 16 10 5 21"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-white/60 text-sm font-medium">Klik untuk upload gambar</p>
                                <p className="text-white/30 text-xs mt-0.5">JPG, PNG, WebP, GIF · Maks. 5MB</p>
                              </div>
                            </div>
                          )}
                          <input
                            ref={(el) => { fileInputRefs.current[index] = el; }}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(index, file);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors shrink-0 mt-2"
                      title="Hapus gambar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {form.images.filter(i => i.trim()).length > 1 && (
                <p className="mt-2 text-white/30 text-xs">
                  {form.images.filter(i => i.trim()).length} gambar ditambahkan · Gambar pertama akan jadi thumbnail di halaman daftar
                </p>
              )}
            </div>

            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat postingan..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Konten Lengkap *</label>
              <textarea
                required
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tulis konten lengkap postingan di sini..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-lime"
              />
              <label htmlFor="featured" className="text-white/70 text-sm cursor-pointer">
                Tandai sebagai postingan unggulan (featured)
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-white/60 font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploadingIndex !== null}
              className="flex-1 py-3 bg-lime text-forest-dark font-bold rounded-xl hover:bg-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Postingan'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
