'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { adminFetch } from '@/lib/adminClient';

interface Me {
  username: string;
  name: string;
  role: string;
}

export default function AdminAccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        setMe(data.user);
        setName(data.user?.name ?? '');
      } catch {
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMsg(null);
    setSavingName(true);
    try {
      const res = await adminFetch('/api/auth/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNameMsg({ type: 'err', text: data?.error || 'Gagal menyimpan nama.' });
      } else {
        setNameMsg({ type: 'ok', text: 'Nama tampilan diperbarui.' });
        setMe((prev) => (prev ? { ...prev, name } : prev));
        router.refresh();
      }
    } catch {
      setNameMsg({ type: 'err', text: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (pw.next.length < 8) {
      setPwMsg({ type: 'err', text: 'Sandi baru minimal 8 karakter.' });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: 'err', text: 'Konfirmasi sandi baru tidak sama.' });
      return;
    }

    setSavingPw(true);
    try {
      const res = await adminFetch('/api/auth/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwMsg({ type: 'err', text: data?.error || 'Gagal mengganti sandi.' });
      } else {
        setPwMsg({
          type: 'ok',
          text: 'Sandi berhasil diganti. Sesi di perangkat lain sudah keluar.',
        });
        setPw({ current: '', next: '', confirm: '' });
      }
    } catch {
      setPwMsg({ type: 'err', text: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setSavingPw(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 transition-all';
  const labelClass = 'block text-white/70 font-semibold text-sm mb-2';

  const Msg = ({ m }: { m: { type: 'ok' | 'err'; text: string } | null }) =>
    m ? (
      <div
        role={m.type === 'err' ? 'alert' : 'status'}
        className={`mb-4 p-3.5 rounded-xl text-sm border ${
          m.type === 'ok' ?'bg-lime/10 border-lime/30 text-lime' :'bg-red-500/10 border-red-500/30 text-red-300'
        }`}
      >
        {m.text}
      </div>
    ) : null;

  const roleLabel =
    me?.role === 'admin' ? 'Administrator' : me?.role === 'editor' ? 'Editor' : 'Kontributor';

  return (
    <AdminLayout title="Akun Saya">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-lime/20 border-t-lime animate-spin" aria-label="Memuat" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white/[0.06] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-1">Profil</h2>
            <p className="text-white/50 text-sm mb-5">
              Masuk sebagai <span className="text-lime font-semibold">{me?.username}</span> · {roleLabel}
            </p>
            <Msg m={nameMsg} />
            <form onSubmit={saveName} className="space-y-4">
              <div>
                <label htmlFor="display-name" className={labelClass}>Nama Tampilan</label>
                <input
                  id="display-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={savingName}
                className="px-6 py-3 bg-gradient-to-r from-lime to-lime-dark text-forest-dark font-bold rounded-xl hover:shadow-lime-lg transition-all disabled:opacity-60"
              >
                {savingName ? 'Menyimpan...' : 'Simpan Nama'}
              </button>
            </form>
          </section>

          <section className="bg-white/[0.06] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-1">Ganti Sandi</h2>
            <p className="text-white/50 text-sm mb-5">
              Setelah diganti, sesi di perangkat lain akan otomatis keluar.
            </p>
            <Msg m={pwMsg} />
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label htmlFor="current-password" className={labelClass}>Sandi Lama</label>
                <input
                  id="current-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="new-password" className={labelClass}>Sandi Baru (min. 8 karakter)</label>
                <input
                  id="new-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className={labelClass}>Ulangi Sandi Baru</label>
                <input
                  id="confirm-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPw}
                  onChange={(e) => setShowPw(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-lime focus:ring-lime/40"
                />
                <span className="text-white/60 text-sm">Tampilkan sandi</span>
              </label>
              <button
                type="submit"
                disabled={savingPw}
                className="px-6 py-3 bg-gradient-to-r from-lime to-lime-dark text-forest-dark font-bold rounded-xl hover:shadow-lime-lg transition-all disabled:opacity-60"
              >
                {savingPw ? 'Menyimpan...' : 'Ganti Sandi'}
              </button>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
