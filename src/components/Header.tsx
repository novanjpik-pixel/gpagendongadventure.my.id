'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { nav, org } from '@/data/site';
import { useSiteInfo } from '@/components/site/useSiteInfo';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { kontak, media } = useSiteInfo();
  const active = (href: string) => pathname === href || (href !== '/home' && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Bilah atas */}
      <div className="bg-forest-dark text-white/80 text-xs">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <span className="hidden sm:block tracking-wide">Gerakan Pencinta Alam · Bengkulu · Sejak {org.foundedYear}</span>
          <div className="flex items-center gap-5 ml-auto">
            <a href={`mailto:${kontak.email}`} className="hover:text-lime transition-colors">{kontak.email}</a>
            <a href={`https://instagram.com/${kontak.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-lime transition-colors">Instagram</a>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.logo} alt="Lambang GPA Gendong Adventure" className="h-12 w-auto" />
            <span className="leading-tight">
              <span className="block font-extrabold text-forest-dark text-lg tracking-tight">GPA GENDONG</span>
              <span className="block text-[11px] font-semibold tracking-[0.28em] text-forest">ADVENTURE</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  active(n.href) ? 'text-forest border-forest' : 'text-forest-dark/80 border-transparent hover:text-forest hover:border-lime'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/donation" className="ml-3 px-5 py-2.5 bg-forest text-white text-[13px] font-bold uppercase tracking-wider hover:bg-forest-dark transition-colors">
              Dukung Kami
            </Link>
          </nav>

          <button
            className="lg:hidden p-2 text-forest-dark"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-forest/10 bg-white px-6 py-3" aria-label="Navigasi seluler">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`block py-3 text-sm font-bold uppercase tracking-wider border-b border-forest/10 ${active(n.href) ? 'text-forest' : 'text-forest-dark/80'}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
