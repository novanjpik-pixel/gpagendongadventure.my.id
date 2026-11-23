'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  category: string;
  date: string;
  featured: boolean;
}

interface Settings {
  siteName: string;
  tagline: string;
}

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, settingsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/settings'),
        ]);
        const postsData = await postsRes.json();
        const settingsData = await settingsRes.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Postingan',
      value: posts.length,
      icon: '📝',
      href: '/admin/posts',
      gradient: 'from-lime/25 via-lime/10 to-transparent',
      ring: 'border-lime/30',
      glow: 'bg-lime/20',
    },
    {
      label: 'Postingan Featured',
      value: posts.filter((p) => p.featured).length,
      icon: '⭐',
      href: '/admin/posts',
      gradient: 'from-yellow-400/25 via-yellow-400/10 to-transparent',
      ring: 'border-yellow-400/30',
      glow: 'bg-yellow-400/20',
    },
    {
      label: 'Kategori Aktif',
      value: [...new Set(posts.map((p) => p.category))].length,
      icon: '🏷️',
      href: '/admin/posts',
      gradient: 'from-sky-400/25 via-sky-400/10 to-transparent',
      ring: 'border-sky-400/30',
      glow: 'bg-sky-400/20',
    },
    {
      label: 'Pengaturan',
      value: settings ? 1 : 0,
      icon: '⚙️',
      href: '/admin/settings',
      gradient: 'from-purple-400/25 via-purple-400/10 to-transparent',
      ring: 'border-purple-400/30',
      glow: 'bg-purple-400/20',
    },
  ];

  const quickActions = [
    { href: '/admin/posts/new', icon: '✍️', title: 'Postingan Baru', desc: 'Tambah kegiatan atau berita', primary: true },
    { href: '/admin/gallery', icon: '🖼️', title: 'Kelola Galeri', desc: 'Unggah dan atur foto', primary: false },
    { href: '/admin/settings', icon: '⚙️', title: 'Pengaturan', desc: 'Kontak, donasi, tentang', primary: false },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Hero welcome */}
        <div className="relative overflow-hidden rounded-3xl border border-lime/20 bg-gradient-to-br from-forest-light via-forest-mid to-forest-dark p-6 sm:p-8 shadow-forest-lg">
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-lime/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-lime/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                Panel Admin
              </span>
              <h2 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight mb-2">
                Selamat Datang kembali 👋
              </h2>
              <p className="text-white/60 text-sm sm:text-base max-w-xl">
                Kelola konten website <span className="text-lime font-semibold">{settings?.siteName || 'GPA Gendong Adventure'}</span> dari satu tempat.
              </p>
              {settings?.tagline && (
                <p className="text-white/40 text-sm mt-2 italic">“{settings.tagline}”</p>
              )}
            </div>
            <Link
              href="/admin/posts/new"
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-lime text-forest-dark font-bold rounded-xl hover:bg-lime-light shadow-lime-lg transition-all hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Postingan Baru
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Link
              key={i}
              href={stat.href}
              className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} bg-white/5 border ${stat.ring} rounded-2xl p-5 hover:-translate-y-1 hover:shadow-forest-lg transition-all duration-300`}
            >
              <div className={`pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.glow} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tabular-nums">
                  {loading ? <span className="inline-block w-10 h-8 rounded-md bg-white/10 animate-pulse" /> : stat.value}
                </div>
                <div className="text-white/60 text-sm font-medium">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  a.primary
                    ? 'bg-gradient-to-br from-lime/20 to-lime/5 border-lime/30 hover:border-lime/60 hover:shadow-lime'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${a.primary ? 'bg-lime/20' : 'bg-white/10'}`}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold">{a.title}</p>
                  <p className="text-white/40 text-sm truncate">{a.desc}</p>
                </div>
                <svg className="text-white/30 group-hover:text-lime group-hover:translate-x-1 transition-all" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-forest">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.03]">
            <div>
              <h3 className="text-white font-bold">Postingan Terbaru</h3>
              <p className="text-white/40 text-xs mt-0.5">5 postingan terakhir yang ditambahkan</p>
            </div>
            <Link href="/admin/posts" className="text-lime text-sm font-semibold hover:text-lime-light transition-colors">
              Lihat Semua →
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((n) => (
                <div key={n} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-10 text-center text-white/40">
              <p>Belum ada postingan.</p>
              <Link href="/admin/posts/new" className="mt-3 inline-block text-lime text-sm hover:underline">
                Buat postingan pertama →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {posts.slice(0, 5).map((post, idx) => (
                <div key={post.id} className="flex items-center gap-4 p-4 sm:px-6 hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-lime/10 border border-lime/20 flex items-center justify-center text-lime text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{post.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-lime/10 text-lime text-[11px] font-semibold">{post.category}</span>
                      <span className="text-white/40 text-xs">
                        {new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 text-[11px] font-semibold">⭐ Featured</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-lime hover:text-forest-dark text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
