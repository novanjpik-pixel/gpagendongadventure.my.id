import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/site/PageHero';
import { getContent } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import { mapRowToPost, Post } from '@/lib/data';
import { getWordPressPosts } from '@/lib/wordpress';
import ActivitiesClient from './ActivitiesClient';

export const metadata: Metadata = {
  title: 'Kegiatan & Blog GPA Gendong Adventure — Dokumentasi Kegiatan',
  description: 'Dokumentasi kegiatan lingkungan, pendidikan, dan sosial komunitas GPA Gendong Adventure di Bengkulu, Indonesia.',
  openGraph: {
    title: 'Kegiatan & Blog GPA Gendong Adventure',
    description: 'Dokumentasi kegiatan lingkungan, pendidikan, dan sosial komunitas GPA Gendong Adventure.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/activities`,
    images: [
      {
        url: '/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png',
        width: 1200,
        height: 630,
        alt: 'GPA Gendong Adventure - Kegiatan dan Blog',
      },
    ],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/activities`,
  },
};

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
  const C = await getContent();
  let posts: Post[] | null = await getWordPressPosts(100);

  if (posts === null) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    posts = error ? [] : (data || []).map((row) => mapRowToPost(row as Record<string, unknown>));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Kegiatan & Blog GPA Gendong Adventure',
            description: 'Dokumentasi kegiatan lingkungan, pendidikan, dan sosial komunitas GPA Gendong Adventure.',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/activities`,
            publisher: {
              '@type': 'Organization',
              name: 'GPA Gendong Adventure',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png`,
              },
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Kegiatan',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/activities`,
              },
            ],
          }),
        }}
      />
      <Header />
      <main className="bg-cream">
        <PageHero eyebrow="Kegiatan" title="Setiap langkah adalah cerita" lead="Dokumentasi kegiatan lingkungan, pendidikan, dan sosial GPA Gendong Adventure." image={C.media.heroKegiatan} />

        <ActivitiesClient posts={posts} />
      </main>
      <Footer />
    </>
  );
}
