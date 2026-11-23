// Skema konten yang bisa diedit dari admin. Dipakai oleh editor (klien) dan validasi (server).
export type Row = Record<string, string | boolean>;

export type Kind =
  | { t: 'text' } | { t: 'long' } | { t: 'lines' }
  | { t: 'map'; fields: { k: string; label: string; long?: boolean; image?: boolean }[] }
  | { t: 'rows'; fields: { k: string; label: string; long?: boolean; bool?: boolean; image?: boolean }[] };

export interface Field { key: string; label: string; hint?: string; kind: Kind }
export interface Section { id: string; title: string; hint?: string; fields: Field[] }

export const SECTIONS: Section[] = [
  { id: 'beranda', title: 'Beranda', hint: 'Teks utama, angka, dan sorotan di halaman depan.', fields: [
    { key: 'beranda', label: 'Teks hero', kind: { t: 'map', fields: [
      { k: 'eyebrow', label: 'Teks kecil di atas judul' }, { k: 'judul', label: 'Judul besar' }, { k: 'lead', label: 'Kalimat pengantar', long: true },
      { k: 'videoKet', label: 'Keterangan di bawah video', long: true } ] } },
    { key: 'angka', label: 'Angka ringkas (strip hijau)', kind: { t: 'rows', fields: [{ k: 'value', label: 'Angka' }, { k: 'label', label: 'Keterangan' }] } },
    { key: 'fakta', label: 'Fakta mangrove / data pendukung', kind: { t: 'rows', fields: [{ k: 'value', label: 'Angka' }, { k: 'text', label: 'Penjelasan', long: true }] } },
    { key: 'teks', label: 'Judul dan kalimat halaman lain', kind: { t: 'map', fields: [
      { k: 'aboutJudul', label: 'Tentang Kami: judul' }, { k: 'aboutLead', label: 'Tentang Kami: kalimat pengantar', long: true },
      { k: 'galeriJudul', label: 'Galeri: judul' }, { k: 'galeriLead', label: 'Galeri: kalimat pengantar', long: true },
      { k: 'risetJudul', label: 'Riset: judul' }, { k: 'risetLead', label: 'Riset: kalimat pengantar', long: true },
      { k: 'petaLead', label: 'Peta ETTRS: kalimat di bawah judul' }, { k: 'petaCatatan', label: 'Peta ETTRS: catatan di bawah peta', long: true },
      { k: 'ajakanJudul', label: 'Judul ajakan (banner hijau muda)' } ] } },
  ] },
  { id: 'tentang', title: 'Tentang Kami', hint: 'Profil, visi, misi, perjalanan, dan legalitas.', fields: [
    { key: 'motto', label: 'Motto', kind: { t: 'long' } },
    { key: 'tentang', label: 'Profil “Siapa kami” (satu paragraf per baris)', kind: { t: 'lines' } },
    { key: 'angkaTentang', label: 'Tiga angka di Tentang Kami', kind: { t: 'rows', fields: [{ k: 'value', label: 'Angka' }, { k: 'label', label: 'Keterangan' }] } },
    { key: 'visi', label: 'Visi', kind: { t: 'long' } },
    { key: 'misi', label: 'Misi (satu per baris)', kind: { t: 'lines' } },
    { key: 'tujuan', label: 'Tujuan (satu per baris)', kind: { t: 'lines' } },
    { key: 'landasan', label: 'Landasan organisasi', kind: { t: 'long' } },
    { key: 'sikap', label: 'Sikap organisasi (satu paragraf per baris)', kind: { t: 'lines' } },
    { key: 'perjalanan', label: 'Perjalanan kami (empat tahap)', kind: { t: 'rows', fields: [{ k: 'label', label: 'Tahun' }, { k: 'judul', label: 'Judul' }, { k: 'teks', label: 'Uraian', long: true }] } },
    { key: 'dilawan', label: 'Yang kami lawan (satu per baris)', kind: { t: 'lines' } },
    { key: 'diperjuangkan', label: 'Yang kami perjuangkan (satu per baris)', kind: { t: 'lines' } },
    { key: 'rutin', label: 'Kegiatan rutin (satu per baris)', kind: { t: 'lines' } },
    { key: 'rencana', label: 'Rencana kegiatan (satu per baris)', kind: { t: 'lines' } },
    { key: 'legalitas', label: 'Data badan hukum', kind: { t: 'rows', fields: [{ k: 'k', label: 'Judul' }, { k: 'v', label: 'Isi', long: true }] } },
    { key: 'timeline', label: 'Kronologi kegiatan', kind: { t: 'rows', fields: [{ k: 'tahun', label: 'Tahun' }, { k: 'waktu', label: 'Waktu' }, { k: 'judul', label: 'Kegiatan', long: true }, { k: 'sorot', label: 'Sorotan', bool: true }] } },
  ] },
  { id: 'riset', title: 'Riset', fields: [
    { key: 'risetFokus', label: 'Fokus kami (satu per baris)', kind: { t: 'lines' } },
    { key: 'risetTopik', label: 'Topik yang kami kaji (satu per baris)', kind: { t: 'lines' } },
  ] },
  { id: 'kontak', title: 'Kontak dan footer', hint: 'Tampil di header, footer, dan data situs.', fields: [
    { key: 'kontak', label: 'Kontak sekretariat', kind: { t: 'map', fields: [
      { k: 'alamat', label: 'Alamat sekretariat', long: true }, { k: 'email', label: 'Email' }, { k: 'instagram', label: 'Instagram (tanpa @)' },
      { k: 'facebook', label: 'Facebook' }, { k: 'ketumTelp', label: 'Telepon Ketua Umum (tampilan)' }, { k: 'ketumWa', label: 'Tautan WhatsApp Ketua Umum (https://wa.me/62…)' } ] } },
  ] },
  { id: 'media', title: 'Foto, video, dan logo', hint: 'Ganti dengan unggah gambar atau tempel tautan. Video dibatasi ukuran unggah Vercel (±4,5 MB), jadi untuk video tempel tautan berkas .mp4 (mis. dari Supabase Storage).', fields: [
    { key: 'media', label: 'Gambar dan video', kind: { t: 'map', fields: [
      { k: 'logo', label: 'Logo', image: true },
      { k: 'videoUtama', label: 'Video yang langsung terputar di Beranda (.mp4)' }, { k: 'videoUtamaPoster', label: 'Gambar awal video', image: true },
      { k: 'videoLatar', label: 'Video latar hero Beranda (.mp4)' }, { k: 'videoLatarPoster', label: 'Gambar awal video latar', image: true },
      { k: 'heroAbout', label: 'Hero Tentang Kami', image: true }, { k: 'heroGaleri', label: 'Hero Galeri', image: true },
      { k: 'heroRiset', label: 'Hero Riset', image: true }, { k: 'heroPeta', label: 'Hero Peta ETTRS', image: true },
      { k: 'heroKegiatan', label: 'Hero Kegiatan', image: true }, { k: 'heroDonasi', label: 'Hero Donasi', image: true }, { k: 'heroKontak', label: 'Hero Kontak', image: true } ] } },
    { key: 'galeri', label: 'Foto galeri bawaan (di luar foto yang diunggah lewat “Kelola Galeri”)', kind: { t: 'rows', fields: [{ k: 'src', label: 'Foto', image: true }, { k: 'judul', label: 'Judul' }, { k: 'caption', label: 'Keterangan', long: true }] } },
  ] },
];

export const ALL_FIELDS: Field[] = SECTIONS.flatMap((s) => s.fields);
