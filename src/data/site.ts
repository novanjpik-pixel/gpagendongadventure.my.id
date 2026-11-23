// Konten statis profil organisasi GPA Gendong Adventure.
// Sumber: Profil Organisasi GPA Gendong Adventure (Kepengurusan 2026–2027).
// Ubah teks di sini bila ada perubahan; halaman akan mengikuti otomatis.

export const org = {
  name: 'GPA Gendong Adventure',
  fullName: 'Gerakan Pencinta Alam Gendong Adventure Bengkulu',
  founded: '22 Agustus 2015',
  foundedYear: 2015,
  members: 85,
  legalSince: 2024,
  motto: 'Bentuklah karakter hidup untuk menjadi lebih baik, jagalah alam untuk suatu kehidupan.',
  address: 'Jl. BTN Blok D/1 RT 07 RW 03, Kel. Timur Indah, Kec. Singaran Pati, Kota Bengkulu, Provinsi Bengkulu',
  email: 'Gendong.Adventure@gmail.com',
  instagram: 'GPA_Gendongadventure',
  facebook: 'Gpa GendongAdventure',
  period: '2026–2027',
  ketumPhone: '+62 895-2870-5780',
  ketumWa: 'https://wa.me/6289528705780',
};

export const visi =
  'Menjadikan Organisasi GPA Gendong Adventure yang mandiri, memiliki anggota yang berpola pikir luas dan bertanggung jawab terhadap pelestarian lingkungan serta menjunjung tinggi kode etik pecinta alam.';

export const misi = [
  'Mendorong keterlibatan masyarakat dalam upaya pelestarian alam.',
  'Menjalin dan mempererat rasa kekeluargaan yang harmonis sesama pecinta alam.',
  'Melahirkan kader yang berpikir kritis dan peduli terhadap lingkungan.',
  'Menyelenggarakan berbagai kegiatan terkait pentingnya menjaga lingkungan di tingkat masyarakat.',
];

export const tujuan = [
  'Terbangunnya inisiatif masyarakat dalam menjaga lingkungan.',
  'Terbangunnya gerakan bersama dalam pelestarian alam.',
  'Meningkatnya kesadaran kader tentang pentingnya lingkungan bagi kehidupan.',
  'Munculnya kesadaran masyarakat terkait pentingnya menjaga lingkungan.',
];

export const landasan = 'Menjadikan Komunitas GPA Gendong Adventure sebagai garda terdepan dalam pelestarian lingkungan.';

export const sikap = [
  'Pemuda tidak hanya dituntut menggali ilmu pengetahuan, tetapi juga mampu mengimplementasikannya di tengah masyarakat melalui kegiatan nyata yang membawa hasil dan perubahan positif. Dengan demikian, pemuda menjadi aset bangsa yang berkualitas.',
  'Hal ini dapat terwujud dengan memberikan kesempatan bagi generasi masa depan untuk berkreasi dan berinovasi, baik dalam bentuk komunitas maupun kepedulian terhadap fenomena di masyarakat sekitar.',
];

export const tentang = [
  'GPA Gendong Adventure — secara resmi Gerakan Pencinta Alam Gendong Adventure Bengkulu — adalah organisasi kepemudaan di bidang lingkungan yang didirikan pada 22 Agustus 2015 dan berbasis di Provinsi Bengkulu. Dengan 85 anggota yang seluruhnya pemuda Bengkulu, gerakan ini melampaui komunitas hobi: ia menjadi wadah nyata bagi generasi muda untuk beraksi langsung demi masa depan lingkungan yang lebih baik.',
  'Berawal dari sekumpulan anak muda penghobi olahraga alam bebas, aktivitas komunitas berkembang menjadi gerakan pelestarian lingkungan. Sejak 2016, GPA Gendong Adventure memusatkan perhatian pada pemulihan pesisir Kota Bengkulu melalui penanaman kolektif di titik-titik yang terdampak abrasi dan hilangnya hutan sepadan pantai, serta membangun demplot pembibitan mangrove.',
  'Pada 30 Juli 2024, organisasi resmi berbadan hukum perkumpulan melalui Keputusan Menteri Hukum dan HAM RI. Kini GPA Gendong Adventure menjalankan kaderisasi berjenjang — dari Pendidikan Dasar (Diksar) hingga Angkatan VIII dan Pendidikan Lanjutan — sambil terus bergerak di persimpangan petualangan alam bebas dan pelestarian ekosistem.',
];

export const stats = [
  { value: '85', label: 'Anggota pemuda Bengkulu' },
  { value: '2015', label: 'Berdiri di Kota Bengkulu' },
  { value: '2024', label: 'Berbadan hukum perkumpulan' },
  { value: '39', label: 'Kegiatan tercatat 2016–2026' },
];

export const fakta = [
  { value: '4.393 ha', text: 'Mangrove berkondisi baik di pesisir Bengkulu sepanjang 345 km (Buku Sebaran Mangrove Kritis Indonesia, 2018).' },
  { value: '764 ha', text: 'Mangrove berkondisi baik di Kota Bengkulu, tersebar di empat kecamatan — dengan 146 ha kritis di luar dan 72 ha di dalam kawasan konservasi.' },
  { value: '212,5 ha', text: 'Mangrove Bengkulu hilang sepanjang 2021–2025, rata-rata 42,5 ha per tahun (analisis spasial Divisi Konservasi GPA, 2026).' },
  { value: '18,53 ton/ha', text: 'Karbon tersimpan pada tegakan mangrove pesisir Kota Bengkulu (Sunoaji & Hidayat, UGM, 2016).' },
];

export type Person = { jabatan: string; nama: string };

export const struktur = {
  ketum: { jabatan: 'Ketua Umum', nama: 'M Reza Syaputra' },
  dpo: [
    { jabatan: 'Dewan Pertimbangan Organisasi', nama: 'Fajrimus Anugrah Bima Putra' },
    { jabatan: 'Dewan Pertimbangan Organisasi', nama: 'Hesen Saputra' },
    { jabatan: 'Dewan Pertimbangan Organisasi', nama: 'Rahmat Novan Ismadi' },
  ] as Person[],
  sekum: { jabatan: 'Sekretaris Umum', nama: 'Dzakiah Fitrah Gemilang' },
  bendum: { jabatan: 'Bendahara Umum', nama: 'Dona Nabila' },
  bidang: [
    { nama: 'Sumber Daya Manusia', kepala: 'Muhammad Ardiansyah', anggota: [] as string[] },
    { nama: 'Media dan Informasi', kepala: 'Fairuz Dzaki', anggota: ['Riki Fernando Saputra'] },
    { nama: 'Kewirausahaan', kepala: 'Intan Arcela', anggota: [] as string[] },
    { nama: 'Sarana dan Prasarana', kepala: 'Rizki Agustian', anggota: [] as string[] },
    { nama: 'Politik Kajian dan Ilmiah', kepala: 'Oktario M Gerry', anggota: ['Raghel Mareandi', 'Ilham Adhi'] },
  ],
  dasar:
    'Hasil Musyawarah Besar Ke-X (11 Oktober 2026), ditetapkan melalui SK Badan Pengurus Nomor 02 s.d. 14/KPTS-BPH/GA-BKL/X/2026 tanggal 28 Oktober 2026.',
};

export const legalitas = [
  ['Nama perkumpulan', 'Gerakan Pencinta Alam Gendong Adventure Bengkulu'],
  ['Dasar pengesahan', 'Keputusan Menteri Hukum dan HAM RI Nomor AHU-0007373.AH.01.07.Tahun 2024'],
  ['Ditetapkan', 'Jakarta, 30 Juli 2024'],
  ['Akta pendirian', 'Nomor 01 tanggal 22 Juli 2024, Notaris Ivanie Alif Andelha, S.H., M.Kn.'],
];

export const timeline: { waktu: string; tahun: number; judul: string; sorot?: boolean }[] = [
  { tahun: 2016, waktu: '12 Maret 2016', judul: 'Penanaman mangrove di pesisir Bengkulu untuk mencegah abrasi dan melindungi pesisir.' },
  { tahun: 2017, waktu: '2017', judul: 'Bersama lintas komunitas menanam mangrove di Sungai Itam dan bersih pantai.' },
  { tahun: 2018, waktu: '29 April 2018', judul: 'Hari Bumi: penanaman 500 bibit mangrove Rhizophora di Sungai Itam.' },
  { tahun: 2018, waktu: '22 Juli 2018', judul: 'Penanaman 1.000 bibit mangrove di pesisir Bengkulu.' },
  { tahun: 2018, waktu: 'Oktober 2018', judul: 'Berinisiatif membangun demplot pembibitan mangrove.' },
  { tahun: 2019, waktu: '27–28 April 2019', judul: 'Bersama Gubernur Bengkulu dan komunitas pecinta alam menanam 10.000 mangrove untuk pesisir Kota Bengkulu.', sorot: true },
  { tahun: 2019, waktu: '16 Agustus–22 Desember 2019', judul: 'Gendong Adventure Glory II.' },
  { tahun: 2021, waktu: '22 April 2021', judul: 'Bersama BEM UNIB dan lintas komunitas menanam bibit mangrove di Muara Bengkulu.' },
  { tahun: 2022, waktu: '22 Agustus 2022', judul: 'Aksi bersih pantai Tapak Paderi.' },
  { tahun: 2023, waktu: '19–20 Agustus 2023', judul: 'Pelatihan Fotografi Alam Bebas dan Desain Grafis.' },
  { tahun: 2024, waktu: '30 Juli 2024', judul: 'Resmi berstatus badan hukum perkumpulan (AHU-0007373.AH.01.07.Tahun 2024).', sorot: true },
  { tahun: 2025, waktu: '10 Februari 2025', judul: 'Pendidikan Dasar Angkatan VIII di Bukit Kandis, Bengkulu.' },
  { tahun: 2025, waktu: '7 September 2025', judul: 'FGD Dampak Pertambangan bersama akademisi dan masyarakat.' },
  { tahun: 2025, waktu: 'November–Desember 2025', judul: 'Operasi Gabungan Merah Putih di Bentang Alam Seblat untuk koridor Gajah dan Harimau Sumatera.' },
  { tahun: 2026, waktu: '19 Januari 2026', judul: 'Audiensi dengan Kapolda Bengkulu terkait program “Explore The Tropical Rainforest Sumatra – Edisi Bumi Rafflesia”.' },
  { tahun: 2026, waktu: '25 Januari 2026', judul: 'Bersama WALHI Bengkulu merehabilitasi pesisir Desa Pondok Kelapa, Bengkulu Tengah.' },
  { tahun: 2026, waktu: '22 Mei 2026', judul: 'Aksi sosial dan santunan di Panti Asuhan Bumi Raflesia.' },
  { tahun: 2026, waktu: '14 Juni 2026', judul: 'Anggota Muda menanam 100 bibit mangrove di pesisir Muara Jenggalu.' },
  { tahun: 2026, waktu: 'Juli 2026', judul: 'Merilis analisis spasial: Bengkulu kehilangan 212,5 ha mangrove (2021–2025); restorasi di TWA Pantai Panjang dan Pulau Baai.', sorot: true },
  { tahun: 2026, waktu: '6 September 2026', judul: 'Hari Lahir ke-11: penanaman 1.000 bibit mangrove Rhizophora di pesisir Desa Pondok Kelapa.', sorot: true },
  { tahun: 2026, waktu: '28 Oktober 2026', judul: 'Menetapkan Badan Pengurus Periode 2026–2027.' },
];

export const kegiatanRutin = [
  'Penyemaian bibit mangrove',
  'Pendidikan Dasar dan Pendidikan Lanjutan',
  'Penguatan kapasitas anggota terkait kelembagaan',
  'Diskusi rutin bulanan materi pecinta alam',
  'Pelatihan divisi setiap tiga bulan',
];

export const rencana = [
  'Akses kemitraan di Taman Wisata Alam (TWA) untuk pemulihan ekosistem mangrove.',
  'Membangun demplot pembibitan mangrove dan tanaman sepadan pantai.',
  'Meningkatkan produksi dan pemasaran produk olahan buah mangrove.',
  'Menggalang pendanaan untuk pemulihan ekosistem pesisir Kota Bengkulu.',
];

export const galeri = [
  { src: '/assets/gallery/arung-jeram.jpg', judul: 'Arung jeram', caption: 'Menyusuri jeram di antara tebing ngarai — petualangan sungai bersama tim.', w: 1280, h: 960 },
  { src: '/assets/gallery/kebersamaan-panggung.jpg', judul: 'Kebersamaan', caption: 'Anggota GPA Gendong Adventure berfoto bersama dalam sebuah kegiatan.', w: 1600, h: 902 },
  { src: '/assets/gallery/masurai-danau-kawah.jpg', judul: 'Gunung Masurai 2.916 mdpl', caption: 'Dua pendaki menikmati danau kawah Gunung Masurai.', w: 756, h: 1008 },
  { src: '/assets/gallery/hutan-berlumut.jpg', judul: 'Hutan berlumut', caption: 'Trekking menembus hutan hujan tropis yang berkabut dan berlumut.', w: 844, h: 1500 },
  { src: '/assets/gallery/puncak-gunung-patah.jpg', judul: 'Puncak Gunung Patah', caption: 'Anggota tiba di puncak Gunung Patah.', w: 844, h: 1500 },
];

export const logo = '/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png';
export const nav = [
  { href: '/home', label: 'Beranda' },
  { href: '/about', label: 'Tentang Kami' },
  { href: '/activities', label: 'Kegiatan' },
  { href: '/gallery', label: 'Galeri' },
  { href: '/peta', label: 'Peta ETTRS' },
  { href: '/riset', label: 'Riset' },
  { href: '/donation', label: 'Donasi' },
  { href: '/contact', label: 'Kontak' },
];

export const perjalanan = [
  { label: '2015', judul: 'Lahir dari hobi alam bebas', teks: 'Sekelompok anak muda penghobi olahraga alam bebas mendirikan GPA Gendong Adventure pada 22 Agustus 2015 di Kota Bengkulu.' },
  { label: '2016–2019', judul: 'Gerakan mangrove pesisir', teks: 'Fokus bergeser ke pemulihan pesisir: penanaman kolektif di titik abrasi, demplot pembibitan, dan aksi bersama pemerintah serta komunitas pecinta alam se-Provinsi Bengkulu.' },
  { label: '2024', judul: 'Berbadan hukum perkumpulan', teks: 'Disahkan Kemenkumham RI melalui SK AHU-0007373.AH.01.07.Tahun 2024 sebagai tanda kematangan dan komitmen jangka panjang.' },
  { label: '2025–2026', judul: 'Konservasi dan kaderisasi berjenjang', teks: 'Analisis spasial mangrove, kolaborasi dengan WALHI Bengkulu, restorasi di Pondok Kelapa, Pantai Panjang dan Pulau Baai, serta pengurus baru periode 2026–2027.' },
];

export const dilawan = [
  'Abrasi dan rusaknya pesisir Bengkulu',
  'Hilangnya ekosistem mangrove',
  'Hilangnya hutan sepadan pantai',
  'Dampak pertambangan terhadap lingkungan',
];

export const diperjuangkan = [
  'Restorasi mangrove dan pembibitan',
  'Kaderisasi berjenjang pecinta alam',
  'Penelitian dan analisis spasial',
  'Edukasi lingkungan dan aksi sosial',
  'Kolaborasi lintas komunitas dan pemerintah',
  'Perlindungan hutan dan satwa Sumatra',
  'Ekonomi dari produk olahan mangrove',
];
