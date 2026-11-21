/**
 * LKBH PGRI DIY - Layanan Konsultasi & Pengaduan Hukum Guru
 * Google Apps Script (terikat ke Google Spreadsheet)
 * Dikembangkan oleh Edy Thomas
 *
 * LANGKAH PASANG:
 * 1. Buat Google Spreadsheet baru > Ekstensi > Apps Script.
 * 2. Tempel file ini sebagai Code.gs, buat file HTML bernama "index" lalu tempel index.html.
 * 3. Jalankan fungsi  setupAwal  sekali (beri izin). Ini membuat sheet & PIN admin awal.
 * 4. Isi PIN admin Anda: Project Settings > Script Properties > ADMIN_PIN.
 *    Opsional: ADMIN_EMAIL = email penerima notifikasi pengaduan baru.
 * 5. Deploy > New deployment > Web app > Execute as: Me; Who has access: Anyone.
 */

const SHEET_ADUAN = 'Pengaduan';
const SHEET_TL = 'Tindak_Lanjut';
const HEAD_ADUAN = ['Kode', 'Waktu', 'Nama', 'Sekolah', 'Kab/Kota', 'WhatsApp', 'Keanggotaan',
  'Kategori', 'Judul', 'Kronologi', 'Urgensi', 'Rahasia', 'Bukti', 'Status', 'Pendamping', 'Update Terakhir'];
const HEAD_TL = ['Kode', 'Waktu', 'Status', 'Catatan', 'Tampil ke Pelapor', 'Oleh'];
const STATUS = ['Baru', 'Diverifikasi', 'Dalam Pendampingan', 'Mediasi', 'Selesai', 'Ditutup'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('LKBH PGRI DIY')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------- Setup ---------- */
function setupAwal() {
  siapkanSheet_();
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('ADMIN_PIN')) p.setProperty('ADMIN_PIN', 'GANTI_PIN_ANDA');
  Logger.log('Selesai. PIN admin awal: GANTI_PIN_ANDA (segera diubah di Script Properties > ADMIN_PIN).');
}

function siapkanSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [[SHEET_ADUAN, HEAD_ADUAN], [SHEET_TL, HEAD_TL]].forEach(function (x) {
    let sh = ss.getSheetByName(x[0]);
    if (!sh) sh = ss.insertSheet(x[0]);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, x[1].length).setValues([x[1]]).setFontWeight('bold')
        .setBackground('#c8102e').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  return ss;
}

function sh_(nama) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(nama) || (siapkanSheet_(), ss.getSheetByName(nama));
}

/* ---------- Util ---------- */
function bersih_(v, maks) {
  v = String(v == null ? '' : v).trim();
  // cegah formula injection di Spreadsheet
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v.substring(0, maks || 500);
}
function digitWA_(s) {
  let d = String(s || '').replace(/\D/g, '');
  if (d.indexOf('62') === 0) d = d.substring(2);
  if (d.indexOf('0') === 0) d = d.substring(1);
  return d;
}
function fmt_(d) { return Utilities.formatDate(new Date(d), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm'); }
function kodeBaru_() {
  const t = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyMMdd');
  const h = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 4; i++) r += h.charAt(Math.floor(Math.random() * h.length));
  return 'LKBH-' + t + '-' + r;
}

/* ---------- Publik ---------- */
function kirimPengaduan(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (!d || !d.nama || !d.wa || !d.kategori || !d.judul || !d.kronologi)
      throw new Error('Data wajib belum lengkap.');
    if (digitWA_(d.wa).length < 8) throw new Error('Nomor WhatsApp tidak valid.');
    const sh = sh_(SHEET_ADUAN);
    const kode = kodeBaru_();

    // simpan bukti (maks 3 berkas, 5 MB per berkas)
    const link = [];
    (d.files || []).slice(0, 3).forEach(function (f) {
      const bytes = Utilities.base64Decode(f.data);
      if (bytes.length > 5 * 1024 * 1024) throw new Error('Berkas ' + f.name + ' melebihi 5 MB.');
      const blob = Utilities.newBlob(bytes, f.type || 'application/octet-stream', kode + '_' + bersih_(f.name, 80));
      link.push(folderBukti_().createFile(blob).getUrl());
    });

    const now = new Date();
    sh.appendRow([kode, now, bersih_(d.nama, 100), bersih_(d.sekolah, 150), bersih_(d.kabkota, 50),
      "'" + bersih_(d.wa, 20), bersih_(d.keanggotaan, 40), bersih_(d.kategori, 80), bersih_(d.judul, 150),
      bersih_(d.kronologi, 4000), bersih_(d.urgensi, 20), d.rahasia ? 'Ya' : 'Tidak',
      link.join('\n'), 'Baru', '', now]);
    sh_(SHEET_TL).appendRow([kode, now, 'Baru', 'Pengaduan diterima. Menunggu verifikasi pengurus LKBH.', 'Ya', 'Sistem']);

    const em = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
    if (em) {
      try {
        MailApp.sendEmail(em, '[LKBH PGRI DIY] Pengaduan baru ' + kode,
          'Kategori: ' + d.kategori + '\nUrgensi: ' + d.urgensi + '\nJudul: ' + d.judul +
          '\nBuka dasbor admin untuk menindaklanjuti.');
      } catch (e) { /* abaikan */ }
    }
    return { ok: true, kode: kode };
  } finally {
    lock.releaseLock();
  }
}

function folderBukti_() {
  const p = PropertiesService.getScriptProperties();
  let id = p.getProperty('FOLDER_BUKTI');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* buat baru */ } }
  const f = DriveApp.createFolder('LKBH PGRI DIY - Bukti Pengaduan');
  p.setProperty('FOLDER_BUKTI', f.getId());
  return f;
}

function cekStatus(kode, wa) {
  kode = String(kode || '').trim().toUpperCase();
  const cache = CacheService.getScriptCache();
  const kunci = 'gagal_' + kode;
  if (Number(cache.get(kunci) || 0) >= 5) throw new Error('Terlalu banyak percobaan. Coba lagi 15 menit lagi.');
  const rows = sh_(SHEET_ADUAN).getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === kode && digitWA_(rows[i][5]) === digitWA_(wa)) {
      const tl = sh_(SHEET_TL).getDataRange().getValues().slice(1)
        .filter(function (r) { return r[0] === kode && r[4] === 'Ya'; })
        .map(function (r) { return { waktu: fmt_(r[1]), status: r[2], catatan: r[3] }; });
      return { kode: kode, judul: rows[i][8], kategori: rows[i][7], status: rows[i][13],
        pendamping: rows[i][14], waktu: fmt_(rows[i][1]), update: fmt_(rows[i][15]), riwayat: tl };
    }
  }
  cache.put(kunci, String(Number(cache.get(kunci) || 0) + 1), 900);
  throw new Error('Kode atau nomor WhatsApp tidak cocok.');
}

/* ---------- Admin ---------- */
function adminLogin(pin) {
  const cache = CacheService.getScriptCache();
  if (Number(cache.get('gagal_admin') || 0) >= 5) throw new Error('Terlalu banyak percobaan. Tunggu 15 menit.');
  const benar = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
  if (!benar || String(pin) !== benar) {
    cache.put('gagal_admin', String(Number(cache.get('gagal_admin') || 0) + 1), 900);
    throw new Error('PIN salah.');
  }
  const token = Utilities.getUuid();
  cache.put('tok_' + token, '1', 6 * 3600);
  return token;
}

function cekToken_(token) {
  if (!token || !CacheService.getScriptCache().get('tok_' + token))
    throw new Error('Sesi berakhir. Silakan masuk kembali.');
}

function adminData(token) {
  cekToken_(token);
  const rows = sh_(SHEET_ADUAN).getDataRange().getValues().slice(1);
  const tl = sh_(SHEET_TL).getDataRange().getValues().slice(1);
  const riwayat = {};
  tl.forEach(function (r) {
    (riwayat[r[0]] = riwayat[r[0]] || []).push({ waktu: fmt_(r[1]), status: r[2], catatan: r[3], publik: r[4], oleh: r[5] });
  });
  const data = rows.map(function (r) {
    return { kode: r[0], waktu: fmt_(r[1]), nama: r[2], sekolah: r[3], kabkota: r[4], wa: String(r[5]).replace(/^'/, ''),
      keanggotaan: r[6], kategori: r[7], judul: r[8], kronologi: r[9], urgensi: r[10], rahasia: r[11],
      bukti: r[12] ? String(r[12]).split('\n') : [], status: r[13], pendamping: r[14],
      update: fmt_(r[15]), riwayat: riwayat[r[0]] || [] };
  }).reverse();
  return { data: data, status: STATUS };
}

function adminUpdate(token, kode, status, pendamping, catatan, publik) {
  cekToken_(token);
  if (STATUS.indexOf(status) < 0) throw new Error('Status tidak valid.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sh_(SHEET_ADUAN);
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === kode) {
        const now = new Date();
        sh.getRange(i + 1, 14, 1, 3).setValues([[status, bersih_(pendamping, 100), now]]);
        if (catatan || status !== rows[i][13]) {
          sh_(SHEET_TL).appendRow([kode, now, status, bersih_(catatan, 1000) || ('Status diubah menjadi ' + status),
            publik ? 'Ya' : 'Tidak', 'Pengurus LKBH']);
        }
        return true;
      }
    }
    throw new Error('Kode tidak ditemukan.');
  } finally {
    lock.releaseLock();
  }
}
