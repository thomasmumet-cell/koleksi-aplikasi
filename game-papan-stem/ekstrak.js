/* =====================================================================
   Ekstraktor paket game dari proyek buku SERAT STEM (.json / localStorage).
   Dipakai bersama oleh halaman Game Papan STEM (browser) dan alat Node
   alat/buat-paket.js (untuk tugas otomatis). Hanya mengambil bahan game:
   judul bab, soal pilihan ganda, kata kunci, glosarium, langkah proyek.
   ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.EkstrakSerat = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var HURUF = "ABCDE";
  function teks(v) { return String(v == null ? "" : v).replace(/\*\*?|__/g, "").replace(/\s+/g, " ").trim(); }
  function slugify(s) {
    return teks(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "buku";
  }
  function soalDari(list) {
    var out = [];
    (list || []).forEach(function (p) {
      if (!p || !p.q || !Array.isArray(p.opsi) || p.opsi.length < 2) return;
      var k = String(p.kunci || "").trim().toUpperCase().charAt(0), i = HURUF.indexOf(k);
      var opsi = p.opsi.map(teks).filter(function (x) { return x; });
      if (i < 0 || i >= opsi.length) return;
      out.push({ q: teks(p.q), opsi: opsi, kunci: i });
    });
    return out;
  }
  function isiBab(c) {
    var t = [c.judul, c.apersepsi].concat((c.subbab || []).map(function (s) { return (s.judul || "") + " " + (s.isi || ""); }), c.rangkuman || [], c.kataKunci || []);
    return teks(t.join(" ")).toLowerCase();
  }
  function hitung(hay, kata) {
    kata = kata.toLowerCase(); if (!kata) return 0;
    var n = 0, i = hay.indexOf(kata);
    while (i > -1) { n++; i = hay.indexOf(kata, i + kata.length); }
    return n;
  }
  function langkahDari(am) {
    return ((am && am.langkah) || []).map(function (l) {
      l = teks(l); var m = l.match(/^([^:]{3,40}):\s*(.+)$/);
      return m ? { tahap: m[1].trim(), isi: m[2].trim() } : { tahap: "", isi: l };
    }).filter(function (x) { return x.isi; });
  }
  /* buku: objek proyek SERAT STEM. Mengembalikan paket game atau melempar Error. */
  function ekstrak(buku, opsi) {
    opsi = opsi || {};
    if (!buku || !Array.isArray(buku.chapters) || !buku.chapters.length) throw new Error("Berkas ini bukan proyek buku SERAT STEM (tidak ada bab).");
    var meta = buku.meta || {}, judul = teks(meta.judul) || "Buku tanpa judul";
    var glos = (buku.glosarium || []).map(function (g) { return { istilah: teks(g.istilah), arti: teks(g.arti) }; })
      .filter(function (g) { return g.istilah && g.arti; });
    var isi = buku.chapters.map(isiBab);
    var babGlos = buku.chapters.map(function () { return []; });
    glos.forEach(function (g) {
      var best = -1, skor = 0;
      isi.forEach(function (h, i) { var s = hitung(h, g.istilah); if (s > skor) { skor = s; best = i; } });
      if (best > -1) babGlos[best].push(g);
    });
    var bab = buku.chapters.map(function (c, i) {
      return {
        no: i + 1,
        judul: teks(c.judul) || "Bab " + (i + 1),
        kataKunci: (c.kataKunci || []).map(teks).filter(Boolean),
        soal: soalDari(c.pg),
        istilah: babGlos[i],
        proyek: teks(c.ayoMencoba && c.ayoMencoba.judul),
        langkah: langkahDari(c.ayoMencoba)
      };
    }).filter(function (b) { return b.soal.length || b.istilah.length || b.langkah.length; });
    if (!bab.length) throw new Error("Bab belum berisi soal, glosarium, atau langkah proyek. Lengkapi naskah di SERAT STEM dahulu.");
    return {
      v: 1,
      slug: opsi.slug || slugify(judul + (meta.kelas ? " kelas " + meta.kelas : "")),
      judul: judul,
      mapel: teks(meta.mapel),
      kelas: teks(meta.kelas),
      sumber: "SERAT STEM",
      diperbarui: opsi.tanggal || new Date().toISOString().slice(0, 10),
      bab: bab,
      aas: soalDari(buku.aas && buku.aas.pg),
      glosarium: glos
    };
  }
  return { ekstrak: ekstrak, slugify: slugify };
});
