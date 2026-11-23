import { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/site/PageHero';
import SectionTitle from '@/components/site/SectionTitle';
import OrgChart from '@/components/site/OrgChart';
import Reveal from '@/components/site/Reveal';
import CountUp from '@/components/site/CountUp';
import { org } from '@/data/site';

export const metadata: Metadata = {
  title: 'Tentang Kami — GPA Gendong Adventure',
  description:
    'Profil, visi, misi, tujuan, struktur organisasi 2026–2027, sejarah, dan legalitas GPA Gendong Adventure — Gerakan Pencinta Alam Bengkulu.',
};


export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const C = await getContent();
  const { visi, misi, tujuan, tentang, motto, struktur, landasan, sikap, perjalanan, dilawan, diperjuangkan, legalitas, galeri, fakta, media, teks } = C;
  const kegiatanRutin = C.rutin, rencana = C.rencana, timeline = C.timeline;
  const tahun = Array.from(new Set(timeline.map((t) => t.tahun)));
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="GPA Gendong Adventure / Tentang"
          title={teks.aboutJudul}
          lead={teks.aboutLead}
          image={media.heroAbout}
        />

        {/* SIAPA KAMI */}
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-12">
            <Reveal from="left" className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-forest mb-4">Siapa kami</p>
              <h2 className="text-3xl md:text-4xl font-bold text-forest-dark leading-tight">Dari hobi alam bebas, menjadi gerakan penjaga pesisir dan hutan Bengkulu.</h2>
              <figure className="mt-8 border-l-4 border-lime pl-5">
                <blockquote className="text-forest-dark/80 italic leading-relaxed">“{motto}”</blockquote>
                <figcaption className="mt-2 text-xs font-bold uppercase tracking-wider text-forest">Motto organisasi</figcaption>
              </figure>
            </Reveal>
            <Reveal from="right" className="lg:col-span-7">
              <div className="rata space-y-5 text-lg leading-relaxed text-forest-dark/80">
                {tentang.map((p) => (<p key={p.slice(0, 20)}>{p}</p>))}
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-forest/15 pt-8">
                {C.angkaTentang.map(({ value: v, label: l }) => (
                  <div key={l}>
                    <dt className="text-3xl md:text-4xl font-bold text-forest">{/^\d+$/.test(v) ? <CountUp to={Number(v)} /> : v}</dt>
                    <dd className="mt-1 text-sm text-forest-dark/70">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* PERJALANAN KAMI */}
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forest mb-4">Perjalanan kami</p>
            <h2 className="text-3xl md:text-4xl font-bold text-forest-dark leading-tight max-w-3xl mb-12">Tumbuh dari tanam pertama hingga berbadan hukum.</h2>
            <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {perjalanan.map((t, i) => (
                <Reveal as="li" delay={i * 130} key={t.label} className="bg-white p-6 border-t-4 border-forest hover:-translate-y-1 hover:shadow-lg transition-transform duration-300">
                  <div className="text-sm font-bold uppercase tracking-wider text-forest">{t.label}</div>
                  <h3 className="mt-3 text-xl font-bold text-forest-dark leading-snug">{t.judul}</h3>
                  <p className="mt-3 text-forest-dark/75 leading-relaxed">{t.teks}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* YANG KAMI LAWAN / PERJUANGKAN */}
        <section className="bg-forest-dark text-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime mb-4">Yang kami lawan</p>
              <ul className="divide-y divide-white/15 border-y border-white/15">
                {dilawan.map((d, i) => (<Reveal as="li" delay={i * 90} from="left" key={d} className="py-4 text-lg text-white/90">{d}</Reveal>))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime mb-4">Yang kami perjuangkan</p>
              <ul className="divide-y divide-white/15 border-y border-white/15">
                {diperjuangkan.map((d, i) => (<Reveal as="li" delay={i * 90} from="right" key={d} className="py-4 text-lg text-white/90">{d}</Reveal>))}
              </ul>
            </div>
          </div>
        </section>

        {/* VISI MISI TUJUAN */}
        <section id="visi-misi" className="bg-cream py-20 scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle eyebrow="Visi · Misi · Tujuan" title="Arah dan cita-cita" />
            <div className="grid gap-8 lg:grid-cols-3">
              <Reveal from="zoom" className="bg-forest text-white p-8">
                <h3 className="text-lime text-xs font-bold uppercase tracking-[0.3em] mb-4">Visi</h3>
                <p className="text-lg font-semibold leading-relaxed">{visi}</p>
              </Reveal>
              <Reveal from="zoom" delay={150} className="bg-white p-8 border-t-4 border-forest">
                <h3 className="text-forest text-xs font-bold uppercase tracking-[0.3em] mb-4">Misi</h3>
                <ol className="space-y-4">
                  {misi.map((m, i) => (
                    <li key={m} className="flex gap-3"><span className="font-extrabold text-forest">{i + 1}.</span><span className="text-forest-dark/85 leading-relaxed">{m}</span></li>
                  ))}
                </ol>
              </Reveal>
              <Reveal from="zoom" delay={300} className="bg-white p-8 border-t-4 border-lime">
                <h3 className="text-forest text-xs font-bold uppercase tracking-[0.3em] mb-4">Tujuan</h3>
                <ol className="space-y-4">
                  {tujuan.map((m, i) => (
                    <li key={m} className="flex gap-3"><span className="font-extrabold text-forest">{i + 1}.</span><span className="text-forest-dark/85 leading-relaxed">{m}</span></li>
                  ))}
                </ol>
              </Reveal>
            </div>
            <Reveal className="mt-12 bg-white p-8 md:p-10">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-forest mb-4">Landasan dan sikap organisasi</h3>
              <p className="mb-3 font-semibold text-forest-dark">{landasan}</p>
              <div className="rata space-y-3 text-forest-dark/85 leading-relaxed max-w-4xl">{sikap.map((s) => (<p key={s.slice(0, 20)}>{s}</p>))}</div>
            </Reveal>
          </div>
        </section>

        {/* STRUKTUR */}
        <section id="struktur" className="bg-white py-20 scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle eyebrow={`Badan Pengurus ${org.period}`} title="Struktur organisasi" />
            <Reveal from="zoom"><OrgChart struktur={struktur} /></Reveal>
          </div>
        </section>

        {/* SEJARAH */}
        <section id="sejarah" className="bg-forest-dark text-white py-20 scroll-mt-28">
          <div className="max-w-5xl mx-auto px-6">
            <SectionTitle light eyebrow="2016 — 2026" title="Jejak perjalanan" />
            <div className="space-y-10">
              {tahun.map((th) => (
                <Reveal key={th} className="grid gap-4 md:grid-cols-[6rem_1fr]">
                  <div className="text-3xl font-extrabold text-lime">{th}</div>
                  <ul className="space-y-4 border-l-2 border-white/20 pl-6">
                    {timeline.filter((t) => t.tahun === th).map((t) => (
                      <li key={t.waktu + t.judul} className="relative">
                        <span className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full ${t.sorot ? 'bg-lime dot-pulse' : 'bg-white/40'}`} />
                        <div className="text-xs font-bold uppercase tracking-wider text-lime/90">{t.waktu}</div>
                        <p className={`mt-1 leading-relaxed ${t.sorot ? 'text-white font-semibold' : 'text-white/80'}`}>{t.judul}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* RUTIN & RENCANA */}
        <section className="bg-cream py-20">
          <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-2">
            <Reveal from="left" className="bg-white p-8 border-t-4 border-forest">
              <h3 className="text-xl font-bold text-forest-dark mb-5">Kegiatan rutin</h3>
              <ul className="space-y-3 list-disc pl-5 text-forest-dark/85">{kegiatanRutin.map((k) => (<li key={k}>{k}</li>))}</ul>
            </Reveal>
            <Reveal from="right" className="bg-white p-8 border-t-4 border-lime">
              <h3 className="text-xl font-bold text-forest-dark mb-5">Rencana kegiatan</h3>
              <ul className="space-y-3 list-disc pl-5 text-forest-dark/85">{rencana.map((k) => (<li key={k}>{k}</li>))}</ul>
            </Reveal>
          </div>
        </section>

        {/* LEGALITAS */}
        <section id="legalitas" className="bg-white py-20 scroll-mt-28">
          <div className="max-w-5xl mx-auto px-6">
            <SectionTitle eyebrow="Legalitas" title="Berbadan hukum perkumpulan" />
            <dl className="divide-y divide-forest/15 border-y border-forest/15">
              {legalitas.map(({ k, v }, i) => (
                <Reveal key={k} delay={i * 100} from="left" className="grid gap-1 md:grid-cols-3 py-4">
                  <dt className="font-bold text-forest-dark">{k}</dt>
                  <dd className="md:col-span-2 text-forest-dark/80">{v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* FAKTA */}
        <section className="bg-forest text-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle light eyebrow="Fokus Pemulihan Pesisir" title="Fakta mangrove Bengkulu" />
            <div className="grid gap-8 md:grid-cols-2">
              {fakta.map((f, i) => (
                <Reveal key={f.value} delay={i * 120} className="border-l-4 border-lime pl-6">
                  <div className="text-4xl font-extrabold text-lime">{f.value}</div>
                  <p className="mt-2 text-white/85 leading-relaxed">{f.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* MOMEN KAMI */}
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-forest mb-4">Momen kami</p>
            <h2 className="text-3xl md:text-4xl font-bold text-forest-dark leading-tight mb-10">Sekilas dari lapangan.</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[galeri[0], galeri[3], galeri[4]].filter(Boolean).map((g, i) => (
                <Reveal as="article" delay={i * 140} from="zoom" key={g.src}><figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt={g.caption} className="w-full aspect-[4/5] object-cover" />
                  <figcaption className="mt-2 text-sm text-forest-dark/70">{g.judul} · © GPA Gendong Adventure</figcaption>
                </figure></Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* AJAKAN */}
        <section className="bg-lime text-forest-dark py-16">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight max-w-2xl">Bergabunglah dalam gerakan menjaga alam Bengkulu.</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="px-7 py-4 bg-forest-dark text-white font-bold uppercase text-sm tracking-wider hover:bg-forest transition-colors">Hubungi kami</Link>
              <Link href="/activities" className="px-7 py-4 border-2 border-forest-dark font-bold uppercase text-sm tracking-wider hover:bg-forest-dark hover:text-white transition-colors">Lihat aktivitas</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
