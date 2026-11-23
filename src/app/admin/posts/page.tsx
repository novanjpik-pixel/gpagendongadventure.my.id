'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  featured: boolean;
  image: string;
}

export const dynamic = 'force-dynamic';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus postingan "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete post', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout title="Kelola Postingan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">Semua Postingan</h2>
            <p className="text-white/40 text-sm mt-1">{posts.length} postingan total</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-lime text-forest-dark font-bold rounded-xl hover:bg-lime-dark transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Postingan Baru
          </Link>
        </div>

        {/* Posts list */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/40">Memuat postingan...</div>
          ) : posts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Belum Ada Postingan</h3>
              <p className="text-white/40 text-sm mb-6">Mulai buat postingan pertama Anda untuk ditampilkan di website.</p>
              <Link href="/admin/posts/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-lime text-forest-dark font-bold rounded-xl text-sm hover:bg-lime-dark transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Buat Postingan Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-5 hover:bg-white/5 transition-colors">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={`Thumbnail ${post.title}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">📷</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lime text-xs font-semibold">{post.category}</span>
                      {post.featured && (
                        <span className="text-yellow-400 text-xs">⭐ Featured</span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{post.title}</h3>
                    <p className="text-white/40 text-xs mt-1 line-clamp-1">{post.description}</p>
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/activities/${post.id}`}
                      target="_blank"
                      className="p-2 text-white/30 hover:text-white transition-colors"
                      title="Lihat di website"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/15 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deleting === post.id}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {deleting === post.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
