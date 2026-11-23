import { createServiceClient } from '@/lib/adminAuth';
import { buildCfg, DEFAULT_SETTINGS, PetaSettings } from '@/lib/peta';

export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export async function GET() {
  let settings: PetaSettings = DEFAULT_SETTINGS;
  let rows: Record<string, unknown>[] = [];
  try {
    const sb = createServiceClient();
    const [s, l] = await Promise.all([
      sb.from('peta_settings').select('*').eq('id', 1).maybeSingle(),
      sb.from('peta_layers').select('id,nama,grup,warna,gaya,opacity,garis,ukuran,ket,sumber,aktif,awal,sort_order,tipe,n,bbox,title_key,warna_oleh,updated_at').order('sort_order').order('created_at'),
    ]);
    if (s.data) settings = { ...DEFAULT_SETTINGS, ...(s.data as Partial<PetaSettings>) };
    rows = (l.data as Record<string, unknown>[]) || [];
  } catch {
    // Supabase tidak terjangkau: tetap tampilkan peta dasar.
  }
  const cfg = JSON.stringify(buildCfg(settings, rows)).replace(/</g, '\\u003c').replace(/&/g, '\\u0026');
  const title = esc(settings.judul.replace(/\*/g, ''));
  const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title} | GPA Gendong Adventure</title><meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800&family=Source+Serif+4:ital,wght@1,400;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/peta/maplibre-gl.css">
<link rel="stylesheet" href="/peta/peta.css?v=1">
</head><body class="embed">
<header id="top" hidden><div class="tin"><img id="brandlogo" alt="" hidden><nav id="nav"></nav><button type="button" id="navbtn"></button></div></header>
<div id="map" aria-label="Peta interaktif"></div>
<div id="dock">
  <section id="intro"><h1 id="ttl"></h1><p id="sub"></p><div id="stats"></div></section>
  <div id="bar">
    <button type="button" id="lbtn"><span>Lapisan</span></button>
    <div id="sbox"><input id="q" type="search" placeholder="Cari lokasi, kawasan, titik temuan…" autocomplete="off" aria-label="Cari"><div id="sres"></div></div>
  </div>
  <aside id="panel" aria-label="Lapisan peta">
    <div class="phead"><div><span class="eb sm"><i></i>Jelajahi data</span><h2>Lapisan peta</h2></div><button type="button" id="pclose" aria-label="Tutup"></button></div>
    <div class="seg"><button type="button" data-base="peta" class="on">Peta</button><button type="button" data-base="sat">Citra satelit</button></div>
    <div class="provs" id="provs"></div>
    <div id="pbody"></div>
    <div class="pfoot"><button type="button" data-met>Sumber data &amp; metodologi</button></div>
  </aside>
</div>
<section id="tl" aria-label="Linimasa kualitas udara">
  <div class="tlh"><button type="button" id="tlp" aria-label="Putar"></button><b id="tlt">PM2.5</b><span id="tlmsg"></span><span class="tlw">Panah = arah angin</span></div>
  <input type="range" id="tlr" min="0" max="0" value="0" aria-label="Waktu">
  <div class="scale"><i></i><div class="ticks"><span>0</span><span>15</span><span>35</span><span>55</span><span>100</span><span>150</span><span>250+</span></div></div>
  <p>µg/m³ · 55 = baku mutu harian PP 22/2021 · Prakiraan model CAMS &amp; angin 10 m via Open-Meteo, bukan alat ukur</p>
</section>
<button type="button" id="locate" aria-label="Lokasi saya" title="Lokasi saya"></button>
<div id="toast" class="toast" role="status"></div>
<div id="met" role="dialog" aria-modal="true" aria-label="Metodologi"><div class="mbox"><button type="button" id="metx" aria-label="Tutup"></button><span class="eb dark"><i></i>GPA Gendong Adventure / ETTRS</span><h2>Sumber data &amp; <em>metodologi</em></h2><div id="metbody"></div></div></div>
<div id="lbx" role="dialog" aria-label="Foto"><figure><img alt=""><figcaption></figcaption></figure></div>
<div id="spin"></div>
<script type="application/json" id="fgp-cfg">${cfg}</script>
<script src="/peta/maplibre-gl.js"></script>
<script src="/peta/peta.js?v=1"></script>
</body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
