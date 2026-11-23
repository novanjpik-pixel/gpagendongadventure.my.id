'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';

interface Settings {
  siteName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  aboutText: string;
  visionText: string;
  missionText: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  facebook: string;
}

export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Settings>({
    siteName: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    aboutText: '',
    visionText: '',
    missionText: '',
    instagram: '',
    youtube: '',
    whatsapp: '',
    facebook: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setForm({
          siteName: data.siteName || '',
          tagline: data.tagline || '',
          description: data.description || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          aboutText: data.aboutText || '',
          visionText: data.visionText || '',
          missionText: data.missionText || '',
          instagram: data.instagram || '',
          youtube: data.youtube || '',
          whatsapp: data.whatsapp || '',
          facebook: data.facebook || '',
        });
      } catch (err) {
        setError('Gagal memuat pengaturan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan pengaturan');
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Pengaturan">
        <div className="text-center py-20 text-white/40">Memuat pengaturan...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan Website">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-white font-bold text-xl">Pengaturan Website</h2>
          <p className="text-white/40 text-sm mt-1">Kelola informasi dasar, kontak, dan konten website</p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-5 p-4 bg-lime/10 border border-lime/20 rounded-xl text-lime text-sm">
            ✅ Pengaturan berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold text-base border-b border-white/10 pb-3">Informasi Website</h3>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Nama Website</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Deskripsi</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors resize-none"
              />
            </div>
          </div>

          {/* About */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold text-base border-b border-white/10 pb-3">Tentang Kami</h3>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Teks Tentang</label>
              <textarea
                rows={4}
                value={form.aboutText}
                onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Visi</label>
              <textarea
                rows={3}
                value={form.visionText}
                onChange={(e) => setForm({ ...form, visionText: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Misi</label>
              <textarea
                rows={3}
                value={form.missionText}
                onChange={(e) => setForm({ ...form, missionText: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold text-base border-b border-white/10 pb-3">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">Telepon</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/70 font-medium text-sm mb-2">Alamat</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold text-base border-b border-white/10 pb-3">Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={form.youtube}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">WhatsApp URL</label>
                <input
                  type="url"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="https://wa.me/62..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/70 font-medium text-sm mb-2">Facebook URL</label>
                <input
                  type="url"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/10 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-lime text-forest-dark font-bold rounded-xl hover:bg-lime-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
