# Talenta10 — Asesmen Minat, Bakat & Potensi Siswa

Dikembangkan oleh **Edy Thomas**.

Talenta10 memetakan 8 aspek siswa SMP: kognitif akademik (Matematika, Bahasa Indonesia,
Bahasa Inggris, IPA, IPS), kecakapan berpikir, gaya belajar (V/A/K), kecerdasan majemuk,
minat karier RIASEC, ketahanan belajar & kecerdasan emosi (EQ, AQ, motivasi berprestasi),
8 Dimensi Profil Lulusan, serta minat dan cita-cita. Hasilnya berupa laporan 11 halaman A4
yang siap dicetak atau disimpan sebagai PDF, lengkap dengan rekomendasi ekstrakurikuler,
arah studi lanjut (SMA/SMK), karier, dan rencana aksi 4 minggu.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Tampilan aplikasi (siswa, laporan, panel Guru BK) |
| `Code.gs` | Kode server Google Apps Script (penyimpanan ke Google Sheets) |
| `demo.js` | Mode Demo: dipakai otomatis jika `index.html` dibuka di luar Apps Script, data tersimpan di perangkat |

## Memasang untuk sekolah (Google Apps Script)

1. Buat Google Sheets baru → **Ekstensi → Apps Script**.
2. Tempel isi `Code.gs`. Buat file HTML bernama **index**, tempel isi `index.html`. Simpan.
   (`demo.js` tidak perlu dipasang.)
3. Pilih fungsi **setup** → **Jalankan** → izinkan akses.
4. **Terapkan → Deployment baru → Aplikasi web**
   (Jalankan sebagai: Saya · Yang memiliki akses: Siapa saja) → salin URL berakhiran `/exec`.
5. Buka URL `/exec` tersebut. Untuk Google Sites: **Sisipkan → Sematkan → Menurut URL**
   (jangan "Sematkan kode").
6. Masuk **Guru BK** (password awal `bk123`), lalu segera ganti password di menu **Pengaturan**.

Soal akademik dapat diubah di sheet **SoalAkademik**; daftar ekstrakurikuler di menu **Daftar Ekskul**.

> Catatan: laporan Talenta10 adalah bahan bimbingan, bukan diagnosis psikologis.
> "Indeks Kecakapan Berpikir" bukan skor IQ.
