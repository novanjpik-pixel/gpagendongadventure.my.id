// Logika bersama Peta ETTRS: validasi GeoJSON, bangun konfigurasi untuk peta.js.

export const PETA_GROUPS = [
  'Temuan Pemantauan', 'Taman Nasional', 'Kawasan Hutan', 'Reforestasi', 'Administrasi', 'Perizinan',
  'Tutupan Lahan', 'Deforestasi', 'Sosial', 'Mangrove dan Pesisir', 'Jalur Ekspedisi',
];

export const MAX_GEOJSON_BYTES = 3.5 * 1024 * 1024; // batas body fungsi serverless Vercel ~4,5 MB

const TITLE_KEYS = ['judul', 'title', 'nama', 'name', 'nama_objek', 'objek', 'lokasi', 'jenis', 'kategori', 'kawasan', 'namobj', 'remark'];

export interface LayerMeta {
  tipe: string[];
  n: number;
  bbox: number[] | null;
  title_key: string;
  geojson: { type: 'FeatureCollection'; features: unknown[] };
}

type Geom = { type?: string; coordinates?: unknown; geometries?: Geom[] } | null;

function walk(c: unknown, f: (x: number, y: number) => void) {
  if (!Array.isArray(c)) return;
  if (typeof c[0] === 'number' && typeof c[1] === 'number') { f(c[0] as number, c[1] as number); return; }
  for (const i of c) walk(i, f);
}

export function analyzeGeojson(input: unknown): LayerMeta {
  let obj = input as { type?: string; features?: unknown[]; geometry?: unknown };
  if (!obj || typeof obj !== 'object') throw new Error('Berkas bukan GeoJSON yang valid.');
  let features: { type: string; properties?: Record<string, unknown>; geometry: Geom }[];
  if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) features = obj.features as typeof features;
  else if (obj.type === 'Feature') features = [obj as unknown as (typeof features)[number]];
  else if (obj.type && /^(Point|MultiPoint|LineString|MultiLineString|Polygon|MultiPolygon)$/.test(obj.type)) features = [{ type: 'Feature', properties: {}, geometry: obj as Geom }];
  else throw new Error('GeoJSON harus berupa FeatureCollection, Feature, atau geometri.');

  const tipe = new Set<string>();
  let minx = 180, miny = 90, maxx = -180, maxy = -90, any = false;
  const props = new Set<string>();
  const clean: typeof features = [];
  for (const f of features) {
    if (!f || !f.geometry || !f.geometry.type) continue;
    const g = f.geometry;
    const t = g.type as string;
    if (t.endsWith('Polygon')) tipe.add('polygon'); else if (t.endsWith('LineString')) tipe.add('line'); else if (t.endsWith('Point')) tipe.add('point');
    walk(g.coordinates, (x, y) => {
      if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 180 || Math.abs(y) > 90) return;
      any = true; minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
    });
    Object.keys(f.properties || {}).forEach((k) => props.add(k));
    clean.push({ type: 'Feature', properties: f.properties || {}, geometry: g });
  }
  if (!clean.length || !any) throw new Error('Tidak ada objek peta yang valid. Pastikan koordinat berformat WGS84 (bujur, lintang).');
  const lower = Array.from(props);
  const title_key = TITLE_KEYS.map((k) => lower.find((p) => p.toLowerCase() === k)).find(Boolean) || '';
  return { tipe: Array.from(tipe), n: clean.length, bbox: [minx, miny, maxx, maxy], title_key, geojson: { type: 'FeatureCollection', features: clean } };
}

export const DEFAULT_METODOLOGI =
  'Peta ini memadukan data lapangan GPA Gendong Adventure dengan citra satelit serta data terbuka, untuk program Explore The Tropical Rainforest Sumatra (ETTRS).\n\n' +
  'Data kami: batas kawasan, jalur, dan titik temuan berasal dari kegiatan ekspedisi, verifikasi lapangan, dan analisis spasial GPA Gendong Adventure. Batas kawasan mengikuti data resmi yang tersedia pada saat pembaruan.\n\n' +
  'Citra Sentinel-2: citra resolusi 10 m dari program Copernicus (ESA) yang diperbarui secara berkala, disajikan lewat layanan Esri. Pilih rentang waktu dan batas awan sesuai kebutuhan; di wilayah tropis scene bebas awan sering terbatas.\n\n' +
  'Peringatan deforestasi dan kehilangan tutupan pohon: Global Forest Watch (WRI), berbasis data GLAD, RADD, dan Hansen/UMD. Ini indikasi dari citra satelit dan belum diverifikasi lapangan.\n\n' +
  'Kualitas udara: prakiraan model CAMS dan angin 10 m melalui Open-Meteo. Ini hasil model, bukan pengukuran alat.\n\n' +
  'Tutupan lahan 10 m: Impact Observatory, Microsoft, dan Esri. Hasil klasifikasi otomatis, bukan peta resmi.';

export interface PetaSettings {
  judul: string; deskripsi: string; lon: number; lat: number; zoom: number; metodologi: string;
  f_sentinel: boolean; f_cloudless: boolean; f_tutupan: boolean; f_gfw: boolean; f_udara: boolean;
}
export const DEFAULT_SETTINGS: PetaSettings = {
  judul: 'Peta *ETTRS* Sumatra', deskripsi: 'Explore The Tropical Rainforest Sumatra', lon: 102.3, lat: -3.6, zoom: 6.4, metodologi: '',
  f_sentinel: true, f_cloudless: true, f_tutupan: true, f_gfw: true, f_udara: true,
};

export function buildCfg(s: PetaSettings, rows: Record<string, unknown>[]) {
  const layers = rows.filter((r) => r.aktif).map((r) => ({
    id: String(r.id), nama: r.nama, grup: r.grup,
    url: `/api/peta/data/${r.id}?v=${encodeURIComponent(String(r.updated_at))}`,
    tipe: r.tipe, n: r.n, bbox: r.bbox ? (r.bbox as unknown[]).map(Number) : null,
    warna: r.warna, gaya: r.gaya, opacity: Number(r.opacity), garis: Number(r.garis), ukuran: Number(r.ukuran),
    title: r.title_key || '', kolom: [], warna_oleh: r.warna_oleh || '', ket: r.ket, sumber: r.sumber, tgl: '', aktif: !!r.awal,
  }));
  return {
    nama: 'GPA Gendong Adventure', judul: s.judul, deskripsi: s.deskripsi, nav: [], logoPutih: false,
    pusat: [Number(s.lon), Number(s.lat)], zoom: Number(s.zoom), logo: '/assets/images/logo-gpa.png',
    hotspotUrl: '/api/peta/hotspot',
    fitur: { sentinel: +s.f_sentinel, cloudless: +s.f_cloudless, tutupan: +s.f_tutupan, gfw: +s.f_gfw, udara: +s.f_udara, hotspot: 0 },
    metodologi: s.metodologi || DEFAULT_METODOLOGI, layers,
  };
}

export function cleanStyle(b: Record<string, unknown>) {
  const o: Record<string, unknown> = {};
  if (typeof b.nama === 'string' && b.nama.trim()) o.nama = b.nama.trim().slice(0, 80);
  if (typeof b.grup === 'string' && b.grup.trim()) o.grup = b.grup.trim().slice(0, 40);
  if (typeof b.warna === 'string' && /^#[0-9a-f]{6}$/i.test(b.warna)) o.warna = b.warna;
  if (b.gaya === 'isi' || b.gaya === 'arsir' || b.gaya === 'garis') o.gaya = b.gaya;
  if (b.opacity !== undefined) o.opacity = Math.max(0, Math.min(1, Number(b.opacity) || 0.45));
  if (b.garis !== undefined) o.garis = Math.max(0.5, Math.min(8, Number(b.garis) || 1.6));
  if (b.ukuran !== undefined) o.ukuran = Math.max(2, Math.min(20, Number(b.ukuran) || 6));
  if (typeof b.ket === 'string') o.ket = b.ket.slice(0, 600);
  if (typeof b.sumber === 'string') o.sumber = b.sumber.slice(0, 120);
  if (typeof b.aktif === 'boolean') o.aktif = b.aktif;
  if (typeof b.awal === 'boolean') o.awal = b.awal;
  if (typeof b.sort_order === 'number') o.sort_order = Math.trunc(b.sort_order);
  if (typeof b.warna_oleh === 'string') o.warna_oleh = b.warna_oleh.slice(0, 60);
  return o;
}
