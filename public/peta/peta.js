/* Peta ETTRS (Explore The Tropical Rainforest Sumatra): MapLibre GL + GeoJSON unggahan + Sentinel-2 terbaru + GFW + FIRMS + kualitas udara.
 * Konfigurasi dibaca dari <script type="application/json" id="fgp-cfg"> yang dibuat plugin (fg-peta.php). */
(function () {
  "use strict";
  var CFG = JSON.parse(document.getElementById("fgp-cfg").textContent);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- konstanta ---------- */
  var PROV = [
    { k: "jambi", n: "Jambi", bb: [101.1, -2.75, 104.55, -0.74], al: ["jambi"] },
    { k: "bengkulu", n: "Bengkulu", bb: [101.0, -4.95, 103.85, -2.28], al: ["bengkulu"] },
    { k: "sumbar", n: "Sumatera Barat", bb: [98.45, -3.35, 101.9, 0.92], al: ["sumatera barat", "sumatra barat", "sumbar"] },
    { k: "sumsel", n: "Sumatera Selatan", bb: [102.1, -4.95, 106.15, -1.62], al: ["sumatera selatan", "sumatra selatan", "sumsel"] }
  ];
  var BBOX_ALL = [98.4, -5.1, 106.3, 1.0];
  var PALETTE = ["#d1495b", "#edae49", "#00798c", "#6a4c93", "#2d6a4f", "#e07a5f", "#3d5a80", "#8d6a9f", "#c9a24b", "#4f772d", "#b5446e", "#1982c4"];
  var GROUPS = [
    ["Taman Nasional", "park"], ["Temuan Pemantauan", "pin"], ["Reforestasi", "tree"], ["Administrasi", "admin"], ["Perizinan", "doc"], ["Kawasan Hutan", "tree"],
    ["Tutupan Lahan", "land"], ["Deforestasi", "alert"], ["Hotspot", "fire"], ["Kualitas Udara", "wind"], ["Citra Satelit", "sat"], ["Sosial", "people"]
  ];
  var ICON = {
    park: '<path d="M12 3l5 8h-3l4 6H6l4-6H7z"/><path d="M12 17v4"/>', pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    admin: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0114 0"/>', doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    tree: '<path d="M12 3l5 7h-3l4 6H6l4-6H7z"/><path d="M12 16v5"/>', land: '<path d="M3 17l5-8 4 5 3-4 6 7z"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>',
    fire: '<path d="M12 3s5 4.5 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/>', wind: '<path d="M3 9h11a3 3 0 10-3-3M3 15h15a3 3 0 11-3 3M3 12h8"/>',
    sat: '<path d="M4 20l4-4M7 11l6 6M13 5l6 6-5 5-6-6z"/>', people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M17 11a3 3 0 100-6M21.5 20a5.5 5.5 0 00-4-5.3"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>', pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor"/>', chev: '<path d="M9 6l6 6-6 6"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };
  function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (ICON[n] || ICON.layers) + "</svg>"; }
  var TITLE_KEYS = ["judul", "title", "nama", "name", "nama_objek", "objek", "lokasi", "jenis", "kategori", "kawasan", "namobj", "remark"];
  var CAT_KEYS = ["jenis", "jenis_temuan", "kategori", "tipe", "type", "kelas", "status", "fungsi"];
  var DATE_KEYS = ["tanggal", "tgl", "date", "waktu", "tahun", "year"];
  var PROV_KEYS = ["provinsi", "province", "prov", "wadmpr", "nama_prov", "propinsi"];
  var FOTO_KEYS = ["foto", "gambar", "image", "photo", "img", "foto_url"];
  var LINK_KEYS = ["tautan", "url", "link", "sumber_url", "laporan"];

  /* ---------- peta ---------- */
  var S = { layers: {}, base: "peta", prov: "all", panelOpen: window.innerWidth > 820, builtin: {}, feats: [], aq: null, popup: null };
  var map = new maplibregl.Map({
    container: "map", style: "https://tiles.openfreemap.org/styles/positron", center: CFG.pusat || [101.7, -2.3], zoom: CFG.zoom || 7.2, maxZoom: 18, minZoom: 4,
    attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false
  });
  map.touchZoomRotate.disableRotation();
  window.FGPETA = { map: map, state: S };
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: "metric" }), "bottom-left");
  var attrib = new maplibregl.AttributionControl({ compact: true, customAttribution: "Sentinel-2 © ESA/Copernicus, Esri · GFW/UMD · NASA FIRMS · Open-Meteo/CAMS · © OpenFreeMap © OpenMapTiles Data from OpenStreetMap" });
  map.addControl(attrib, "bottom-right");
  setTimeout(function () { var a = document.querySelector(".maplibregl-ctrl-attrib"); if (a) { a.classList.remove("maplibregl-compact-show"); a.removeAttribute("open"); } }, 0);
  var firstSymbol = null, baseLayerIds = [];

  function toast(msg, bad) {
    var t = $("#toast"); t.textContent = msg; t.className = "toast on" + (bad ? " err" : "");
    clearTimeout(t._t); t._t = setTimeout(function () { t.className = "toast"; }, bad ? 6500 : 3500);
  }
  function setBusy(n) { document.body.classList.toggle("busy", n > 0); }

  map.on("load", function () {
    var st = map.getStyle();
    st.layers.forEach(function (l) { if (!firstSymbol && l.type === "symbol") firstSymbol = l.id; baseLayerIds.push(l); });
    try { map.setPaintProperty("background", "background-color", "#eef2ec"); } catch (e) {}
    try { map.setPaintProperty("water", "fill-color", "#cfe3dd"); } catch (e) {}
    addBasemapSat();
    addBuiltins();
    CFG.layers.forEach(addUserLayer);
    (function () { /* tampilan awal: muat seluruh data (kecuali batas administrasi) */
      var b = [180, 90, -180, -90], n = 0;
      CFG.layers.forEach(function (L) { if (L.grup === "Administrasi" || !L.bbox) return; n++; b = [Math.min(b[0], L.bbox[0]), Math.min(b[1], L.bbox[1]), Math.max(b[2], L.bbox[2]), Math.max(b[3], L.bbox[3])]; });
      if (n) map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: { top: 60, bottom: 60, left: window.innerWidth > 820 ? 400 : 30, right: 40 }, duration: 0, maxZoom: 12 });
    })();
    updateStats();
    buildPanel();
    buildSearchIndex();
    setPanel(S.panelOpen);
    wireMapEvents();
    applyProvince("all", true);
    setTimeout(function () { $("body").classList.add("ready"); }, 50);
  });
  map.on("error", function (e) {
    var id = e && e.sourceId || "";
    if (/^b-(s2|lc|gfw|loss|cl)$/.test(id) && !S._errShown) { S._errShown = 1; setTimeout(function () { S._errShown = 0; }, 15000); toast("Sebagian citra satelit gagal dimuat (layanan sedang sibuk atau di luar jangkauan data).", true); }
  });

  /* ---------- peta dasar & citra ---------- */
  function addBasemapSat() {
    map.addSource("sat", { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, maxzoom: 19, attribution: "Citra © Esri, Maxar, Earthstar Geographics" });
    map.addLayer({ id: "sat", type: "raster", source: "sat", layout: { visibility: "none" } }, baseLayerIds[0].id);
  }
  function setBase(b) {
    S.base = b;
    var sat = b === "sat";
    map.setLayoutProperty("sat", "visibility", sat ? "visible" : "none");
    baseLayerIds.forEach(function (l) {
      if (l.type === "symbol") return;
      map.setLayoutProperty(l.id, "visibility", sat ? "none" : "visible");
    });
    document.body.classList.toggle("sat", sat);
    document.querySelectorAll("[data-base]").forEach(function (b2) { b2.classList.toggle("on", b2.dataset.base === b); });
  }

  /* ---------- lapisan bawaan (data publik) ---------- */
  var LC_CLASSES = [
    ["#1A5BAB", "Air", "Sungai, danau, waduk, laut", 1, [26, 91, 171]],
    ["#358221", "Pohon", "Hutan dan tajuk pohon rapat, termasuk kebun pohon", 2, [53, 130, 33]],
    ["#87D19E", "Vegetasi tergenang", "Rawa, mangrove, sawah tergenang musiman", 4, [135, 209, 158]],
    ["#FFDB5C", "Pertanian", "Tanaman semusim, sawah, ladang", 5, [255, 219, 92]],
    ["#ED022A", "Terbangun", "Permukiman, jalan, bangunan", 7, [237, 2, 42]],
    ["#EDE9E4", "Lahan terbuka", "Tanah kosong, bekas bakar/tambang, pasir, batuan", 8, [237, 233, 228]],
    ["#F2FAFF", "Salju/es", "Es permanen (hampir tidak ada di Indonesia)", 9, [242, 250, 255]],
    ["#C8C8C8", "Awan", "Area tertutup awan sepanjang tahun, tidak terklasifikasi", 10, [200, 200, 200]],
    ["#C6AD8D", "Semak/padang", "Semak, padang rumput, vegetasi rendah", 11, [198, 173, 141]]
  ];
  function lcLegend(interactive) { var off = (S.builtin && S.builtin.lc && S.builtin.lc.opt.off) || []; return '<div class="leg lcl' + (interactive ? "" : " static") + '">' + LC_CLASSES.map(function (k) { return '<' + (interactive ? 'button type="button"' : "span") + ' class="lg' + (interactive && off.indexOf(k[3]) >= 0 ? " off" : "") + '"' + (interactive ? ' data-lc="' + k[3] + '"' : "") + '><i style="background:' + k[0] + '"></i><span><b>' + k[1] + "</b><small>" + k[2] + "</small></span></" + (interactive ? "button" : "span") + ">"; }).join("") + "</div>"; }
  var thisYear = new Date().getFullYear();
  function esriTiles(base, extra) { return base + "/exportImage?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=jpgpng&f=image&noData=0" + extra; }
  function s2Tiles() {
    var o = S.builtin.s2.opt, end = o.end ? new Date(o.end + "T23:59:59Z").getTime() : Date.now(), start = end - o.days * 864e5;
    var mr = { mosaicMethod: "esriMosaicAttribute", sortField: "cloudcover", ascending: true, mosaicOperation: "MT_FIRST", where: "cloudcover<=" + (o.cloud / 100).toFixed(2) };
    var rf = { rasterFunction: o.render };
    return [esriTiles("https://sentinel.arcgis.com/arcgis/rest/services/Sentinel2/ImageServer", "&time=" + start + "," + end + "&mosaicRule=" + encodeURIComponent(JSON.stringify(mr)) + "&renderingRule=" + encodeURIComponent(JSON.stringify(rf)))];
  }
  function lcTiles() {
    var o = S.builtin.lc.opt, y = o.year, on = LC_CLASSES.filter(function (k) { return o.off.indexOf(k[3]) < 0; });
    var rule = { rasterFunction: "Cartographic Renderer for Visualization and Analysis" };
    if (on.length < LC_CLASSES.length) rule = { rasterFunction: "Colormap", rasterFunctionArguments: { Colormap: on.map(function (k) { return [k[3]].concat(k[4]); }), Raster: { rasterFunction: "Remap", rasterFunctionArguments: { InputRanges: [].concat.apply([], on.map(function (k) { return [k[3], k[3] + 1]; })), OutputValues: on.map(function (k) { return k[3]; }), NoDataRanges: [] } } } };
    if (!on.length) rule = { rasterFunction: "Remap", rasterFunctionArguments: { InputRanges: [1, 2], OutputValues: [1], NoDataRanges: [1, 12] } };
    return [esriTiles("https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer", "&time=" + Date.UTC(y, 5, 1) + "," + Date.UTC(y, 5, 2) + "&renderingRule=" + encodeURIComponent(JSON.stringify(rule)))];
  }
  function gfwTiles() {
    var o = S.builtin.gfw.opt, iso = function (d) { return d.toISOString().slice(0, 10); }, now = new Date(), st = new Date(now.getTime() - o.days * 864e5);
    return ["https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/dynamic/{z}/{x}/{y}.png?start_date=" + iso(st) + "&end_date=" + iso(now) + "&render_type=true_color" + (o.conf === "high" ? "&alert_confidence=high" : "")];
  }
  var BUILTIN = [
    { id: "s2", nama: "Sentinel-2 terbaru (real-time)", grup: "Citra Satelit", on: false, fitur: "sentinel", minzoom: 10, ket: "Citra Sentinel-2 L2A (10 m) dari Copernicus/ESA via Esri, diperbarui harian. Dipilih scene paling sedikit berawan dalam rentang waktu yang Anda atur. Muncul mulai zoom 10.", opt: { days: 30, cloud: 100, end: "", render: "Natural Color with DRA" }, rasterMin: 10, tiles: s2Tiles, tileSize: 512 },
    { id: "cl", nama: "Sentinel-2 mosaik bebas awan 2024", grup: "Citra Satelit", on: false, fitur: "cloudless", ket: "Mosaik tahunan Sentinel-2 bebas awan (EOX s2cloudless). Bukan real-time; berguna sebagai latar yang bersih.", opt: {}, tiles: function () { return ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"]; }, tileSize: 256, maxzoom: 14, attrib: "Sentinel-2 cloudless © EOX (Copernicus)" },
    { id: "lc", nama: "Tutupan lahan 10 m", grup: "Tutupan Lahan", on: false, fitur: "tutupan", ket: "Klasifikasi tutupan lahan global 10 m dari Sentinel-2 (Impact Observatory, Microsoft, Esri), 2017-2025. Hasil model otomatis, bukan peta resmi.", opt: { year: thisYear - 1, off: [] }, tiles: lcTiles, tileSize: 512, legend: LC_CLASSES },
    { id: "gfw", nama: "Peringatan deforestasi (GFW)", grup: "Deforestasi", on: false, fitur: "gfw", ket: "Peringatan perubahan tutupan hutan terintegrasi (GLAD-L, GLAD-S2, RADD) dari Global Forest Watch. Indikasi dari citra satelit, belum terverifikasi lapangan.", opt: { days: 90, conf: "all" }, tiles: gfwTiles, tileSize: 256, maxzoom: 14, attrib: "Peringatan © Global Forest Watch / WRI" },
    { id: "loss", nama: "Kehilangan tutupan pohon tahunan", grup: "Deforestasi", on: false, fitur: "gfw", ket: "Kehilangan tutupan pohon per tahun 2001 sampai sekarang (Hansen/UMD via Global Forest Watch). Warna merah muda hingga merah menunjukkan tahun kehilangan.", opt: {}, tiles: function () { return ["https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/default/{z}/{x}/{y}.png"]; }, tileSize: 256, maxzoom: 12, attrib: "Tree cover loss © Hansen/UMD/Google/USGS/NASA via GFW" },
    { id: "hs", nama: "Hotspot VIIRS (NASA FIRMS)", grup: "Hotspot", on: false, fitur: "hotspot", ket: "Titik panas dari satelit VIIRS (Suomi NPP, NOAA-20, NOAA-21; resolusi 375 m). Indikasi kebakaran/panas, belum tentu api; belum terverifikasi lapangan.", opt: { days: 3, conf: "all" }, point: true },
    { id: "aq", nama: "PM2.5 dan angin (prakiraan)", grup: "Kualitas Udara", on: false, fitur: "udara", ket: "Prakiraan konsentrasi PM2.5 dari model CAMS dan angin 10 m via Open-Meteo. Ini hasil model, bukan pengukuran alat. Gunakan slider waktu di bawah peta.", opt: {}, aq: true }
  ];
  function addBuiltins() {
    BUILTIN.forEach(function (b) {
      if (CFG.fitur && CFG.fitur[b.fitur] === 0) return;
      S.builtin[b.id] = b;
      if (b.tiles) {
        map.addSource("b-" + b.id, { type: "raster", tiles: b.tiles(), tileSize: b.tileSize || 256, minzoom: b.rasterMin || 0, maxzoom: b.maxzoom || 22, attribution: b.attrib || "Citra Sentinel-2 modifikasi © Copernicus/ESA, diproses Esri" });
        map.addLayer({ id: "b-" + b.id, type: "raster", source: "b-" + b.id, minzoom: b.minzoom || 0, layout: { visibility: "none" }, paint: { "raster-opacity": 1, "raster-fade-duration": 150 } }, firstSymbol);
      }
      if (b.id === "hs") {
        map.addSource("b-hs", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "b-hs", type: "circle", source: "b-hs", layout: { visibility: "none" }, paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3.5, 12, 8], "circle-color": ["match", ["get", "conf"], "high", "#b30000", "nominal", "#ef4444", "#f6a35b"], "circle-stroke-color": "#fff", "circle-stroke-width": 1.2, "circle-opacity": 0.92 } });
      }
      if (b.id === "aq") {
        var c = BBOX_ALL;
        map.addSource("b-aq", { type: "image", url: transparentPng(), coordinates: [[c[0], c[3]], [c[2], c[3]], [c[2], c[1]], [c[0], c[1]]] });
        map.addLayer({ id: "b-aq", type: "raster", source: "b-aq", layout: { visibility: "none" }, paint: { "raster-opacity": 0.72, "raster-fade-duration": 0, "raster-resampling": "linear" } }, firstSymbol);
        map.addSource("b-wind", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addImage("arrow", arrowImage(), { pixelRatio: 2 });
        map.addLayer({ id: "b-wind", type: "symbol", source: "b-wind", layout: { visibility: "none", "icon-image": "arrow", "icon-rotate": ["get", "rot"], "icon-size": ["get", "sz"], "icon-allow-overlap": true, "icon-ignore-placement": true, "icon-rotation-alignment": "map" }, paint: { "icon-opacity": 0.92 } });
      }
    });
  }
  function transparentPng() { return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="; }
  function arrowImage() {
    var c = document.createElement("canvas"); c.width = 28; c.height = 28; var x = c.getContext("2d");
    x.translate(14, 14); x.fillStyle = "#16241d"; x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -11); x.lineTo(6, 8); x.lineTo(0, 4); x.lineTo(-6, 8); x.closePath(); x.stroke(); x.fill();
    return x.getImageData(0, 0, 28, 28);
  }
  function refreshBuiltin(id) {
    var b = S.builtin[id]; if (!b) return;
    if (b.tiles && map.getSource("b-" + id)) map.getSource("b-" + id).setTiles(b.tiles());
    if (id === "hs") loadHotspots();
    if (id === "s2") s2Info();
  }
  function toggleBuiltin(id, on) {
    var b = S.builtin[id]; b.on = on;
    var vis = on ? "visible" : "none";
    ["b-" + id].concat(id === "aq" ? ["b-wind"] : []).forEach(function (l) { if (map.getLayer(l)) map.setLayoutProperty(l, "visibility", vis); });
    if (id === "aq") { $("#tl").classList.toggle("on", on); if (on) loadAir(); }
    if (id === "hs" && on) loadHotspots();
    if (id === "s2" && on) { s2Info(); if (map.getZoom() < b.minzoom) toast("Zoom mendekat (zoom 10 ke atas) untuk melihat citra Sentinel-2."); }
  }

  /* info scene Sentinel-2 terbaik di tengah peta */
  var s2T;
  function s2Info() {
    clearTimeout(s2T);
    s2T = setTimeout(function () {
      var b = S.builtin.s2, el = $("#s2info"); if (!b || !b.on || !el) return;
      var o = b.opt, end = o.end ? new Date(o.end + "T23:59:59Z").getTime() : Date.now(), st = end - o.days * 864e5, c = map.getCenter();
      var base = "https://sentinel.arcgis.com/arcgis/rest/services/Sentinel2/ImageServer/query?f=json&geometry=" + encodeURIComponent(JSON.stringify({ x: c.lng, y: c.lat, spatialReference: { wkid: 4326 } })) + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=acquisitiondate,cloudcover&returnGeometry=false&resultRecordCount=1&time=" + st + "," + end;
      function q(order) { return fetch(base + "&where=" + encodeURIComponent("cloudcover<=" + (o.cloud / 100).toFixed(2)) + "&orderByFields=" + encodeURIComponent(order)).then(function (r) { return r.json(); }).then(function (j) { return j.features && j.features[0] && j.features[0].attributes; }); }
      Promise.all([q("acquisitiondate DESC"), q("cloudcover ASC")]).then(function (r) {
        var nw = r[0], bs = r[1];
        el.innerHTML = nw ? "Scene terbaru di tengah peta: <b>" + fmtDate(nw.acquisitiondate) + "</b> (awan " + Math.round(nw.cloudcover * 100) + "%)" + (bs && bs.acquisitiondate !== nw.acquisitiondate ? "<br>Paling bersih: <b>" + fmtDate(bs.acquisitiondate) + "</b> (awan " + Math.round(bs.cloudcover * 100) + "%)" : "") : "Tidak ada scene dengan awan ≤ " + o.cloud + "% dalam " + o.days + " hari terakhir di titik ini. Longgarkan batas awan atau perpanjang rentang hari.";
      }).catch(function () { el.textContent = ""; });
    }, 500);
  }
  function fmtDate(ms) { return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }); }

  /* ---------- hotspot (proxy FIRMS di server) ---------- */
  function loadHotspots() {
    var o = S.builtin.hs.opt; setBusy(1);
    fetch(CFG.hotspotUrl + (CFG.hotspotUrl.indexOf("?") > -1 ? "&" : "?") + "hari=" + o.days, { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (j) {
      setBusy(0);
      if (j.error) { toast("Hotspot: " + j.error, true); $("#hsinfo") && ($("#hsinfo").textContent = j.error); return; }
      var feats = (j.features || []).filter(function (f) { return o.conf === "all" || f.properties.conf === o.conf || (o.conf === "nominal" && f.properties.conf === "high"); });
      map.getSource("b-hs").setData({ type: "FeatureCollection", features: feats });
      var el = $("#hsinfo"); if (el) el.textContent = feats.length + " titik dalam " + o.days + " hari terakhir" + (j.cached ? " (cache " + j.cached + ")" : "");
    }).catch(function () { setBusy(0); toast("Gagal mengambil data hotspot.", true); });
  }

  /* ---------- kualitas udara & angin (Open-Meteo) ---------- */
  var AQ = { step: 0.7, hours: [], pm: null, ws: null, wd: null, lons: [], lats: [], idx: 0, timer: null, canvas: null };
  var AQ_COLORS = [[0, [0, 176, 107]], [15, [160, 214, 60]], [35, [245, 214, 40]], [55, [243, 140, 40]], [100, [229, 62, 48]], [150, [140, 60, 170]], [250, [110, 20, 70]]];
  function aqColor(v) {
    if (v <= AQ_COLORS[0][0]) return AQ_COLORS[0][1];
    for (var i = 1; i < AQ_COLORS.length; i++) {
      if (v <= AQ_COLORS[i][0]) { var a = AQ_COLORS[i - 1], b = AQ_COLORS[i], t = (v - a[0]) / (b[0] - a[0]); return [0, 1, 2].map(function (k) { return Math.round(a[1][k] + (b[1][k] - a[1][k]) * t); }); }
    }
    return AQ_COLORS[AQ_COLORS.length - 1][1];
  }
  function loadAir() {
    if (AQ.pm) { drawAir(); return; }
    var ck = null; try { ck = JSON.parse(sessionStorage.getItem("fgp_aq")); } catch (e) {}
    if (ck && Date.now() - ck.t < 30 * 60 * 1000) { Object.assign(AQ, ck.d); initTimeline(); return; }
    var b = BBOX_ALL, lons = [], lats = [], x, y;
    for (y = b[1]; y <= b[3] + 1e-6; y += AQ.step) lats.push(+y.toFixed(3));
    for (x = b[0]; x <= b[2] + 1e-6; x += AQ.step) lons.push(+x.toFixed(3));
    var LA = [], LO = []; lats.forEach(function (la) { lons.forEach(function (lo) { LA.push(la); LO.push(lo); }); });
    setBusy(1); $("#tlmsg").textContent = "Memuat prakiraan…";
    var q = "latitude=" + LA.join(",") + "&longitude=" + LO.join(",") + "&timezone=Asia%2FJakarta&past_days=1&forecast_days=3";
    function get(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }); }
    // dipecah per 60 titik agar URL tidak terlalu panjang
    var chunks = [], i;
    for (i = 0; i < LA.length; i += 60) chunks.push([LA.slice(i, i + 60), LO.slice(i, i + 60)]);
    var pmAll = [], wAll = [];
    Promise.all(chunks.map(function (c) {
      var qq = "latitude=" + c[0].join(",") + "&longitude=" + c[1].join(",") + "&timezone=Asia%2FJakarta&past_days=1&forecast_days=3";
      return Promise.all([get("https://air-quality-api.open-meteo.com/v1/air-quality?" + qq + "&hourly=pm2_5"), get("https://api.open-meteo.com/v1/forecast?" + qq + "&hourly=wind_speed_10m,wind_direction_10m")]);
    })).then(function (res) {
      res.forEach(function (r) { [].push.apply(pmAll, [].concat(r[0])); [].push.apply(wAll, [].concat(r[1])); });
      var hours = pmAll[0].hourly.time;
      AQ.hours = hours; AQ.lons = lons; AQ.lats = lats;
      AQ.pm = pmAll.map(function (p) { return p.hourly.pm2_5; });
      AQ.ws = wAll.map(function (p) { return p.hourly.wind_speed_10m; });
      AQ.wd = wAll.map(function (p) { return p.hourly.wind_direction_10m; });
      try { sessionStorage.setItem("fgp_aq", JSON.stringify({ t: Date.now(), d: { hours: AQ.hours, lons: AQ.lons, lats: AQ.lats, pm: AQ.pm, ws: AQ.ws, wd: AQ.wd } })); } catch (e) {}
      setBusy(0); initTimeline();
    }).catch(function (e) { setBusy(0); $("#tlmsg").textContent = "Gagal memuat prakiraan udara."; toast("Gagal memuat kualitas udara (Open-Meteo).", true); });
  }
  function initTimeline() {
    var sl = $("#tlr"); sl.max = AQ.hours.length - 1;
    var nowIso = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 13) + ":00"; // jam sekarang WIB
    var k = AQ.hours.indexOf(nowIso); AQ.idx = k < 0 ? Math.min(24, AQ.hours.length - 1) : k; sl.value = AQ.idx;
    $("#tlmsg").textContent = ""; drawAir();
  }
  function drawAir() {
    if (!AQ.pm) return;
    var i = AQ.idx, W = 300, b = BBOX_ALL, lons = AQ.lons, lats = AQ.lats, nx = lons.length, ny = lats.length;
    var merc = function (la) { return Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360)); }, inv = function (y) { return (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI; };
    var y0 = merc(b[3]), y1 = merc(b[1]), H = Math.round(W * (y0 - y1) / ((b[2] - b[0]) * Math.PI / 180));
    var c = AQ.canvas || (AQ.canvas = document.createElement("canvas")); c.width = W; c.height = H;
    var cx = c.getContext("2d"), img = cx.createImageData(W, H), d = img.data;
    function val(ix, iy) { var v = AQ.pm[iy * nx + ix][i]; return v == null ? 0 : v; }
    for (var py = 0; py < H; py++) {
      var lat = inv(y0 + (y1 - y0) * (py + 0.5) / H), fy = (lat - lats[0]) / AQ.step; fy = Math.max(0, Math.min(ny - 1.001, fy));
      var iy = Math.floor(fy), ty = fy - iy;
      for (var px = 0; px < W; px++) {
        var lon = b[0] + (b[2] - b[0]) * (px + 0.5) / W, fx = (lon - lons[0]) / AQ.step; fx = Math.max(0, Math.min(nx - 1.001, fx));
        var ix = Math.floor(fx), tx = fx - ix;
        var v = (val(ix, iy) * (1 - tx) + val(ix + 1, iy) * tx) * (1 - ty) + (val(ix, iy + 1) * (1 - tx) + val(ix + 1, iy + 1) * tx) * ty;
        var col = aqColor(v), o = (py * W + px) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    cx.putImageData(img, 0, 0);
    map.getSource("b-aq").updateImage({ url: c.toDataURL("image/png"), coordinates: [[b[0], b[3]], [b[2], b[3]], [b[2], b[1]], [b[0], b[1]]] });
    // angin
    var wf = [], gx = Math.max(1, Math.round(1.4 / AQ.step));
    for (var yy = 0; yy < ny; yy += 1) for (var xx = 0; xx < nx; xx += 1) {
      if ((xx + yy) % 2) continue;
      var k = yy * nx + xx, sp = AQ.ws[k][i], dr = AQ.wd[k][i]; if (sp == null || dr == null) continue;
      wf.push({ type: "Feature", properties: { rot: (dr + 180) % 360, sz: Math.max(0.7, Math.min(1.35, 0.7 + sp / 30)), v: Math.round(sp) }, geometry: { type: "Point", coordinates: [lons[xx], lats[yy]] } });
    }
    map.getSource("b-wind").setData({ type: "FeatureCollection", features: wf });
    var t = new Date(AQ.hours[i] + ":00+07:00");
    $("#tlt").textContent = "PM2.5 · " + t.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jakarta" }) + " · " + t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta", hour12: false }).replace(":", ".") + " WIB";
  }
  function tlPlay(on) {
    clearInterval(AQ.timer); $("#tlp").innerHTML = ic(on ? "pause" : "play"); AQ.playing = on;
    if (on) AQ.timer = setInterval(function () { AQ.idx = (AQ.idx + 1) % AQ.hours.length; $("#tlr").value = AQ.idx; drawAir(); }, 550);
  }

  /* ---------- lapisan pengguna (GeoJSON unggahan) ---------- */
  function hatchImage(color) {
    var c = document.createElement("canvas"); c.width = 16; c.height = 16; var x = c.getContext("2d");
    x.strokeStyle = color; x.lineWidth = 2; x.globalAlpha = 0.9; x.beginPath(); x.moveTo(-2, 18); x.lineTo(18, -2); x.moveTo(-2, 10); x.lineTo(10, -2); x.moveTo(6, 18); x.lineTo(18, 6); x.stroke();
    return x.getImageData(0, 0, 16, 16);
  }
  function detectKey(feats, keys) {
    var seen = {}; for (var i = 0; i < Math.min(feats.length, 60); i++) { var p = feats[i].properties || {}; for (var k in p) seen[k.toLowerCase()] = k; }
    for (var j = 0; j < keys.length; j++) if (seen[keys[j]]) return seen[keys[j]];
    return "";
  }
  function addUserLayer(L) {
    var rec = { cfg: L, id: L.id, on: L.aktif !== false && L.aktif !== 0 && L.on !== false, feats: [], loaded: false, cats: [], catOff: {}, year: "", cat: L.warna_oleh || "", provKey: "", dateKey: "", years: [] };
    S.layers[L.id] = rec;
    map.addSource("u-" + L.id, { type: "geojson", data: { type: "FeatureCollection", features: [] }, promoteId: undefined });
    var vis = rec.on ? "visible" : "none", tipe = L.tipe || ["polygon", "line", "point"], color = L.warna || "#2d6a4f";
    var colorExpr = color;
    rec.colorExpr = function () { return rec._colorExpr || color; };
    var op = L.opacity == null ? 0.45 : L.opacity;
    if (tipe.indexOf("polygon") > -1) {
      if (L.gaya === "arsir") {
        var key = "hatch-" + L.id; map.addImage(key, hatchImage(color), { pixelRatio: 2 });
        map.addLayer({ id: "u-" + L.id + "-fill", type: "fill", source: "u-" + L.id, layout: { visibility: vis }, paint: { "fill-pattern": key, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, Math.min(1, op + 0.35), 12, 0.3] }, filter: ["==", ["geometry-type"], "Polygon"] }, firstSymbol);
      } else if (L.gaya !== "garis") {
        map.addLayer({ id: "u-" + L.id + "-fill", type: "fill", source: "u-" + L.id, layout: { visibility: vis }, paint: { "fill-color": color, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, op, 13, op * 0.45] }, filter: ["==", ["geometry-type"], "Polygon"] }, firstSymbol);
      }
    }
    if (tipe.indexOf("polygon") > -1 || tipe.indexOf("line") > -1) {
      map.addLayer({ id: "u-" + L.id + "-line", type: "line", source: "u-" + L.id, layout: { visibility: vis, "line-join": "round", "line-cap": "round" }, paint: { "line-color": color, "line-width": ["interpolate", ["linear"], ["zoom"], 5, (L.garis || 1.6) * 0.7, 12, (L.garis || 1.6) * 1.8], "line-opacity": 0.95 }, filter: ["!=", ["geometry-type"], "Point"] }, firstSymbol);
    }
    if (tipe.indexOf("point") > -1) {
      var r = L.ukuran || 6;
      map.addLayer({ id: "u-" + L.id + "-pt", type: "circle", source: "u-" + L.id, layout: { visibility: vis }, paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, r * 0.6, 10, r, 15, r * 1.6], "circle-color": color, "circle-stroke-color": "#fff", "circle-stroke-width": 1.6, "circle-opacity": 0.95 }, filter: ["==", ["geometry-type"], "Point"] });
    }
    // muat data
    setBusy(1);
    fetch(L.url).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (gj) {
      rec.feats = gj.features || []; rec.loaded = true; setBusy(0);
      /* Foto (data:image) bisa berukuran ratusan KB per titik. Jika ikut di tile peta, setiap tile membawa semuanya dan peta menjadi berat.
         Simpan terpisah, tampilkan lagi hanya saat popup dibuka. */
      rec.heavy = {};
      rec.feats.forEach(function (f, i) {
        var q = f.properties; if (!q) return; var hv = null;
        for (var k in q) { if (typeof q[k] === "string" && q[k].length > 1500) { (hv = hv || {})[k] = q[k]; delete q[k]; } }
        if (hv) { rec.heavy[i] = hv; q._i = i; q._h = 1; }
      });
      rec.provKey = detectKey(rec.feats, PROV_KEYS); rec.dateKey = detectKey(rec.feats, DATE_KEYS);
      if (!rec.cat) rec.cat = detectKey(rec.feats, CAT_KEYS) && L.auto_kategori !== false ? detectKey(rec.feats, CAT_KEYS) : "";
      buildCategories(rec); buildYears(rec);
      map.getSource("u-" + L.id).setData(gj);
      applyFilters(rec); refreshPanelRow(rec); buildSearchIndex(rec);
    }).catch(function (e) { setBusy(0); toast("Lapisan \"" + L.nama + "\" gagal dimuat.", true); });
  }
  function buildCategories(rec) {
    rec.cats = []; if (!rec.cat) return;
    var cnt = {}; rec.feats.forEach(function (f) { var v = f.properties && f.properties[rec.cat]; if (v == null || v === "") v = "(tanpa kategori)"; v = String(v); cnt[v] = (cnt[v] || 0) + 1; });
    var keys = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
    if (keys.length < 2 || keys.length > 24) { rec.cat = ""; return; }
    var over = rec.cfg.warna_kat || {};
    var sc = {}; rec.feats.forEach(function (f) { var q = f.properties || {}, v = q[rec.cat]; v = (v == null || v === "") ? "(tanpa kategori)" : String(v); if (!sc[v] && /^#[0-9a-f]{6}$/i.test(q._warna || "")) sc[v] = q._warna; });
    rec.cats = keys.map(function (k, i) { return { v: k, n: cnt[k], c: over[k] || sc[k] || PALETTE[i % PALETTE.length] }; });
    var m = ["match", ["to-string", ["coalesce", ["get", rec.cat], "(tanpa kategori)"]]]; rec.cats.forEach(function (c) { m.push(c.v, c.c); }); m.push(rec.cfg.warna || "#2d6a4f");
    ["-fill", "-line", "-pt"].forEach(function (s) {
      var id = "u-" + rec.id + s; if (!map.getLayer(id)) return;
      if (s === "-fill") { if (rec.cfg.gaya === "arsir") return; map.setPaintProperty(id, "fill-color", m); }
      if (s === "-line") map.setPaintProperty(id, "line-color", m);
      if (s === "-pt") map.setPaintProperty(id, "circle-color", m);
    });
  }
  function buildYears(rec) {
    rec.years = []; if (!rec.dateKey) return; var set = {};
    rec.feats.forEach(function (f) { var v = f.properties && f.properties[rec.dateKey]; if (v == null) return; var y = String(v).slice(0, 4); if (/^(19|20)\d\d$/.test(y)) set[y] = 1; });
    rec.years = Object.keys(set).sort().reverse(); if (rec.years.length < 2) rec.years = [];
  }
  function provExpr(rec) {
    if (S.prov === "all" || !rec.provKey) return null;
    var p = PROV.filter(function (x) { return x.k === S.prov; })[0];
    var v = ["downcase", ["to-string", ["get", rec.provKey]]];
    return ["any", ["!", ["has", rec.provKey]]].concat(p.al.map(function (a) { return ["in", a, v]; }));
  }
  function applyFilters(rec) {
    var f = ["all"], pe = provExpr(rec); if (pe) f.push(pe);
    if (rec.year && rec.dateKey) f.push(["==", ["slice", ["to-string", ["get", rec.dateKey]], 0, 4], rec.year]);
    var off = Object.keys(rec.catOff).filter(function (k) { return rec.catOff[k]; });
    if (off.length && rec.cat) f.push(["!", ["in", ["to-string", ["coalesce", ["get", rec.cat], "(tanpa kategori)"]], ["literal", off]]]);
    var geo = { "-fill": ["==", ["geometry-type"], "Polygon"], "-line": ["!=", ["geometry-type"], "Point"], "-pt": ["==", ["geometry-type"], "Point"] };
    ["-fill", "-line", "-pt"].forEach(function (s) { var id = "u-" + rec.id + s; if (map.getLayer(id)) map.setFilter(id, f.length > 1 ? ["all", geo[s], f] : geo[s]); });
  }
  function setUserVisible(rec, on) {
    rec.on = on; ["-fill", "-line", "-pt"].forEach(function (s) { var id = "u-" + rec.id + s; if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); });
  }
  function bboxOfFeats(feats) {
    var b = [180, 90, -180, -90];
    function walk(c) { if (typeof c[0] === "number") { if (c[0] < b[0]) b[0] = c[0]; if (c[1] < b[1]) b[1] = c[1]; if (c[0] > b[2]) b[2] = c[0]; if (c[1] > b[3]) b[3] = c[1]; } else for (var i = 0; i < c.length; i++) walk(c[i]); }
    walk(feats.map(function (f) { return f.geometry ? f.geometry.coordinates : []; }));
    return b[0] > b[2] ? null : b;
  }
  function zoomToRec(rec) {
    var b = rec.cfg.bbox || bboxOfFeats(rec.feats); if (!b) return;
    if (b[0] === b[2] && b[1] === b[3]) map.flyTo({ center: [b[0], b[1]], zoom: 13 }); else map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: { top: 60, bottom: 60, left: window.innerWidth > 820 ? 400 : 30, right: 40 }, maxZoom: 13, duration: 900 });
  }

  /* ---------- provinsi ---------- */
  function applyProvince(k, silent) {
    S.prov = k;
    Object.keys(S.layers).forEach(function (id) { if (S.layers[id].loaded) applyFilters(S.layers[id]); });
    document.querySelectorAll("[data-prov]").forEach(function (b) { b.classList.toggle("on", b.dataset.prov === k); });
    if (silent) return;
    var bb = k === "all" ? BBOX_ALL : PROV.filter(function (p) { return p.k === k; })[0].bb;
    map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: { top: 60, bottom: 60, left: window.innerWidth > 820 ? 400 : 20, right: 20 }, duration: 900 });
  }

  /* ---------- popup ---------- */
  function humanize(k) { return String(k).replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().replace(/^./, function (c) { return c.toUpperCase(); }).replace(/\btnks\b/gi, "TNKS").replace(/\bglad\b/gi, "GLAD").replace(/\bmdpl\b/gi, "mdpl").replace(/\bdas\b/gi, "DAS").replace(/\bha$/i, "(ha)"); }
  function pick(p, keys) { var low = {}; for (var k in p) low[k.toLowerCase()] = k; for (var i = 0; i < keys.length; i++) if (low[keys[i]] && p[low[keys[i]]] !== "" && p[low[keys[i]]] != null) return low[keys[i]]; return ""; }
  function fmtVal(k, v) {
    if (v == null || v === "") return "";
    if (typeof v === "object") return esc(JSON.stringify(v));
    var s = String(v);
    if (/^https?:\/\/\S+$/i.test(s)) return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(s) ? '<a href="' + esc(s) + '" target="_blank" rel="noopener"><img class="pimg" loading="lazy" src="' + esc(s) + '" alt=""></a>' : '<a href="' + esc(s) + '" target="_blank" rel="noopener">Buka tautan ↗</a>';
    if (/^\d{4}-\d{2}$/.test(s) && /tanggal|tgl|date|waktu/i.test(k)) { var d2 = new Date(s + "-01T00:00:00Z"); if (!isNaN(d2)) return d2.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }); }
    if (/^\d{4}-\d{2}-\d{2}/.test(s) && /tanggal|tgl|date|waktu/i.test(k)) { var d = new Date(s.slice(0, 10) + "T00:00:00Z"); if (!isNaN(d)) return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); }
    if (typeof v === "number" && !/^(id|kode|no|tahun|year)/i.test(k)) return esc(new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(v));
    return esc(s);
  }
  var IMG_OK = /^(https?:\/\/\S+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+)$/i, PHOTO_RE = /^(foto|gambar|image|photo|img)(_?\d+)?$/i;
  function photoKeys(p) {
    return Object.keys(p).filter(function (k) { return PHOTO_RE.test(k) && typeof p[k] === "string" && IMG_OK.test(p[k]); }).sort(function (a, b) { return (parseInt(a.replace(/\D/g, ""), 10) || 1) - (parseInt(b.replace(/\D/g, ""), 10) || 1); });
  }
  function gallery(p, ks) {
    if (!ks.length) return "";
    var cap = function (k) { return p[k + "_ket"] != null ? String(p[k + "_ket"]) : ""; };
    var h = '<div class="gal"><img class="pphoto" src="' + esc(p[ks[0]]) + '" alt="' + esc(cap(ks[0])) + '"><div class="gcap">' + esc(cap(ks[0])) + "</div>";
    if (ks.length > 1) { h += '<div class="gth">'; ks.forEach(function (k, i) { h += '<button type="button" class="' + (i ? "" : "on") + '" data-cap="' + esc(cap(k)) + '"><img src="' + esc(p[k]) + '" alt=""></button>'; }); h += "</div>"; }
    return h + "</div>";
  }
  function featCard(rec, f) {
    var p = f.properties || {}; if (p._h && rec.heavy && rec.heavy[p._i]) p = Object.assign({}, p, rec.heavy[p._i]);
    var cfg = rec.cfg, tk = cfg.title && p[cfg.title] != null ? cfg.title : pick(p, TITLE_KEYS);
    var title = tk ? String(p[tk]) : cfg.nama, cat = rec.cat && p[rec.cat] != null ? String(p[rec.cat]) : "", col = "";
    rec.cats.forEach(function (c) { if (c.v === cat) col = c.c; });
    var cols = (cfg.kolom && cfg.kolom.length) ? cfg.kolom : Object.keys(p);
    var pks = photoKeys(p), rows = "", photo = gallery(p, pks);
    cols.forEach(function (k) {
      if (k === tk || pks.indexOf(k) > -1 || /_ket$/i.test(k) && PHOTO_RE.test(k.replace(/_ket$/i, "")) || k.charAt(0) === "_" || k === rec.cat) return; var v = fmtVal(k, p[k]); if (!v) return;
      rows += "<tr><th>" + esc(cfg.label && cfg.label[k] ? cfg.label[k] : humanize(k)) + "</th><td>" + v + "</td></tr>";
    });
    return '<div class="pc"><div class="pl">' + esc(cfg.nama) + '</div><h4>' + esc(title) + "</h4>" + (cat ? '<span class="chip" style="background:' + esc(col || cfg.warna) + '">' + esc(cat) + "</span>" : "") + photo + (rows ? "<table>" + rows + "</table>" : "") + "</div>";
  }
  function showPopup(lngLat, cards) {
    if (S.popup) S.popup.remove();
    var html = '<div class="pstack">' + cards.join("") + "</div>";
    S.popup = new maplibregl.Popup({ maxWidth: "340px", closeButton: true, offset: 8, className: "fgpop" }).setLngLat(lngLat).setHTML(html).addTo(map);
    requestAnimationFrame(function () {
      var el = S.popup && S.popup.getElement(); if (!el) return;
      var r = el.getBoundingClientRect(), top = (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hh"), 10) || 70) + 12, bot = innerHeight - 12, dy = 0;
      if (r.bottom > bot) dy = Math.min(r.bottom - bot, Math.max(0, r.top - top)); else if (r.top < top) dy = r.top - top;
      if (dy) map.panBy([0, dy], { duration: 300 });
    });
  }
  function wireMapEvents() {
    function interactive() { var ids = []; Object.keys(S.layers).forEach(function (k) { if (S.layers[k].on) ["-pt", "-line", "-fill"].forEach(function (s) { var id = "u-" + k + s; if (map.getLayer(id)) ids.push(id); }); }); if (S.builtin.hs && S.builtin.hs.on) ids.unshift("b-hs"); return ids; }
    map.on("click", function (e) {
      var ids = interactive(); if (!ids.length) return;
      var r = 6, fs = map.queryRenderedFeatures([[e.point.x - r, e.point.y - r], [e.point.x + r, e.point.y + r]], { layers: ids });
      if (!fs.length) return;
      /* titik temuan tampil lebih dulu, lalu garis, terakhir poligon (batas kawasan) */
      function rank(f) { var l = f.layer.id; return /-pt$|^b-hs$/.test(l) ? 0 : /-line$/.test(l) ? 1 : 2; }
      fs = fs.map(function (f, i) { return { f: f, i: i }; }).sort(function (a, b) { return rank(a.f) - rank(b.f) || a.i - b.i; }).map(function (o) { return o.f; });
      var seen = {}, cards = [];
      fs.forEach(function (f) {
        var lid = f.layer.id; if (cards.length >= 4) return;
        if (lid === "b-hs") { var key = "hs" + f.properties.id; if (seen[key]) return; seen[key] = 1; cards.push(hotspotCard(f.properties)); return; }
        var rec = S.layers[lid.replace(/^u-/, "").replace(/-(pt|line|fill)$/, "")]; if (!rec) return;
        var sig = rec.id + JSON.stringify(f.properties).slice(0, 200); if (seen[sig]) return; seen[sig] = 1; cards.push(featCard(rec, { properties: f.properties }));
      });
      if (cards.length) showPopup(e.lngLat, cards);
    });
    map.on("mousemove", function (e) {
      var ids = interactive(); if (!ids.length) { map.getCanvas().style.cursor = ""; return; }
      map.getCanvas().style.cursor = map.queryRenderedFeatures(e.point, { layers: ids }).length ? "pointer" : "";
    });
    map.on("moveend", function () { if (S.builtin.s2 && S.builtin.s2.on) s2Info(); });
    map.on("zoomend", function () { var s2 = S.builtin.s2; if (s2 && s2.on) $("#s2zoom") && $("#s2zoom").classList.toggle("warn", map.getZoom() < s2.minzoom); });
  }
  function hotspotCard(p) {
    var conf = { high: "Tinggi", nominal: "Sedang", low: "Rendah" }[p.conf] || p.conf;
    return '<div class="pc"><div class="pl">Hotspot VIIRS (NASA FIRMS)</div><h4>' + esc(p.tgl || "") + " " + esc(p.jam || "") + " UTC</h4><span class=\"chip\" style=\"background:#ef4444\">Kepercayaan " + esc(conf) + "</span><table><tr><th>Satelit</th><td>" + esc(p.sat || "-") + "</td></tr><tr><th>Daya radiatif (FRP)</th><td>" + esc(p.frp == null ? "-" : p.frp + " MW") + "</td></tr><tr><th>Siang/malam</th><td>" + (p.dn === "D" ? "Siang" : p.dn === "N" ? "Malam" : "-") + "</td></tr></table><div class=\"pn\">Indikasi titik panas, belum terverifikasi lapangan.</div></div>";
  }

  /* ---------- pencarian ---------- */
  function buildSearchIndex(rec) {
    S.feats = S.feats.filter(function (x) { return !rec || x.rid !== rec.id; });
    var recs = rec ? [rec] : Object.keys(S.layers).map(function (k) { return S.layers[k]; });
    recs.forEach(function (r) {
      r.feats.forEach(function (f) {
        var p = f.properties || {}, tk = r.cfg.title && p[r.cfg.title] != null ? r.cfg.title : pick(p, TITLE_KEYS), name = tk ? String(p[tk]) : "";
        var extra = []; for (var k in p) { if (typeof p[k] === "string" && k !== tk && extra.length < 14 && p[k].length < 120 && !/^https?:/.test(p[k])) extra.push(p[k]); }
        if (!name && !extra.length) return;
        S.feats.push({ rid: r.id, f: f, name: name || extra[0], sub: r.cfg.nama, hay: (name + " " + extra.join(" ")).toLowerCase() });
      });
    });
  }
  function centerOf(f) {
    var g = f.geometry; if (!g) return null; if (g.type === "Point") return g.coordinates;
    var b = bboxOfFeats([f]); return b ? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] : null;
  }
  function doSearch(q) {
    var box = $("#sres"); q = q.trim().toLowerCase();
    if (q.length < 2) { box.innerHTML = ""; box.classList.remove("on"); return; }
    var hits = S.feats.filter(function (x) { return x.hay.indexOf(q) > -1; }).slice(0, 12);
    box.innerHTML = hits.length ? hits.map(function (h, i) { return '<button type="button" data-i="' + S.feats.indexOf(h) + '"><b>' + esc(h.name) + "</b><small>" + esc(h.sub) + "</small></button>"; }).join("") : '<div class="none">Tidak ada hasil. Pencarian mencakup nama pada data GeoJSON yang diunggah.</div>';
    box.classList.add("on");
  }
  function gotoFeat(h) {
    var rec = S.layers[h.rid]; if (rec && !rec.on) { setUserVisible(rec, true); refreshPanelRow(rec); }
    var b = bboxOfFeats([h.f]), c = centerOf(h.f);
    if (b && b[0] !== b[2]) map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 80, maxZoom: 14, duration: 900 }); else if (c) map.flyTo({ center: c, zoom: 14, duration: 900 });
    if (c) setTimeout(function () { showPopup(c, [featCard(rec, h.f)]); }, 950);
  }

  /* ---------- panel lapisan ---------- */
  function allRows() {
    var rows = [];
    Object.keys(S.layers).forEach(function (k) { rows.push({ kind: "u", rec: S.layers[k], grup: S.layers[k].cfg.grup || "Lainnya" }); });
    Object.keys(S.builtin).forEach(function (k) { rows.push({ kind: "b", b: S.builtin[k], grup: S.builtin[k].grup }); });
    return rows;
  }
  function setPanel(on) { $("#panel").classList.toggle("open", on); document.body.classList.toggle("panelopen", on); }
  function buildPanel() {
    var p = $("#pbody"), rows = allRows(), html = "";
    var order = GROUPS.map(function (g) { return g[0]; }); rows.forEach(function (r) { if (order.indexOf(r.grup) < 0) order.push(r.grup); });
    order.forEach(function (g) {
      var rr = rows.filter(function (r) { return r.grup === g; }); if (!rr.length) return;
      var icon = (GROUPS.filter(function (x) { return x[0] === g; })[0] || [0, "layers"])[1];
      var open = rr.some(function (r) { return r.kind === "u" ? r.rec.on : false }) || g === "Temuan Pemantauan" || g === "Taman Nasional";
      html += '<section class="grp' + (open ? " open" : "") + '" data-g="' + esc(g) + '"><button type="button" class="gh">' + ic("chev") + '<span class="gi">' + ic(icon) + "</span><b>" + esc(g.toUpperCase()) + '</b><em class="gc"></em></button><div class="gb">';
      rr.forEach(function (r) { html += rowHtml(r); });
      html += "</div></section>";
    });
    p.innerHTML = html || '<div class="empty">Belum ada lapisan. Unggah GeoJSON di panel admin.</div>';
    updateGroupCounts();
  }
  function rowHtml(r) {
    var id = r.kind === "u" ? r.rec.id : r.b.id, nm = r.kind === "u" ? r.rec.cfg.nama : r.b.nama, on = r.kind === "u" ? r.rec.on : r.b.on;
    var dot = r.kind === "u" ? '<i class="dot" style="background:' + esc(r.rec.cfg.warna || "#2d6a4f") + '"></i>' : '<i class="dot bi"></i>';
    return '<div class="lr' + (on ? " on" : "") + '" data-k="' + r.kind + '" data-id="' + esc(id) + '"><div class="lh"><label class="sw"><input type="checkbox"' + (on ? " checked" : "") + '><span></span></label>' + dot + '<span class="ln">' + esc(nm) + '</span><button type="button" class="ex" aria-label="Detail">' + ic("chev") + '</button></div><div class="ld"></div></div>';
  }
  function refreshPanelRow(rec) {
    var row = document.querySelector('.lr[data-k="u"][data-id="' + rec.id + '"]'); if (!row) return;
    row.classList.toggle("on", rec.on); row.querySelector("input").checked = rec.on;
    if (row.classList.contains("open")) fillDetail(row);
    updateGroupCounts();
  }
  function updateGroupCounts() {
    document.querySelectorAll(".grp").forEach(function (g) {
      var rs = g.querySelectorAll(".lr"), on = g.querySelectorAll(".lr.on").length;
      g.querySelector(".gc").textContent = on + "/" + rs.length; g.querySelector(".gc").classList.toggle("act", on > 0);
    });
  }
  function ctl(label, html) { return '<div class="ct"><label>' + label + "</label>" + html + "</div>"; }
  function sel(name, opts, cur) { return '<select data-o="' + name + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(cur) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
  function fillDetail(row) {
    var d = row.querySelector(".ld"), id = row.dataset.id, h = "";
    if (row.dataset.k === "u") {
      var rec = S.layers[id], c = rec.cfg;
      h += c.ket ? '<p class="ket">' + esc(c.ket) + "</p>" : "";
      h += '<p class="ket sm">' + (rec.loaded ? rec.feats.length + " objek" : "Memuat…") + (c.tgl ? " · diperbarui " + esc(c.tgl) : "") + (c.sumber ? " · " + esc(c.sumber) : "") + "</p>";
      if (rec.years.length) h += ctl("Tahun", sel("year", [["", "Semua tahun"]].concat(rec.years.map(function (y) { return [y, y]; })), rec.year));
      if (rec.cats.length) h += '<div class="leg">' + rec.cats.map(function (k) { return '<button type="button" class="lg' + (rec.catOff[k.v] ? " off" : "") + '" data-cat="' + esc(k.v) + '"><i style="background:' + esc(k.c) + '"></i><span>' + esc(k.v) + "</span><em>" + k.n + "</em></button>"; }).join("") + "</div>";
      h += '<div class="rw2"><button type="button" class="mini" data-act="zoom">' + ic("search") + " Zoom ke lapisan</button></div>";
    } else {
      var b = S.builtin[id], o = b.opt; h += '<p class="ket">' + esc(b.ket) + "</p>";
      if (id === "s2") {
        h += ctl("Rentang waktu", sel("days", [[7, "7 hari terakhir"], [14, "14 hari"], [30, "30 hari"], [60, "60 hari"], [90, "90 hari"], [180, "180 hari"]], o.days));
        h += ctl("Maks. tutupan awan: <b id=\"cv\">" + o.cloud + "%</b> <span class=\"hint\">(100% = pilih yang paling bersih)</span>", '<input type="range" min="5" max="100" step="5" value="' + o.cloud + '" data-o="cloud">');
        h += ctl("Sampai tanggal (opsional)", '<input type="date" data-o="end" max="' + new Date().toISOString().slice(0, 10) + '" value="' + o.end + '">');
        h += ctl("Kombinasi pita", sel("render", [["Natural Color with DRA", "Warna alami"], ["Color Infrared with DRA", "Inframerah (vegetasi merah)"], ["Short-wave Infrared with DRA", "SWIR (bekas bakar)"], ["Agriculture with DRA", "Pertanian"]], o.render));
        h += '<p id="s2info" class="ket sm"></p><p id="s2zoom" class="ket sm warn' + (map.getZoom() < b.minzoom ? "" : "") + '">Zoom ≥ 10 diperlukan agar citra tampil.</p>';
      }
      if (id === "lc") { h += ctl("Tahun", sel("year", range(2017, thisYear - 1).map(function (y) { return [y, y]; }), o.year)); h += '<p class="ket sm"><b>Kelas klasifikasi</b> <span class="hint">(klik untuk tampil/sembunyi)</span></p>' + lcLegend(true) + '<div class="rw2"><button type="button" class="mini" data-lcall="1">Tampilkan semua</button><button type="button" class="mini" data-lcall="0">Sembunyikan semua</button></div>'; }
      if (id === "gfw") h += ctl("Jendela waktu", sel("days", [[30, "30 hari"], [60, "60 hari"], [90, "90 hari"], [180, "180 hari"], [365, "365 hari"]], o.days)) + ctl("Keyakinan", sel("conf", [["all", "Semua"], ["high", "Tinggi saja"]], o.conf));
      if (id === "hs") { h += ctl("Rentang", sel("days", [[1, "24 jam"], [2, "2 hari"], [3, "3 hari"], [5, "5 hari"]], o.days)) + ctl("Kepercayaan", sel("conf", [["all", "Semua"], ["nominal", "Sedang ke atas"], ["high", "Tinggi saja"]], o.conf)); h += '<p id="hsinfo" class="ket sm"></p>'; }
      if (b.tiles && id !== "hs") h += ctl("Transparansi", '<input type="range" min="0.15" max="1" step="0.05" value="' + (map.getPaintProperty("b-" + id, "raster-opacity") || 1) + '" data-op="1">');
    }
    d.innerHTML = h;
    if (row.dataset.k === "b" && id === "s2") s2Info();
  }
  function range(a, b) { var r = []; for (var i = b; i >= a; i--) r.push(i); return r; }
  document.addEventListener("click", function (e) {
    var t = e.target;
    var gh = t.closest(".gh"); if (gh) { gh.parentNode.classList.toggle("open"); return; }
    var ex = t.closest(".ex, .ln"); if (ex) { var row = ex.closest(".lr"); row.classList.toggle("open"); if (row.classList.contains("open")) fillDetail(row); return; }
    var lcb = t.closest("[data-lc],[data-lcall]");
    if (lcb) {
      var lo = S.builtin.lc.opt;
      if (lcb.dataset.lcall) lo.off = lcb.dataset.lcall === "1" ? [] : LC_CLASSES.map(function (k) { return k[3]; });
      else { var cv2 = +lcb.dataset.lc, ix = lo.off.indexOf(cv2); if (ix >= 0) lo.off.splice(ix, 1); else lo.off.push(cv2); }
      document.querySelectorAll("[data-lc]").forEach(function (e) { e.classList.toggle("off", lo.off.indexOf(+e.dataset.lc) >= 0); });
      refreshBuiltin("lc"); return;
    }
    var lg = t.closest(".lg[data-cat]"); if (lg) { var rw = lg.closest(".lr"), rec = S.layers[rw.dataset.id]; rec.catOff[lg.dataset.cat] = !rec.catOff[lg.dataset.cat]; lg.classList.toggle("off"); applyFilters(rec); return; }
    var gt = t.closest(".gth button"); if (gt) { var gl = gt.closest(".gal"); gl.querySelector(".pphoto").src = gt.querySelector("img").src; gl.querySelector(".gcap").textContent = gt.dataset.cap || ""; gl.querySelectorAll(".gth button").forEach(function (x) { x.classList.toggle("on", x === gt); }); return; }
    var pp = t.closest(".pphoto"); if (pp) { var lb = $("#lbx"); lb.querySelector("img").src = pp.src; lb.querySelector("figcaption").textContent = (pp.parentNode.querySelector(".gcap") || {}).textContent || ""; lb.classList.add("on"); return; }
    if (t.closest("#lbx")) { $("#lbx").classList.remove("on"); return; }
    var mn = t.closest("[data-act=zoom]"); if (mn) { zoomToRec(S.layers[mn.closest(".lr").dataset.id]); return; }
    var bb = t.closest("[data-base]"); if (bb) { setBase(bb.dataset.base); return; }
    var pv = t.closest("[data-prov]"); if (pv) { applyProvince(pv.dataset.prov); return; }
    if (t.closest("#lbtn")) { setPanel(!$("#panel").classList.contains("open")); return; }
    if (t.closest("#pclose")) { setPanel(false); return; }
    if (t.closest("#metbtn") || t.closest("[data-met]")) { $("#met").classList.add("on"); return; }
    if (t.closest("#metx") || t.id === "met") { $("#met").classList.remove("on"); return; }
    if (t.closest("#tlp")) { tlPlay(!AQ.playing); return; }
    if (t.closest("#sres button")) { var h2 = S.feats[+t.closest("button").dataset.i]; $("#sres").classList.remove("on"); gotoFeat(h2); return; }
    if (!t.closest("#sbox")) $("#sres").classList.remove("on");
    if (t.closest("#locate")) { navigator.geolocation && navigator.geolocation.getCurrentPosition(function (p) { map.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 11 }); }, function () { toast("Lokasi tidak diizinkan.", true); }); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target, row = t.closest(".lr");
    if (t.matches(".sw input")) { var on = t.checked, k = row.dataset.kind || row.dataset.k; row.classList.toggle("on", on); if (k === "u") setUserVisible(S.layers[row.dataset.id], on); else toggleBuiltin(row.dataset.id, on); updateGroupCounts(); return; }
    if (t.dataset.o && row) {
      var v = t.value; if (row.dataset.k === "u") { var rec = S.layers[row.dataset.id]; rec[t.dataset.o] = v; applyFilters(rec); }
      else { var b = S.builtin[row.dataset.id]; b.opt[t.dataset.o] = /^(days|year|cloud)$/.test(t.dataset.o) ? +v : v; refreshBuiltin(row.dataset.id); if (t.dataset.o === "cloud") { var cv = $("#cv"); if (cv) cv.textContent = v + "%"; } }
    }
  });
  document.addEventListener("input", function (e) {
    var t = e.target, row = t.closest(".lr");
    if (t.dataset.op && row) map.setPaintProperty("b-" + row.dataset.id, "raster-opacity", +t.value);
    if (t.dataset.o === "cloud") { var cv = $("#cv"); if (cv) cv.textContent = t.value + "%"; clearTimeout(t._d); t._d = setTimeout(function () { t.dispatchEvent(new Event("change", { bubbles: true })); }, 350); }
    if (t.id === "tlr") { AQ.idx = +t.value; drawAir(); }
    if (t.id === "q") doSearch(t.value);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { $("#met").classList.remove("on"); $("#sres").classList.remove("on"); $("#lbx").classList.remove("on"); } });

  /* ---------- UI statis ---------- */
  function titleHtml(t) { return esc(t).replace(/\*(.+?)\*/g, "<em>$1</em>"); }
  $("#ttl").innerHTML = titleHtml(CFG.judul || "Peta *ETTRS* Sumatra");
  $("#sub").textContent = CFG.deskripsi || "";
  var im = $("#brandlogo"); if (CFG.logo) { im.src = CFG.logo; if (!CFG.logoPutih) im.classList.add("inv"); im.hidden = false; }
  $("#sbox").insertAdjacentHTML("afterbegin", ic("search"));
  $("#lbtn").insertAdjacentHTML("afterbegin", ic("layers"));
  $("#tlp").innerHTML = ic("play");
  $("#pclose").innerHTML = ic("close"); $("#metx").innerHTML = ic("close");
  $("#provs").innerHTML = '<button type="button" data-prov="all" class="on">Semua</button>' + PROV.map(function (p) { return '<button type="button" data-prov="' + p.k + '">' + p.n + "</button>"; }).join("");
  $("#metbody").innerHTML = (CFG.metodologi || "").split(/\n{2,}/).map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>" + (/^Tutupan lahan 10 m/.test(p) ? '<p class="ket sm"><b>Kelas klasifikasi:</b></p>' + lcLegend() : ""); }).join("");
  document.title = (CFG.judul || "Platform Interaktif").replace(/\*/g, "") + " | " + (CFG.nama || "");
  /* navigasi mengikuti menu situs */
  (function () {
    var nav = $("#nav"), h = "";
    (CFG.nav || []).forEach(function (n) { h += '<a href="' + esc(n.u) + '"' + (n.a ? ' class="on"' : "") + ">" + esc(n.t) + "</a>"; });
    nav.innerHTML = h;
    $("#navbtn").onclick = function () { var o = $("#top").classList.toggle("open"); this.setAttribute("aria-expanded", o); };
  })();
  function updateStats() {
    var recs = Object.keys(S.layers).map(function (k) { return S.layers[k]; }), n = 0; recs.forEach(function (r) { n += r.cfg.n || 0; });
    $("#stats").innerHTML = recs.length ? "<span><b>" + recs.length + "</b> lapisan data</span><span><b>" + n.toLocaleString("id-ID") + "</b> objek</span><span><b>4</b> provinsi</span>" : "<span><b>4</b> provinsi</span><span><b>Sentinel-2</b> terbaru</span>";
  }
  updateStats();
})();
