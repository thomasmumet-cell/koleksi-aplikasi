// =====================================================================
//  DAFTAR APLIKASI — satu baris kurung kurawal { } untuk satu aplikasi.
//  Aplikasi terbaru cukup ditambahkan di bagian ATAS daftar.
//
//  status:  "aktif"  = sudah diunggah, tombol Buka berfungsi
//           "kode"   = kode tersimpan di repo privat kode-apps-script
//           "segera" = belum diunggah ke koleksi
//  jenis:   "HTML" | "Apps Script" | "AI Tool"
// =====================================================================

const APLIKASI = [
  {
    nama: "PAMIT",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Pengajuan dan Monitoring Izin Terpadu untuk guru dan karyawan: lapor izin lewat HP, laporan otomatis ke Kepala Sekolah dan Kurikulum (email/Telegram), daftar izin hari ini, dan rekap bulanan.",
    tanggal: "2026-11-10",
    tautan: "pamit/",
    status: "aktif"
  },
  {
    nama: "Toko Bunga Melati",
    kategori: "Latihan",
    jenis: "HTML",
    deskripsi: "Halaman toko bunga dengan daftar harga dan keranjang belanja. Latihan pertama GitHub.",
    tanggal: "2026-11-10",
    tautan: "https://thomasmumet-cell.github.io/tokobunga/",
    status: "aktif"
  },
  {
    nama: "RKJM Pintar & RKT Pintar",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Penyusun Rencana Kerja Jangka Menengah dan Tahunan sekolah, dapat mengimpor Rapor Pendidikan.",
    status: "segera"
  },
  {
    nama: "Simulasi TKA",
    kategori: "Pembelajaran",
    jenis: "Apps Script",
    deskripsi: "Simulasi Tes Kemampuan Akademik berbasis komputer, dengan menu admin untuk input soal oleh guru.",
    status: "segera"
  },
  {
    nama: "Monitoring Revitalisasi Lab",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Pemantauan dana, material, upah, progres, dan foto revitalisasi ruang laboratorium.",
    status: "segera"
  },
  {
    nama: "Kas 5 Sekawan Tour",
    kategori: "Keuangan",
    jenis: "HTML",
    deskripsi: "Kas kelompok: iuran per orang, total, pengeluaran, dan saldo.",
    status: "segera"
  },
  {
    nama: "SIMPATI",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Sistem Informasi Monitoring Presensi dan Tata Tertib untuk guru piket.",
    status: "segera"
  },
  {
    nama: "Infak Siswa",
    kategori: "Keuangan",
    jenis: "HTML",
    deskripsi: "Pencatatan infak harian kelas 7, 8, dan 9: pemasukan, total, dan pengeluaran.",
    status: "segera"
  },
  {
    nama: "Pengumuman Kelulusan",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Pengumuman kelulusan siswa secara daring dengan data dari Google Sheets.",
    status: "segera"
  },
  {
    nama: "Chatbot Guru BK",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Asisten penyusunan Program Bimbingan dan Konseling untuk semua jenjang.",
    status: "segera"
  },
  {
    nama: "Chef Ramadhan Indonesia",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Resep, menu sahur, berbuka, takjil, menu 30 hari, daftar belanja, dan anggaran.",
    status: "segera"
  },
  {
    nama: "Aplikasi KBM Slash Command",
    kategori: "Pembelajaran",
    jenis: "AI Tool",
    deskripsi: "20 perintah garis miring (/diagram, /quiz, /RPP, dan lain-lain) pendukung kegiatan belajar mengajar.",
    status: "segera"
  },
  {
    nama: "Laporan Vokasional ABK",
    kategori: "ABK & Inklusi",
    jenis: "HTML",
    deskripsi: "Pelaporan penilaian keterampilan vokasional ABK (memasak, cuci motor, dan lainnya) dari PPI dan rubrik.",
    status: "segera"
  },
  {
    nama: "Gamifikasi IPA Kelas 7",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Permainan klasifikasi makhluk hidup yang ramah bagi siswa dengan kesulitan belajar.",
    status: "segera"
  },
  {
    nama: "Kalender Agenda MKKS",
    kategori: "Organisasi",
    jenis: "HTML",
    deskripsi: "Kalender agenda interaktif untuk web MKKS SMP/MTs Kota Yogyakarta, terhubung Google Sheets.",
    status: "segera"
  },
  {
    nama: "Jurnal Baca Digital",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Jurnal baca siswa untuk program literasi, disematkan di Google Sites.",
    status: "segera"
  }
];
