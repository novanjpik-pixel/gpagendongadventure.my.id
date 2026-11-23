'use client';

import { useEffect, useRef, useState } from 'react';

/* Muncul halus saat digulir ke layar. Konten di atas lipatan dan tanpa JavaScript tetap terlihat (tidak ada kilatan). */
export default function Reveal({
  children, delay = 0, from = 'up', className = '', as: Tag = 'div',
}: { children: React.ReactNode; delay?: number; from?: 'up' | 'left' | 'right' | 'zoom' | 'line'; className?: string; as?: 'div' | 'li' | 'section' | 'article' }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'hide' | 'in'>('idle');

  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) return; // sudah terlihat: biarkan
    setState('hide');
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setState('in'); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dir = from === 'up' ? '' : ` rv-${from}`;
  const cls = state === 'idle' ? '' : state === 'hide' ? `rv-hide${dir}` : `rv-hide${dir} rv-in`;
  const Comp = Tag as React.ElementType;
  return <Comp ref={ref} className={`${className} ${cls}`.trim()} style={{ ['--rv-delay' as string]: `${delay}ms` }}>{children}</Comp>;
}
