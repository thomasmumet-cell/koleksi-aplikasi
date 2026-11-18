#!/usr/bin/env node
/* Bangun pustaka Book to Game dari proyek SERAT STEM (.json).
   node book-to-game/alat/bangun.js Proyek_Buku.json [lagi.json ...]   → buku/<id>.json + buku/pustaka.js
   node book-to-game/alat/bangun.js --bangun                           → susun ulang pustaka.js saja
   Nama penulis, profil, dan data pribadi tidak ikut (model BUKU hanya berisi materi). */
"use strict";
const fs = require("fs"), path = require("path"), B2G = require("../inti.js");
const DIR = path.join(__dirname, "..", "buku"); fs.mkdirSync(DIR, { recursive: true });
const args = process.argv.slice(2).filter(a => a !== "--bangun");
for (const f of args) {
  try {
    const b = B2G.dariSerat(JSON.parse(fs.readFileSync(f, "utf8")));
    const g = B2G.bangunGame(b, {});
    fs.writeFileSync(path.join(DIR, b.id + ".json"), JSON.stringify(b));
    console.log(`OK  ${b.id}: ${g.level.length} level, ${g.level.reduce((a, l) => a + l.misi.length, 0)} misi, sidik ${b.sidik}`);
  } catch (e) { console.error(`GAGAL ${f}: ${e.message}`); process.exitCode = 1; }
}
const semua = fs.readdirSync(DIR).filter(n => n.endsWith(".json")).sort().map(n => JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8")));
fs.writeFileSync(path.join(DIR, "pustaka.js"), "/* Dibuat otomatis oleh alat/bangun.js — jangan disunting manual. */\nwindow.PUSTAKA_B2G = " + JSON.stringify(semua).replace(/</g, "\\u003c") + ";\n");
console.log(`pustaka.js: ${semua.length} buku`);
