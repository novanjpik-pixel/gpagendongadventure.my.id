'use client';

import Link from 'next/link';
import { nav, org } from '@/data/site';
import { useSiteInfo } from '@/components/site/useSiteInfo';

export default function Footer() {
  const year = new Date().getFullYear();
  const { kontak, media } = useSiteInfo();
  const logo = media.logo;
  return (
    <footer className="bg-forest-dark text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="Lambang GPA Gendong Adventure" className="h-16 w-auto" />
              <div className="leading-tight">
                <div className="font-extrabold text-xl tracking-tight">GPA GENDONG</div>
                <div className="text-xs font-semibold tracking-[0.3em] text-lime">ADVENTURE</div>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed max-w-md italic border-l-4 border-lime pl-4">“{org.motto}”</p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-lime mb-5">Jelajahi</h3>
            <ul className="space-y-3 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-white/70 hover:text-white transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-lime mb-5">Sekretariat</h3>
            <address className="not-italic text-sm text-white/70 leading-relaxed space-y-3">
              <p>{kontak.alamat}</p>
              <p>Ketua Umum: <a href={kontak.ketumWa} target="_blank" rel="noopener noreferrer" className="hover:text-white">{kontak.ketumTelp}</a></p>
              <p><a href={`mailto:${kontak.email}`} className="hover:text-white">{kontak.email}</a></p>
              <p className="flex flex-wrap gap-x-5 gap-y-1">
                <a href={`https://instagram.com/${kontak.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram: @{kontak.instagram}</a>
                <span>Facebook: {kontak.facebook}</span>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/50">
          <p>© {year} {org.fullName}. Berbadan hukum sejak {org.legalSince}.</p>
          <p>AHU-0007373.AH.01.07.Tahun 2024</p>
        </div>
      </div>
    </footer>
  );
}
