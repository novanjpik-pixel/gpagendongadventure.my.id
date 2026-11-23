'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminClient';
import type { SiteContent } from '@/lib/content-defaults';
import { SECTIONS, type Field, type Row } from '@/lib/content-schema';

const input = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-lime/50';
const label = 'block text-xs font-semibold text-white/60 mb-1';
const btn = 'px-4 py-2 rounded-lg text-sm font-semibold transition-colors';
const lines = (a: string[]) => a.join('\n');
const split = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
type Person = { jabatan: string; nama: string };
type C = Record<string, unknown>;

function ImageField({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const up = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true); setErr('');
    const fd = new FormData(); fd.append('file', f);
    const r = await adminFetch('/api/upload', { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    setBusy(false); e.target.value = '';
    if (r.ok && j.url) onChange(j.url); else setErr(j.error || 'Gagal mengunggah.');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-center">
        {value && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-10 w-14 object-cover rounded" />}
        <input id={id} className={input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Tempel tautan gambar atau unggah" />
      </div>
      <input type="file" accept="image/*" onChange={up} className="text-xs text-white/60" aria-label="Unggah gambar" disabled={busy} />
      {busy && <span className="text-xs text-white/50 ml-2">Mengunggah…</span>}
      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}

export default function AdminKontenPage() {
  const [c, setC] = useState<C | null>(null);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; s: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('beranda');

  useEffect(() => {
    adminFetch('/api/content').then((r) => r.json()).then((j) => setC(j.content)).catch(() => setMsg({ t: 'err', s: 'Gagal memuat konten.' }));
  }, []);

  if (!c) return <AdminLayout title="Konten Halaman"><p className="text-white/50 text-sm">{msg ? msg.s : 'Memuat…'}</p></AdminLayout>;

  const set = (k: string, v: unknown) => setC({ ...c, [k]: v });
  const struktur = c.struktur as SiteContent['struktur'];
  const setS = (patch: Partial<typeof struktur>) => set('struktur', { ...struktur, ...patch });
  const setPerson = (k: 'ketum' | 'sekum' | 'bendum', v: Partial<Person>) => setS({ [k]: { ...struktur[k], ...v } } as Partial<typeof struktur>);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const r = await adminFetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    setMsg(r.ok ? { t: 'ok', s: 'Tersimpan. Perubahan langsung tampil di website.' } : { t: 'err', s: j.error || 'Gagal menyimpan.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const personRow = (k: 'ketum' | 'sekum' | 'bendum', t: string) => (
    <div className="grid gap-3 md:grid-cols-2">
      <div><label className={label} htmlFor={`${k}j`}>{t} (jabatan)</label><input id={`${k}j`} className={input} value={struktur[k].jabatan} onChange={(e) => setPerson(k, { jabatan: e.target.value })} /></div>
      <div><label className={label} htmlFor={`${k}n`}>Nama</label><input id={`${k}n`} className={input} value={struktur[k].nama} onChange={(e) => setPerson(k, { nama: e.target.value })} /></div>
    </div>
  );

  const renderField = (f: Field) => {
    const v = c[f.key]; const k = f.kind; const id = `f-${f.key}`;
    if (k.t === 'text') return <input id={id} className={input} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />;
    if (k.t === 'long') return <textarea id={id} rows={3} className={input} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />;
    if (k.t === 'lines') return <textarea id={id} rows={Math.min(10, Math.max(3, (v as string[]).length + 1))} className={input} value={lines((v as string[]) || [])} onChange={(e) => set(f.key, split(e.target.value))} />;
    if (k.t === 'map') {
      const m = (v as Record<string, string>) || {};
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {k.fields.map((fl) => (
            <div key={fl.k} className={fl.long ? 'md:col-span-2' : ''}>
              <label className={label} htmlFor={`${id}-${fl.k}`}>{fl.label}</label>
              {fl.image ? <ImageField id={`${id}-${fl.k}`} value={m[fl.k] || ''} onChange={(x) => set(f.key, { ...m, [fl.k]: x })} />
                : fl.long ? <textarea id={`${id}-${fl.k}`} rows={3} className={input} value={m[fl.k] || ''} onChange={(e) => set(f.key, { ...m, [fl.k]: e.target.value })} />
                : <input id={`${id}-${fl.k}`} className={input} value={m[fl.k] || ''} onChange={(e) => set(f.key, { ...m, [fl.k]: e.target.value })} />}
            </div>
          ))}
        </div>
      );
    }
    const rows = (v as Row[]) || [];
    const upd = (i: number, key: string, val: string | boolean) => set(f.key, rows.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
    const blank: Row = Object.fromEntries(k.fields.map((fl) => [fl.k, fl.bool ? false : '']));
    return (
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="border border-white/10 rounded-xl p-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-3 md:grid-cols-2">
              {k.fields.map((fl) => (
                <div key={fl.k} className={fl.long ? 'md:col-span-2' : ''}>
                  {fl.bool ? (
                    <label className="flex items-center gap-2 text-xs text-white/70 mt-5"><input type="checkbox" checked={!!r[fl.k]} onChange={(e) => upd(i, fl.k, e.target.checked)} />{fl.label}</label>
                  ) : (
                    <>
                      <label className={label} htmlFor={`${id}-${i}-${fl.k}`}>{fl.label}</label>
                      {fl.image ? <ImageField id={`${id}-${i}-${fl.k}`} value={String(r[fl.k] || '')} onChange={(x) => upd(i, fl.k, x)} />
                        : fl.long ? <textarea id={`${id}-${i}-${fl.k}`} rows={2} className={input} value={String(r[fl.k] || '')} onChange={(e) => upd(i, fl.k, e.target.value)} />
                        : <input id={`${id}-${i}-${fl.k}`} className={input} value={String(r[fl.k] || '')} onChange={(e) => upd(i, fl.k, e.target.value)} />}
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex md:flex-col gap-2">
              <button type="button" disabled={i === 0} onClick={() => { const a = [...rows]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set(f.key, a); }} className={`${btn} bg-white/10 text-white disabled:opacity-30`} aria-label="Naikkan">↑</button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => { const a = [...rows]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set(f.key, a); }} className={`${btn} bg-white/10 text-white disabled:opacity-30`} aria-label="Turunkan">↓</button>
              <button type="button" onClick={() => set(f.key, rows.filter((_, j) => j !== i))} className={`${btn} bg-red-500/15 text-red-300`}>Hapus</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set(f.key, [...rows, { ...blank }])} className={`${btn} bg-white/10 text-white hover:bg-white/20`}>+ Tambah baris</button>
      </div>
    );
  };

  const section = SECTIONS.find((s) => s.id === tab) || SECTIONS[0];

  return (
    <AdminLayout title="Konten Halaman">
      <form onSubmit={save} className="space-y-6">
        <p className="text-white/60 text-sm max-w-3xl">Ubah teks, angka, foto, video, dan logo di seluruh website. Perubahan langsung tampil tanpa deploy ulang. Kolom yang dikosongkan akan memakai isi bawaan.</p>
        {msg && <div className={`px-4 py-3 rounded-xl text-sm border ${msg.t === 'ok' ? 'bg-lime/10 border-lime/20 text-lime' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{msg.s}</div>}

        <div role="tablist" className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={tab === s.id} onClick={() => setTab(s.id)}
              className={`${btn} ${tab === s.id ? 'bg-lime text-forest-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}>{s.title}</button>
          ))}
        </div>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div><h2 className="text-white font-bold text-lg">{section.title}</h2>{section.hint && <p className="text-xs text-white/50 mt-1">{section.hint}</p>}</div>

          {tab === 'tentang' && (
            <div className="space-y-4 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold">Struktur organisasi</h3>
              <p className="text-xs text-white/50">Saat pengurus berganti, cukup ubah nama di sini.</p>
              {personRow('ketum', 'Ketua Umum')}{personRow('sekum', 'Sekretaris Umum')}{personRow('bendum', 'Bendahara Umum')}
              <div className="space-y-3">
                <div className="flex items-center justify-between"><h4 className="text-white/80 text-sm font-semibold">Dewan Pertimbangan Organisasi</h4>
                  <button type="button" className={`${btn} bg-white/10 text-white`} onClick={() => setS({ dpo: [...struktur.dpo, { jabatan: 'Dewan Pertimbangan Organisasi', nama: '' }] })}>+ Tambah</button></div>
                {struktur.dpo.map((d, i) => (
                  <div key={i} className="flex gap-3">
                    <input aria-label={`Nama DPO ${i + 1}`} className={input} value={d.nama} placeholder="Nama" onChange={(e) => setS({ dpo: struktur.dpo.map((x, j) => (j === i ? { ...x, nama: e.target.value } : x)) })} />
                    <button type="button" className={`${btn} bg-red-500/15 text-red-300`} onClick={() => setS({ dpo: struktur.dpo.filter((_, j) => j !== i) })}>Hapus</button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><h4 className="text-white/80 text-sm font-semibold">Bidang</h4>
                  <button type="button" className={`${btn} bg-white/10 text-white`} onClick={() => setS({ bidang: [...struktur.bidang, { nama: '', kepala: '', anggota: [] }] })}>+ Tambah bidang</button></div>
                {struktur.bidang.map((b, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-3 grid gap-3 md:grid-cols-3">
                    <div><label className={label} htmlFor={`bn${i}`}>Nama bidang</label><input id={`bn${i}`} className={input} value={b.nama} onChange={(e) => setS({ bidang: struktur.bidang.map((x, j) => (j === i ? { ...x, nama: e.target.value } : x)) })} /></div>
                    <div><label className={label} htmlFor={`bk${i}`}>Kepala bidang</label><input id={`bk${i}`} className={input} value={b.kepala} onChange={(e) => setS({ bidang: struktur.bidang.map((x, j) => (j === i ? { ...x, kepala: e.target.value } : x)) })} /></div>
                    <div><label className={label} htmlFor={`ba${i}`}>Anggota (satu per baris)</label><textarea id={`ba${i}`} rows={2} className={input} value={lines(b.anggota)} onChange={(e) => setS({ bidang: struktur.bidang.map((x, j) => (j === i ? { ...x, anggota: split(e.target.value) } : x)) })} /></div>
                    <div className="md:col-span-3"><button type="button" className={`${btn} bg-red-500/15 text-red-300`} onClick={() => setS({ bidang: struktur.bidang.filter((_, j) => j !== i) })}>Hapus bidang</button></div>
                  </div>
                ))}
              </div>
              <div><label className={label} htmlFor="dasar">Dasar penetapan (di bawah bagan)</label><textarea id="dasar" rows={2} className={input} value={struktur.dasar} onChange={(e) => setS({ dasar: e.target.value })} /></div>
            </div>
          )}

          {section.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor={`f-${f.key}`}>{f.label}</label>
              {renderField(f)}
            </div>
          ))}
        </section>

        <button disabled={saving} className={`${btn} bg-lime text-forest-dark hover:bg-white disabled:opacity-50`}>{saving ? 'Menyimpan…' : 'Simpan semua perubahan'}</button>
        <p className="text-xs text-white/40">Foto kegiatan: menu Kelola Postingan dan Kelola Galeri. Isi menu navigasi dan susunan blok halaman mengikuti desain; ubahan di luar yang tercantum di sini dilakukan lewat kode.</p>
      </form>
    </AdminLayout>
  );
}
