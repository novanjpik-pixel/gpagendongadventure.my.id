import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'GPA Gendong Adventure — Explore Nature, Build Brotherhood',
  description: 'Gerakan Pencinta Alam Gendong Adventure Bengkulu — organisasi kepemudaan lingkungan, berdiri 2015, berbadan hukum 2024.',
  keywords: ['GPA Gendong Adventure', 'komunitas pecinta alam', 'Bengkulu', 'petualangan alam', 'pelestarian lingkungan'],
  authors: [{ name: 'GPA Gendong Adventure' }],
  creator: 'GPA Gendong Adventure',
  publisher: 'GPA Gendong Adventure',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: [
      { url: '/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png', type: 'image/x-icon' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'GPA Gendong Adventure',
    title: 'GPA Gendong Adventure — Explore Nature',
    description: 'Komunitas pecinta alam Bengkulu untuk eksplorasi, persaudaraan, dan pelestarian alam.',
    images: [
      {
        url: '/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png',
        width: 1200,
        height: 630,
        alt: 'GPA Gendong Adventure - Komunitas Pecinta Alam Bengkulu',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPA Gendong Adventure — Explore Nature',
    description: 'Komunitas pecinta alam Bengkulu untuk eksplorasi, persaudaraan, dan pelestarian alam.',
    images: ['/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'GPA Gendong Adventure',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png`,
              description: 'Gerakan Pencinta Alam Gendong Adventure Bengkulu — organisasi kepemudaan lingkungan, berdiri 2015, berbadan hukum 2024.',
              sameAs: [
                'https://instagram.com/GPA_Gendongadventure',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                email: 'Gendong.Adventure@gmail.com',
              },
              areaServed: 'ID',
              foundingDate: '2015-08-22',
            }),
          }}
        />
</head>
      <body>{children}</body>
    </html>
  );
}