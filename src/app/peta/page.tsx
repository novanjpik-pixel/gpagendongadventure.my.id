import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/site/PageHero';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Peta ETTRS — GPA Gendong Adventure',
  description: 'Explore The Tropical Rainforest Sumatra: peta interaktif lapisan data lapangan, citra satelit Sentinel-2, deforestasi, dan tutupan lahan.',
};

export const dynamic = 'force-dynamic';

export default async function PetaPage() {
  const C = await getContent();
  return (
    <>
      <Header />
      <main className="bg-cream">
        <PageHero
          eyebrow="ETTRS"
          title="Peta ETTRS"
          lead={C.teks.petaLead}
          image={C.media.heroPeta}
        />
        <section className="bg-white">
          <iframe
            src="/peta-embed"
            title="Peta ETTRS — Explore The Tropical Rainforest Sumatra"
            className="w-full block border-0"
            style={{ height: 'min(82vh, 860px)', minHeight: 520 }}
            loading="lazy"
            allow="geolocation"
          />
        </section>
        <section className="max-w-5xl mx-auto px-6 py-12 text-forest-dark/75 leading-relaxed">
          <p className="rata">{C.teks.petaCatatan}</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
