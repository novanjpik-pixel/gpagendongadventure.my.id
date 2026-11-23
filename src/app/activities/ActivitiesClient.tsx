'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/data';

const categories = ['Semua', 'Lingkungan', 'Pendidikan', 'Sosial', 'Umum'];

interface ActivitiesClientProps {
  posts: Post[];
}

export default function ActivitiesClient({ posts }: ActivitiesClientProps) {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredPosts =
    activeCategory === 'Semua'
      ? posts
      : posts.filter((post) => post?.category === activeCategory);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                cat === activeCategory
                  ? 'bg-forest text-white'
                  : 'bg-white border border-forest/20 text-forest/70 hover:border-forest hover:text-forest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredPosts?.length === 0 ? (
          <div className="text-center py-20 text-forest/40">
            <p className="text-xl">Belum ada kegiatan yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts?.map((post) => {
              const thumbnail =
                post?.images?.[0] ||
                'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80';
              return (
                <Link key={post?.id} href={`/activities/${post?.id}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-forest transition-all duration-300 hover:-translate-y-1 border border-forest/5">
                    <div className="relative overflow-hidden h-52">
                      <img
                        src={thumbnail}
                        alt={`Foto kegiatan ${post?.title} - GPA Gendong Adventure`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-forest text-lime text-xs font-semibold rounded-full">
                          {post?.category}
                        </span>
                      </div>
                      {post?.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-lime text-forest-dark text-xs font-bold rounded-full">
                            Unggulan
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-forest/40 text-xs font-medium mb-2">
                        {new Date(post.date)?.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <h3 className="font-bold text-forest-dark text-lg mb-2 line-clamp-2 group-hover:text-forest transition-colors">
                        {post?.title}
                      </h3>
                      <p className="text-forest/60 text-sm leading-relaxed line-clamp-3">
                        {post?.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-forest text-sm font-semibold">
                        Baca Selengkapnya
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform group-hover:translate-x-1"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
