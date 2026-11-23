import * as S from '@/data/site';

export type Struktur = typeof S.struktur;
type KV = { value: string; label: string };

export interface SiteContent {
  visi: string; misi: string[]; tujuan: string[]; tentang: string[]; motto: string; struktur: Struktur;
  landasan: string; sikap: string[];
  beranda: Record<string, string>;
  angka: KV[]; angkaTentang: KV[];
  fakta: { value: string; text: string }[];
  perjalanan: { label: string; judul: string; teks: string }[];
  dilawan: string[]; diperjuangkan: string[]; rutin: string[]; rencana: string[];
  legalitas: { k: string; v: string }[];
  timeline: { tahun: string; waktu: string; judul: string; sorot: boolean }[];
  risetFokus: string[]; risetTopik: string[];
  kontak: Record<string, string>;
  galeri: { src: string; judul: string; caption: string }[];
  teks: Record<string, string>;
  media: Record<string, string>;
}

export const CONTENT_DEFAULTS: SiteContent = {
  visi: S.visi, misi: S.misi, tujuan: S.tujuan, tentang: S.tentang, motto: S.org.motto, struktur: S.struktur,
  landasan: S.landasan, sikap: S.sikap,
  beranda: {
    eyebrow: 'Gerakan Pencinta Alam · Bengkulu', judul: 'Jagalah alam untuk suatu kehidupan',
    lead: `Pemuda Bengkulu yang bergerak nyata: menanam mangrove, menjaga hutan, dan mencetak kader pecinta alam sejak ${S.org.foundedYear}.`,
    videoKet: 'Ekspedisi Explore The Tropical Rainforest Sumatra. Video berputar otomatis; ketuk “Nyalakan suara” untuk mendengarkan.',
  },
  angka: S.stats, angkaTentang: [{ value: '2015', label: 'Awal gerakan' }, { value: '85', label: 'Pemuda anggota' }, { value: '2024', label: 'Berbadan hukum' }],
  fakta: S.fakta,
  perjalanan: S.perjalanan,
  dilawan: S.dilawan, diperjuangkan: S.diperjuangkan, rutin: S.kegiatanRutin, rencana: S.rencana,
  legalitas: S.legalitas.map(([k, v]) => ({ k, v })),
  timeline: S.timeline.map((t) => ({ tahun: String(t.tahun), waktu: t.waktu, judul: t.judul, sorot: !!t.sorot })),
  risetFokus: ['Hutan dan konservasi', 'Pesisir dan mangrove', 'Tata kelola ruang berkeadilan'],
  risetTopik: ['Deforestasi dan degradasi hutan', 'Abrasi dan krisis pesisir', 'Industri ekstraktif', 'Perizinan dan tata ruang (RTRW, RPJMD, KLHS)', 'Keanekaragaman hayati', 'Kebijakan dan penegakan hukum lingkungan'],
  kontak: { alamat: S.org.address, email: S.org.email, instagram: S.org.instagram, facebook: S.org.facebook, ketumTelp: S.org.ketumPhone, ketumWa: S.org.ketumWa },
  galeri: S.galeri.map((g) => ({ src: g.src, judul: g.judul, caption: g.caption })),
  teks: {
    aboutJudul: 'Kolektif pemuda pecinta alam Bengkulu',
    aboutLead: 'Organisasi kepemudaan di bidang lingkungan yang bekerja untuk memulihkan pesisir, menjaga hutan, dan mencetak kader pecinta alam.',
    galeriJudul: 'Dokumentasi perjalanan kami', galeriLead: 'Foto kegiatan GPA Gendong Adventure — dari hutan, gunung, sungai, hingga pesisir Bengkulu.',
    risetJudul: 'Riset untuk menjaga masa depan alam Bengkulu', risetLead: 'Pengetahuan adalah bagian dari perjuangan. Baca kajian dan laporan kami tentang hutan, pesisir, dan keadilan ruang.',
    petaLead: 'Explore The Tropical Rainforest Sumatra',
    petaCatatan: 'Peta ini memadukan data lapangan GPA Gendong Adventure dengan citra satelit dan data terbuka. Buka panel Lapisan untuk menyalakan citra Sentinel-2, peringatan deforestasi, tutupan lahan, atau kualitas udara. Peringatan deforestasi dan hasil model adalah indikasi dari citra satelit dan belum diverifikasi lapangan.',
    ajakanJudul: 'Ikut menjaga alam bersama kami',
  },
  media: {
    logo: S.logo, videoUtama: '/assets/video/ettrs.mp4', videoUtamaPoster: '/assets/video/ettrs-poster.jpg',
    videoLatar: '/assets/video/hero.mp4', videoLatarPoster: '/assets/video/hero-poster.jpg',
    heroAbout: '/assets/gallery/masurai-danau-kawah.jpg', heroGaleri: '/assets/gallery/arung-jeram.jpg', heroRiset: '/assets/gallery/hutan-berlumut.jpg',
    heroPeta: '/assets/gallery/hutan-berlumut.jpg', heroKegiatan: '/assets/gallery/kebersamaan-panggung.jpg', heroDonasi: '/assets/gallery/puncak-gunung-patah.jpg', heroKontak: '/assets/gallery/hutan-berlumut.jpg',
  },
};

