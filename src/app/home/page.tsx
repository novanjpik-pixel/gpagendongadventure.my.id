import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/site/SectionTitle';
import HeroVideo from '@/components/site/HeroVideo';
import { createClient } from '@/lib/supabase/server';
import { mapRowToPost, Post } from '@/lib/data';
import { getWordPressPosts } from '@/lib/wordpress';
import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GPA Gendong Adventure — Gerakan Pencinta Alam Bengkulu',
  description:
    'Gerakan Pencinta Alam Gendong Adventure Bengkulu: organisasi kepemudaan lingkungan sejak 2015, berbadan hukum sejak 2024. Mangrove, konservasi, dan kaderisasi pecinta alam.',
};

async function loadPosts(): Promise<Post[]> {
  try {
    const wp = await getWordPressPosts(3);
    if (wp) return wp;
    const supabase = await createClient();
    const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: false }).limit(3);
    return error ? [] : (data || []).map((r) => mapRowToPost(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [posts, C] = await Promise.all([loadPosts(), getContent()]);
  const { visi, misi, tentang, beranda, angka: stats, fakta, galeri, media, teks } = C;
  const sorotan = C.timeline.filter((t) => t.sorot).slice(-4).reverse();

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="relative bg-forest-dark text-white overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={media.videoLatarPoster}
            aria-hidden="true"
          >
            <source src={media.videoLatar} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/40 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 min-h-[78vh] grid lg:grid-cols-12 gap-10 items-center pb-16 md:pb-20 pt-24">
            <div className="lg:col-span-7 hero-in">
              <p className="text-lime text-xs font-bold uppercase tracking-[0.3em] mb-5">{beranda.eyebrow}</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1]">{beranda.judul}</h1>
              <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">{beranda.lead}</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/about" className="px-7 py-4 bg-lime text-forest-dark font-bold uppercase text-sm tracking-wider hover:bg-white transition-colors">Kenali Kami</Link>
                <Link href="/activities" className="px-7 py-4 border-2 border-white text-white font-bold uppercase text-sm tracking-wider hover:bg-white hover:text-forest-dark transition-colors">Lihat Kegiatan</Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              {media.videoUtama && <HeroVideo src={media.videoUtama} poster={media.videoUtamaPoster} />}
              <p className="mt-3 text-xs text-white/60 text-left">{beranda.videoKet}</p>
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="bg-forest text-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`py-8 px-4 md:px-8 ${i > 0 ? 'md:border-l border-white/15' : ''} ${i % 2 === 1 ? 'border-l border-white/15 md:border-l' : ''}`}>
                <div className="text-4xl md:text-5xl font-extrabold text-lime">{s.value}</div>
                <div className="mt-2 text-sm text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TENTANG */}
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-2 items-center">
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(galeri[2] ?? galeri[0])?.src} alt={(galeri[2] ?? galeri[0])?.caption} className="w-full h-full object-cover aspect-[3/4]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(galeri[4] ?? galeri[0])?.src} alt={(galeri[4] ?? galeri[0])?.caption} className="w-full h-full object-cover aspect-[3/4] mt-10" />
            </div>
            <div>
              <SectionTitle eyebrow="Tentang Kami" title="Dari hobi alam bebas menjadi gerakan lingkungan" />
              <p className="rata text-forest-dark/80 leading-relaxed text-lg">{tentang[0]}</p>
              <Link href="/about" className="inline-block mt-8 px-7 py-4 bg-forest text-white font-bold uppercase text-sm tracking-wider hover:bg-forest-dark transition-colors">Selengkapnya</Link>
            </div>
          </div>
        </section>

        {/* VISI MISI */}
        <section className="bg-forest-dark text-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle light eyebrow="Visi & Misi" title="Arah gerak kami" />
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2 bg-lime text-forest-dark p-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-4">Visi</h3>
                <p className="text-xl md:text-2xl font-bold leading-snug">{visi}</p>
              </div>
              <ol className="lg:col-span-3 space-y-4">
                {misi.map((m, i) => (
                  <li key={m} className="flex gap-5 border-t border-white/20 pt-4">
                    <span className="text-lime font-extrabold text-3xl w-10 shrink-0">0{i + 1}</span>
                    <span className="text-white/90 text-lg leading-relaxed">{m}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Link href="/about#struktur" className="inline-block mt-12 text-lime font-bold uppercase text-sm tracking-wider hover:text-white">Lihat struktur organisasi →</Link>
          </div>
        </section>

        {/* SOROTAN KEGIATAN */}
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle eyebrow="Jejak Gerakan" title="Sorotan kegiatan" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {sorotan.map((t) => (
                <article key={t.waktu} className="bg-white border-t-4 border-forest p-6 flex flex-col">
                  <div className="text-forest text-sm font-bold uppercase tracking-wider">{t.waktu}</div>
                  <p className="mt-3 text-forest-dark leading-relaxed flex-1">{t.judul}</p>
                </article>
              ))}
            </div>
            <Link href="/about#sejarah" className="inline-block mt-10 text-forest font-bold uppercase text-sm tracking-wider hover:text-forest-dark">Kronologi lengkap 2016–2026 →</Link>
          </div>
        </section>

        {/* KEGIATAN TERBARU (dari admin, bila ada) */}
        {posts.length > 0 && (
          <section className="bg-white py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-6">
              <SectionTitle eyebrow="Kabar Terbaru" title="Kegiatan terkini" />
              <div className="grid gap-8 md:grid-cols-3">
                {posts.map((p) => (
                  <Link key={p.id} href={`/activities/${p.slug || p.id}`} className="group block">
                    <div className="aspect-[4/3] bg-forest/10 overflow-hidden">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-wider text-forest">{p.category} · {p.date}</div>
                    <h3 className="mt-2 text-xl font-bold text-forest-dark group-hover:text-forest leading-snug">{p.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* GALERI */}
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle eyebrow="Galeri" title="Dari hutan, gunung, dan sungai" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {galeri.map((g, i) => (
                <Link key={g.src} href="/gallery" className={`relative block overflow-hidden group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt={g.caption} className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-sm font-bold">{g.judul}</span>
                </Link>
              ))}
            </div>
            <Link href="/gallery" className="inline-block mt-10 text-forest font-bold uppercase text-sm tracking-wider hover:text-forest-dark">Buka seluruh galeri →</Link>
          </div>
        </section>

        {/* FAKTA MANGROVE */}
        <section className="bg-forest text-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle light eyebrow="Mengapa Mangrove" title="Pesisir Bengkulu butuh kita" />
            <div className="grid gap-8 md:grid-cols-2">
              {fakta.map((f) => (
                <div key={f.value} className="border-l-4 border-lime pl-6">
                  <div className="text-4xl md:text-5xl font-extrabold text-lime">{f.value}</div>
                  <p className="mt-2 text-white/85 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AJAKAN */}
        <section className="bg-lime text-forest-dark py-16">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight max-w-2xl">{teks.ajakanJudul}</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/donation" className="px-7 py-4 bg-forest-dark text-white font-bold uppercase text-sm tracking-wider hover:bg-forest transition-colors">Dukung Kami</Link>
              <Link href="/contact" className="px-7 py-4 border-2 border-forest-dark font-bold uppercase text-sm tracking-wider hover:bg-forest-dark hover:text-white transition-colors">Hubungi Kami</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
