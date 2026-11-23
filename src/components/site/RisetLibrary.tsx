'use client';

import { useState } from 'react';
import type { Riset } from '@/lib/riset-shared';
import PdfReader from './PdfReader';

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

function Cover({ r }: { r: Riset }) {
  if (r.sampul_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={r.sampul_url} alt={`Sampul ${r.judul}`} className="w-full h-full object-cover object-top" />;
  }
  return (
    <div className="w-full h-full bg-forest-dark text-white p-6 flex flex-col justify-between">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-lime">GPA / {r.jenis}</div>
      <div className="font-bold text-xl leading-snug">{r.judul.length > 90 ? r.judul.slice(0, 88) + '…' : r.judul}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">GPA Gendong Adventure · Research &amp; Advocacy</div>
    </div>
  );
}

export default function RisetLibrary({ items }: { items: Riset[] }) {
  const [open, setOpen] = useState<Riset | null>(null);
  if (!items.length) return <p className="text-forest-dark/60">Belum ada publikasi.</p>;
  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <article key={r.id} className="bg-white flex flex-col border border-forest/10 hover:shadow-lg transition-shadow">
            <button type="button" onClick={() => setOpen(r)} className="block aspect-[4/5] overflow-hidden text-left" aria-label={`Baca ${r.judul}`}>
              <Cover r={r} />
            </button>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-forest">{r.jenis}</span>
                <span className="text-forest-dark/50">{fmt(r.tanggal)}</span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-forest-dark leading-snug">{r.judul}</h3>
              {r.ringkasan && <p className="mt-3 text-forest-dark/70 leading-relaxed flex-1">{r.ringkasan}</p>}
              <button type="button" onClick={() => setOpen(r)} className="mt-5 self-start px-5 py-3 bg-forest text-white text-sm font-bold uppercase tracking-wider hover:bg-forest-dark transition-colors">Baca dokumen →</button>
            </div>
          </article>
        ))}
      </div>
      {open && <PdfReader item={open} onClose={() => setOpen(null)} />}
    </>
  );
}
