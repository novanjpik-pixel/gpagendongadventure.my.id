# Website GPA Gendong Adventure

Website publik + panel admin (Next.js 15, React 19, Tailwind, Supabase).

## Isi halaman
| Alamat | Isi |
|---|---|
| `/home` | Beranda: hero video, statistik, visi–misi, sorotan kegiatan, galeri, fakta mangrove |
| `/about` | Tentang Kami: profil, motto, **visi–misi–tujuan**, **struktur organisasi 2026–2027**, sejarah 2016–2026, legalitas |
| `/activities` | Kegiatan/blog (dari admin) |
| `/gallery` | Galeri: 5 foto bawaan + foto yang diunggah lewat admin |
| `/riset` | **Riset**: perpustakaan publikasi; pengunjung membaca PDF langsung di website (halaman demi halaman) |
| `/peta` | **Peta ETTRS** (Explore The Tropical Rainforest Sumatra): peta interaktif + lapisan GeoJSON dari admin |
| `/donation`, `/contact` | Donasi (WhatsApp) dan kontak |
| `/admin/*` | Panel pengelola (login) |

## Mengelola dari dashboard admin (langsung berubah di website)
Masuk di `/admin/login`, lalu:
| Menu | Fungsinya |
|---|---|
| Kelola Postingan | Kegiatan/blog di `/activities` dan Beranda |
| Kelola Galeri | Foto tambahan di `/gallery` |
| **Konten Halaman** | Hampir seluruh isi website, dalam 5 tab: **Beranda** (teks hero, angka, fakta, judul halaman), **Tentang Kami** (profil, visi, misi, tujuan, struktur, perjalanan, legalitas, kronologi), **Riset** (fokus dan topik), **Kontak dan footer**, **Foto, video, dan logo** (logo, video Beranda, foto hero tiap halaman, foto galeri bawaan) |
| **Riset** | Tambah/ubah/hapus publikasi: judul, jenis, tanggal, ringkasan, sampul, PDF (tempel tautan Google Drive/URL atau unggah ≤4 MB) |
| **Peta ETTRS** | Unggah/ganti/hapus lapisan GeoJSON, atur warna, urutan, tampil/sembunyi, judul dan pusat peta |
| Pengaturan, Anggota, Akun | Kontak, pengguna admin, kata sandi |

Perubahan tersimpan ke Supabase dan halaman publik memuatnya pada permintaan berikutnya (tanpa deploy ulang).
Bila Supabase belum terisi, website memakai isi bawaan di `src/data/site.ts`.

## Mengubah isi lewat kode (opsional)
- Isi bawaan profil, visi, struktur, timeline → `src/data/site.ts`.
- Foto galeri bawaan → `public/assets/gallery/` lalu daftarkan di `galeri` pada `site.ts`.
- Video latar hero → `public/assets/video/hero.mp4`; video yang langsung terputar di Beranda (ETTRS) → `public/assets/video/ettrs.mp4` (+ `ettrs-poster.jpg`). Video otomatis berputar tanpa suara (aturan browser); pengunjung bisa menekan “Nyalakan suara”.
- Logo → `public/assets/images/logo-gpa.png`.

## Menjalankan
```bash
cp .env.example .env     # isi kunci Supabase Anda
npm install
npm run dev              # pengembangan, http://localhost:4028
npm run build && npm start   # produksi
```

## Variabel lingkungan (`.env`, jangan di-commit)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` — lihat `.env.example`.

## Database
Jalankan berkas di `supabase/migrations/` berurutan (nama berawalan tanggal) pada SQL Editor Supabase.
Tiga migrasi terbaru: `20260601100000_peta_ettrs.sql` (peta), `20260601100001_site_content.sql` (konten halaman), `20260601100002_riset.sql` (riset, sudah berisi dokumen “Menilik Narasi Bengkulu Provinsi Konservasi”).
Catatan: migrasi awal mengisi **data contoh** pada tabel `settings` (telepon `+62 812-xxxx-xxxx`, dsb.).
Perbarui lewat `/admin/settings` agar halaman Kontak menampilkan data asli.

## Keamanan
- Ganti akun/kata sandi bawaan admin segera setelah setup pertama.
- Jangan membagikan `SUPABASE_SERVICE_ROLE_KEY`. Bila pernah terkirim lewat chat/zip, buat ulang kuncinya di Supabase.

## Upload ke GitHub
```bash
git init
git add .
git commit -m "Website GPA Gendong Adventure"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
File `.env` sudah ada di `.gitignore`, jadi kunci Supabase tidak ikut terunggah.

## Deploy di Vercel
1. vercel.com → **Add New… → Project** → impor repo GitHub tadi. Framework otomatis **Next.js**; perintah build/output biarkan bawaan.
2. Di **Environment Variables**, isi: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (alamat Vercel/domain Anda, mis. `https://nama.vercel.app`).
3. Klik **Deploy**. Setiap `git push` ke `main` otomatis deploy ulang.
4. Jalankan migrasi SQL di Supabase (bagian Database) sebelum memakai menu admin Peta, Konten Halaman, dan Riset.

Catatan Vercel: `server.js` tidak dipakai (Vercel menjalankan Next.js langsung). Batas ukuran unggahan fungsi serverless ±4,5 MB:
foto galeri maks 1 MB per berkas (batas aplikasi), GeoJSON peta maks 3,5 MB per berkas.
Peta memakai peta dasar OpenFreeMap, citra Esri/EOX, dan Global Forest Watch langsung dari browser pengunjung (butuh internet).
