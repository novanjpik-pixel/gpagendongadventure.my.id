'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminClient';

interface Member {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor';
  isActive: boolean;
  allowedPages: string[];
  lastLoginAt: string | null;
  createdAt: string;
}

interface LogEntry {
  id: string;
  userName: string;
  action: string;
  objectType: string;
  objectLabel: string;
  createdAt: string;
}

interface FormState {
  id: string | null;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'contributor';
  isActive: boolean;
  allowedPages: string[];
}

const PAGES = [
  { key: 'home', label: 'Beranda' },
  { key: 'about', label: 'Tentang Kami' },
  { key: 'activities', label: 'Kegiatan' },
  { key: 'gallery', label: 'Galeri' },
  { key: 'donation', label: 'Donasi' },
  { key: 'contact', label: 'Kontak' },
];

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  contributor: 'Kontributor',
};

const ROLE_DESC: Record<string, string> = {
  admin: 'Akses penuh: semua konten, pengaturan, dan anggota.',
  editor: 'Menulis, mengedit, menerbitkan, dan menghapus konten pada halaman yang diizinkan.',
  contributor: 'Membuat dan mengedit draft; simpanan menunggu review Editor/Admin.',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-lime/15 text-lime border-lime/30',
  editor: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  contributor: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
};

const EMPTY_FORM: FormState = {
  id: null,
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'contributor',
  isActive: true,
  allowedPages: [],
};

function formatDate(value: string | null): string {
  if (!value) return 'Belum pernah';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(d);
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<'members' | 'logs'>('members');

  const load = useCallback(async () => {
    try {
      const [mRes, lRes] = await Promise.all([
        fetch('/api/members', { credentials: 'same-origin' }),
        fetch('/api/activity', { credentials: 'same-origin' }),
      ]);
      if (mRes.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (mRes.status === 403) {
        router.replace('/admin/dashboard');
        return;
      }
      const mData = await mRes.json().catch(() => ({}));
      if (!mRes.ok) {
        setNotice({ type: 'err', text: mData?.error || 'Gagal memuat anggota.' });
      } else {
        setMembers(mData.members ?? []);
        setCurrentUserId(mData.currentUserId ?? '');
      }
      if (lRes.ok) {
        const lData = await lRes.json().catch(() => ({}));
        setLogs(lData.logs ?? []);
      }
    } catch {
      setNotice({ type: 'err', text: 'Terjadi kesalahan jaringan. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowPw(false);
  };

  const openEdit = (m: Member) => {
    setForm({
      id: m.id,
      name: m.name,
      username: m.username,
      email: m.email,
      password: '',
      role: m.role,
      isActive: m.isActive,
      allowedPages: m.allowedPages,
    });
    setFormError('');
    setShowPw(false);
  };

  const togglePage = (key: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const has = prev.allowedPages.includes(key);
      return {
        ...prev,
        allowedPages: has ? prev.allowedPages.filter((p) => p !== key) : [...prev.allowedPages, key],
      };
    });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setFormError('');

    if (!form.id && form.password.length < 8) {
      setFormError('Sandi minimal 8 karakter.');
      return;
    }
    if (form.id && form.password && form.password.length < 8) {
      setFormError('Sandi minimal 8 karakter.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        username: form.username,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
        allowedPages: form.role === 'admin' ? [] : form.allowedPages,
      };
      if (form.password) payload.password = form.password;

      const res = await adminFetch(form.id ? `/api/members/${form.id}` : '/api/members', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error || 'Gagal menyimpan anggota.');
        return;
      }
      setForm(null);
      setNotice({ type: 'ok', text: form.id ? 'Anggota diperbarui.' : 'Anggota baru ditambahkan.' });
      await load();
    } catch {
      setFormError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/members/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'err', text: data?.error || 'Gagal menghapus anggota.' });
      } else {
        setNotice({ type: 'ok', text: `Anggota "${deleteTarget.name}" dihapus.` });
        await load();
      }
    } catch {
      setNotice({ type: 'err', text: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 transition-all';
  const labelClass = 'block text-white/70 font-semibold text-sm mb-2';

  const activeCount = members.filter((m) => m.isActive).length;

  return (
    <AdminLayout title="Anggota">
      {notice && (
        <div
          role={notice.type === 'err' ? 'alert' : 'status'}
          className={`mb-5 p-3.5 rounded-xl text-sm border flex items-start justify-between gap-3 ${
            notice.type === 'ok' ?'bg-lime/10 border-lime/30 text-lime' :'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-current/70 hover:text-white text-lg leading-none"
            aria-label="Tutup pemberitahuan"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-lime/20 border-t-lime animate-spin" aria-label="Memuat" />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white font-bold text-xl">Tim Pengelola</h2>
              <p className="text-white/50 text-sm">
                {members.length} anggota · {activeCount} aktif
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-lime to-lime-dark text-forest-dark font-bold rounded-xl hover:shadow-lime-lg transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Anggota
            </button>
          </div>

          <div role="tablist" aria-label="Tampilan anggota" className="flex gap-2 mb-5">
            {([
              ['members', 'Daftar Anggota'],
              ['logs', 'Log Aktivitas'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  tab === key
                    ? 'bg-lime/15 border-lime/30 text-lime' :'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'members' && (
            <section className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-white/50 text-xs uppercase tracking-wider border-b border-white/10">
                      <th scope="col" className="px-5 py-3.5 font-semibold">Nama</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Peran</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold hidden md:table-cell">Akses Halaman</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold hidden lg:table-cell">Terakhir Masuk</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((m) => {
                      const isSelf = m.id === currentUserId;
                      const pageText =
                        m.role === 'admin' || m.allowedPages.length === 0 ?'Semua halaman'
                          : m.allowedPages
                              .map((k) => PAGES.find((p) => p.key === k)?.label ?? k)
                              .join(', ');
                      return (
                        <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center">
                                <span className="text-forest-dark text-sm font-bold">
                                  {m.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold truncate">
                                  {m.name}
                                  {isSelf && <span className="ml-2 text-[10px] text-lime/70 font-bold uppercase">Anda</span>}
                                </p>
                                <p className="text-white/40 text-xs truncate">@{m.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_BADGE[m.role] ?? ROLE_BADGE.contributor}`}>
                              {ROLE_LABEL[m.role] ?? m.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-white/60 hidden md:table-cell max-w-[220px]">
                            <span className="line-clamp-2">{pageText}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                m.isActive ? 'text-lime' : 'text-white/40'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-lime' : 'bg-white/30'}`} />
                              {m.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-white/50 hidden lg:table-cell whitespace-nowrap">
                            {formatDate(m.lastLoginAt)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(m)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/20 transition-colors"
                                aria-label={`Ubah ${m.name}`}
                              >
                                Ubah
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(m)}
                                disabled={isSelf}
                                title={isSelf ? 'Tidak dapat menghapus akun sendiri' : undefined}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label={`Hapus ${m.name}`}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-white/40">
                          Belum ada anggota.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'logs' && (
            <section className="bg-white/[0.06] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Log Aktivitas</h3>
                <span className="text-white/40 text-xs">80 entri terakhir</span>
              </div>
              {logs.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center">Belum ada aktivitas tercatat.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {logs.map((l) => (
                    <li key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="text-sm text-white/80">
                        <span className="font-semibold text-white">{l.userName || 'Sistem'}</span>{' '}
                        {l.action.toLowerCase()}
                        {l.objectLabel && <span className="text-lime"> · {l.objectLabel}</span>}
                      </p>
                      <time dateTime={l.createdAt} className="text-xs text-white/40 whitespace-nowrap">
                        {formatDate(l.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      {/* Create / edit dialog */}
      {form && (
        <div
          className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-form-title"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setForm(null)} />
          <form
            onSubmit={submitForm}
            className="relative w-full max-w-xl bg-forest-dark border border-white/15 rounded-2xl p-6 shadow-2xl my-4"
          >
            <div className="flex items-start justify-between mb-5">
              <h2 id="member-form-title" className="text-white font-bold text-lg">
                {form.id ? 'Ubah Anggota' : 'Tambah Anggota'}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="text-white/50 hover:text-white text-2xl leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {formError && (
              <div role="alert" className="mb-4 p-3.5 rounded-xl text-sm border bg-red-500/10 border-red-500/30 text-red-300">
                {formError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="m-name" className={labelClass}>Nama Lengkap</label>
                <input
                  id="m-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="m-username" className={labelClass}>Username</label>
                <input
                  id="m-username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9._\-]{3,30}"
                  autoComplete="off"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  className={inputClass}
                />
                <p className="text-white/40 text-xs mt-1.5">Huruf kecil, angka, titik, strip, garis bawah.</p>
              </div>
              <div>
                <label htmlFor="m-email" className={labelClass}>Email (opsional)</label>
                <input
                  id="m-email"
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="m-password" className={labelClass}>
                  Sandi {form.id ? '(kosongkan jika tidak diganti)' : '(min. 8 karakter)'}
                </label>
                <div className="relative">
                  <input
                    id="m-password"
                    type={showPw ? 'text' : 'password'}
                    required={!form.id}
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${inputClass} pr-24`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/60 hover:text-lime"
                  >
                    {showPw ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="m-role" className={labelClass}>Peran</label>
                <select
                  id="m-role"
                  value={form.role}
                  disabled={form.id === currentUserId}
                  onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}
                  className={`${inputClass} disabled:opacity-60`}
                >
                  <option value="admin" className="text-black">Admin</option>
                  <option value="editor" className="text-black">Editor</option>
                  <option value="contributor" className="text-black">Kontributor</option>
                </select>
                <p className="text-white/40 text-xs mt-1.5">{ROLE_DESC[form.role]}</p>
              </div>

              {form.role !== 'admin' && (
                <fieldset className="sm:col-span-2">
                  <legend className={labelClass}>Akses Halaman</legend>
                  <p className="text-white/40 text-xs mb-3">
                    Kosong berarti semua halaman. Tidak berlaku untuk Admin.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PAGES.map((p) => (
                      <label
                        key={p.key}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={form.allowedPages.includes(p.key)}
                          onChange={() => togglePage(p.key)}
                          className="w-4 h-4 rounded border-white/30 bg-white/10 text-lime focus:ring-lime/40"
                        />
                        <span className="text-white/80 text-sm">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!form.isActive}
                  disabled={form.id === currentUserId}
                  onChange={(e) => setForm({ ...form, isActive: !e.target.checked })}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-lime focus:ring-lime/40"
                />
                <span className="text-white/70 text-sm">Nonaktifkan akun (tidak dapat masuk)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setForm(null)}
                disabled={saving}
                className="px-5 py-3 rounded-xl text-white/70 bg-white/10 hover:bg-white/15 font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-lime to-lime-dark text-forest-dark font-bold rounded-xl hover:shadow-lime-lg transition-all disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-forest-dark border border-white/15 rounded-2xl p-6 shadow-2xl">
            <h2 id="delete-title" className="text-white font-bold text-lg mb-2">Hapus anggota?</h2>
            <p className="text-white/60 text-sm mb-6">
              Akun <span className="text-white font-semibold">{deleteTarget.name}</span> (@{deleteTarget.username}) akan
              dihapus permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-3 rounded-xl text-white/70 bg-white/10 hover:bg-white/15 font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
