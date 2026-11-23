"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/site/PageHero';
import { useSiteInfo } from '@/components/site/useSiteInfo';

export default function DonationPage() {
  const { media: siteMedia } = useSiteInfo();
  const whatsappNumber = "6285789547405";
  const whatsappMessage = encodeURIComponent(
    "Halo, saya ingin berdonasi untuk kegiatan GPA Gendong Adventure. Mohon informasi lebih lanjut."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Donasi untuk GPA Gendong Adventure',
            description: 'Dukung kegiatan pelestarian lingkungan dan sosial GPA Gendong Adventure dengan berdonasi.',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/donation`,
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
                name: 'Donasi',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/donation`,
              },
            ],
          }),
        }}
      />
      <Header />
      <main className="bg-cream">
        <PageHero eyebrow="Donasi" title="Dukung pemulihan alam Bengkulu" lead="Setiap kontribusi membantu penanaman mangrove, kaderisasi, dan kegiatan lingkungan kami." image={siteMedia.heroDonasi} />

        {/* WhatsApp Contact Section */}
        <section className="py-20">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-forest/10 p-10 flex flex-col items-center gap-6">
              {/* WhatsApp Icon */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-11 h-11"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-forest-dark mb-2">
                  Hubungi Kami via WhatsApp
                </h2>
                <p className="text-forest/60 text-base leading-relaxed">
                  Untuk informasi donasi, konfirmasi transfer, atau pertanyaan lainnya,
                  silakan hubungi kami langsung melalui WhatsApp.
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-lime hover:bg-lime-dark text-forest-dark font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 shadow-lime"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat WhatsApp
              </a>

              <p className="text-sm text-forest/40">
                Kami siap membantu Senin – Sabtu, 08.00 – 17.00 WIB
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
