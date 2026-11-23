import type { Struktur } from '@/lib/content';

function Box({ jabatan, nama, tone = 'light' }: { jabatan: string; nama: string; tone?: 'dark' | 'light' | 'lime' }) {
  const cls =
    tone === 'dark' ? 'bg-forest-dark text-white' : tone === 'lime' ? 'bg-lime text-forest-dark' : 'bg-white text-forest-dark border border-forest/20';
  return (
    <div className={`${cls} px-4 py-3 text-center min-w-[11rem] shadow-sm`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{jabatan}</div>
      <div className="font-bold text-sm mt-1">{nama}</div>
    </div>
  );
}

export default function OrgChart({ struktur: s }: { struktur: Struktur }) {
  return (
    <div>
      {/* Tampilan lebar */}
      <div className="hidden md:block">
        {/* Ketua Umum (tengah) + DPO sejajar di sisi kiri */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-start">
          <div className="absolute left-1/2 -translate-x-1/2 top-16 bottom-0 w-0.5 bg-forest/70" aria-hidden />
          <div className="flex items-start justify-end">
            <div className="flex flex-col gap-3">
              {s.dpo.map((d) => (<Box key={d.nama} {...d} tone="lime" />))}
            </div>
            <div className="w-12 mt-8 border-t-2 border-dashed border-forest/70" aria-hidden />
          </div>
          <div className="relative z-10 min-h-[4rem] flex"><Box {...s.ketum} tone="dark" /></div>
          <div />
        </div>

        {/* Sekretaris & Bendahara di kiri-kanan garis tengah */}
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-forest/70" aria-hidden />
          <div className="relative grid grid-cols-2 items-center pt-2">
            <div className="flex items-center justify-end">
              <Box {...s.sekum} />
              <div className="w-10 border-t-2 border-forest/70" aria-hidden />
            </div>
            <div className="flex items-center justify-start">
              <div className="w-10 border-t-2 border-forest/70" aria-hidden />
              <Box {...s.bendum} />
            </div>
          </div>
          <div className="h-10" />
        </div>

        {/* Kepala bidang */}
        <div className="relative">
          <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-forest/70" aria-hidden />
          <div className="grid grid-cols-5 gap-3 pt-6">
            {s.bidang.map((b) => (
              <div key={b.nama} className="relative flex flex-col items-center">
                <div className="absolute -top-6 w-0.5 h-6 bg-forest/70" aria-hidden />
                <div className="bg-forest text-white px-3 py-3 text-center w-full">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime">Kepala Bidang</div>
                  <div className="text-xs font-bold uppercase mt-1 leading-snug">{b.nama}</div>
                  <div className="text-sm mt-2 font-semibold">{b.kepala}</div>
                </div>
                {b.anggota.map((a) => (
                  <div key={a} className="w-full bg-white border border-forest/20 px-3 py-2 text-center mt-2">
                    <div className="text-[10px] uppercase tracking-wider text-forest/60">Anggota</div>
                    <div className="text-sm font-semibold text-forest-dark">{a}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-[11px] text-forest/60">Garis putus-putus: jalur koordinasi Dewan Pertimbangan Organisasi dengan Ketua Umum.</p>
      </div>

      {/* Tampilan ponsel */}
      <div className="md:hidden space-y-3">
        <Box {...s.ketum} tone="dark" />
        {s.dpo.map((d) => (<Box key={d.nama} {...d} tone="lime" />))}
        <Box {...s.sekum} />
        <Box {...s.bendum} />
        {s.bidang.map((b) => (
          <div key={b.nama} className="bg-forest text-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime">Bidang {b.nama}</div>
            <div className="font-semibold mt-1">{b.kepala} <span className="text-white/60 text-xs">· Kepala</span></div>
            {b.anggota.map((a) => (<div key={a} className="text-sm text-white/80">{a} <span className="text-white/50 text-xs">· Anggota</span></div>))}
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-forest-dark/60 max-w-3xl">{s.dasar}</p>
    </div>
  );
}
