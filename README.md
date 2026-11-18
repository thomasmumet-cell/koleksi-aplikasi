# Koleksi Aplikasi

Kumpulan aplikasi buatan Thomas untuk sekolah, pembelajaran, dan organisasi.

**Katalog:** https://thomasmumet-cell.github.io/koleksi-aplikasi/

## Susunan

- `index.html`: halaman katalog (pencarian dan kategori)
- `katalog.js`: daftar semua aplikasi. Tambahkan aplikasi baru di sini.
- `nama-aplikasi/index.html`: satu folder untuk setiap aplikasi

## Menambah aplikasi baru

1. Buat folder baru, misalnya `infak-siswa/`, lalu isi dengan `index.html` aplikasinya.
2. Tambahkan satu entri di bagian atas `katalog.js` dengan `status: "aktif"` dan
   `tautan: "infak-siswa/"`.

Atau cukup bilang ke Claude: **"Simpan ke koleksi, kategori ...".**

> Repo ini Public. Jangan simpan kata sandi, ID spreadsheet sekolah, atau data pribadi siswa di sini.
> Kode Google Apps Script disimpan di repo Private `kode-apps-script`.

## Arena Papan STEM (game otomatis dari buku SERAT STEM)

Setiap buku SERAT STEM otomatis punya 3 game papan interaktif di `game-papan-stem/`.
Untuk memasukkan buku baru ke koleksi (berkas `Proyek_*.json` hasil SERAT STEM):

```
node game-papan-stem/alat/buat-paket.js Proyek_Judul_Buku.json
```

Perintah itu membuat `game-papan-stem/buku/<slug>.json` dan menyusun ulang `buku/paket.js`
(hanya soal, glosarium, kata kunci, dan langkah proyek; tanpa nama penulis atau gambar).

## Book to Game (buku STEM → game petualangan)

`book-to-game/` membaca buku (Word, PDF, proyek SERAT STEM, teks) menjadi model BUKU (`inti.js`),
lalu membangun game: level per bab, misi, lab virtual, kuis, lencana, rapor capaian. Aplikasi PWA
(bisa dipasang di Android/Windows) dan bisa diunduh sebagai game luring satu berkas per buku.

Menambah/memperbarui buku bawaan dari berkas `Proyek_*.json` SERAT STEM:

```
node book-to-game/alat/bangun.js Proyek_Judul_Buku.json
```
