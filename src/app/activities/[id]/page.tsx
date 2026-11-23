import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapRowToPost, Post } from '@/lib/data';
import { notFound } from 'next/navigation';
import ImageCarousel from '@/components/ImageCarousel';
import { isWordPressEnabled, getWordPressPostBySlug, getWordPressPosts } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post: Post | null = null;
  let related: Post[] = [];

  if (isWordPressEnabled()) {
    post = await getWordPressPostBySlug(id);
    if (post) {
      const all = (await getWordPressPosts(20)) || [];
      related = all.filter((p) => p.category === post!.category && p.id !== post!.id).slice(0, 3);
    }
  }

  if (!post) {
    const supabase = await createClient();

    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!postData) {
      notFound();
    }

    post = mapRowToPost(postData as Record<string, unknown>);

    const { data: relatedData } = await supabase
      .from('posts')
      .select('*')
      .eq('category', post.category)
      .neq('id', id)
      .limit(3);

    related = (relatedData || []).map((row) => mapRowToPost(row as Record<string, unknown>));
  }

  const images = post.images || [];

  return (
    <>
      <Header />
      <main className="bg-cream pt-16">
        {/* Hero with carousel */}
        <section className="relative overflow-hidden">
          <ImageCarousel images={images} alt={`Foto kegiatan ${post.title} - GPA Gendong Adventure`} />
          <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto z-20">
            <span className="inline-block px-3 py-1 bg-lime/20 border border-lime/30 text-lime text-xs font-semibold rounded-full mb-3">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl">{post.title}</h1>
            <p className="text-white/60 mt-2 text-sm">
              {new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/activities" className="inline-flex items-center gap-2 text-forest/60 hover:text-forest text-sm font-medium mb-8 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Kembali ke Kegiatan
            </Link>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-forest/5">
              <p className="text-forest/70 text-lg leading-relaxed mb-6 font-medium italic border-l-4 border-lime pl-4">
                {post.description}
              </p>
              <div className="prose prose-lg max-w-none text-forest/70 leading-relaxed">
                {post.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="py-16 bg-forest-dark">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl font-bold text-white mb-8">Kegiatan Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p) => {
                  const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80';
                  return (
                    <Link key={p.id} href={`/activities/${p.id}`} className="group block">
                      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 transition-colors">
                        <img
                          src={thumb}
                          alt={`Foto kegiatan ${p.title}`}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <span className="text-lime text-xs font-semibold">{p.category}</span>
                          <h3 className="text-white font-semibold mt-1 line-clamp-2 group-hover:text-lime transition-colors">{p.title}</h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
