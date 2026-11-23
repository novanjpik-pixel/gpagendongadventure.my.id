import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import GalleryClient from './GalleryClient';
import PageHero from '@/components/site/PageHero';
import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galeri GPA Gendong Adventure — Dokumentasi Foto Kegiatan',
  description: 'Galeri foto kegiatan GPA Gendong Adventure — eksplorasi alam, kegiatan sosial, dan pelestarian lingkungan di Bengkulu.',
  openGraph: {
    title: 'Galeri GPA Gendong Adventure',
    description: 'Dokumentasi foto kegiatan GPA Gendong Adventure di Bengkulu.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gallery`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gallery`,
  },
};

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export default async function GalleryPage() {
  const C = await getContent();
  const statis: GalleryItem[] = C.galeri.map((g, i) => ({
    id: `static-${i}`,
    title: g.judul,
    image_url: g.src,
    caption: g.caption,
    sort_order: -100 + i,
    created_at: '',
  }));

  let dinamis: GalleryItem[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    dinamis = error ? [] : (data || []);
  } catch {
    dinamis = [];
  }
  const items = [...statis, ...dinamis];

  return (
    <>
      <Header />
      <main className="bg-cream">
        <PageHero
          eyebrow="Galeri"
          title={C.teks.galeriJudul}
          lead={C.teks.galeriLead}
          image={C.media.heroGaleri}
        />
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <GalleryClient items={items} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
