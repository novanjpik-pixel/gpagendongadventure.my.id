'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/auth/setup', { credentials: 'same-origin', cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.needsSetup === false) {
          router.replace('/admin/login');
          return;
        }
        if (!res.ok || data?.needsSetup !== true) {
          setError(
            data?.error ||
              'Gagal memeriksa status setup. Periksa SUPABASE_SERVICE_ROLE_KEY dan pastikan migrasi sudah dijalankan.'
          );
          setChecking(false);
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) {
          setError('Gagal memeriksa status. Muat ulang halaman.');
          setChecking(false);
        }
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Sandi minimal 8 karakter.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Konfirmasi sandi tidak sama.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: form.name,
          username: form.username.toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Setup gagal.');
        setLoading(false);
        return;
      }
      router.replace('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 transition-all';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-forest-dark via-[#0f2a1c] to-forest-mid flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-lime/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-forest-light/40 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center shadow-lime-lg">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0d2418" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-8 4 4 4-6 4 10"/>
              <path d="M3 21h18"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-4 mb-2">Setup Admin Pertama</h1>
          <p className="text-white/50 text-sm">
            Buat akun administrator. Halaman ini hanya muncul sekali dan akan nonaktif setelah akun dibuat.
          </p>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-forest-lg">
          {checking ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-4 border-lime/20 border-t-lime animate-spin" aria-label="Memuat" />
            </div>
          ) : (
            <>
              {error && (
                <div role="alert" className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-white/70 font-semibold text-sm mb-2">Nama Lengkap</label>
                  <input
                    id="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama Anda"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-white/70 font-semibold text-sm mb-2">Username</label>
                  <input
                    id="username"
                    type="text"
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[a-z0-9._\-]{3,30}"
                    autoComplete="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                    placeholder="huruf kecil, angka, . - _"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-white/70 font-semibold text-sm mb-2">Sandi (min. 8 karakter)</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className={`${inputClass} pr-20`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/50 hover:text-lime transition-colors"
                    >
                      {showPassword ? 'Sembunyi' : 'Lihat'}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-white/70 font-semibold text-sm mb-2">Ulangi Sandi</label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-lime to-lime-dark text-forest-dark font-bold rounded-xl hover:shadow-lime-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Membuat akun...' : 'Buat Akun Admin'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/home" className="text-white/40 text-sm hover:text-lime transition-colors">
            ← Kembali ke Website
          </Link>
        </div>
      </div>
    </div>
  );
}
