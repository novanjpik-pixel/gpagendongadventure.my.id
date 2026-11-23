'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Riset } from '@/lib/riset-shared';
import { driveId } from '@/lib/riset-shared';

/* Pembaca PDF halaman-demi-halaman (PDF.js, dimuat dari /vendor/pdfjs). Tautan Google Drive memakai penampil Drive. */
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void>; cancel: () => void } }> };

export default function PdfReader({ item, onClose }: { item: Riset; onClose: () => void }) {
  const drive = driveId(item.file_url);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(drive ? 'ready' : 'loading');
  const [rendering, setRendering] = useState(false);
  const jump = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (drive) return;
    let dead = false;
    (async () => {
      try {
        const lib = await import(/* webpackIgnore: true */ '/vendor/pdfjs/pdf.min.mjs' as string);
        lib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs';
        const d = await lib.getDocument({ url: item.file_url }).promise;
        if (!dead) { setDoc(d); setState('ready'); }
      } catch { if (!dead) setState('error'); }
    })();
    return () => { dead = true; };
  }, [item.file_url, drive]);

  const draw = useCallback(async () => {
    if (!doc || !canvasRef.current || !boxRef.current) return;
    setRendering(true);
    const p = await doc.getPage(page);
    const w = boxRef.current.clientWidth - 8, hMax = boxRef.current.clientHeight - 8;
    const base = p.getViewport({ scale: 1 });
    const scale = Math.min(w / base.width, hMax / base.height) * Math.min(window.devicePixelRatio || 1, 2);
    const vp = p.getViewport({ scale });
    const c = canvasRef.current;
    c.width = vp.width; c.height = vp.height;
    c.style.width = `${vp.width / Math.min(window.devicePixelRatio || 1, 2)}px`;
    c.style.height = `${vp.height / Math.min(window.devicePixelRatio || 1, 2)}px`;
    const task = p.render({ canvasContext: c.getContext('2d'), viewport: vp });
    try { await task.promise; } catch { /* dibatalkan */ }
    setRendering(false);
  }, [doc, page]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => { const f = () => draw(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, [draw]);

  const total = doc?.numPages || 0;
  const go = useCallback((n: number) => setPage((cur) => Math.max(1, Math.min(total || 1, n === 0 ? cur : n))), [total]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!doc) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') setPage((p) => Math.min(total, p + 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [doc, total, onClose]);

  const openUrl = drive ? `https://drive.google.com/file/d/${drive}/view` : item.file_url;

  return (
    <div className="fixed inset-0 z-[100] bg-forest-dark flex flex-col" role="dialog" aria-modal="true" aria-label={`Baca: ${item.judul}`}>
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-white/10 text-white">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-lime">GPA Gendong Adventure / Publikasi riset</div>
          <div className="font-semibold truncate">{item.judul}</div>
        </div>
        <a href={openUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-block px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/30 hover:bg-white hover:text-forest-dark transition-colors">Buka PDF ↗</a>
        <button onClick={onClose} aria-label="Tutup pembaca" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-xl">×</button>
      </div>

      {drive ? (
        <iframe title={item.judul} src={`https://drive.google.com/file/d/${drive}/preview`} className="flex-1 w-full bg-white border-0" allow="autoplay" />
      ) : (
        <>
          <div ref={boxRef} className="flex-1 min-h-0 flex items-center justify-center p-3 overflow-auto">
            {state === 'loading' && <p className="text-white/70 text-sm">Memuat dokumen…</p>}
            {state === 'error' && (
              <p className="text-white/80 text-sm text-center max-w-sm">Dokumen tidak dapat ditampilkan di sini. <a className="text-lime underline" href={openUrl} target="_blank" rel="noopener noreferrer">Buka PDF di tab baru</a>.</p>
            )}
            <canvas ref={canvasRef} className={`bg-white shadow-2xl ${state === 'ready' && doc ? '' : 'hidden'} ${rendering ? 'opacity-80' : ''}`} aria-label={`Halaman ${page}`} />
          </div>
          {doc && (
            <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10 text-white text-sm">
              <button onClick={() => go(page - 1)} disabled={page <= 1} className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30">← Sebelumnya</button>
              <form onSubmit={(e) => { e.preventDefault(); const n = parseInt(jump.current?.value || '', 10); if (n) go(n); }} className="flex items-center gap-2">
                <label className="sr-only" htmlFor="pgjump">Ke halaman</label>
                <input id="pgjump" ref={jump} key={page} defaultValue={page} inputMode="numeric" className="w-14 text-center bg-white/10 border border-white/20 py-1.5 text-white" />
                <span className="text-white/60">/ {total}</span>
              </form>
              <button onClick={() => go(page + 1)} disabled={page >= total} className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30">Berikutnya →</button>
            </div>
          )}
          <p className="text-center text-[11px] text-white/40 pb-2 hidden md:block">← → Gunakan tombol keyboard untuk membalik halaman · Esc untuk menutup</p>
        </>
      )}
    </div>
  );
}
