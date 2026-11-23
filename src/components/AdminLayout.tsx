'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { installCsrfFetchPatch } from '@/lib/adminClient';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('admin');
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    installCsrfFetchPatch();
    let cancelled = false;

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setUserName(data?.user?.name || 'Admin');
        setUserRole(data?.user?.role || 'admin');
        setChecking(false);
      } catch {
        router.replace('/admin/login');
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore network errors; still leave the panel
    }
    router.replace('/admin/login');
    router.refresh();
  };

  const roleLabel =
    userRole === 'admin' ? 'Administrator' : userRole === 'editor' ? 'Editor' : 'Kontributor';

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      href: '/admin/posts',
      label: 'Kelola Postingan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      href: '/admin/gallery',
      label: 'Kelola Galeri',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
    {
      href: '/admin/konten',
      label: 'Konten Halaman',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>
        </svg>
      ),
    },
    {
      href: '/admin/riset',
      label: 'Riset',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
    },
    {
      href: '/admin/peta',
      label: 'Peta ETTRS',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>
        </svg>
      ),
    },
    {
      href: '/admin/settings',
      label: 'Pengaturan',
      adminOnly: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    },
    {
      href: '/admin/members',
      label: 'Anggota',
      adminOnly: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      href: '/admin/account',
      label: 'Akun Saya',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const Sidebar = () => (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-lime/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-24 w-56 h-56 rounded-full bg-forest-light/30 blur-3xl" />

      {/* Logo */}
      <div className="relative p-6 border-b border-white/10">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center shadow-lime group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d2418" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-8 4 4 4-6 4 10"/>
              <path d="M3 21h18"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">GPA Admin</p>
            <p className="text-lime/70 text-[11px] font-medium tracking-wide">Gendong Adventure</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 p-4 space-y-1.5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Menu Utama</p>
        {navItems.filter((item) => !('adminOnly' in item && item.adminOnly) || userRole === 'admin').map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-lime/20 to-lime/5 text-lime shadow-[inset_0_0_0_1px_rgba(74,222,128,0.25)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-lime" />
              )}
              <span className={active ? 'text-lime' : 'text-white/50'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="relative p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white/5 border border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-lime to-lime-dark rounded-full flex items-center justify-center shadow-lime">
            <span className="text-forest-dark text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{userName}</p>
            <p className="text-lime/60 text-xs">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-[#0f2a1c] to-forest-dark flex">
      {checking && (
        <div className="fixed inset-0 z-[100] bg-forest-dark flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-lime/20 border-t-lime animate-spin" aria-label="Memeriksa sesi" />
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-forest-dark/95 backdrop-blur border-r border-white/10 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-forest-dark border-r border-white/10 flex flex-col animate-slide-down">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-forest-dark/70 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="7" x2="21" y2="7"/>
                <line x1="3" y1="13" x2="21" y2="13"/>
              </svg>
            </button>
            <div>
              <p className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-lime/60 font-bold">Panel Admin</p>
              <h1 className="text-white font-bold text-base sm:text-lg leading-tight">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-white/70 text-sm hover:text-forest-dark hover:bg-lime transition-all flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span className="hidden sm:inline">Lihat Website</span>
            </Link>
            <div className="hidden sm:flex w-9 h-9 bg-gradient-to-br from-lime to-lime-dark rounded-full items-center justify-center shadow-lime">
              <span className="text-forest-dark text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
