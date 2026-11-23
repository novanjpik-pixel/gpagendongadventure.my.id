'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminClient';
import { RISET_JENIS, type Riset } from '@/lib/riset-shared';

const input = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50';
const label = 'block text-xs font-semibold text-white/60 mb-1';
const btn = 'px-4 py-2 rounded-lg text-sm font-semibold transition-colors';
const today = () => new Date().toISOString().slice(0, 10);
const blank = { id: '', jenis: RISET_JENIS[0], judul: '', ringkasan: '', tanggal: today(), sampul_url: '', file_url: '', aktif: true };

export default function AdminRisetPage() {
  const [items, setItems] = useState<Riset[]>([]);
  const [f, setF] = useState<typeof blank>(blank);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; s: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const flash = (t: 'ok' | 'err', s: string) => { setMsg({ t, s }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const load = useCallback(async () => {
    const r = await adminFetch('/api/riset'); const j = await r.json().catch(() => ({}));
    if (r.ok) setItems(j.items || []); else flash('err', j.error || 'Gagal memuat.');
  }, []);
  useEffect(() => { load(); }, [load]);

  const up = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'pdf' | 'img') => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    const fd = new FormData(); fd.append('file', file);
    const r = await adminFetch(kind === 'pdf' ? '/api/riset/upload' : '/api/upload', { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    setBusy(false); e.target.value = '';
    if (!r.ok) { flash('err', j.error || 'Gagal mengunggah.'); return; }
    const url = j.url || j.publicUrl;
    setF((s) => (kind === 'pdf' ? { ...s, file_url: url } : { ...s, sampul_url: url }));
    flash('ok', kind === 'pdf' ? 'PDF terunggah. Klik Simpan.' : 'Sampul terunggah. Klik Simpan.');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { id, ...body } = f;
    const r = await adminFetch(id ? `/api/riset/${id}` : '/api/riset', { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { flash('err', j.error || 'Gagal menyimpan.'); return; }
    flash('ok', 'Tersimpan. Langsung tampil di halaman Riset.'); setF(blank); load();
  };

  const toggle = async (it: Riset) => {
    await adminFetch(`/api/riset/${it.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktif: !it.aktif }) }); load();
  };
  const del = async (it: Riset) => {
    if (!window.confirm(`Hapus "${it.judul}"?`)) return;
    await adminFetch(`/api/riset/${it.id}`, { method: 'DELETE' }); load();
  };

  return (
    <AdminLayout title="Riset">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/60 text-sm max-w-2xl">Kelola publikasi pada halaman <b className="text-white">Riset</b>. Pengunjung membaca dokumen langsung di website, halaman demi halaman.</p>
          <a href="/riset" target="_blank" rel="noopener noreferrer" className={`${btn} bg-lime text-forest-dark hover:bg-white`}>Lihat halaman riset</a>
        </div>
        {msg && <div className={`px-4 py-3 rounded-xl text-sm border ${msg.t === 'ok' ? 'bg-lime/10 border-lime/20 text-lime' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{msg.s}</div>}

        <form onSubmit={save} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold text-lg">{f.id ? 'Ubah publikasi' : 'Tambah publikasi'}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2"><label className={label} htmlFor="rj">Judul</label><input id="rj" required className={input} value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} /></div>
            <div><label className={label} htmlFor="rt">Tanggal terbit</label><input id="rt" type="date" className={input} value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} /></div>
            <div><label className={label} htmlFor="rjn">Jenis</label><input id="rjn" list="rjenis" className={input} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })} />
              <datalist id="rjenis">{RISET_JENIS.map((j) => <option key={j} value={j} />)}</datalist></div>
            <div className="md:col-span-2"><label className={label} htmlFor="rr">Ringkasan (tampil di kartu)</label><textarea id="rr" rows={2} className={input} value={f.ringkasan} onChange={(e) => setF({ ...f, ringkasan: e.target.value })} /></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label} htmlFor="rf">Berkas PDF: tempel tautan (Google Drive atau URL PDF) atau unggah</label>
              <input id="rf" required className={input} value={f.file_url} onChange={(e) => setF({ ...f, file_url: e.target.value })} placeholder="https://drive.google.com/file/d/…/view" />
              <input type="file" accept="application/pdf" onChange={(e) => up(e, 'pdf')} className="mt-2 text-xs text-white/60" aria-label="Unggah PDF" />
              <p className="text-xs text-white/40 mt-1">Unggah maks. 4 MB. PDF lebih besar: simpan di Google Drive (akses “Siapa saja yang memiliki link”) lalu tempel tautannya.</p>
            </div>
            <div>
              <label className={label} htmlFor="rs">Gambar sampul (opsional)</label>
              <input id="rs" className={input} value={f.sampul_url} onChange={(e) => setF({ ...f, sampul_url: e.target.value })} placeholder="Kosongkan untuk sampul otomatis" />
              <input type="file" accept="image/*" onChange={(e) => up(e, 'img')} className="mt-2 text-xs text-white/60" aria-label="Unggah sampul" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={f.aktif} onChange={(e) => setF({ ...f, aktif: e.target.checked })} />Tampilkan di website</label>
          <div className="flex gap-3">
            <button disabled={busy} className={`${btn} bg-lime text-forest-dark hover:bg-white disabled:opacity-50`}>{busy ? 'Memproses…' : 'Simpan'}</button>
            {f.id && <button type="button" onClick={() => setF(blank)} className={`${btn} bg-white/10 text-white`}>Batal</button>}
          </div>
        </form>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Publikasi ({items.length})</h2>
          {items.length === 0 ? <p className="text-white/50 text-sm">Belum ada publikasi (atau migrasi riset belum dijalankan).</p> : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id} className="border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-semibold">{it.judul}</div>
                    <div className="text-xs text-white/50">{it.jenis} · {it.tanggal} · {it.aktif ? 'Tampil' : 'Disembunyikan'}</div>
                  </div>
                  <button type="button" onClick={() => { setF({ id: it.id, jenis: it.jenis, judul: it.judul, ringkasan: it.ringkasan, tanggal: it.tanggal, sampul_url: it.sampul_url, file_url: it.file_url, aktif: it.aktif }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`${btn} bg-white/10 text-white`}>Ubah</button>
                  <button type="button" onClick={() => toggle(it)} className={`${btn} bg-white/10 text-white`}>{it.aktif ? 'Sembunyikan' : 'Tampilkan'}</button>
                  <button type="button" onClick={() => del(it)} className={`${btn} bg-red-500/15 text-red-300`}>Hapus</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
