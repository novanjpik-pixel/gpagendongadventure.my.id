'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (cancelled) return;
        if (res.ok) {
          router.replace('/admin/dashboard');
          return;
        }
        const data = await res.json().catch(() => null);
        if (data?.needsSetup) router.replace('/admin/setup');
      } catch {
        // stay on login
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
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...form, remember }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.needsSetup) {
          router.replace('/admin/setup');
          return;
        }
        setError(data?.error || 'Login gagal');
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-forest-dark via-[#0f2a1c] to-forest-mid flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-lime/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-forest-light/40 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center shadow-lime-lg group-hover:scale-105 transition-transform">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0d2418" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l4-8 4 4 4-6 4 10"/>
                <path d="M3 21h18"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mt-4 mb-2">Masuk ke Panel Admin</h1>
          <p className="text-white/50 text-sm">Kelola konten website GPA Gendong Adventure</p>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-forest-lg">
          {error && (
            <div role="alert" className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-2">
              <svg className="mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-white/70 font-semibold text-sm mb-2">Username atau Email</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-white/70 font-semibold text-sm mb-2">Sandi</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-20 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-4 focus:ring-lime/10 transition-all"
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

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-lime focus:ring-lime/40"
              />
              <span className="text-white/60 text-sm">Ingat saya (14 hari)</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-lime to-lime-dark text-forest-dark font-bold rounded-xl hover:shadow-lime-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
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
