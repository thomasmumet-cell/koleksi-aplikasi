/* =====================================================================
   BOOK TO GAME — inti mesin (dipakai browser dan Node).
   1) Pembaca: proyek SERAT STEM (.json) dan baris terstruktur hasil Word/PDF/teks
      → model BUKU yang seragam (bab, subbab, tujuan, kata kunci, gambar,
        aktivitas/eksperimen, soal, glosarium).
   2) Pembangun: BUKU → GAME (level per bab, karakter, dialog, misi, hadiah)
      secara deterministik, sehingga buku yang sama selalu menghasilkan game
      yang sama dan revisi hanya mengubah bagian yang berubah (sidik per bab).
   ===================================================================== */
(function (root, factory) {
  var api = factory(); api.__pabrik = String(factory);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BookToGame = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var HURUF = "ABCDE";

  /* ---------- utilitas ---------- */
  function bersih(v) { return String(v == null ? "" : v).replace(/\*\*?|__/g, "").replace(/[ \t]+/g, " ").trim(); }
  function slugify(s) {
    return bersih(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "buku";
  }
  function sidik(o) { /* FNV-1a 32-bit atas JSON */
    var s = typeof o === "string" ? o : JSON.stringify(o), h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return ("0000000" + h.toString(16)).slice(-8);
  }
  function rng(seed) { var a = parseInt(seed, 16) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function acak(arr, r) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function kalimat(teks) { return bersih(teks).split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 25; }); }
  function jenjangDari(kelas) {
    var k = String(kelas || "").toUpperCase().trim(), r = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
    var n = r[k] || parseInt(k, 10) || 0;
    return n && n <= 6 ? "SD" : n >= 10 ? "SMA" : "SMP";
  }
  function soalDari(list) {
    var out = [];
    (list || []).forEach(function (p) {
      if (!p || !p.q || !Array.isArray(p.opsi) || p.opsi.length < 2) return;
      var k = typeof p.kunci === "number" ? p.kunci : HURUF.indexOf(String(p.kunci || "").trim().toUpperCase().charAt(0));
      var opsi = p.opsi.map(bersih).filter(Boolean);
      if (k < 0 || k >= opsi.length) return;
      out.push({ q: bersih(p.q), opsi: opsi, kunci: k, asal: p.asal || "buku" });
    });
    return out;
  }

  /* ---------- markup SERAT (# judul, [GAMBAR: ...], [TABEL: ...], [STEM: ...], - poin) ---------- */
  function uraiMarkup(teks) {
    var bl = [], L = String(teks || "").split(/\r?\n/), i = 0, m;
    while (i < L.length) {
      var t = L[i].trim();
      if (!t) { i++; continue; }
      if ((m = t.match(/^#{1,3}\s+(.*)$/))) { bl.push({ t: "h", text: bersih(m[1]) }); i++; continue; }
      if ((m = t.match(/^\[GAMBAR\s*:\s*(.*?)\]\s*$/i))) { var p = m[1].split("|").map(function (s) { return s.trim(); }); bl.push({ t: "fig", judul: p[0] || "Ilustrasi", desc: p[2] || "" }); i++; continue; }
      if ((m = t.match(/^\[TABEL\s*:\s*(.*?)\]\s*$/i))) { var rows = []; i++; while (i < L.length && /^\s*\|/.test(L[i])) { var r = L[i].trim().replace(/^\||\|$/g, "").split("|").map(bersih); if (!r.every(function (c) { return /^:?-{2,}:?$/.test(c) || !c; })) rows.push(r); i++; } bl.push({ t: "tab", judul: bersih(m[1]), rows: rows }); continue; }
      if ((m = t.match(/^\[STEA?M\s*:\s*(.*?)\]\s*(.*)$/i))) { var b = m[2]; i++; while (i < L.length && L[i].trim() && !/^(#|\[|-\s|\|)/.test(L[i].trim())) { b += " " + L[i].trim(); i++; } bl.push({ t: "stem", judul: bersih(m[1]) || "Pojok STEM", text: bersih(b) }); continue; }
      if ((m = t.match(/^[-•]\s+(.*)$/))) { bl.push({ t: "li", text: bersih(m[1]) }); i++; continue; }
      var para = t; i++;
      while (i < L.length && L[i].trim() && !/^(#|\[|[-•]\s|\|)/.test(L[i].trim())) { para += " " + L[i].trim(); i++; }
      bl.push({ t: "p", text: bersih(para) });
    }
    return bl;
  }

  /* ---------- Pembaca 1: proyek SERAT STEM ---------- */
  function dariSerat(buku) {
    if (!buku || !Array.isArray(buku.chapters) || !buku.chapters.length) throw new Error("Berkas ini bukan proyek buku SERAT STEM.");
    var meta = buku.meta || {}, img = buku.images || {};
    var bab = buku.chapters.map(function (c, ci) {
      var n = ci + 1, gambar = [], stem = [], sub = [];
      function serap(teks, judulSub) {
        var s = { judul: bersih(judulSub), paragraf: [], poin: [], tabel: [] };
        uraiMarkup(teks).forEach(function (b) {
          if (b.t === "p") s.paragraf.push(b.text);
          else if (b.t === "li") s.poin.push(b.text);
          else if (b.t === "h") s.paragraf.push("## " + b.text);
          else if (b.t === "fig") gambar.push({ judul: b.judul, desc: b.desc, src: img["b" + n + "::" + b.judul.toLowerCase().trim()] || null });
          else if (b.t === "stem") stem.push({ judul: b.judul, teks: b.text });
          else if (b.t === "tab") s.tabel.push({ judul: b.judul, rows: b.rows });
        });
        return s;
      }
      var aper = serap(c.apersepsi, "Apersepsi");
      (c.subbab || []).forEach(function (sb) { sub.push(serap(sb.isi, sb.judul)); });
      var am = c.ayoMencoba || null, akt = null;
      if (am && (am.judul || (am.langkah || []).length)) {
        akt = {
          judul: bersih(am.judul), pengantar: bersih(am.pengantar), pertanyaan: bersih(am.pertanyaan),
          alat: (am.alat || []).map(bersih).filter(Boolean),
          langkah: (am.langkah || []).map(function (l) { l = bersih(l); var m = l.match(/^([^:]{3,40}):\s*(.+)$/); return m ? { tahap: m[1].trim(), isi: m[2].trim() } : { tahap: "", isi: l }; }).filter(function (x) { return x.isi; }),
          prediksi: (am.prediksi || []).map(bersih).filter(Boolean),
          data: am.data ? { kolom: (am.data.kolom || []).map(bersih), keterangan: bersih(am.data.keterangan) } : null,
          sukses: (am.sukses || []).map(bersih).filter(Boolean), batasan: (am.batasan || []).map(bersih).filter(Boolean),
          produk: bersih(am.produk), steam: am.steam || null,
          rubrik: (am.rubrik || []).map(function (r) { return { aspek: bersih(r.aspek), skor4: bersih(r.skor4), skor1: bersih(r.skor1) }; })
        };
      }
      return {
        id: "b" + n, no: n, judul: bersih(c.judul) || "Bab " + n,
        tujuan: (c.tujuan || []).map(bersih).filter(Boolean), kataKunci: (c.kataKunci || []).map(bersih).filter(Boolean),
        pemantik: (c.pemantik || []).map(bersih).filter(Boolean), apersepsi: aper.paragraf.join(" "),
        subbab: sub, gambar: gambar, stem: stem, aktivitas: akt,
        soal: soalDari(c.pg), esai: (c.esai || []).map(bersih).filter(Boolean),
        hots: (c.hots || []).map(function (h) { return { level: bersih(h.level), kasus: bersih(h.kasus), tuntutan: bersih(h.tuntutan) }; }).filter(function (h) { return h.kasus; }),
        rangkuman: (c.rangkuman || []).map(bersih).filter(Boolean), refleksi: (c.refleksi || []).map(bersih).filter(Boolean),
        dimensi: (c.dimensi || []).map(function (d) { return { dimensi: bersih(d.dimensi), indikator: bersih(d.indikator) }; })
      };
    });
    return rampungkan({
      judul: bersih(meta.judul) || "Buku tanpa judul", mapel: bersih(meta.mapel), kelas: bersih(meta.kelas),
      cp: bersih(buku.cp).slice(0, 2000), sumber: "SERAT STEM", bab: bab,
      glosarium: (buku.glosarium || []).map(function (g) { return { istilah: bersih(g.istilah), arti: bersih(g.arti) }; }).filter(function (g) { return g.istilah && g.arti; }),
      aas: soalDari(buku.aas && buku.aas.pg)
    });
  }

  /* ---------- Pembaca 2: baris terstruktur (Word/PDF/teks) ----------
     baris: [{t:'h1'|'h2'|'h3'|'p'|'li'|'img', text, src}] */
  var RE_BAB = /^(BAB|Bab|Chapter|Unit)\s+([IVXLC]+|\d+)\b[.:\s-]*(.*)$/;
  var RE_SEKSI = { tujuan: /^tujuan( pembelajaran)?\b/i, kunci: /^kata[- ]kunci\b/i, rangkuman: /^(rangkuman|ringkasan)\b/i, refleksi: /^refleksi\b/i, glos: /^glosarium\b/i, pustaka: /^daftar pustaka|^pustaka\b/i, soal: /^(asesmen|evaluasi|uji kompetensi|latihan( soal)?|soal|ayo berlatih)\b/i, kuncijawab: /^kunci jawaban\b/i, akt: /^(ayo mencoba|aktivitas|proyek|eksperimen|percobaan|kegiatan)\b/i, pemantik: /^pertanyaan pemantik\b/i, prakata: /^(prakata|kata pengantar|daftar isi|daftar gambar|daftar tabel|indeks|profil penulis|tentang penulis)\b/i };
  function dariBaris(baris, meta) {
    meta = meta || {};
    var bab = [], cur = null, sub = null, seksi = "isi", glos = [], kunciJawab = {}, soalAkhir = [], pend = null, judulBuku = bersih(meta.judul);
    function babBaru(judul) {
      cur = { id: "b" + (bab.length + 1), no: bab.length + 1, judul: bersih(judul) || "Bab " + (bab.length + 1), tujuan: [], kataKunci: [], pemantik: [], apersepsi: "", subbab: [], gambar: [], stem: [], aktivitas: null, soal: [], esai: [], hots: [], rangkuman: [], refleksi: [], dimensi: [], _soalMentah: [] };
      bab.push(cur); sub = null; seksi = "isi";
    }
    function subBaru(j) { sub = { judul: bersih(j), paragraf: [], poin: [], tabel: [] }; cur.subbab.push(sub); }
    function seksiDari(text) { for (var k in RE_SEKSI) if (RE_SEKSI[k].test(text)) return k; return null; }
    for (var i = 0; i < baris.length; i++) {
      var b = baris[i], tx = bersih(b.text);
      if (b.t === "img") { if (cur) { var cap = ""; var nx = baris[i + 1]; if (nx && /^gambar\s+\d/i.test(bersih(nx.text))) cap = bersih(nx.text).replace(/^gambar\s+[\d.]+\s*/i, ""); cur.gambar.push({ judul: cap || "Ilustrasi " + (cur.gambar.length + 1), desc: "", src: b.src }); } continue; }
      if (!tx) continue;
      var mb = tx.match(RE_BAB);
      if (mb && (b.t === "h1" || b.t === "h2" || tx.length < 90)) {
        var judul = bersih(mb[3]);
        if (!judul) { var nx2 = baris[i + 1]; if (nx2 && bersih(nx2.text).length < 90 && !RE_BAB.test(bersih(nx2.text))) { judul = bersih(nx2.text); i++; } }
        babBaru(judul); continue;
      }
      var sk = (b.t !== "p" || tx.length < 40 || /^(kata[- ]kunci|tujuan pembelajaran)\s*:/i.test(tx)) ? seksiDari(tx) : null;
      if (sk === "prakata") { seksi = "lewati"; if (cur && b.t === "h1") cur = null; continue; }
      if (sk === "glos") { seksi = "glos"; cur = null; continue; }
      if (sk === "pustaka") { seksi = "lewati"; cur = null; continue; }
      if (sk === "kuncijawab") { seksi = "jawab"; continue; }
      if (!cur && seksi === "glos") { var mg = tx.match(/^(.{2,60}?)\s*[:–—-]\s+(.{8,})$/); if (mg) glos.push({ istilah: bersih(mg[1]), arti: bersih(mg[2]) }); continue; }
      if (seksi === "jawab") { var re = /(\d+)\s*[.)]\s*([A-Ea-e])\b/g, mk; while ((mk = re.exec(tx))) kunciJawab[(cur ? cur.id : "aas") + ":" + mk[1]] = mk[2].toUpperCase(); continue; }
      if (!cur) { if (!judulBuku && !sk && tx.length < 120 && (b.t === "h1" || !bab.length)) judulBuku = tx; if (b.t === "h1" && RE_SEKSI.soal.test(tx)) { babBaru("Asesmen Akhir"); cur.akhir = true; seksi = "soal"; } continue; }
      if (sk && sk !== "prakata") {
        seksi = sk;
        if (sk === "kunci") { var isi = tx.replace(RE_SEKSI.kunci, "").replace(/^[\s:]+/, ""); if (isi) cur.kataKunci = isi.split(/[,;•]/).map(bersih).filter(Boolean); }
        if (sk === "akt" && !cur.aktivitas) cur.aktivitas = { judul: bersih(tx.replace(RE_SEKSI.akt, "").replace(/^[\s:!–-]+/, "")) || tx, pengantar: "", pertanyaan: "", alat: [], langkah: [], prediksi: [], data: null, sukses: [], batasan: [], produk: "", steam: null, rubrik: [], _sub: "" };
        continue;
      }
      if ((b.t === "h2" || b.t === "h3") && seksi !== "soal") { seksi = "isi"; subBaru(tx); continue; }
      switch (seksi) {
        case "tujuan": cur.tujuan.push(tx.replace(/^\d+[.)]\s*/, "")); break;
        case "kunci": cur.kataKunci = cur.kataKunci.concat(tx.split(/[,;•]/).map(bersih).filter(Boolean)); break;
        case "pemantik": cur.pemantik.push(tx.replace(/^\d+[.)]\s*/, "")); break;
        case "rangkuman": cur.rangkuman.push(tx.replace(/^\d+[.)]\s*/, "")); break;
        case "refleksi": cur.refleksi.push(tx.replace(/^\d+[.)]\s*/, "")); break;
        case "akt":
          var A = cur.aktivitas;
          if (/^(alat( dan bahan)?|bahan)\b/i.test(tx)) A._sub = "alat";
          else if (/^(langkah|cara kerja|prosedur)/i.test(tx)) A._sub = "langkah";
          else if (/^(prediksi|pertanyaan|hipotesis)/i.test(tx)) A._sub = "prediksi";
          else if (/^(kriteria|berhasil)/i.test(tx)) A._sub = "sukses";
          else if (/^batasan/i.test(tx)) A._sub = "batasan";
          else if (A._sub === "alat") A.alat.push(tx.replace(/^\d+[.)]\s*/, ""));
          else if (A._sub === "langkah") { var ml = tx.replace(/^\d+[.)]\s*/, "").match(/^([^:]{3,40}):\s*(.+)$/); A.langkah.push(ml ? { tahap: ml[1], isi: ml[2] } : { tahap: "", isi: tx.replace(/^\d+[.)]\s*/, "") }); }
          else if (A._sub === "prediksi") A.prediksi.push(tx.replace(/^\d+[.)]\s*/, ""));
          else if (A._sub === "sukses") A.sukses.push(tx); else if (A._sub === "batasan") A.batasan.push(tx);
          else if (!A.pengantar) A.pengantar = tx; else A.pengantar += " " + tx;
          break;
        case "soal":
          var mq = tx.match(/^(\d+)\s*[.)]\s*(.+)$/), mo = tx.match(/^([A-Ea-e])\s*[.)]\s*(.+)$/);
          if (mq) { pend = { no: +mq[1], q: mq[2], opsi: [] }; cur._soalMentah.push(pend); }
          else if (mo && pend) pend.opsi.push(mo[2]);
          else if (pend && !pend.opsi.length) pend.q += " " + tx;
          break;
        default:
          if (!sub) subBaru(cur.subbab.length ? "Lanjutan" : "Pengantar");
          if (b.t === "li") sub.poin.push(tx); else sub.paragraf.push(tx);
          if (!cur.apersepsi && cur.subbab.length === 1 && sub.paragraf.length === 1) cur.apersepsi = tx;
      }
    }
    var aas = [];
    bab.forEach(function (c) {
      c._soalMentah.forEach(function (s) {
        var k = kunciJawab[c.id + ":" + s.no] || kunciJawab["aas:" + s.no];
        if (s.opsi.length >= 2 && k) (c.akhir ? aas : c.soal).push({ q: bersih(s.q), opsi: s.opsi.map(bersih), kunci: HURUF.indexOf(k), asal: "buku" });
        else if (s.opsi.length < 2 && s.q.length > 15) c.esai.push(bersih(s.q));
      });
      delete c._soalMentah; if (c.aktivitas) delete c.aktivitas._sub;
      if (c.aktivitas && !c.aktivitas.langkah.length && !c.aktivitas.alat.length) c.aktivitas = null;
    });
    bab = bab.filter(function (c) { return !c.akhir && (c.subbab.length || c.soal.length); });
    bab.forEach(function (c, i) { c.no = i + 1; c.id = "b" + (i + 1); });
    if (!bab.length) throw new Error("Bab tidak ditemukan. Pastikan setiap bab diawali judul seperti “BAB 1 …” atau memakai gaya Heading 1.");
    return rampungkan({ judul: judulBuku || "Buku tanpa judul", mapel: bersih(meta.mapel), kelas: bersih(meta.kelas), cp: "", sumber: meta.sumber || "Dokumen", bab: bab, glosarium: glos, aas: aas });
  }

  /* ---------- pelengkap umum ---------- */
  function rampungkan(B) {
    B.v = 2; B.id = slugify(B.judul + (B.kelas ? " kelas " + B.kelas : ""));
    B.jenjang = jenjangDari(B.kelas);
    var semuaTeks = B.bab.map(function (c) { return (c.judul + " " + c.subbab.map(function (s) { return s.paragraf.join(" ") + " " + s.poin.join(" "); }).join(" ")).toLowerCase(); });
    /* kata kunci kosong → ambil istilah glosarium yang paling sering muncul di bab itu */
    B.bab.forEach(function (c, i) {
      if (!c.kataKunci.length) c.kataKunci = B.glosarium.filter(function (g) { return semuaTeks[i].indexOf(g.istilah.toLowerCase()) > -1; }).slice(0, 8).map(function (g) { return g.istilah; });
      if (!c.kataKunci.length) c.kataKunci = c.subbab.map(function (s) { return s.judul; }).filter(function (j) { return j && j.length < 40 && j !== "Lanjutan" && j !== "Pengantar"; }).slice(0, 6);
      if (!c.tujuan.length) c.tujuan = ["Memahami " + c.judul.toLowerCase() + "."];
      c.sidik = sidik([c.judul, c.tujuan, c.kataKunci, c.subbab, c.gambar.map(function (g) { return [g.judul, g.desc, g.src ? g.src.length : 0]; }), c.aktivitas, c.soal, c.hots, c.rangkuman]);
    });
    B.sidik = sidik(B.bab.map(function (c) { return c.sidik; }).concat([sidik(B.glosarium), sidik(B.aas)]));
    return B;
  }

  /* ---------- Pembangun game ---------- */
  var TOKOH = {
    mentor: { nama: "Prof. Sinar", peran: "ilmuwan pemandu", warna: "#7048e8", emoji: "👩🏽‍🔬" },
    robo: { nama: "Robo Tekno", peran: "robot asisten", warna: "#1c7ed6", emoji: "🤖" },
    warga: { nama: "Pak Karya", peran: "warga yang butuh bantuan", warna: "#e8590c", emoji: "🧑🏽‍🌾" }
  };
  var ATURAN = { /* tingkat kesulitan per jenjang */
    SD: { opsi: 3, soal: 5, detik: 0, bantuan: 2, kilat: 3 },
    SMP: { opsi: 4, soal: 8, detik: 45, bantuan: 1, kilat: 4 },
    SMA: { opsi: 4, soal: 10, detik: 35, bantuan: 0, kilat: 5 }
  };
  function aturan(jenjang, mode) {
    var a = Object.assign({}, ATURAN[jenjang] || ATURAN.SMP);
    if (mode === "mudah") { a.opsi = Math.max(3, a.opsi - 1); a.soal = Math.max(4, a.soal - 2); a.detik = a.detik ? a.detik + 15 : 0; a.bantuan += 1; }
    if (mode === "menantang") { a.soal += 3; a.detik = a.detik ? Math.max(20, a.detik - 10) : 40; a.bantuan = Math.max(0, a.bantuan - 1); a.kilat += 1; }
    return a;
  }
  function kataPenting(s) { return (String(s).toLowerCase().match(/[a-z]{4,}/g) || []).filter(function (w) { return ["atau", "dengan", "sebagai", "untuk", "bekas", "yang", "dari", "digunakan", "bimbingan", "guru"].indexOf(w) < 0; }); }
  function kapital(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  function potong(s, n) { s = String(s || ""); if (s.length <= n) return s; var t = s.slice(0, n - 1).replace(/\s+\S*$/, ""); return /[.!?]$/.test(t) ? t : t + "…"; }

  /* soal isian rumpang dari kalimat buku: kata kunci dikosongkan, pengecoh dari istilah lain */
  function soalRumpang(c, B, r, maks) {
    var istilah = c.kataKunci.concat(B.glosarium.map(function (g) { return g.istilah; })).filter(function (x, i, a) { return x && x.length < 40 && a.indexOf(x) === i; });
    var out = [], pakai = {};
    c.subbab.forEach(function (s) {
      kalimat(s.paragraf.filter(function (p) { return p.indexOf("## ") !== 0; }).join(" ")).forEach(function (k) {
        if (out.length >= maks * 2) return;
        var low = k.toLowerCase();
        for (var i = 0; i < istilah.length; i++) {
          var w = istilah[i], idx = low.indexOf(w.toLowerCase());
          if (idx < 0 || pakai[w] || k.length > 260) continue;
          var batasKiri = idx === 0 || /[^a-z0-9]/i.test(low.charAt(idx - 1)), batasKanan = !/[a-z0-9]/i.test(low.charAt(idx + w.length) || " ");
          if (!batasKiri || !batasKanan) continue;
          var beda = function (x) { return x.toLowerCase() !== w.toLowerCase(); };
          var peng = acak(c.kataKunci.filter(beda), r).slice(0, 2);
          acak(istilah.filter(beda), r).forEach(function (x) { if (peng.length < 3 && peng.indexOf(x) < 0) peng.push(x); });
          if (peng.length < 2) continue;
          pakai[w] = 1;
          var awal = idx === 0, bentuk = function (x) { return /^[A-Z0-9]{2,}$/.test(x) ? x : (awal ? kapital(x) : x.charAt(0).toLowerCase() + x.slice(1)); };
          var jawab = bentuk(k.slice(idx, idx + w.length)), opsi = acak([jawab].concat(peng.map(bentuk)), r);
          out.push({ q: k.slice(0, idx) + "______" + k.slice(idx + w.length), opsi: opsi, kunci: opsi.indexOf(jawab), asal: "rumpang", sub: s.judul });
          break;
        }
      });
    });
    return acak(out, r).slice(0, maks);
  }
  function tujuanUntuk(teks, tujuan) { /* petakan item ke tujuan pembelajaran lewat irisan kata */
    var w = String(teks).toLowerCase().match(/[a-z]{5,}/g) || [], best = 0, skor = -1;
    tujuan.forEach(function (t, i) { var tw = String(t).toLowerCase(), s = 0; w.forEach(function (x) { if (tw.indexOf(x.slice(0, 6)) > -1) s++; }); if (s > skor) { skor = s; best = i; } });
    return best;
  }
  function kartuMateri(c, r) {
    var kartu = [];
    c.subbab.forEach(function (s, si) {
      var par = s.paragraf.filter(function (p) { return p.indexOf("## ") !== 0; });
      var ks = kalimat(par.join(" ")), pilih = [];
      ks.forEach(function (k) { if (pilih.length < 3 && c.kataKunci.some(function (w) { return k.toLowerCase().indexOf(w.toLowerCase()) > -1; })) pilih.push(k); });
      ks.forEach(function (k) { if (pilih.length < 3 && pilih.indexOf(k) < 0) pilih.push(k); });
      if (!pilih.length && !s.poin.length) return;
      kartu.push({ judul: s.judul || ("Bagian " + (si + 1)), poin: pilih.map(function (k) { return potong(k, 260); }), daftar: s.poin.slice(0, 5).map(function (p) { return potong(p, 160); }), tabel: (s.tabel[0] || null) });
    });
    c.gambar.forEach(function (g, gi) { var k = kartu[Math.min(kartu.length - 1, Math.floor(gi * kartu.length / Math.max(1, c.gambar.length)))]; if (k) (k.gambar = k.gambar || []).push(g); });
    c.stem.forEach(function (s, si) { var k = kartu[Math.min(kartu.length - 1, si)]; if (k) k.stem = s; });
    return kartu;
  }
  function bangunLevel(c, B, A) {
    var r = rng(c.sidik), T = c.tujuan, akt = c.aktivitas, misi = [];
    var lencana = kapital(c.kataKunci[0] || c.judul.split(/\s+/)[0]);
    /* dialog pembuka */
    var dialog = [
      { tokoh: "mentor", teks: "Selamat datang di Level " + c.no + ": " + c.judul + "!" },
      { tokoh: "mentor", teks: potong(kalimat(c.apersepsi)[0] || c.apersepsi || ("Hari ini kita menjelajahi " + c.judul.toLowerCase() + "."), 240) }
    ];
    if (c.pemantik[0]) dialog.push({ tokoh: "robo", teks: "Pertanyaanku: " + c.pemantik[0] });
    if (akt && akt.pengantar) dialog.push({ tokoh: "warga", teks: potong(kalimat(akt.pengantar).filter(function (k) { return !/kelompok/i.test(k); }).slice(0, 2).join(" ") || akt.pengantar, 260) });
    dialog.push({ tokoh: "mentor", teks: "Misi kita: " + (akt && akt.judul ? akt.judul : "menguasai " + c.judul.toLowerCase()) + ". Kumpulkan bintang di setiap misi untuk meraih Lencana " + lencana + "!" });

    var kartu = kartuMateri(c, r), kilat = soalRumpang(c, B, r, A.kilat);
    if (kartu.length) misi.push({ id: "jelajah", jenis: "jelajah", judul: "Jelajah Konsep", ikon: "🔭", cerita: "Prof. Sinar membuka catatan lapangan. Baca kartu konsep, lalu jawab cek kilat.", kartu: kartu, kilat: kilat.map(function (q) { q.tujuan = tujuanUntuk(q.q, T); return q; }) });
    var pas = c.kataKunci.map(function (w) { var g = B.glosarium.filter(function (x) { return x.istilah.toLowerCase() === w.toLowerCase(); })[0]; return g; }).filter(Boolean);
    if (pas.length < 4) B.glosarium.forEach(function (g) { if (pas.length < 6 && pas.indexOf(g) < 0 && c.subbab.some(function (s) { return (s.paragraf.join(" ")).toLowerCase().indexOf(g.istilah.toLowerCase()) > -1; })) pas.push(g); });
    if (pas.length >= 3) misi.push({ id: "istilah", jenis: "istilah", judul: "Kode Istilah", ikon: "🧩", cerita: "Robo Tekno menemukan kartu istilah yang tercampur. Pasangkan istilah dengan artinya!", pasangan: acak(pas, r).slice(0, A.jenjang === "SD" ? 4 : 6) });
    var soal = c.soal.map(function (q) { q = Object.assign({}, q); q.tujuan = tujuanUntuk(q.q, T); return q; });
    if (soal.length < 3) soal = soal.concat(soalRumpang(c, B, rng(sidik(c.sidik + "k")), 6).map(function (q) { q.tujuan = tujuanUntuk(q.q, T); return q; }));
    if (soal.length) misi.push({ id: "kuis", jenis: "kuis", judul: "Gerbang Kuis", ikon: "🚪", cerita: "Gerbang menuju level berikutnya hanya terbuka bagi penjelajah yang menjawab dengan tepat.", soal: soal, wajib: true });
    if (akt && (akt.langkah.length >= 3 || akt.alat.length >= 2)) {
      var lainAlat = []; B.bab.forEach(function (x) { if (x !== c && x.aktivitas) lainAlat = lainAlat.concat(x.aktivitas.alat); });
      misi.push({ id: "lab", jenis: "lab", judul: "Lab Virtual: " + (akt.judul || "Eksperimen"), ikon: "⚗️", cerita: (akt.pengantar ? potong(kalimat(akt.pengantar).filter(function (k) { return !/kelompok/i.test(k); }).join(" ") || akt.pengantar, 240) + " " : "") + "Rancang dan uji solusimu di laboratorium virtual.",
        alat: akt.alat.slice(0, 6), pengecoh: acak(lainAlat.filter(function (x) { var kx = kataPenting(x); return akt.alat.indexOf(x) < 0 && !akt.alat.some(function (y) { var ky = kataPenting(y); return kx.some(function (w) { return ky.indexOf(w) > -1; }); }); }).filter(function (x, i, a) { return a.indexOf(x) === i; }), r).slice(0, Math.min(4, Math.max(2, akt.alat.length - 1))),
        langkah: akt.langkah, prediksi: akt.prediksi, data: akt.data, sukses: akt.sukses, batasan: akt.batasan, steam: akt.steam, produk: akt.produk, tujuan: tujuanUntuk(akt.judul + " " + akt.pengantar + " " + akt.langkah.map(function (l) { return l.isi; }).join(" "), T) });
    }
    if (c.hots.length || c.esai.length) {
      var h = c.hots.length ? c.hots[c.hots.length - 1] : { level: "", kasus: c.esai[0], tuntutan: "Jawablah dengan alasan yang jelas." };
      misi.push({ id: "bos", jenis: "bos", judul: "Tantangan Bos", ikon: "🐉", cerita: "Tantangan terakhir! Gunakan semua yang kamu pelajari untuk memecahkan kasus ini.", kasus: h.kasus, tuntutan: h.tuntutan,
        rubrik: (akt && akt.rubrik.length ? akt.rubrik.map(function (x) { return x.aspek + ": " + x.skor4; }) : ["Jawaban memakai konsep yang tepat dari bab ini", "Alasan didukung data atau contoh", "Jawaban runtut dan jelas"]).slice(0, 4),
        tujuan: tujuanUntuk(h.kasus + " " + h.tuntutan, T) });
    }
    return {
      id: c.id, no: c.no, judul: c.judul, sidik: c.sidik, tujuan: T, dimensi: c.dimensi, lencana: lencana,
      dialog: dialog, misi: misi.map(function (m) { m.sidik = sidik([c.sidik, m.id]); return m; }),
      penutup: c.rangkuman.slice(0, 4), refleksi: c.refleksi.slice(0, 3), stem: akt && akt.steam ? akt.steam : null
    };
  }
  function bangunGame(B, opsi) {
    opsi = opsi || {};
    var jenjang = opsi.jenjang || B.jenjang || "SMP", A = aturan(jenjang, opsi.mode); A.jenjang = jenjang;
    return { bukuId: B.id, judul: B.judul, sidik: B.sidik, jenjang: jenjang, mode: opsi.mode || "normal", aturan: A, tokoh: TOKOH,
      level: B.bab.map(function (c) { return bangunLevel(c, B, A); }), final: B.aas.length ? { soal: B.aas } : null };
  }

  /* Bentuk minimal SERAT untuk Arena Papan STEM (mode papan kelas) */
  function keSeratMini(B) {
    return { meta: { judul: B.judul, mapel: B.mapel, kelas: B.kelas }, glosarium: B.glosarium,
      aas: { pg: B.aas.map(function (q) { return { q: q.q, opsi: q.opsi, kunci: HURUF[q.kunci] }; }) },
      chapters: B.bab.map(function (c) { return { judul: c.judul, kataKunci: c.kataKunci, subbab: c.subbab.map(function (s) { return { judul: s.judul, isi: s.paragraf.join("\n") }; }), pg: c.soal.map(function (q) { return { q: q.q, opsi: q.opsi, kunci: HURUF[q.kunci] }; }), ayoMencoba: c.aktivitas ? { judul: c.aktivitas.judul, langkah: c.aktivitas.langkah.map(function (l) { return (l.tahap ? l.tahap + ": " : "") + l.isi; }) } : null }; }) };
  }
  /* bandingkan dua versi buku: bab mana yang berubah */
  function bandingkan(lama, baru) {
    var L = {}; (lama && lama.bab || []).forEach(function (c) { L[c.judul.toLowerCase()] = c.sidik; });
    return baru.bab.map(function (c) { var s = L[c.judul.toLowerCase()]; return { id: c.id, judul: c.judul, status: s === undefined ? "baru" : (s === c.sidik ? "sama" : "berubah") }; });
  }
  return { dariSerat: dariSerat, dariBaris: dariBaris, bangunGame: bangunGame, keSeratMini: keSeratMini, bandingkan: bandingkan, sidik: sidik, slugify: slugify, aturan: aturan, jenjangDari: jenjangDari, TOKOH: TOKOH };
});
