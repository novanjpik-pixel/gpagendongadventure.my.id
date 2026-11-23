'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminClient';
import { PETA_GROUPS } from '@/lib/peta';

interface Layer {
  id: string; nama: string; grup: string; warna: string; gaya: 'isi' | 'arsir' | 'garis'; opacity: number; garis: number; ukuran: number;
  ket: string; sumber: string; aktif: boolean; awal: boolean; sort_order: number; tipe: string[]; n: number; updated_at: string;
}
interface Settings {
  judul: string; deskripsi: string; lon: number; lat: number; zoom: number; metodologi: string;
  f_sentinel: boolean; f_cloudless: boolean; f_tutupan: boolean; f_gfw: boolean; f_udara: boolean;
}

const input = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50';
const label = 'block text-xs font-semibold text-white/60 mb-1';
const btn = 'px-4 py-2 rounded-lg text-sm font-semibold transition-colors';

export default function AdminPetaPage() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; s: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);

  const [form, setForm] = useState({ nama: '', grup: PETA_GROUPS[0], warna: '#2d6a4f', gaya: 'isi', ket: '', sumber: '', text: '' });
  const [file, setFile] = useState<File | null>(null);

  const flash = (t: 'ok' | 'err', s: string) => { setMsg({ t, s }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([adminFetch('/api/peta/layers'), adminFetch('/api/peta/settings')]);
    const ja = await a.json().catch(() => ({}));
    if (!a.ok) flash('err', ja.error || 'Gagal memuat lapisan.'); else setLayers(ja.layers || []);
    const jb = await b.json().catch(() => ({}));
    if (b.ok) setSettings(jb.settings);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !form.text.trim()) { flash('err', 'Pilih berkas .geojson atau tempel isinya.'); return; }
    setBusy(true);
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('geojson', form.text);
    (['nama', 'grup', 'warna', 'gaya', 'ket', 'sumber'] as const).forEach((k) => fd.append(k, form[k]));
    fd.append('aktif', 'true'); fd.append('awal', 'true');
    const r = await adminFetch('/api/peta/layers', { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { flash('err', j.error || 'Gagal mengunggah.'); return; }
    flash('ok', `Lapisan "${j.layer.nama}" ditambahkan (${j.layer.n} objek). Langsung tampil di /peta.`);
    setForm({ ...form, nama: '', ket: '', sumber: '', text: '' }); setFile(null); if (fileRef.current) fileRef.current.value = '';
    load();
  };

  const patch = async (id: string, body: Record<string, unknown>, okMsg = 'Tersimpan. Perubahan langsung tampil di website.') => {
    const r = await adminFetch(`/api/peta/layers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { flash('err', j.error || 'Gagal menyimpan.'); return false; }
    flash('ok', okMsg); await load(); return true;
  };

  const remove = async (l: Layer) => {
    if (!window.confirm(`Hapus lapisan "${l.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const r = await adminFetch(`/api/peta/layers/${l.id}`, { method: 'DELETE' });
    if (r.ok) { flash('ok', 'Lapisan dihapus.'); load(); } else flash('err', 'Gagal menghapus.');
  };

  const move = async (i: number, d: number) => {
    const a = layers[i], b = layers[i + d]; if (!a || !b) return;
    await Promise.all([patch(a.id, { sort_order: b.sort_order }, 'Urutan diubah.'), patch(b.id, { sort_order: a.sort_order }, 'Urutan diubah.')]);
  };

  const replaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !replaceId) return;
    await patch(replaceId, { geojson: await f.text() }, 'Data lapisan diganti.');
    setReplaceId(null); e.target.value = '';
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); if (!settings) return;
    const r = await adminFetch('/api/peta/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) flash('ok', 'Pengaturan peta disimpan.'); else flash('err', j.error || 'Gagal menyimpan pengaturan.');
  };

  const upd = <K extends keyof Layer>(id: string, k: K, v: Layer[K]) => setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: v } : l)));

  return (
    <AdminLayout title="Peta ETTRS">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/60 text-sm max-w-2xl">Kelola lapisan data pada halaman <b className="text-white">Peta ETTRS</b>. Setiap perubahan langsung tampil di website tanpa deploy ulang.</p>
          <a href="/peta" target="_blank" rel="noopener noreferrer" className={`${btn} bg-lime text-forest-dark hover:bg-white`}>Lihat halaman peta</a>
        </div>

        {msg && <div className={`px-4 py-3 rounded-xl text-sm border ${msg.t === 'ok' ? 'bg-lime/10 border-lime/20 text-lime' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{msg.s}</div>}

        {/* Tambah lapisan */}
        <form onSubmit={upload} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold text-lg">Tambah lapisan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className={label} htmlFor="pf">Berkas GeoJSON (.geojson / .json)</label>
              <input id="pf" ref={fileRef} type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={(e) => setFile(e.target.files?.[0] || null)} className={input} /></div>
            <div><label className={label} htmlFor="pn">Nama lapisan</label>
              <input id="pn" className={input} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="mis. Jalur ekspedisi ETTRS 2026" /></div>
            <div><label className={label} htmlFor="pg">Grup</label>
              <input id="pg" list="grplist" className={input} value={form.grup} onChange={(e) => setForm({ ...form, grup: e.target.value })} />
              <datalist id="grplist">{PETA_GROUPS.map((g) => <option key={g} value={g} />)}</datalist></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={label} htmlFor="pw">Warna</label><input id="pw" type="color" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} className="h-9 w-full bg-transparent" /></div>
              <div><label className={label} htmlFor="ps">Gaya poligon</label>
                <select id="ps" className={input} value={form.gaya} onChange={(e) => setForm({ ...form, gaya: e.target.value })}><option value="isi">Isi</option><option value="arsir">Arsir</option><option value="garis">Garis saja</option></select></div>
            </div>
            <div><label className={label} htmlFor="pk">Keterangan</label><input id="pk" className={input} value={form.ket} onChange={(e) => setForm({ ...form, ket: e.target.value })} /></div>
            <div><label className={label} htmlFor="pr">Sumber data</label><input id="pr" className={input} value={form.sumber} onChange={(e) => setForm({ ...form, sumber: e.target.value })} /></div>
          </div>
          <div><label className={label} htmlFor="pt">…atau tempel isi GeoJSON</label>
            <textarea id="pt" rows={4} className={`${input} font-mono`} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder='{"type":"FeatureCollection","features":[…]}' /></div>
          <p className="text-xs text-white/40">Koordinat harus WGS84 (bujur, lintang). Maks. 3,5 MB. Templat ada di folder <code>docs/peta-data</code>.</p>
          <button disabled={busy} className={`${btn} bg-lime text-forest-dark hover:bg-white disabled:opacity-50`}>{busy ? 'Mengunggah…' : 'Unggah lapisan'}</button>
        </form>

        {/* Daftar lapisan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Lapisan ({layers.length})</h2>
          <input ref={replaceRef} type="file" accept=".geojson,.json" className="hidden" onChange={replaceFile} />
          {loading ? <p className="text-white/50 text-sm">Memuat…</p> : layers.length === 0 ? (
            <p className="text-white/50 text-sm">Belum ada lapisan. Peta tetap menampilkan citra satelit, deforestasi, dan tutupan lahan. Unggah GeoJSON untuk menambahkan data lapangan.</p>
          ) : (
            <ul className="space-y-3">
              {layers.map((l, i) => (
                <li key={l.id} className="border border-white/10 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-4 h-4 rounded-full shrink-0" style={{ background: l.warna }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold truncate">{l.nama}</div>
                      <div className="text-xs text-white/50">{l.grup} · {l.n} objek · {l.tipe.join(', ')}</div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={l.aktif} onChange={(e) => patch(l.id, { aktif: e.target.checked })} />Tampil</label>
                    <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={l.awal} onChange={(e) => patch(l.id, { awal: e.target.checked })} />Menyala saat dibuka</label>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={`${btn} bg-white/10 text-white disabled:opacity-30`} aria-label="Naikkan">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === layers.length - 1} className={`${btn} bg-white/10 text-white disabled:opacity-30`} aria-label="Turunkan">↓</button>
                    <button type="button" onClick={() => setEditing(editing === l.id ? null : l.id)} className={`${btn} bg-white/10 text-white hover:bg-white/20`}>{editing === l.id ? 'Tutup' : 'Ubah'}</button>
                    <button type="button" onClick={() => remove(l)} className={`${btn} bg-red-500/15 text-red-300 hover:bg-red-500/25`}>Hapus</button>
                  </div>
                  {editing === l.id && (
                    <div className="mt-4 grid gap-4 md:grid-cols-3 border-t border-white/10 pt-4">
                      <div><label className={label} htmlFor={`n${l.id}`}>Nama</label><input id={`n${l.id}`} className={input} value={l.nama} onChange={(e) => upd(l.id, 'nama', e.target.value)} /></div>
                      <div><label className={label} htmlFor={`g${l.id}`}>Grup</label><input id={`g${l.id}`} list="grplist" className={input} value={l.grup} onChange={(e) => upd(l.id, 'grup', e.target.value)} /></div>
                      <div><label className={label} htmlFor={`s${l.id}`}>Gaya poligon</label>
                        <select id={`s${l.id}`} className={input} value={l.gaya} onChange={(e) => upd(l.id, 'gaya', e.target.value as Layer['gaya'])}><option value="isi">Isi</option><option value="arsir">Arsir</option><option value="garis">Garis saja</option></select></div>
                      <div><label className={label} htmlFor={`w${l.id}`}>Warna</label><input id={`w${l.id}`} type="color" value={l.warna} onChange={(e) => upd(l.id, 'warna', e.target.value)} className="h-9 w-full bg-transparent" /></div>
                      <div><label className={label} htmlFor={`o${l.id}`}>Transparansi isi ({Number(l.opacity).toFixed(2)})</label><input id={`o${l.id}`} type="range" min="0" max="1" step="0.05" value={l.opacity} onChange={(e) => upd(l.id, 'opacity', Number(e.target.value))} className="w-full" /></div>
                      <div><label className={label} htmlFor={`u${l.id}`}>Ukuran titik / tebal garis</label>
                        <div className="flex gap-2"><input id={`u${l.id}`} type="number" min="2" max="20" step="1" className={input} value={l.ukuran} onChange={(e) => upd(l.id, 'ukuran', Number(e.target.value))} aria-label="Ukuran titik" /><input type="number" min="0.5" max="8" step="0.1" className={input} value={l.garis} onChange={(e) => upd(l.id, 'garis', Number(e.target.value))} aria-label="Tebal garis" /></div></div>
                      <div className="md:col-span-2"><label className={label} htmlFor={`k${l.id}`}>Keterangan</label><input id={`k${l.id}`} className={input} value={l.ket} onChange={(e) => upd(l.id, 'ket', e.target.value)} /></div>
                      <div><label className={label} htmlFor={`r${l.id}`}>Sumber</label><input id={`r${l.id}`} className={input} value={l.sumber} onChange={(e) => upd(l.id, 'sumber', e.target.value)} /></div>
                      <div className="md:col-span-3 flex flex-wrap gap-3">
                        <button type="button" onClick={() => patch(l.id, { nama: l.nama, grup: l.grup, gaya: l.gaya, warna: l.warna, opacity: l.opacity, ukuran: l.ukuran, garis: l.garis, ket: l.ket, sumber: l.sumber })} className={`${btn} bg-lime text-forest-dark hover:bg-white`}>Simpan perubahan</button>
                        <button type="button" onClick={() => { setReplaceId(l.id); replaceRef.current?.click(); }} className={`${btn} bg-white/10 text-white hover:bg-white/20`}>Ganti data (unggah GeoJSON baru)</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pengaturan peta */}
        {settings && (
          <form onSubmit={saveSettings} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-lg">Pengaturan peta</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={label} htmlFor="sj">Judul (tanda *kata* = huruf miring)</label><input id="sj" className={input} value={settings.judul} onChange={(e) => setSettings({ ...settings, judul: e.target.value })} /></div>
              <div><label className={label} htmlFor="sd">Deskripsi</label><input id="sd" className={input} value={settings.deskripsi} onChange={(e) => setSettings({ ...settings, deskripsi: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={label} htmlFor="slo">Bujur</label><input id="slo" type="number" step="0.01" className={input} value={settings.lon} onChange={(e) => setSettings({ ...settings, lon: Number(e.target.value) })} /></div>
                <div><label className={label} htmlFor="sla">Lintang</label><input id="sla" type="number" step="0.01" className={input} value={settings.lat} onChange={(e) => setSettings({ ...settings, lat: Number(e.target.value) })} /></div>
                <div><label className={label} htmlFor="sz">Zoom awal</label><input id="sz" type="number" step="0.1" className={input} value={settings.zoom} onChange={(e) => setSettings({ ...settings, zoom: Number(e.target.value) })} /></div>
              </div>
              <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
                <legend className={label}>Lapisan bawaan yang ditampilkan</legend>
                {([['f_sentinel', 'Sentinel-2 terbaru'], ['f_cloudless', 'Mosaik bebas awan'], ['f_tutupan', 'Tutupan lahan'], ['f_gfw', 'Deforestasi (GFW)'], ['f_udara', 'Kualitas udara']] as const).map(([k, t]) => (
                  <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={settings[k]} onChange={(e) => setSettings({ ...settings, [k]: e.target.checked })} />{t}</label>
                ))}
              </fieldset>
            </div>
            <div><label className={label} htmlFor="sm">Teks sumber data &amp; metodologi (kosongkan untuk teks bawaan)</label>
              <textarea id="sm" rows={5} className={input} value={settings.metodologi} onChange={(e) => setSettings({ ...settings, metodologi: e.target.value })} /></div>
            <button className={`${btn} bg-lime text-forest-dark hover:bg-white`}>Simpan pengaturan</button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
