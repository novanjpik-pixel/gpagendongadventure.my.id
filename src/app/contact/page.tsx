'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/site/PageHero';
import { useSiteInfo } from '@/components/site/useSiteInfo';
import { useState, useEffect } from 'react';

interface Settings {
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  facebook?: string;
}

export default function ContactPage() {
  const { media: siteMedia } = useSiteInfo();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [settings, setSettings] = useState<Settings>({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  const validate = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter.';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Format email tidak valid.';
    }
    if (!form.message.trim()) {
      newErrors.message = 'Pesan wajib diisi.';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Pesan minimal 10 karakter.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStatus('sending');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus('sent');
    setForm({ name: '', email: '', message: '' });
  };

  const contactInfo = [
    ...(settings.email ? [{ icon: '📧', label: 'Email', value: settings.email }] : []),
    ...(settings.phone ? [{ icon: '📱', label: 'Telepon', value: settings.phone }] : []),
    ...(settings.address ? [{ icon: '📍', label: 'Alamat', value: settings.address }] : []),
  ];

  const socials = [
    ...(settings.instagram
      ? [{
          name: 'Instagram',
          handle: settings.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@'),
          href: settings.instagram,
          color: 'bg-pink-500',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="white"/>
            </svg>
          ),
        }]
      : []),
    ...(settings.youtube
      ? [{
          name: 'YouTube',
          handle: settings.youtube.replace('https://youtube.com/', '@').replace('https://www.youtube.com/', '@'),
          href: settings.youtube,
          color: 'bg-red-500',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          ),
        }]
      : []),
    ...(settings.whatsapp
      ? [{
          name: 'WhatsApp',
          handle: settings.whatsapp.replace('https://wa.me/', '+').replace('https://api.whatsapp.com/send?phone=', '+'),
          href: settings.whatsapp,
          color: 'bg-green-500',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          ),
        }]
      : []),
    ...(settings.facebook
      ? [{
          name: 'Facebook',
          handle: settings.facebook.replace('https://facebook.com/', '').replace('https://www.facebook.com/', ''),
          href: settings.facebook,
          color: 'bg-blue-600',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          ),
        }]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Hubungi GPA Gendong Adventure',
            description: 'Hubungi GPA Gendong Adventure untuk pertanyaan, bergabung, atau sekadar menyapa.',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contact`,
            publisher: {
              '@type': 'Organization',
              name: 'GPA Gendong Adventure',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png`,
              },
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Kontak',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contact`,
              },
            ],
          }),
        }}
      />
      <Header />
      <main className="bg-cream">
        <PageHero eyebrow="Kontak" title="Hubungi kami" lead="Pertanyaan, kolaborasi, atau ingin bergabung? Kami senang mendengar dari Anda." image={siteMedia.heroKontak} />

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact form */}
              <div>
                <h2 className="text-2xl font-bold text-forest-dark mb-6">Kirim Pesan</h2>
                {status === 'sent' ? (
                  <div className="bg-lime/10 border border-lime/20 rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="font-bold text-forest-dark text-xl mb-2">Pesan Terkirim!</h3>
                    <p className="text-forest/60">Terima kasih! Kami akan membalas pesan Anda segera.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 px-6 py-3 bg-forest text-white rounded-xl font-semibold hover:bg-forest-light transition-colors"
                    >
                      Kirim Pesan Lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                      <label className="block text-forest-dark font-medium text-sm mb-2">Nama Lengkap</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                        placeholder="Masukkan nama Anda"
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-forest-dark placeholder-forest/30 focus:outline-none focus:ring-2 transition-colors ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-forest/20 focus:border-forest focus:ring-forest/10'}`}
                      />
                      {errors.name && <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-forest-dark font-medium text-sm mb-2">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                        placeholder="email@contoh.com"
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-forest-dark placeholder-forest/30 focus:outline-none focus:ring-2 transition-colors ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-forest/20 focus:border-forest focus:ring-forest/10'}`}
                      />
                      {errors.email && <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-forest-dark font-medium text-sm mb-2">Pesan</label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => { setForm({ ...form, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: undefined }); }}
                        placeholder="Tulis pesan Anda di sini..."
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-forest-dark placeholder-forest/30 focus:outline-none focus:ring-2 transition-colors resize-none ${errors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-forest/20 focus:border-forest focus:ring-forest/10'}`}
                      />
                      {errors.message && <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full py-4 bg-forest text-white font-bold rounded-xl hover:bg-forest-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Mengirim...' : 'Kirim Pesan'}
                    </button>
                  </form>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-forest-dark mb-6">Informasi Kontak</h2>
                  {loadingSettings ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-forest/10 animate-pulse">
                          <div className="w-8 h-8 bg-forest/10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-forest/10 rounded w-16" />
                            <div className="h-4 bg-forest/10 rounded w-40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactInfo.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-forest/10">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="text-forest/40 text-xs font-medium mb-1">{item.label}</p>
                            <p className="text-forest-dark font-medium text-sm">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-forest-dark mb-4">Ikuti Kami</h3>
                  {loadingSettings ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-forest/10 animate-pulse">
                          <div className="w-10 h-10 bg-forest/10 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-forest/10 rounded w-24" />
                            <div className="h-3 bg-forest/10 rounded w-36" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socials.map((social, i) => (
                        <a
                          key={i}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-forest/10 hover:border-forest/30 hover:shadow-sm transition-all group"
                        >
                          <div className={`w-10 h-10 ${social.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            {social.icon}
                          </div>
                          <div>
                            <p className="text-forest-dark font-semibold text-sm">{social.name}</p>
                            <p className="text-forest/40 text-xs">{social.handle}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
