import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/site/PageHero';
import RisetLibrary from '@/components/site/RisetLibrary';
import { getRiset } from '@/lib/riset';
import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Riset — GPA Gendong Adventure',
  description: 'Perpustakaan riset dan kajian kebijakan GPA Gendong Adventure tentang hutan, pesisir, dan tata kelola ruang di Bengkulu.',
};


export default async function RisetPage() {
  const [items, C] = await Promise.all([getRiset(), getContent()]);
  const fokus = C.risetFokus, topik = C.risetTopik;
  const jenis = new Set(items.map((i) => i.jenis)).size;
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="GPA Gendong Adventure / Riset"
          title={C.teks.risetJudul}
          lead={C.teks.risetLead}
          image={C.media.heroRiset}
        />

        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forest mb-4">Pusat pengetahuan</p>
            <h2 className="text-3xl md:text-4xl font-bold text-forest-dark leading-tight mb-6">Perpustakaan riset kami.</h2>
            <dl className="flex flex-wrap gap-x-12 gap-y-4 mb-12">
              {[[items.length, 'Publikasi'], [jenis, 'Jenis terbitan'], [fokus.length, 'Fokus isu']].map(([v, l]) => (
                <div key={String(l)}><dt className="sr-only">{l}</dt><dd className="text-3xl font-bold text-forest">{v}<span className="ml-2 text-sm font-medium text-forest-dark/60">{l}</span></dd></div>
              ))}
            </dl>
            <RisetLibrary items={items} />
          </div>
        </section>

        <section className="bg-forest-dark text-white py-20">
          <div className="max-w-7xl mx-auto px-6 grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime mb-4">Fokus kami</p>
              <ul className="divide-y divide-white/15 border-y border-white/15">{fokus.map((f) => <li key={f} className="py-4 text-lg">{f}</li>)}</ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime mb-4">Topik yang kami kaji</p>
              <ul className="divide-y divide-white/15 border-y border-white/15">{topik.map((f) => <li key={f} className="py-4 text-lg">{f}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="bg-lime text-forest-dark py-16">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight max-w-2xl">Punya data atau temuan untuk dibagikan?</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="px-7 py-4 bg-forest-dark text-white font-bold uppercase text-sm tracking-wider hover:bg-forest transition-colors">Hubungi kami</Link>
              <Link href="/activities" className="px-7 py-4 border-2 border-forest-dark font-bold uppercase text-sm tracking-wider hover:bg-forest-dark hover:text-white transition-colors">Lihat aktivitas</Link>
            </div>
          </div>
        </section>
        <p className="bg-white text-center text-xs text-forest-dark/50 px-6 py-4">© GPA Gendong Adventure. Publikasi pada halaman ini milik GPA Gendong Adventure; dilarang menyalin atau menyebarluaskan tanpa izin tertulis.</p>
      </main>
      <Footer />
    </>
  );
}
