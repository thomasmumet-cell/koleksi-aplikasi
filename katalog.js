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
    nama: "Pengelola Ekstrakurikuler",
    kategori: "Sekolah",
    jenis: "HTML",
    deskripsi: "Satu tempat untuk mengelola ekskul wajib kepanduan dan ekskul pilihan: pembina, anggota beserta peran, jadwal mingguan dengan deteksi bentrok tempat/murid, presensi latihan, dan catatan prestasi. Nilai rapor dihitung dari skor indikator dan kehadiran menjadi predikat serta deskripsi yang bisa disunting (CSV untuk e-Rapor), dilengkapi peringatan murid yang belum ikut ekskul wajib dan laporan evaluasi per ekskul siap cetak; data hanya di perangkat.",
    tanggal: "2026-11-21",
    tautan: "ekskul/",
    status: "aktif"
  },
  {
    nama: "Latihan TKA Bahasa Inggris",
    kategori: "Persiapan TKA",
    jenis: "HTML",
    deskripsi: "Penguatan Bahasa Inggris SMP (bukan mata uji TKA SMP): 77 soal orisinal dari 16 teks fungsional pendek dan esai sederhana plus 8 rekaman menyimak bersuara (speechSynthesis), dengan pembahasan berbahasa Indonesia dan bukti yang disorot di teks. Peta lima keterampilan membaca (main idea, detail, inference, vocabulary, reference) per level kognitif, tes berwaktu bergaya CBT, dan soal tambahan AI Gemini opsional.",
    tanggal: "2026-11-21",
    tautan: "tka-bahasa-inggris/",
    status: "aktif"
  },
  {
    nama: "Tiket Keluar & Refleksi",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Exit ticket digital untuk 3–5 menit terakhir pelajaran: 1–3 soal cek pemahaman (PG, benar/salah, isian) plus refleksi pembelajaran mendalam (keyakinan, perasaan, kebermaknaan, pertanyaan tersisa) yang diisi murid bergiliran di perangkat guru atau di kertas cetak. Rekap otomatis mengelompokkan murid Siap lanjut/Perlu penguatan/Perlu pendampingan, menandai “yakin tapi keliru”, menganalisis soal dan miskonsepsi, menyimpan rencana tindak lanjut guru, dan menampilkan tren per kelas; ringkasan AI Gemini opsional.",
    tanggal: "2026-11-21",
    tautan: "tiket-keluar/",
    status: "aktif"
  },
  {
    nama: "Book to Game – Buku STEM jadi Game",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Mesin pembangun game dari buku: unggah buku STEM (Word, PDF, atau proyek SERAT STEM) dan setiap bab otomatis menjadi level petualangan yang saling terhubung, lengkap dengan tokoh dan dialog, kartu konsep bergambar, kode istilah, gerbang kuis, lab virtual (alat, langkah rekayasa, kriteria, prediksi), tantangan bos berubrik, lencana, tingkat kesulitan SD/SMP/SMA, dan rapor capaian per tujuan pembelajaran. Revisi buku langsung menyinkronkan game (hanya bab yang berubah), bisa dipasang di Android/Windows atau diunduh sebagai game luring satu berkas; AI Gemini opsional menambah dialog, soal, dan eksperimen simulasi dari isi bab.",
    tanggal: "2026-11-19",
    tautan: "book-to-game/",
    status: "aktif"
  },
  {
    nama: "Arena Papan STEM – Game Papan Interaktif",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Mesin otomatis yang mengubah setiap buku SERAT STEM menjadi 3 game untuk papan interaktif (IFP): Duel Kilat (adu cepat dua tim kiri–kanan dari soal tiap bab dan asesmen akhir), Memori Istilah (cocokkan kartu glosarium), dan Susun Langkah Proyek (urutkan tahap rekayasa “Ayo Mencoba”). Sudah berisi buku Sains Itu Seru! IPA Berbasis STEM kelas VII; buku baru masuk lewat tombol 🎮 Game Papan di SERAT STEM atau impor berkas proyek.",
    tanggal: "2026-11-19",
    tautan: "game-papan-stem/",
    status: "aktif"
  },
  {
    nama: "AKPD – Angket Kebutuhan Peserta Didik",
    kategori: "Bimbingan Konseling",
    jenis: "HTML",
    deskripsi: "Angket kebutuhan murid 48 butir orisinal bidang pribadi, sosial, belajar, karier yang diisi murid bergantian di perangkat guru (keluar dengan PIN) atau disalin dari lembar cetak; analisis otomatis persentase per butir, bidang, dan kelas, peringkat dan kategori kebutuhan, daftar rahasia butir perhatian khusus, serta tabel prioritas layanan dan narasi deskripsi kebutuhan untuk program BK. Data hanya di perangkat, dikunci PIN.",
    tanggal: "2026-11-19",
    tautan: "bk-akpd/",
    status: "aktif"
  },
  {
    nama: "Asesmen Diagnostik Kilat",
    kategori: "Pembelajaran",
    jenis: "HTML",
    deskripsi: "Asesmen awal literasi membaca dan numerasi 12 butir orisinal (bisa diganti soal sekolah), input benar/salah per siswa secepat ketuk atau ketik, lalu siswa otomatis dikelompokkan Perlu bimbingan/Cukup/Mahir lengkap dengan fokus indikator, saran aktivitas pembelajaran mendalam per kelompok, analisis butir, peta silang literasi × numerasi, dan putaran pemantauan untuk pengelompokan ulang. Saran AI Gemini opsional.",
    tanggal: "2026-11-19",
    tautan: "asesmen-diagnostik/",
    status: "aktif"
  },
  {
    nama: "Latihan TKA Bahasa Indonesia",
    kategori: "Persiapan TKA",
    jenis: "HTML",
    deskripsi: "Latihan TKA Bahasa Indonesia SMP dengan 17 teks orisinal (artikel, berita, dua teks, infografis, tabel, grafik, poster, cerpen, fabel, legenda, puisi, drama), satu teks untuk 2–3 soal (47 soal PG, PG kompleks, benar/salah), mode latihan berpembahasan, tes berwaktu 30 soal/75 menit, dan peta kemampuan per kompetensi. Soal tambahan AI Gemini opsional.",
    tanggal: "2026-11-18",
    tautan: "tka-bahasa-indonesia/",
    status: "aktif"
  },
  {
    nama: "Latihan TKAD Bahasa Inggris – Bacaan Panjang",
    kategori: "Persiapan TKA",
    jenis: "HTML",
    deskripsi: "Latihan membaca model TKAD DIY: 18 bacaan panjang orisinal berilustrasi dan 3 teks bergambar (label, papan aturan, denah) dari lima jenis teks, tiap bacaan untuk 2–3 soal (62 soal PG, PG kompleks, True/False), mode latihan berpembahasan, tes berwaktu ±40 soal/90 menit, dan peta kemampuan per jenis teks dan proses membaca. Bacaan dan soal tambahan dari AI Gemini bersifat opsional.",
    tanggal: "2026-11-18",
    tautan: "tkad-inggris-bacaan/",
    status: "aktif"
  },
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
    deskripsi: "Susun pembagian jam pelajaran per guru dan per kelas, hitung JP tatap muka plus ekuivalensi tugas tambahan (Permendikdasmen 11/2025), tandai guru di bawah 24 atau di atas 40 JP, deteksi mapel/rombel yang belum terisi, dan cetak lampiran SK pembagian tugas. Data guru dan jadwal mengajar bisa diimpor dari Excel/Google Sheets atau CSV; dasbor jadwal menampilkan siapa mengajar sekarang, guru yang kosong untuk pengganti, pencarian per guru/kelas/mapel, dan cek bentrok.",
    tanggal: "2026-11-18",
    tautan: "beban-mengajar-guru/?v=20261118g",
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
