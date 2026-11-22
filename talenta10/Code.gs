/**
 * =====================================================================
 *  TALENTA10 — Asesmen Minat, Bakat & Potensi Siswa
 *  Dikembangkan oleh Edy Thomas
 *  Backend: Code.gs  |  Frontend: index.html  |  Database: Google Sheets
 * ---------------------------------------------------------------------
 *  CARA PASANG:
 *  1. Buat Google Sheets baru → Ekstensi → Apps Script.
 *  2. Tempel file ini ke Code.gs. Buat file HTML bernama "index",
 *     tempel isi index.html. Simpan.
 *  3. Pilih fungsi  setup  → Jalankan → Izinkan.
 *  4. Terapkan → Deployment baru → Aplikasi web
 *     (Jalankan sebagai: Saya | Akses: Siapa saja) → salin URL.
 *  Password Guru BK awal: bk123  (ganti di menu Pengaturan)
 *
 *  Catatan: hasil Talenta10 adalah gambaran awal potensi untuk
 *  bimbingan, bukan diagnosis psikologis.
 * =====================================================================
 */

var VERSI = 'Talenta10 v1.0';

var SH = {
  HASIL:   { name: 'Hasil', head: ['waktu','kode','nisn','nama','kelas','jk','tgl_lahir','gaya','mi_1','mi_2','mi_3','riasec','iku','akademik','eq','aq','am','ekskul','cita_cita','hasil_json','jawaban_json'] },
  SOAL:    { name: 'SoalAkademik', head: ['id','mapel','indikator','soal','A','B','C','D','kunci','aktif'] },
  EKSKUL:  { name: 'Ekskul', head: ['nama','tag','aktif'] },
  SETTING: { name: 'Pengaturan', head: ['kunci','nilai'] }
};

var DEFAULT_SET = {
  nama_sekolah: 'SMP Negeri 10 Yogyakarta',
  tahun_ajaran: '2026/2027',
  guru_bk: '',
  nip_bk: '',
  kepala_sekolah: '',
  nip_ks: '',
  password_bk: 'bk123',
  token: '',
  tampil_hasil: 'Y'
};

/* ============================== WEB APP ============================== */
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('Talenta10 — Asesmen Minat & Bakat')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* =============================== SETUP =============================== */
function setup() {
  var ss = ss_();
  Object.keys(SH).forEach(function (k) { sheet_(SH[k]); });
  var cur = setting_();
  var st = sheet_(SH.SETTING);
  Object.keys(DEFAULT_SET).forEach(function (k) { if (cur[k] === undefined) st.appendRow([k, DEFAULT_SET[k]]); });
  if (rows_(SH.SOAL).length === 0) {
    var s = sheet_(SH.SOAL);
    SOAL_AKADEMIK_AWAL.forEach(function (q) { s.appendRow([q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7], q[8], 'Y']); });
  }
  if (rows_(SH.EKSKUL).length === 0) {
    var e = sheet_(SH.EKSKUL);
    EKSKUL_AWAL.forEach(function (x) { e.appendRow([x[0], x[1], 'Y']); });
  }
  Object.keys(SH).forEach(function (k) {
    var s = ss.getSheetByName(SH[k].name);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, SH[k].head.length).setFontWeight('bold').setBackground('#3b2e83').setFontColor('#ffffff');
  });
  var d = ss.getSheetByName('Sheet1') || ss.getSheetByName('Lembar1');
  if (d && d.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(d);
  return 'Setup selesai';
}

function siap_() {
  var ss = ss_();
  if (!ss.getSheetByName(SH.SOAL.name) || rows_(SH.SOAL).length === 0 || !ss.getSheetByName(SH.SETTING.name)) setup();
}

/* ============================ HELPER DATA ============================ */
function ss_() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (ss) return ss;
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('SS_ID');
  if (id) return SpreadsheetApp.openById(id);
  ss = SpreadsheetApp.create('Database Talenta10');
  p.setProperty('SS_ID', ss.getId());
  return ss;
}
function sheet_(d) {
  var ss = ss_(), s = ss.getSheetByName(d.name);
  if (!s) { s = ss.insertSheet(d.name); s.getRange(1, 1, 1, d.head.length).setValues([d.head]); }
  else if (s.getLastRow() === 0) s.getRange(1, 1, 1, d.head.length).setValues([d.head]);
  return s;
}
function out_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  return v === null || v === undefined ? '' : v;
}
function rows_(d) {
  var s = sheet_(d), n = s.getLastRow();
  if (n < 2) return [];
  return s.getRange(2, 1, n - 1, d.head.length).getValues().map(function (r, i) {
    var o = { _row: i + 2 };
    d.head.forEach(function (h, j) { o[h] = out_(r[j]); });
    return o;
  }).filter(function (o) { return String(o[d.head[0]]) !== '' || String(o[d.head[1]]) !== ''; });
}
function setting_() {
  var s = ss_().getSheetByName(SH.SETTING.name), o = {};
  if (!s || s.getLastRow() < 2) return o;
  s.getRange(2, 1, s.getLastRow() - 1, 2).getValues().forEach(function (r) { if (r[0] !== '') o[String(r[0])] = String(r[1]); });
  return o;
}
function ya_(v) { return /^(y|ya|yes|true|1)$/i.test(String(v).trim()); }
function bulat_(x) { return Math.round(x); }

/* ===================== INSTRUMEN (BANK PERTANYAAN) ===================== */
/* Semua butir ditulis khusus untuk Talenta10. Skala Likert 1–5. */

var MI_NAMA = { ling: 'Linguistik', logis: 'Logis-Matematis', visual: 'Visual-Spasial', kines: 'Kinestetik',
  musik: 'Musikal', inter: 'Interpersonal', intra: 'Intrapersonal', natur: 'Naturalis' };
var RIASEC_NAMA = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
var KAR_NAMA = { motivasi: 'Motivasi Berprestasi', tekun: 'Ketekunan', sistem: 'Sistematika Belajar', mandiri: 'Kemandirian Belajar',
  adaptasi: 'Penyesuaian Diri', sadar: 'Kesadaran Diri', empati: 'Empati', kendali: 'Pengendalian Diri', aq: 'Daya Juang (AQ)' };
var DPL_NAMA = { iman: 'Keimanan & Ketakwaan', warga: 'Kewargaan', kritis: 'Penalaran Kritis', kreatif: 'Kreativitas',
  kolab: 'Kolaborasi', mandiri: 'Kemandirian', sehat: 'Kesehatan', komun: 'Komunikasi' };
var KC_NAMA = { analisa: 'Analisa–Sintesa', fleksibel: 'Berpikir Fleksibel', verbal: 'Kemampuan Verbal', praktis: 'Berpikir Praktis',
  numerik: 'Kemampuan Numerikal', abstrak: 'Kemampuan Abstraksi', literasi: 'Kemampuan Literasi' };

var KECAKAPAN = [
  { id: 'k1', sub: 'numerik', soal: 'Lanjutkan deret angka berikut: 2, 4, 8, 16, …', opsi: ['24', '30', '32', '36'], kunci: 'C' },
  { id: 'k2', sub: 'numerik', soal: 'Lanjutkan deret angka berikut: 3, 6, 10, 15, 21, …', opsi: ['26', '27', '28', '30'], kunci: 'C' },
  { id: 'k3', sub: 'verbal', soal: 'GURU : SEKOLAH = DOKTER : …', opsi: ['Obat', 'Rumah Sakit', 'Pasien', 'Stetoskop'], kunci: 'B' },
  { id: 'k4', sub: 'verbal', soal: 'Lawan kata (antonim) dari OPTIMIS adalah …', opsi: ['Pesimis', 'Realistis', 'Egois', 'Ragu-ragu'], kunci: 'A' },
  { id: 'k5', sub: 'abstrak', soal: 'Lanjutkan pola: ○ △ □ ○ △ □ ○ …', opsi: ['○', '△', '□', '◇'], kunci: 'B' },
  { id: 'k6', sub: 'abstrak', soal: 'Lanjutkan pola huruf: B, E, H, K, …', opsi: ['L', 'M', 'N', 'O'], kunci: 'C' },
  { id: 'k7', sub: 'analisa', soal: 'Semua anggota tim basket sekolah rajin berlatih. Dimas anggota tim basket sekolah. Kesimpulan yang tepat …', opsi: ['Dimas rajin berlatih', 'Dimas kapten tim', 'Dimas tidak rajin berlatih', 'Semua siswa rajin berlatih'], kunci: 'A' },
  { id: 'k8', sub: 'analisa', soal: 'Jika hujan turun, halaman sekolah basah. Pagi ini halaman sekolah tidak basah. Kesimpulan yang tepat …', opsi: ['Hujan turun', 'Tidak hujan', 'Halaman sudah kering', 'Tidak dapat disimpulkan'], kunci: 'B' },
  { id: 'k9', sub: 'fleksibel', soal: 'Manakah yang TIDAK satu kelompok dengan yang lain?', opsi: ['Mawar', 'Melati', 'Anggrek', 'Beringin'], kunci: 'D' },
  { id: 'k10', sub: 'fleksibel', soal: 'Manakah yang berbeda dari yang lain?', opsi: ['Segitiga', 'Persegi', 'Kubus', 'Lingkaran'], kunci: 'C' },
  { id: 'k11', sub: 'praktis', soal: 'Kamu sedang mengetik tugas di laptop, lalu muncul peringatan baterai tinggal 5%. Langkah pertama yang paling tepat …', opsi: ['Melanjutkan mengetik secepatnya', 'Menyimpan pekerjaan terlebih dahulu', 'Mematikan laptop', 'Mencari charger milik teman'], kunci: 'B' },
  { id: 'k12', sub: 'praktis', soal: 'Saat kerja kelompok, dua temanmu berselisih tentang pembagian tugas, padahal waktu tinggal sedikit. Tindakan paling tepat …', opsi: ['Membiarkan mereka sampai selesai berdebat', 'Mengerjakan semua tugas sendirian', 'Mengusulkan pembagian tugas yang adil lalu segera mulai bekerja', 'Melapor ke guru agar kelompok dibubarkan'], kunci: 'C' },
  { id: 'k13', sub: 'literasi', bacaan: 'Pohon di halaman sekolah ditanam sejak 20 tahun lalu. Saat siang terik, siswa senang duduk di bawahnya karena teduh. Daunnya yang gugur dikumpulkan petugas kebersihan untuk dijadikan kompos bagi taman sekolah.', soal: 'Manfaat pohon yang disebutkan dalam bacaan adalah …', opsi: ['Menghasilkan buah dan kayu', 'Memberi keteduhan dan bahan kompos', 'Menahan banjir dan longsor', 'Tempat bermain dan berolahraga'], kunci: 'B' },
  { id: 'k14', sub: 'literasi', bacaan: 'Rani selalu membawa botol minum dari rumah. Ia juga menolak sedotan plastik ketika membeli es teh di kantin. Menurutnya, langkah kecil itu dapat mengurangi sampah di sekolah.', soal: 'Sikap Rani dalam bacaan menunjukkan bahwa ia …', opsi: ['Hemat uang jajan', 'Tidak suka minum es teh', 'Peduli terhadap lingkungan', 'Ingin dipuji teman'], kunci: 'C' }
];

var GAYA = [
  { id: 'g1', soal: 'Saat mempelajari materi baru, aku paling cepat paham jika …', opsi: [['V', 'melihat gambar, diagram, atau video'], ['A', 'mendengar penjelasan guru atau teman'], ['K', 'mencoba atau mempraktikkannya langsung']] },
  { id: 'g2', soal: 'Saat menghafal materi, aku biasanya …', opsi: [['V', 'menulis dan mewarnai catatan'], ['A', 'membaca dengan suara keras berulang-ulang'], ['K', 'menghafal sambil berjalan atau bergerak']] },
  { id: 'g3', soal: 'Kegiatan waktu luang yang paling aku sukai …', opsi: [['V', 'menonton, menggambar, atau melihat-lihat foto'], ['A', 'mendengarkan musik, podcast, atau mengobrol'], ['K', 'berolahraga atau membuat sesuatu dengan tangan']] },
  { id: 'g4', soal: 'Saat menuju tempat yang belum pernah dikunjungi, aku lebih suka …', opsi: [['V', 'melihat peta atau denah'], ['A', 'diberi petunjuk arah secara lisan'], ['K', 'langsung berjalan dan mencari sambil mencoba']] },
  { id: 'g5', soal: 'Saat bertemu orang baru, yang paling aku ingat adalah …', opsi: [['V', 'wajah dan penampilannya'], ['A', 'nama dan suaranya'], ['K', 'kegiatan yang kami lakukan bersama']] },
  { id: 'g6', soal: 'Saat mulai bosan di kelas, aku biasanya …', opsi: [['V', 'mencoret-coret atau menggambar di buku'], ['A', 'berbisik dengan teman atau bersenandung'], ['K', 'menggerak-gerakkan kaki, tangan, atau pulpen']] },
  { id: 'g7', soal: 'Saat merakit barang baru, aku …', opsi: [['V', 'membaca gambar petunjuk terlebih dahulu'], ['A', 'meminta orang lain menjelaskan caranya'], ['K', 'langsung mencoba merakit sendiri']] },
  { id: 'g8', soal: 'Saat ujian, jawaban paling mudah aku ingat dari …', opsi: [['V', 'bayangan halaman buku atau catatan'], ['A', 'suara guru saat menjelaskan'], ['K', 'pengalaman praktik yang pernah dilakukan']] },
  { id: 'g9', soal: 'Saat belajar, aku paling mudah terganggu oleh …', opsi: [['V', 'meja atau ruangan yang berantakan'], ['A', 'suara bising di sekitar'], ['K', 'harus duduk diam terlalu lama']] },
  { id: 'g10', soal: 'Saat sedang sangat senang, aku cenderung …', opsi: [['V', 'tersenyum lebar dan wajahku berseri-seri'], ['A', 'bercerita panjang atau bersorak'], ['K', 'melompat, bertepuk tangan, atau memeluk']] },
  { id: 'g11', soal: 'Hadiah yang paling aku sukai …', opsi: [['V', 'buku bergambar, poster, atau alat gambar'], ['A', 'headset, speaker, atau alat musik'], ['K', 'alat olahraga atau perlengkapan kerajinan']] },
  { id: 'g12', soal: 'Belajarku paling efektif jika dilakukan …', opsi: [['V', 'di tempat yang rapi dan terang'], ['A', 'sambil berdiskusi dengan teman'], ['K', 'sambil praktik di laboratorium atau lapangan']] }
];

var MI = [
  ['m1', 'ling', 'Aku senang membaca buku cerita, novel, atau artikel.'],
  ['m2', 'ling', 'Aku mudah merangkai kata saat menulis atau bercerita.'],
  ['m3', 'ling', 'Aku menikmati permainan kata, seperti teka-teki silang atau tebak kata.'],
  ['m4', 'logis', 'Aku senang memecahkan soal hitungan atau teka-teki logika.'],
  ['m5', 'logis', 'Aku sering ingin tahu sebab dan akibat dari suatu kejadian.'],
  ['m6', 'logis', 'Aku suka mengurutkan atau mengelompokkan sesuatu dengan rapi dan teratur.'],
  ['m7', 'visual', 'Aku mudah membayangkan bentuk benda dari berbagai sisi.'],
  ['m8', 'visual', 'Aku senang menggambar, mendesain, atau menata ruangan.'],
  ['m9', 'visual', 'Aku mudah membaca peta, denah, atau grafik.'],
  ['m10', 'kines', 'Aku senang berolahraga, menari, atau bergerak aktif.'],
  ['m11', 'kines', 'Aku lebih cepat paham jika langsung mempraktikkan sesuatu.'],
  ['m12', 'kines', 'Tanganku terampil membuat kerajinan atau memperbaiki barang.'],
  ['m13', 'musik', 'Aku mudah mengingat lagu dan nadanya.'],
  ['m14', 'musik', 'Aku cepat menyadari jika ada nada atau suara yang sumbang.'],
  ['m15', 'musik', 'Aku senang bernyanyi atau memainkan alat musik.'],
  ['m16', 'inter', 'Aku mudah berteman dengan orang baru.'],
  ['m17', 'inter', 'Teman-teman sering bercerita atau meminta saran kepadaku.'],
  ['m18', 'inter', 'Aku senang bekerja dalam kelompok dan mengoordinasikan teman.'],
  ['m19', 'intra', 'Aku tahu kelebihan dan kekurangan diriku.'],
  ['m20', 'intra', 'Aku suka merenung atau menulis catatan harian tentang perasaanku.'],
  ['m21', 'intra', 'Aku punya target pribadi dan berusaha mencapainya.'],
  ['m22', 'natur', 'Aku senang merawat tanaman atau hewan peliharaan.'],
  ['m23', 'natur', 'Aku peduli pada kebersihan dan kelestarian lingkungan.'],
  ['m24', 'natur', 'Aku senang mengamati alam, seperti cuaca, langit, atau serangga.']
];

var RIASEC = [
  ['r1', 'R', 'Memperbaiki sepeda, kipas angin, atau alat elektronik sederhana.'],
  ['r2', 'R', 'Merakit atau membuat model, prakarya, dan maket.'],
  ['r3', 'R', 'Bekerja di luar ruangan, seperti berkebun atau beternak.'],
  ['r4', 'R', 'Menggunakan alat pertukangan atau mesin.'],
  ['r5', 'I', 'Melakukan percobaan sains di laboratorium.'],
  ['r6', 'I', 'Mencari tahu cara kerja suatu benda atau teknologi.'],
  ['r7', 'I', 'Memecahkan soal matematika atau sains yang menantang.'],
  ['r8', 'I', 'Membaca tentang penemuan, penelitian, atau teknologi baru.'],
  ['r9', 'A', 'Menggambar, melukis, atau membuat desain.'],
  ['r10', 'A', 'Bermain musik, bernyanyi, atau menari.'],
  ['r11', 'A', 'Menulis cerita, puisi, atau naskah.'],
  ['r12', 'A', 'Berakting, membuat film pendek, atau konten video.'],
  ['r13', 'S', 'Membantu teman yang kesulitan belajar.'],
  ['r14', 'S', 'Mengikuti kegiatan sosial atau menjadi relawan.'],
  ['r15', 'S', 'Mengajari adik atau teman suatu keterampilan.'],
  ['r16', 'S', 'Mendengarkan masalah orang lain dan memberi semangat.'],
  ['r17', 'E', 'Memimpin kelompok, kelas, atau organisasi.'],
  ['r18', 'E', 'Berjualan atau menjalankan usaha kecil.'],
  ['r19', 'E', 'Berbicara di depan umum untuk meyakinkan orang lain.'],
  ['r20', 'E', 'Merencanakan dan mengatur sebuah acara atau lomba.'],
  ['r21', 'C', 'Merapikan catatan, berkas, atau arsip.'],
  ['r22', 'C', 'Mengelola keuangan, misalnya uang kas kelas.'],
  ['r23', 'C', 'Mengetik dan mengolah data di komputer.'],
  ['r24', 'C', 'Mengerjakan sesuatu dengan prosedur yang jelas dan teliti.']
];

/* rev:true = butir negatif (skornya dibalik) */
var KARAKTER = [
  ['c1', 'motivasi', 'Aku ingin mendapatkan hasil terbaik dalam setiap tugas.'],
  ['c2', 'motivasi', 'Aku senang mendapat tantangan yang sulit.'],
  ['c3', 'motivasi', 'Aku belajar lebih banyak walaupun tidak disuruh.'],
  ['c4', 'tekun', 'Aku tidak mudah menyerah saat menghadapi soal yang sulit.'],
  ['c5', 'tekun', 'Aku menyelesaikan tugas sampai tuntas.'],
  ['c6', 'tekun', 'Aku mudah bosan lalu berhenti di tengah jalan.', true],
  ['c7', 'sistem', 'Aku memiliki jadwal belajar dan berusaha menaatinya.'],
  ['c8', 'sistem', 'Catatan pelajaranku rapi dan mudah dibaca ulang.'],
  ['c9', 'sistem', 'Aku membuat rencana sebelum mengerjakan tugas besar.'],
  ['c10', 'mandiri', 'Aku belajar tanpa perlu diingatkan orang tua.'],
  ['c11', 'mandiri', 'Saat tidak paham, aku mencari sumber belajar sendiri.'],
  ['c12', 'mandiri', 'Aku bergantung pada jawaban teman saat mengerjakan PR.', true],
  ['c13', 'adaptasi', 'Aku cepat akrab di lingkungan atau kelas yang baru.'],
  ['c14', 'adaptasi', 'Aku dapat menerima perubahan rencana dengan tenang.'],
  ['c15', 'adaptasi', 'Aku merasa sangat cemas jika situasi berubah tiba-tiba.', true],
  ['c16', 'sadar', 'Aku dapat mengenali perasaan yang sedang aku alami.'],
  ['c17', 'sadar', 'Aku tahu penyebab aku merasa senang, sedih, atau marah.'],
  ['c18', 'sadar', 'Aku menyadari kebiasaan baik dan buruk dalam diriku.'],
  ['c19', 'empati', 'Aku ikut merasakan kesedihan teman yang sedang susah.'],
  ['c20', 'empati', 'Aku mau mendengarkan dengan sabar saat teman bercerita.'],
  ['c21', 'empati', 'Aku tidak terlalu peduli dengan perasaan orang lain.', true],
  ['c22', 'kendali', 'Aku tetap bisa bersikap tenang saat sedang kesal.'],
  ['c23', 'kendali', 'Aku berpikir dulu sebelum berbicara atau bertindak.'],
  ['c24', 'kendali', 'Aku mudah meledak marah karena hal kecil.', true],
  ['c25', 'aq', 'Saat gagal, aku mencari cara lain agar berhasil.'],
  ['c26', 'aq', 'Aku yakin setiap masalah dapat diatasi dengan usaha.'],
  ['c27', 'aq', 'Aku bertanggung jawab memperbaiki kesalahanku sendiri.'],
  ['c28', 'aq', 'Satu masalah kecil bisa membuat semua kegiatanku berantakan.', true],
  ['c29', 'aq', 'Kalau gagal sekali, aku merasa akan selalu gagal.', true],
  ['c30', 'aq', 'Aku tetap bersemangat walaupun tugas sedang menumpuk.']
];

var DPL = [
  ['d1', 'iman', 'Aku menjalankan ibadah sesuai agamaku dengan rutin.'],
  ['d2', 'iman', 'Aku berkata jujur walaupun tidak ada yang melihat.'],
  ['d3', 'warga', 'Aku menaati aturan sekolah dan lingkungan tempat tinggalku.'],
  ['d4', 'warga', 'Aku menghargai teman yang berbeda suku, agama, atau budaya.'],
  ['d5', 'kritis', 'Aku memeriksa kebenaran berita sebelum mempercayai atau membagikannya.'],
  ['d6', 'kritis', 'Aku suka bertanya "mengapa" dan mencari bukti dari suatu pendapat.'],
  ['d7', 'kreatif', 'Aku sering punya ide baru atau unik.'],
  ['d8', 'kreatif', 'Aku senang mencoba cara berbeda untuk menyelesaikan masalah.'],
  ['d9', 'kolab', 'Dalam kelompok, aku ikut mengerjakan bagian tugasku dengan adil.'],
  ['d10', 'kolab', 'Aku menghargai pendapat teman walaupun berbeda dengan pendapatku.'],
  ['d11', 'mandiri', 'Aku dapat mengatur waktu belajar, bermain, dan istirahat sendiri.'],
  ['d12', 'mandiri', 'Aku menyelesaikan tugas tanpa harus terus diingatkan.'],
  ['d13', 'sehat', 'Aku rutin berolahraga dan makan makanan bergizi.'],
  ['d14', 'sehat', 'Aku tidur cukup dan mau bercerita kepada orang yang kupercaya saat ada masalah.'],
  ['d15', 'komun', 'Aku berani menyampaikan pendapat di depan kelas.'],
  ['d16', 'komun', 'Aku dapat menjelaskan ideku dengan jelas, baik lisan maupun tulisan.']
];

var SOAL_AKADEMIK_AWAL = [
  ['a1', 'Matematika', 'Menentukan nilai rata-rata dari data', 'Nilai ulangan lima siswa adalah 70, 80, 75, 90, dan 85. Rata-rata nilai mereka adalah …', '78', '80', '82', '85', 'B'],
  ['a2', 'Matematika', 'Menghitung volume bangun ruang', 'Sebuah kubus memiliki panjang rusuk 6 cm. Volume kubus tersebut adalah …', '36 cm³', '72 cm³', '216 cm³', '144 cm³', 'C'],
  ['a3', 'Matematika', 'Menyelesaikan masalah persentase', 'Harga sebuah baju Rp120.000 dan mendapat diskon 25%. Harga yang harus dibayar adalah …', 'Rp90.000', 'Rp95.000', 'Rp100.000', 'Rp30.000', 'A'],
  ['a4', 'Matematika', 'Menyelesaikan masalah perbandingan', 'Perbandingan uang Ani dan Budi adalah 3 : 5. Jika jumlah uang mereka Rp160.000, uang Budi adalah …', 'Rp60.000', 'Rp80.000', 'Rp100.000', 'Rp96.000', 'C'],
  ['a5', 'Bahasa Indonesia', 'Menggunakan ejaan dan tanda baca yang tepat', 'Penulisan kalimat yang sesuai dengan ejaan adalah …', 'Ibu membeli sayur di pasar.', 'ibu Membeli sayur dipasar.', 'Ibu membeli sayur dipasar', 'Ibu membeli Sayur di Pasar.', 'A'],
  ['a6', 'Bahasa Indonesia', 'Menentukan ide pokok paragraf', 'Sampah plastik sulit terurai dan membutuhkan ratusan tahun untuk hancur. Sampah itu mencemari tanah dan laut. Oleh karena itu, kita perlu mengurangi penggunaan plastik. Ide pokok paragraf tersebut adalah …', 'Plastik mudah didapat', 'Sampah plastik merusak lingkungan sehingga perlu dikurangi', 'Laut sudah tercemar', 'Plastik dibuat di pabrik', 'B'],
  ['a7', 'Bahasa Indonesia', 'Menentukan makna kata (sinonim)', 'Siswa itu sangat tekun belajar. Kata "tekun" bermakna sama dengan …', 'rajin', 'malas', 'pintar', 'cepat', 'A'],
  ['a8', 'Bahasa Indonesia', 'Mengenali kata baku', 'Kata yang baku adalah …', 'apotik', 'nasehat', 'kualitas', 'resiko', 'C'],
  ['a9', 'Bahasa Inggris', 'Menentukan nama profesi', 'My aunt works in a hospital. She takes care of sick people every day. She is a …', 'teacher', 'nurse', 'pilot', 'farmer', 'B'],
  ['a10', 'Bahasa Inggris', 'Menentukan lawan kata (antonym)', 'The opposite of "expensive" is …', 'cheap', 'big', 'new', 'heavy', 'A'],
  ['a11', 'Bahasa Inggris', 'Melengkapi kalimat dengan kata yang tepat', 'There are … books on the table.', 'a', 'an', 'some', 'much', 'C'],
  ['a12', 'Bahasa Inggris', 'Memahami informasi rinci dari teks pendek', 'Rina wakes up at 5 a.m. She takes a bath and has breakfast. She goes to school by bike at 6.30. How does Rina go to school?', 'By bus', 'On foot', 'By car', 'By bike', 'D'],
  ['a13', 'IPA', 'Mengidentifikasi perubahan wujud zat', 'Air yang dipanaskan lalu berubah menjadi uap disebut peristiwa …', 'membeku', 'menguap', 'mengembun', 'mencair', 'B'],
  ['a14', 'IPA', 'Mengenali organ tubuh manusia', 'Organ utama pernapasan manusia adalah …', 'jantung', 'lambung', 'paru-paru', 'ginjal', 'C'],
  ['a15', 'IPA', 'Mengenali besaran dan satuan', 'Satuan Internasional (SI) untuk massa adalah …', 'gram', 'kilogram', 'ons', 'ton', 'B'],
  ['a16', 'IPA', 'Memahami proses fotosintesis', 'Gas yang dihasilkan tumbuhan saat fotosintesis adalah …', 'oksigen', 'karbon dioksida', 'nitrogen', 'hidrogen', 'A'],
  ['a17', 'IPS', 'Memahami konsep letak geografis', 'Garis khayal yang membagi bumi menjadi belahan utara dan selatan disebut …', 'garis bujur', 'khatulistiwa', 'garis balik utara', 'meridian', 'B'],
  ['a18', 'IPS', 'Memahami kegiatan ekonomi', 'Kegiatan menghasilkan atau menambah nilai guna suatu barang disebut …', 'konsumsi', 'distribusi', 'produksi', 'promosi', 'C'],
  ['a19', 'IPS', 'Menghitung jarak sebenarnya dengan skala peta', 'Peta berskala 1 : 100.000. Jarak dua kota pada peta 5 cm. Jarak sebenarnya adalah …', '5 km', '50 km', '500 m', '0,5 km', 'A'],
  ['a20', 'IPS', 'Memahami interaksi sosial', 'Syarat terjadinya interaksi sosial adalah …', 'kontak sosial dan komunikasi', 'persaingan dan konflik', 'kerja sama dan akomodasi', 'imitasi dan sugesti', 'A']
];

/* tag ekskul: kecerdasan (ling, logis, visual, kines, musik, inter, intra, natur) + RIASEC (R I A S E C) */
var EKSKUL_AWAL = [
  ['Pramuka', 'inter,natur,kines,S,R,E'], ['PMR', 'inter,empati,S,I'], ['Paskibra', 'kines,inter,R,C'],
  ['Futsal', 'kines,inter,R'], ['Bola Voli', 'kines,inter,R'], ['Bola Basket', 'kines,inter,R,E'], ['Bulu Tangkis', 'kines,R'],
  ['Pencak Silat', 'kines,intra,R'], ['Tari Tradisional', 'kines,musik,A'], ['Karawitan', 'musik,inter,A'],
  ['Paduan Suara', 'musik,inter,A,S'], ['Band / Musik Modern', 'musik,A,E'], ['Seni Lukis & Gambar', 'visual,intra,A'],
  ['Teater / Drama', 'ling,inter,kines,A,E'], ['Jurnalistik', 'ling,intra,A,I,E'], ['English Club', 'ling,inter,S,E'],
  ['Karya Ilmiah Remaja (KIR)', 'logis,natur,I'], ['Olimpiade Matematika & Sains', 'logis,I,C'], ['Robotik & Coding', 'logis,visual,I,R'],
  ['Fotografi & Videografi', 'visual,A,R'], ['Desain Grafis Digital', 'visual,A,I'], ['Kewirausahaan', 'inter,logis,E,C'],
  ['Kerohanian / Tahfiz', 'intra,ling,S'], ['Adiwiyata / Berkebun', 'natur,R,S'], ['Bahasa Jawa / Macapat', 'ling,musik,A'],
  ['Sempoa / Aritmatika', 'logis,C']
];

/* ======================== DATA UNTUK SISWA ======================== */
function getInfo() {
  siap_();
  var s = setting_();
  return { versi: VERSI, nama_sekolah: s.nama_sekolah || '', tahun_ajaran: s.tahun_ajaran || '', perlu_token: !!String(s.token || '').trim() };
}

function instrumenPublik_() {
  var akad = rows_(SH.SOAL).filter(function (q) { return q.aktif !== 'N' && String(q.soal).trim(); });
  var ekskul = rows_(SH.EKSKUL).filter(function (e) { return e.aktif !== 'N' && String(e.nama).trim(); }).map(function (e) { return String(e.nama); });
  return [
    { id: 'akademik', judul: 'Kognitif Akademik', ikon: '📚', tipe: 'tes', petunjuk: 'Kerjakan soal pelajaran berikut. Pilih satu jawaban yang paling tepat. Kerjakan sendiri dengan jujur, ya!',
      items: akad.map(function (q) { return { id: String(q.id), grup: q.mapel, soal: q.soal, opsi: [q.A, q.B, q.C, q.D] }; }) },
    { id: 'kecakapan', judul: 'Kecakapan Berpikir', ikon: '🧠', tipe: 'tes', petunjuk: 'Soal-soal ini mengukur cara berpikirmu: angka, kata, pola, logika, dan pemecahan masalah. Pilih jawaban yang paling tepat.',
      items: KECAKAPAN.map(function (q) { return { id: q.id, soal: q.soal, bacaan: q.bacaan || '', opsi: q.opsi }; }) },
    { id: 'gaya', judul: 'Gaya Belajar', ikon: '🎧', tipe: 'pilih', petunjuk: 'Pilih satu pernyataan yang PALING menggambarkan dirimu. Tidak ada jawaban benar atau salah.',
      items: GAYA.map(function (q) { return { id: q.id, soal: q.soal, opsi: q.opsi.map(function (o) { return o[1]; }) }; }) },
    { id: 'mi', judul: 'Kecerdasan Majemuk', ikon: '🌈', tipe: 'likert', skala: 'sesuai', petunjuk: 'Seberapa sesuai pernyataan berikut dengan dirimu? Jawablah sesuai keadaanmu yang sebenarnya.',
      items: MI.map(function (x) { return { id: x[0], soal: x[2] }; }) },
    { id: 'riasec', judul: 'Minat Karier (RIASEC)', ikon: '🧭', tipe: 'likert', skala: 'suka', petunjuk: 'Seberapa suka kamu melakukan kegiatan berikut? Bayangkan kamu benar-benar melakukannya.',
      items: RIASEC.map(function (x) { return { id: x[0], soal: x[2] }; }) },
    { id: 'karakter', judul: 'Ketahanan Belajar & Emosi', ikon: '💪', tipe: 'likert', skala: 'sesuai', petunjuk: 'Bacalah setiap pernyataan, lalu pilih yang paling sesuai dengan kebiasaanmu sehari-hari.',
      items: KARAKTER.map(function (x) { return { id: x[0], soal: x[2] }; }) },
    { id: 'dpl', judul: 'Profil Lulusan', ikon: '🇮🇩', tipe: 'likert', skala: 'sering', petunjuk: 'Seberapa sering kamu melakukan hal berikut dalam kehidupan sehari-hari?',
      items: DPL.map(function (x) { return { id: x[0], soal: x[2] }; }) },
    { id: 'minat', judul: 'Minat & Cita-cita', ikon: '⭐', tipe: 'minat', petunjuk: 'Pilih paling banyak 5 kegiatan/ekstrakurikuler yang ingin kamu ikuti, lalu tuliskan hobi dan cita-citamu.',
      ekskul: ekskul }
  ];
}

/** Siswa memulai tes: cek token, kirim instrumen tanpa kunci jawaban */
function mulaiTes(p) {
  siap_();
  var s = setting_();
  if (!p || !String(p.nama || '').trim() || !String(p.nisn || '').trim() || !String(p.kelas || '').trim())
    throw new Error('Lengkapi NISN, nama, dan kelas.');
  var tok = String(s.token || '').trim();
  if (tok && tok.toUpperCase() !== String(p.token || '').trim().toUpperCase()) throw new Error('Kode sesi salah. Tanyakan kepada Guru BK.');
  return { seksi: instrumenPublik_() };
}

/* ============================== SKORING ============================== */
function persenLikert_(vals) {
  if (!vals.length) return 0;
  var m = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  return bulat_((m - 1) / 4 * 100);
}
function nilaiLikert_(def, jw) {
  var grp = {};
  def.forEach(function (x) {
    var v = Number(jw[x[0]]);
    if (!v) return;
    if (x[3]) v = 6 - v;
    (grp[x[1]] = grp[x[1]] || []).push(v);
  });
  var o = {};
  Object.keys(grp).forEach(function (k) { o[k] = persenLikert_(grp[k]); });
  return o;
}
function urut_(obj) { return Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; }); }

function hitung_(jw) {
  var H = {};
  // 1. Akademik
  var akad = rows_(SH.SOAL).filter(function (q) { return q.aktif !== 'N' && String(q.soal).trim(); });
  var mp = {};
  akad.forEach(function (q) {
    var m = String(q.mapel), b = String(jw[q.id] || '').toUpperCase() === String(q.kunci).trim().toUpperCase();
    mp[m] = mp[m] || { benar: 0, jml: 0, indikator: [] };
    mp[m].jml++; if (b) mp[m].benar++;
    mp[m].indikator.push({ t: q.indikator, ok: b });
  });
  H.akademik = Object.keys(mp).map(function (m) { return { mapel: m, nilai: bulat_(mp[m].benar / mp[m].jml * 100), benar: mp[m].benar, jml: mp[m].jml, indikator: mp[m].indikator }; });
  H.akademik_rata = H.akademik.length ? bulat_(H.akademik.reduce(function (a, x) { return a + x.nilai; }, 0) / H.akademik.length) : 0;

  // 2. Kecakapan berpikir
  var kc = {}, tb = 0;
  KECAKAPAN.forEach(function (q) {
    var b = String(jw[q.id] || '').toUpperCase() === q.kunci;
    kc[q.sub] = kc[q.sub] || { b: 0, n: 0 }; kc[q.sub].n++; if (b) { kc[q.sub].b++; tb++; }
  });
  H.kecakapan = {}; Object.keys(kc).forEach(function (k) { H.kecakapan[k] = bulat_(kc[k].b / kc[k].n * 100); });
  H.iku = bulat_(tb / KECAKAPAN.length * 100);

  // 3. Gaya belajar
  var g = { V: 0, A: 0, K: 0 }, ng = 0;
  GAYA.forEach(function (q) { var i = Number(jw[q.id]); if (i >= 0 && q.opsi[i]) { g[q.opsi[i][0]]++; ng++; } });
  H.gaya = { V: ng ? Math.round(g.V / ng * 1000) / 10 : 0, A: ng ? Math.round(g.A / ng * 1000) / 10 : 0, K: ng ? Math.round(g.K / ng * 1000) / 10 : 0 };
  H.gaya_dominan = urut_(H.gaya)[0];
  if (H.gaya[urut_(H.gaya)[0]] === H.gaya[urut_(H.gaya)[1]]) H.gaya_dominan = urut_(H.gaya).slice(0, 2).join('');

  // 4. Kecerdasan majemuk
  H.mi = nilaiLikert_(MI, jw);
  H.mi_urut = urut_(H.mi);

  // 5. RIASEC
  H.riasec = nilaiLikert_(RIASEC, jw);
  H.riasec_urut = urut_(H.riasec);
  H.riasec_kode = H.riasec_urut.slice(0, 3).join('');

  // 6. Ketahanan belajar, emosi, daya juang
  H.karakter = nilaiLikert_(KARAKTER, jw);
  var k = H.karakter;
  H.eq = bulat_((k.adaptasi + k.sadar + k.empati + k.kendali) / 4);
  H.aq = k.aq;
  H.am = k.motivasi;
  H.ketahanan = bulat_((k.motivasi + k.tekun + k.sistem + k.mandiri) / 4);

  // 7. Profil lulusan
  H.dpl = nilaiLikert_(DPL, jw);

  // 8. Minat
  var mi = jw._minat || {};
  H.minat = { pilihan: [].concat(mi.pilihan || []).slice(0, 5), hobi: String(mi.hobi || '').slice(0, 200), cita: String(mi.cita || '').slice(0, 200) };

  // 9. Rekomendasi ekstrakurikuler
  var eks = rows_(SH.EKSKUL).filter(function (e) { return e.aktif !== 'N' && String(e.nama).trim(); });
  H.rek_ekskul = eks.map(function (e) {
    var tags = String(e.tag).split(',').map(function (t) { return t.trim(); }).filter(String);
    var sk = [], alasan = [];
    tags.forEach(function (t) {
      if (H.mi[t] !== undefined) { sk.push(H.mi[t]); if (H.mi_urut.indexOf(t) < 3) alasan.push('kecerdasan ' + MI_NAMA[t]); }
      else if (H.riasec[t] !== undefined) { sk.push(H.riasec[t]); if (H.riasec_urut.indexOf(t) < 2) alasan.push('minat ' + RIASEC_NAMA[t]); }
      else if (k[t] !== undefined) sk.push(k[t]);
    });
    var skor = sk.length ? sk.reduce(function (a, b) { return a + b; }, 0) / sk.length : 0;
    if (H.minat.pilihan.indexOf(String(e.nama)) > -1) { skor += 12; alasan.unshift('kamu sendiri tertarik'); }
    return { nama: String(e.nama), skor: bulat_(skor), alasan: alasan.slice(0, 3) };
  }).sort(function (a, b) { return b.skor - a.skor; }).slice(0, 4);

  return H;
}

/** Siswa mengumpulkan jawaban */
function kirimJawaban(p, jw) {
  siap_();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var s = setting_();
    var H = hitung_(jw);
    var kode = 'T10-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd') + '-' +
      Utilities.getUuid().replace(/-/g, '').slice(0, 5).toUpperCase();
    H.kode = kode;
    H.peserta = { nisn: String(p.nisn), nama: String(p.nama), kelas: String(p.kelas), jk: String(p.jk || ''), tgl_lahir: String(p.tgl_lahir || '') };
    H.tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sheet_(SH.HASIL).appendRow([
      new Date(), kode, "'" + p.nisn, p.nama, p.kelas, p.jk || '', p.tgl_lahir || '',
      H.gaya_dominan, MI_NAMA[H.mi_urut[0]], MI_NAMA[H.mi_urut[1]], MI_NAMA[H.mi_urut[2]], H.riasec_kode, H.iku, H.akademik_rata,
      H.eq, H.aq, H.am, H.rek_ekskul.map(function (e) { return e.nama; }).join(', '), H.minat.cita,
      JSON.stringify(H), JSON.stringify(jw)
    ]);
    var tampil = ya_(s.tampil_hasil === undefined ? 'Y' : s.tampil_hasil);
    return { kode: kode, tampil: tampil, laporan: tampil ? laporan_(H) : null };
  } finally { lock.releaseLock(); }
}

/** Siswa melihat kembali hasilnya dengan NISN + kode laporan */
function lihatHasil(nisn, kode) {
  var s = setting_();
  if (!ya_(s.tampil_hasil === undefined ? 'Y' : s.tampil_hasil)) throw new Error('Hasil dapat dilihat melalui Guru BK.');
  var r = rows_(SH.HASIL).filter(function (x) { return String(x.kode).toUpperCase() === String(kode).trim().toUpperCase() && String(x.nisn).replace(/^'/, '') === String(nisn).trim(); })[0];
  if (!r) throw new Error('Data tidak ditemukan. Periksa NISN dan kode laporan.');
  return laporan_(JSON.parse(r.hasil_json));
}

/** Melengkapi hasil dengan statistik angkatan & identitas sekolah */
function laporan_(H) {
  var s = setting_();
  var stat = {};
  rows_(SH.HASIL).forEach(function (r) {
    var h; try { h = JSON.parse(r.hasil_json); } catch (e) { return; }
    (h.akademik || []).forEach(function (a) {
      var t = stat[a.mapel] = stat[a.mapel] || { n: 0, sum: 0, max: 0, min: 100 };
      t.n++; t.sum += a.nilai; t.max = Math.max(t.max, a.nilai); t.min = Math.min(t.min, a.nilai);
    });
  });
  Object.keys(stat).forEach(function (m) { stat[m].rata = bulat_(stat[m].sum / stat[m].n); });
  return {
    hasil: H, stat: stat,
    sekolah: { nama: s.nama_sekolah || '', tahun: s.tahun_ajaran || '', guru_bk: s.guru_bk || '', nip_bk: s.nip_bk || '', ks: s.kepala_sekolah || '', nip_ks: s.nip_ks || '' },
    nama: { mi: MI_NAMA, riasec: RIASEC_NAMA, kar: KAR_NAMA, dpl: DPL_NAMA, kc: KC_NAMA }
  };
}

/* ============================== GURU BK ============================== */
function bkLogin(pw) {
  siap_();
  var s = setting_();
  if (String(pw) !== String(s.password_bk || DEFAULT_SET.password_bk)) throw new Error('Password salah.');
  var t = Utilities.getUuid();
  CacheService.getScriptCache().put('bk_' + t, '1', 21600);
  return t;
}
function cek_(t) { if (!t || !CacheService.getScriptCache().get('bk_' + t)) throw new Error('Sesi Guru BK berakhir. Silakan masuk lagi.'); }

function bkDaftar(t) {
  cek_(t);
  return rows_(SH.HASIL).map(function (r) {
    var o = {};
    SH.HASIL.head.forEach(function (h) { if (h !== 'hasil_json' && h !== 'jawaban_json') o[h] = r[h]; });
    o.nisn = String(o.nisn).replace(/^'/, '');
    try {
      var h = JSON.parse(r.hasil_json);
      o.mi_skor = h.mi; o.riasec_skor = h.riasec; o.gaya_skor = h.gaya; o.dpl = h.dpl; o.ketahanan = h.ketahanan;
      o.akad = (h.akademik || []).map(function (a) { return [a.mapel, a.nilai]; });
    } catch (e) {}
    return o;
  }).reverse();
}
function bkLaporan(t, kode) {
  cek_(t);
  var r = rows_(SH.HASIL).filter(function (x) { return String(x.kode) === String(kode); })[0];
  if (!r) throw new Error('Data tidak ditemukan.');
  return laporan_(JSON.parse(r.hasil_json));
}
function bkHapus(t, kode) {
  cek_(t);
  var s = sheet_(SH.HASIL), rs = rows_(SH.HASIL);
  for (var i = rs.length - 1; i >= 0; i--) if (String(rs[i].kode) === String(kode)) s.deleteRow(rs[i]._row);
  return bkDaftar(t);
}
function bkSetting(t) {
  cek_(t);
  var s = setting_(); delete s.password_bk;
  return {
    setting: s,
    ekskul: rows_(SH.EKSKUL).map(function (e) { return { nama: e.nama, tag: e.tag, aktif: e.aktif }; }),
    url_sheet: ss_().getUrl(), versi: VERSI
  };
}
function bkSimpanSetting(t, o) {
  cek_(t);
  var st = sheet_(SH.SETTING), cur = setting_();
  Object.keys(o).forEach(function (k) {
    if (k === 'password_bk' && !String(o[k]).trim()) return;
    if (cur[k] === undefined) { st.appendRow([k, o[k]]); return; }
    var v = st.getRange(2, 1, st.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < v.length; i++) if (String(v[i][0]) === k) { st.getRange(i + 2, 2).setValue(o[k]); break; }
  });
  return bkSetting(t);
}
function bkSimpanEkskul(t, list) {
  cek_(t);
  var s = sheet_(SH.EKSKUL);
  if (s.getLastRow() > 1) s.deleteRows(2, s.getLastRow() - 1);
  var v = list.filter(function (e) { return String(e.nama).trim(); }).map(function (e) { return [e.nama, e.tag || '', e.aktif || 'Y']; });
  if (v.length) s.getRange(2, 1, v.length, 3).setValues(v);
  return bkSetting(t);
}
