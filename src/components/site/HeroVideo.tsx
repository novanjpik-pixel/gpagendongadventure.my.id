'use client';

import { useEffect, useRef, useState } from 'react';

/* Video langsung terputar (tanpa suara, sesuai aturan browser). Pengunjung bisa menyalakan suara. */
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.muted = true;
    v.play().catch(() => setPlaying(false));
  }, []);

  const toggleSound = () => {
    const v = ref.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
  };
  const togglePlay = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {}); else { v.pause(); setPlaying(false); }
  };

  return (
    <figure className="relative w-full bg-black shadow-2xl ring-1 ring-white/15">
      <video
        ref={ref}
        className="w-full aspect-[640/262] object-cover block"
        autoPlay muted loop playsInline preload="auto"
        poster={poster}
        aria-label="Video ekspedisi Explore The Tropical Rainforest Sumatra"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute left-3 bottom-3 flex gap-2">
        <button type="button" onClick={toggleSound} className="px-3 py-2 bg-black/70 hover:bg-black text-white text-xs font-bold uppercase tracking-wider backdrop-blur">
          {muted ? 'Nyalakan suara' : 'Matikan suara'}
        </button>
        <button type="button" onClick={togglePlay} className="px-3 py-2 bg-black/70 hover:bg-black text-white text-xs font-bold uppercase tracking-wider backdrop-blur" aria-label={playing ? 'Jeda video' : 'Putar video'}>
          {playing ? 'Jeda' : 'Putar'}
        </button>
      </div>
      <figcaption className="absolute right-3 top-3 px-2.5 py-1 bg-lime text-forest-dark text-[10px] font-bold uppercase tracking-[0.2em]">ETTRS</figcaption>
    </figure>
  );
}
