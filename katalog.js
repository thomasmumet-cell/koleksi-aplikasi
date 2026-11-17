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
    nama: "Jurnal Layanan BK",
    kategori: "Bimbingan Konseling",
    jenis: "HTML",
    deskripsi: "Catat layanan BK harian (konseling individual/kelompok, bimbingan klasikal, konsultasi, mediasi, kunjungan rumah, rujukan) per bidang pribadi, sosial, belajar, karier lengkap dengan durasi, hasil, dan tindak lanjut; rekap bulanan/semester, grafik sebaran, dan laporan cetak agregat. Data hanya di perangkat, dikunci PIN.",
    tanggal: "2026-11-18",
    tautan: "bk-jurnal-layanan/",
    status: "aktif"
  },
  {
    nama: "Latihan TKA Matematika",
    kategori: "Persiapan TKA",
    jenis: "HTML",
    deskripsi: "Latihan TKA Matematika SMP per domain (Bilangan, Aljabar, Geometri dan Pengukuran, Data dan Peluang) dengan 52 soal orisinal berstimulus konteks sehari-hari, mode latihan berpembahasan langkah demi langkah, tes berwaktu 30 soal/75 menit, dan peta kekuatan per domain dan level kognitif. Soal tambahan AI Gemini opsional.",
    tanggal: "2026-11-18",
    tautan: "tka-matematika/",
    status: "aktif"
  },
  {
    nama: "Peta Beban Mengajar Guru",
    kategori: "Sekolah",
    jenis: "HTML",
    deskripsi: "Susun pembagian jam pelajaran per guru dan per kelas, hitung JP tatap muka plus ekuivalensi tugas tambahan (Permendikdasmen 11/2025), tandai guru di bawah 24 atau di atas 40 JP, deteksi mapel/rombel yang belum terisi, dan cetak lampiran SK pembagian tugas.",
    tanggal: "2026-11-18",
    tautan: "beban-mengajar-guru/",
    status: "aktif"
  },
  {
    nama: "SERAT STEM – Mesin Pembuat Buku Berbasis STEM",
    kategori: "Pembelajaran",
    jenis: "AI Tool",
    deskripsi: "Mesin sekali klik untuk menulis naskah buku SMP berbasis STEM sesuai template penerbit (17,6 × 25 cm, ekspor .docx): judul, CP, prakata, semua bab, proyek PBL-STEM, asesmen, glosarium, dan pustaka. Dikunci pada Panduan STEM Kemendikdasmen 2025 dan Cetak Biru STEM Mendalam (Prof. Asri Widowati). Isi kunci API Gemini; simpan ke Google Drive lewat Apps Script sendiri.",
    tanggal: "2026-11-17",
    tautan: "serat-stem/",
    status: "aktif"
  },
  {
    nama: "Dompetku – Keuangan Pribadi",
    kategori: "Keuangan",
    jenis: "HTML",
    deskripsi: "Catat pemasukan dan pengeluaran, anggaran per kategori, batas aman belanja per hari, grafik harian, dan perkiraan akhir bulan. Versi ini menyimpan data di perangkat; versi Google Sheets ada di repo kode-apps-script.",
    tanggal: "2026-11-17",
    tautan: "dompetku/",
    status: "aktif"
  },
  {
    nama: "E-Course Pendidikan Karakter di Sekolah",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Lima modul untuk guru dan kepala sekolah: konsep karakter, kebijakan Kemendikdasmen 2026, empat jalur penerapan, langkah kepala sekolah, dan lembar kerja program, dengan kuis dan tanda selesai.",
    tanggal: "2026-11-16",
    tautan: "ecourse-pendidikan-karakter/",
    status: "aktif"
  },
  {
    nama: "Jurnal Harian Kepala Sekolah",
    kategori: "Sekolah",
    jenis: "HTML",
    deskripsi: "Catat kegiatan harian kepala sekolah lengkap dengan kategori, tempat, hasil, tindak lanjut, dan foto; bisa dicetak, diunduh, dan diimpor.",
    tanggal: "2026-11-16",
    tautan: "jurnal-harian-ks/",
    status: "aktif"
  },
  {
    nama: "PRANATA – Administrasi Kepala Sekolah",
    kategori: "Sekolah",
    jenis: "HTML",
    deskripsi: "Sistem administrasi kepala sekolah yang disusun menurut tugas pokok: perencanaan, supervisi, manajerial, kewirausahaan, dan dokumen.",
    tanggal: "2026-11-15",
    tautan: "pranata/",
    status: "aktif"
  },
  {
    nama: "Kamus Tiga Bahasa",
    kategori: "Pembelajaran",
    jenis: "AI Tool",
    deskripsi: "Kamus Inggris, Indonesia, dan Jawa (ngoko, krama, krama inggil) dengan latihan dan gambar AI (isi kunci API Gemini).",
    tanggal: "2026-11-14",
    tautan: "kamus-tiga-bahasa/",
    status: "aktif"
  },
  {
    nama: "Aset Pintar",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Mesin analisis aset sekolah dari Buku Inventaris/KIB dan rekap aset: ringkasan kondisi, temuan, dan rekomendasi. Data sekolah diimpor sendiri.",
    tanggal: "2026-11-11",
    tautan: "aset-pintar/",
    status: "aktif"
  },
  {
    nama: "RKAS Pintar",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Agen AI untuk bendahara sekolah menyusun RKAS Dana BOS sesuai juknis.",
    tanggal: "2026-11-11",
    tautan: "rkas-pintar/",
    status: "aktif"
  },
  {
    nama: "Bendahara Revit Pintar",
    kategori: "Sekolah",
    jenis: "AI Tool",
    deskripsi: "Agen AI bendahara P2SP revitalisasi SMP 2026: transaksi, upah tenaga kerja, buku kas, laporan, dan pemeriksaan otomatis.",
    tanggal: "2026-11-11",
    tautan: "bendahara-revit-pintar/",
    status: "aktif"
  },
  {
    nama: "Rapor Pintar",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Analisis hasil Rapor Pendidikan dan rencana tindak lanjut sekolah. Impor file Rapor Pendidikan sekolah Anda.",
    tanggal: "2026-11-11",
    tautan: "rapor-pintar/",
    status: "aktif"
  },
  {
    nama: "Kas Sekawan Touring Club",
    kategori: "Keuangan",
    jenis: "HTML",
    deskripsi: "Kas kelompok 5 anggota: iuran per orang, pengeluaran, saldo, dan riwayat.",
    tanggal: "2026-11-05",
    tautan: "kas-sekawan/",
    status: "aktif"
  },
  {
    nama: "Latihan TKAD Bahasa Inggris – Paket A",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Latihan soal TKAD Bahasa Inggris Paket A Tahap 1 dengan tampilan seperti aplikasi TKA.",
    tanggal: "2026-11-04",
    tautan: "latihan-tkad-inggris/",
    status: "aktif"
  },
  {
    nama: "7 Gerakan Indonesia Hebat",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Ceklis kebiasaan harian 7 Kebiasaan Anak Indonesia Hebat dengan rekap 7 hari dan cetak.",
    tanggal: "2026-11-02",
    tautan: "7-gerakan/",
    status: "aktif"
  },
  {
    nama: "Infak Siswa",
    kategori: "Keuangan",
    jenis: "HTML",
    deskripsi: "Pencatatan infak harian kelas 7, 8, dan 9: pemasukan, total, pengeluaran, dan salin rekap.",
    tanggal: "2026-10-30",
    tautan: "infak-siswa/",
    status: "aktif"
  },
  {
    nama: "Sahabat Kepsek",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Asisten tanya jawab kepala sekolah SMP/MTs: regulasi, BOS/BOSP, dokumen sekolah, dan surat dinas.",
    tanggal: "2026-10-21",
    tautan: "sahabat-kepsek/",
    status: "aktif"
  },
  {
    nama: "Asisten Kepala Sekolah",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Chatbot dan prompt siap pakai untuk tugas manajerial, kewirausahaan, dan supervisi kepala sekolah.",
    tanggal: "2026-10-21",
    tautan: "asisten-kepala-sekolah/",
    status: "aktif"
  },
  {
    nama: "Asisten MKKS SMP",
    kategori: "Organisasi",
    jenis: "AI Tool",
    deskripsi: "Asisten untuk kepala sekolah anggota MKKS: regulasi, juknis BOS/BOSP, dokumen sekolah, dan draf surat.",
    tanggal: "2026-10-10",
    tautan: "asisten-mkks/",
    status: "aktif"
  },
  {
    nama: "ATUR PRIKSA",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Layanan izin siswa: orang tua atau siswa melaporkan siswa yang tidak masuk atau tidak ikut kegiatan sekolah. Kode tersimpan di repo privat kode-apps-script.",
    tanggal: "2026-11-14",
    status: "kode"
  },
  {
    nama: "JAGA KELAS",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Lapor kelas kosong oleh ketua kelas dengan dasbor guru piket (bit.ly/jaga_kelas). Kode tersimpan di repo privat kode-apps-script.",
    tanggal: "2026-11-14",
    status: "kode"
  },
  {
    nama: "Belajar Mengaji untuk Pemula",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Belajar membaca Al-Qur'an bertahap seperti iqra: huruf hijaiyah, huruf bersambung, harakat, tanwin, sukun, mad, tasydid, alif lam, surat pendek dengan rekaman qari (Alafasy), dan kuis.",
    tanggal: "2026-11-17",
    tautan: "belajar-ngaji/",
    status: "aktif"
  },
  {
    nama: "E-Course Belajar HTML dari Nol",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Kursus HTML 12 bab untuk guru dan siswa: penjelasan singkat, editor kode dengan pratinjau langsung, tugas dinilai otomatis, contekan tag, dan sertifikat penyelesaian yang bisa dicetak.",
    tanggal: "2026-11-17",
    tautan: "belajar-html/",
    status: "aktif"
  },
  {
    nama: "Meja Host Podcast",
    kategori: "Organisasi",
    jenis: "HTML",
    deskripsi: "Pemandu host podcast PGRI DIY untuk satu tema dengan 2 atau 3 narasumber: rundown otomatis, naskah host, bank pertanyaan, dan Mode Siaran dengan timer serta pencatat waktu bicara. Tombol Buatkan 3 pertanyaan menambah pertanyaan otomatis (bank pola atau AI Gemini). Dilengkapi landing page.",
    tanggal: "2026-11-16",
    tautan: "meja-host-podcast/",
    status: "aktif"
  },
  {
    nama: "BOS Analitik AI",
    kategori: "AI Tool",
    jenis: "AI Tool",
    deskripsi: "Analisis dana BOS dari PDF DPA/DPPA SIPD atau Excel BKU/RKAS ARKAS: dashboard sumber dana dan jenis belanja, cek batas Juknis BOSP 2026, temuan otomatis, laporan dan tanya jawab AI (isi API key Gemini di Pengaturan).",
    tanggal: "2026-11-11",
    tautan: "bos-analitik-ai/",
    status: "aktif"
  },
  {
    nama: "PAMIT",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Pengajuan dan Monitoring Izin Terpadu untuk guru dan karyawan: lapor izin lewat HP, laporan otomatis ke Kepala Sekolah dan Kurikulum (email/Telegram), daftar izin hari ini, dan rekap bulanan.",
    tanggal: "2026-11-10",
    tautan: "https://thomasmumet-cell.github.io/pamit/",
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
    nama: "SIMPATI",
    kategori: "Sekolah",
    jenis: "Apps Script",
    deskripsi: "Sistem Informasi Monitoring Presensi dan Tata Tertib untuk guru piket.",
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
