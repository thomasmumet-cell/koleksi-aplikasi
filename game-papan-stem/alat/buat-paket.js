#!/usr/bin/env node
/* Ubah proyek buku SERAT STEM (.json) menjadi paket game papan interaktif.
   Pemakaian:
     node game-papan-stem/alat/buat-paket.js Proyek_Buku.json [lagi.json ...]
     node game-papan-stem/alat/buat-paket.js --bangun     (hanya menyusun ulang buku/paket.js)
   Hasil: game-papan-stem/buku/<slug>.json dan game-papan-stem/buku/paket.js
   Tidak menyimpan nama penulis, profil, atau gambar; hanya bahan game. */
"use strict";
const fs = require("fs"), path = require("path");
const E = require("../ekstrak.js");
const DIR = path.join(__dirname, "..", "buku");
fs.mkdirSync(DIR, { recursive: true });
const tanggal = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
const args = process.argv.slice(2).filter(a => a !== "--bangun");
let ok = 0;
for (const f of args) {
  try {
    const buku = JSON.parse(fs.readFileSync(f, "utf8"));
    const p = E.ekstrak(buku, { tanggal });
    fs.writeFileSync(path.join(DIR, p.slug + ".json"), JSON.stringify(p, null, 1));
    const ns = p.bab.reduce((a, b) => a + b.soal.length, 0), ni = p.bab.reduce((a, b) => a + b.istilah.length, 0);
    console.log(`OK  ${p.slug}: ${p.bab.length} bab, ${ns} soal bab + ${p.aas.length} soal AAS, ${ni} istilah, ${p.bab.filter(b => b.langkah.length >= 3).length} proyek`);
    ok++;
  } catch (e) { console.error(`GAGAL ${f}: ${e.message}`); process.exitCode = 1; }
}
const paket = fs.readdirSync(DIR).filter(n => n.endsWith(".json")).sort()
  .map(n => JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8")));
fs.writeFileSync(path.join(DIR, "paket.js"),
  "/* Dibuat otomatis oleh alat/buat-paket.js — jangan disunting manual. */\nwindow.PAKET_BUKU = " + JSON.stringify(paket) + ";\n");
console.log(`paket.js: ${paket.length} buku` + (args.length ? `, ${ok}/${args.length} berkas diproses` : ""));
