# 01 · Screens v2

Delapan layar. Setiap bagian: **route → struktur → ukuran → konten → state → catatan gelap**.
Angka diambil dari file desain (frame 1440×880 / 390×844 / A4).

---

## 1. `/procurement` — Pengajuan Pengadaan Barang BOS

Ref: `reference/png/01-pengadaan-bos-light.png` · `09-pengadaan-bos-dark.png`
Shell: sidebar 264px + main (padding **26/32**, gap **18**).

### Topbar

- Breadcrumb kecil: `Inventaris` › `Pengadaan BOS` (11px, `muted` / `brand` 600).
- Judul **27px/800** ls −0.8 + sub **13.5px** `muted`:
  "Formulir pencatatan barang belanjaan Dana BOS bulanan sebelum diperiksa tim pengawas."
- Aksi kanan (gap 9): `Simpan Draft` (secondary, ikon `save`) · `Kirim ke Guru Pengawas`
  (primary, ikon `send`).

### Kolom kiri — 400px, gap 14

**Kartu "Informasi Berita Acara"** (`panel`, radius 16)

- Header padding 16/20 + border bawah: judul 15.5/700, sub 12 `muted`
  ("Data ini tercetak pada dokumen BAP resmi."), badge kanan `Draft` (neutral).
- Body padding 16/20, gap 14:
  1. **Row 2 kolom** (gap 10): `BULAN` (select, nilai "November", chevron) · `TAHUN`
     (select, "2026", mono).
  2. `NOMOR BAP (OTOMATIS)` — input read-only: ikon `lock` 14, nilai mono 12.5 (`$ink`),
     ikon `check` 12 di kanan; di bawah input chip `AUTO` (brand-soft, 9px).
     Nilai contoh: `027/BAP-BOS/XI/2026`.
  3. `GURU PENGAWAS PEMERIKSA` — ikon `user-check` 14, nilai 12.5/600
     ("Drs. Budi Santoso") + sub 10 `muted` ("NIP. 19780512 200501 1 008"), chevron kanan.
  4. `SUMBER DANA` — label caps 11.5/700 + baris: badge pill `Dana BOSP / BOS Reguler 2026`
     (brand-soft) + link `Ubah` 10.5/700 `muted`.
  5. `CATATAN PENGADAAN` — textarea tinggi 88, placeholder 11.5 `muted`
     ("Belanja rutin bulan November untuk kebutuhan Lab. Software 1 dan ruang guru.").
- Footer bar `surface-2`, border atas, padding 12/20: kiri "Draft diperbarui 14:22 WIB" 10.5 `muted`,
  kanan "Lihat riwayat" 10.5/700 `brand`.

**Kartu "Alur Verifikasi"** (`panel`, padding 16/18, gap 12)

- Judul 13/700.
- 3 baris (gap 10, ikon 22px lingkaran):
  1. `Draft pengajuan` — dot `mint-soft` + `check` mint — status "Selesai" (mint)
  2. `Diperiksa Guru Pengawas` — dot `brand-soft` + `timer` brand — "Menunggu" (brand)
  3. `Disahkan & diarsipkan` — dot `surface-2` + `archive` muted — "Belum" (muted)

### Kolom kanan — flex-1, gap 12

**Baris judul + aksi**

- Kiri: "Daftar Barang Belanjaan" 15.5/700 + badge `4 jenis` (brand-soft).
- Kanan (gap 8): `Pilih dari Gudang` (secondary, `package-search`, padding 10/14, 12.5)
  · `Tambah Barang Baru` (**soft** = brand-soft + brand-deep, `plus`).

**Tabel** (`panel`, clip, `flex-1`)

Header baris: `fill surface-2`, padding **9/18**, border bawah, gap **12**.
Kolom (kiri→kanan) & lebar: `NO` 22 · `JENIS` 66 · `NAMA BARANG & SPESIFIKASI` flex ·
`KATEGORI` 86 · `JUMLAH` 46 (rata kanan) · `SATUAN` 46 · `AKSI` 46 (rata kanan).
Label th: **10px/700, uppercase, ls 0.5, `muted`**.

Baris: padding **11/18**, border bawah, gap 12, items-center.

| Kolom | Isi |
| --- | --- |
| No | mono 10.5 `muted` |
| Jenis | badge 9.5 — `Baru` (brand) / `Lama` (neutral) |
| Nama | nama **12.5/700** + spesifikasi **10.5** `muted` (dua baris) |
| Kategori | 11 `muted` |
| Jumlah | mono 12/700, rata kanan |
| Satuan | 11 `ink-soft` |
| Aksi | ikon `pencil` 13 `muted` + `trash-2` 13 `rose`, gap 8 |

Baris tambah (full width, padding 12/18, border bawah): ikon `plus` 13 + teks 11 `muted`
"Tambah baris barang lain", centered.

Footer bar `surface-2`, padding 12/18:
kiri "Total Barang:" 11.5 `muted` + **"4 Jenis · 18 Unit"** 12.5/800;
kanan "18 unit · Dana BOS Reguler 2026" 10.5 `muted`.

**Kartu "Stok Gudang Tersedia"** (quick pick dari inventaris)

- Header padding 14/18: judul 13/700, sub 10.5 `muted`
  ("Barang yang sering diajukan untuk laboratorium komputer."), link "Lihat semua stok →" 10.5/700 `brand`.
- 3 baris (padding 11/18, border bawah): chip 30 (brand-soft, `package` 14) ·
  nama 11.5/700 + spek 10 `muted` · badge stok (neutral, 9.5) · chip tombol 26 (brand-soft, `plus` 12).

Baris info di bawah kartu: ikon `info` 13 + 10.5 `muted`
"Barang akan tercatat di Master Inventaris sekolah setelah BAP disahkan oleh Guru Pengawas."

### State

- `DRAFT` → tombol "Simpan Draft" & "Kirim ke Guru Pengawas" aktif; nomor BAP = preview.
- Setelah dikirim (bukan draft lagi) → form read-only, tombol berubah "Lihat BAP" + badge `Menunggu Guru`.
- Keranjang kosong → tabel menampilkan baris tambah saja + empty hint.
- Validasi: minimal 1 barang, bulan/tahun belum dipakai, guru pengawas wajib dipilih.

### Data yang dipakai

`SchoolSettings` (kop), `Location` (gudang/ruang), `Category`, `Item` (quick pick),
`User` role `TEACHER` (guru pengawas), `Procurement` + `ProcurementItem`.

---

## 2. Tab "Arsip BAP" di `/reports` — Arsip BAP Pengadaan

Ref: `reference/png/02-laporan-arsip-bap-light.png` · `10-laporan-arsip-bap-dark.png`

Arsip BAP **bukan halaman/menu terpisah** — ia tab ke-5 di halaman Laporan yang sudah ada.

### Shell Laporan (sama seperti tab lain)

- Topbar: judul **"Laporan"** 27/800, sub
  "Rekap stok, peminjaman, mutasi gudang, dan arsip BAP siap cetak."
- Aksi kanan (gap 9): select tahun (`calendar` 14 + "2026" mono 12/600 + `chevron-down`,
  padding 9/12, radius 9) · `Export Excel` (secondary, `download`, 12.5) ·
  `Cetak Laporan` (primary, `printer`, 12.5).
- **Tabs** (gap 22, border-bottom `line`, padding tiap tab `8/1/6/1`):
  `Laporan Stok` · `Riwayat Peminjam` · `Riwayat Gudang` · `Barang Masuk` · **`Arsip BAP`**.
  Aktif: label `brand` 700. Non-aktif: `muted` 600. Semua 12.5px.
  Di halaman Laporan lain, tab "Arsip BAP" tampil non-aktif (jangan lupa menambahkannya
  ke keempat tab lain agar konsisten).

### Isi tab Arsip BAP

1. **Month tabs** — 13 pill (gap 6, padding 6/13, radius 999, teks 10.5/700):
   `Semua` · `Jan` … `Des`. Aktif `bg brand` + putih; non-aktif `surface` + border `line` + `ink-soft`.
2. **Bar ringkasan filter** — kartu radius 12, padding 12/18, `justify-between`:
   kiri (gap 18) **Total 11 Berita Acara** · **420 Unit Barang Diterima**
   (chip 28 brand-soft + label 11 `muted` + nilai 12/800); kanan search 236px
   (`surface-2`, radius 9, ikon `search` 13, placeholder "Cari nomor BAP atau nama guru…" 10.5).
3. **Tabel** (kartu `panel`, clip, tinggi `fill`):
   header `surface-2` padding 9/18 gap 14, th 10/700 caps ls .5 `muted`.
   Kolom: `NO. BAP` 150 · `PERIODE` 104 · `TANGGAL SAH` 112 · `GURU PEMERIKSA` flex ·
   `TOTAL UNIT` 78 (kanan) · `STATUS DOKUMEN` 158 · `AKSI` 122 (kanan).
   > Setiap sel harus `frame`/`<td>` ber-lebar tetap (`table-fixed` + `<colgroup>`) — jangan
   > `text` dengan `width`, judul & isi akan bergeser.
   Baris padding 13/18, border bawah:
   - No. BAP: nomor mono 11.5/700 + baris 9.5 "Dokumen sah" (`muted`) / "Draft pengajuan" (`amber`)
   - Periode 11 `ink-soft` · Tanggal Sah 11 mono (`—` bila draft) · Guru Pemeriksa 11.5
     ("Belum diverifikasi" muted)
   - Total Unit mono 11.5/700 rata kanan · Status badge 10 (`Terverifikasi Sah` mint /
     `Menunggu Guru` amber) · Aksi tombol kecil pad 7/12, 10.5, radius 8 (`Cetak BAP` secondary
     `printer` / `Detail` soft `eye`).
   Footer `surface-2`: "Menampilkan 9 dari 11 berita acara" + pagination 26×26 radius 8.
4. Aksi tab lain tidak berubah (Laporan Stok, Peminjaman, Gudang, Barang Masuk memakai
   komponen report yang sudah ada).

### State

- Filter tahun/bulan disimpan di URL (`?tab=bap&year=2026&month=11&q=&page=`), default tahun berjalan.
- Kosong → empty state di dalam kartu tabel (ikon `file-search`, "Belum ada BAP pada periode ini").
- Mobile: tab "Arsip BAP" jadi chip ke-5; tabel → list kartu (nomor + badge, periode/tanggal,
  guru, unit, tombol Cetak/Detail).

## 3. `/procurement/[id]` — Dokumen BAP (A4)

Ref: `03-bap-dokumen-a4.png` (satu-satunya layar tanpa versi gelap — ini kertas cetak).

Kanvas 794×1123 px (A4 @96dpi), putih, padding **48/52**, layout vertikal.
Detail lengkap ukuran & konversi pt ada di `05-print-and-qr.md`.

Struktur:

1. **KOP** — logo 64×64 (brand-soft, radius 10, `graduation-cap` 30 brand) · teks tengah:
   `PEMERINTAH PROVINSI JAWA TENGAH` 11/700 ls 1.4 · `DINAS PENDIDIKAN` 10/600 ls 1.6
   (`ink-soft`) · `SMK HKTI 2 PURWAREJA KLAMPOK` 17/800 · alamat 7.5 `muted` ·
   `NPSN … · Telp … · situs · email` 7.5 `muted` · spacer 64 kanan (simetri).
2. **Garis ganda** — 3px `ink` + gap 2 + 1px `ink`, padding atas 14.
3. **Judul** — padding atas 22, "BERITA ACARA PENERIMAAN BARANG (BAP)" 13.5/800 ls 0.8 centered;
   `Nomor: 027 / BAP-BOS / XI / 2026` 10.5 mono `ink-soft`.
4. **Paragraf pembuka** — padding atas 16, 10px lh 1.7 rata kanan-kiri (`justify`), `ink-soft`.
5. **Tabel** — border 1px `ink`, padding atas 14, kolom
   `No` 30 · `Kode / Barcode` 86 · `Nama Barang & Spesifikasi Teknis` flex · `Volume` 52 (kanan)
   · `Satuan` 50 · `Kondisi` 72 (kanan). Header `surface-2` padding 7/8, th 8/700 ls 0.4.
   Baris padding 8/8: nomor 8.5 mono · kode 8.5 mono · nama 9/700 + spek 7.5 `muted` ·
   volume 8.5/700 mono · satuan 8.5 · kondisi badge `Baik` (mint, 7.5).
   Baris total `surface-2`: "Jumlah Keseluruhan" 8.5/700 · `18` · `Unit` · `10 Roll · 8 Unit`.
6. **Klausul penutup** — 2 paragraf 11px lh 1.75 justify (`ink-soft`).
7. **Spacer fleksibel** (mendorong tanda tangan ke bawah).
8. **Blok tanda tangan** (3 pihak):
   - Kiri 236px: `Penyimpan / Teknisi Barang` 9/600 → ruang 103px → nama 9.5/700 **underline** →
     `NIP. …` 8 `muted`.
   - Kanan 236px: `Guru Pengawas / Pemeriksa` → **kotak QR 86×86** (border 1px ink, padding 6,
     QR 74px) → caption `QR Verifikasi Sah Sistem HIKA` 6.5/700 → 8px → nama + NIP.
   - **Tidak ada** blok "Mengetahui, Kepala Sekolah" — dokumen hanya ditandatangani
     Penyimpan/Teknisi dan Guru Pengawas (role sistem: ADMIN/TECHNICIAN dan TEACHER).
9. **Footer** — padding atas 18, garis 1px `line`, dua baris 7px `muted` centered.

Toolbar halaman (di luar kertas, tidak ikut tercetak): breadcrumb + tombol `Cetak BAP`
(`printer`) dan `Unduh PDF` (`download`), serta `Kirim Ulang` (`mail`) bila perlu.

---

## 4. `/procurement/[id]/check` — Pemeriksaan Barang (mobile)

Ref: `05-mobile-pemeriksaan-light.png` · `12-mobile-pemeriksaan-dark.png`

App bar 59px, padding 13/16: tombol back 30×30 (`surface`, radius 9, border, `arrow-left` 15) ·
judul **16/800** ls −0.4 "Pemeriksaan Barang" + sub **9.5** "BAP No. 027/BAP-BOS/XI/2026" ·
kanan: icon button 32 (`ellipsis-vertical`).

Konten: padding **0/16/10/16**, gap **12**, scroll.

1. **Banner** (`brand-soft`, radius 14, padding 13): baris ikon `clipboard-check` 13 + judul
   11/700 `brand-deep` "Periode: November 2026"; body 9.5 `brand-deep` lh 1.45
   ("4 Jenis Barang (18 Unit). Silakan cek fisik barang di gudang sebelum disahkan.").
2. **Kartu item** (radius 14, padding **11/12**, gap 8, border):
   - Baris atas: **checkbox 20×20** radius 6 (tercentang: `brand` + `check` 12 putih;
     kosong: `surface` + border 1.5 `line`) · info (badge 8, nama **11.5/800**, spek 9 `muted`,
     opsional baris warning amber: `triangle-alert` 10 + 8.5/600) · kanan: jumlah 10/700 mono.
   - Baris bawah (border atas, padding atas 8): bila tercentang pill `Kondisi Baik`
     (mint-soft, `check` 8, 8/700) — bila belum teks "Belum diperiksa" 8.5 `muted`;
     kanan: "Dicek 14:24 WIB" 8 mono `muted`.
3. **Catatan Pemeriksa** (kartu radius 14, padding 11/12): label `CATATAN PEMERIKSA` 8.5/700 caps
   `muted` + input `surface-2` radius 9 padding 9/10 (ikon `pencil-line` 13 + placeholder
   "Catatan fisik (opsional)" 9.5).
4. **Action bar** (sticky, di atas bottom nav; `surface`, border atas, padding 10/16, gap 7):
   - Baris progres: "2 dari 4 barang terverifikasi" 9.5/600 `ink-soft` · "50%" 9.5/700 `brand`.
   - Track 4px radius 999 `#EDF2F8` (dark `#3C4043`) + isian `brand` selebar persentase.
   - **Tombol full width** `Sahkan & Terbitkan BAP`:
     - belum lengkap → `disabled`: `surface-2`, border `line`, teks `muted`, ikon `lock`.
     - lengkap → `primary` `brand`, ikon `check` (atau `check-circle`), aktif.
5. **Bottom nav** 62px (5 tab, tab `Inventaris` aktif).

State: semua item tercentang → tombol aktif → tap memanggil `publishBap` → tampil modal
(screen 5) → setelah tutup, redirect ke `/procurement/[id]`.

---

## 5. Modal "Pengesahan Berhasil" (mobile)

Ref: `06-mobile-modal-pengesahan-light.png` · `13-…-dark.png`

- Overlay penuh `#0B1B2E99` (dark `#000000A6`); konten di belakang tampak samar.
- Dialog: lebar **342** (390 − 48), radius **18**, padding **24**, gap 12, `surface`,
  `shadow` `0 18px 44px #0B1B2E44`.
- Isi: lingkaran 56 `mint-soft` + `check` 28 `mint` · judul **18/800** ls −0.6 centered
  "Pengesahan Berhasil!" · sub 10.5 `muted` lh 1.5 ("BAP Pengadaan BOS Bulan November 2026
  telah sah. Stok otomatis masuk ke gudang.") · kotak QR **140×140** putih border `line` radius 8
  + caption 9 `muted` · kartu detail `surface-2` radius 12 padding 12, 2 baris
  (label 8/700 caps `muted` + nilai 9.5/700 `ink-soft`):
  "Diverifikasi oleh → Drs. Budi Santoso, S.Kom." dan "Waktu → 06 Nov 2026 · 14:30 WIB" ·
  tombol primary "Lihat Surat BAP Resmi" (`file-text`) · tombol secondary "Kembali ke Beranda"
  (`arrow-left`) — keduanya full width, padding 12/16, 12/700.
- Mobile: muncul sebagai bottom sheet (`animate-slide-up`) atau dialog centered; tutup via
  tombol/overlay/ESC; fokus awal pada tombol primary.

---

## 6. Dasbor (`/dashboard`) + blok BOS — desktop

Ref: `reference/png/04-dasbor-bos-light.png` · `11-dasbor-bos-dark.png`

**Tidak ada dasbor kedua.** Dasbor yang sudah ada (v1) ditambah dua elemen BOS:

1. **KPI ke-4** diganti: label `Pengadaan BOS`, nilai **18**, satuan `Unit`,
   caption "Unit masuk · Nov 2026", ikon `shopping-cart`, chip `mint-soft` / ikon `mint`.
   (KPI 1–3 tetap: Total Barang 40, Stok Rendah 18, Peminjaman Aktif 10.)
2. **BOS Strip** — kartu penuh lebar, **di antara KPI Row dan Body** (gap 16), padding **14/18**,
   radius 16, `surface` + border, `items-center`, gap 14:
   - chip ikon 38 (`mint-soft`, `clipboard-list` 18 `mint`)
   - blok teks (flex-1, vertical gap 3):
     baris 1: "Pengadaan BOS · November 2026" 13/700 + badge `Sah & Lengkap` (mint, 10);
     baris 2 (gap 10): nomor BAP mono 10.5/600 `ink-soft` · "4 jenis · 18 unit" 10.5 `muted` ·
       dot 3px `line` · ikon `user-check` 11 + "Budi Santoso" 10.5 `ink-soft`
   - kanan: tombol `Lihat BAP` (secondary, `file-text`, padding 9/14, 12) → `/procurement/[id]`
   Tinggi ±67px. Body (Aktivitas + Stok) otomatis menyusut; stok tinggal 3 item,
   aktivitas 5 baris agar muat tanpa overflow.

3. Kolom kanan Body tetap: kartu **Stok Hampir Habis** (3 item + tombol "Buat Daftar Pengadaan").

Data: KPI dari `Procurement` bulan berjalan (`VERIFIED`) + `Item` + `Borrowing` aktif;
strip menampilkan BAP terakhir yang sah pada bulan berjalan (atau "Belum ada BAP" + tombol
"Buat Pengajuan" bila kosong).

### Versi mobile

Ref: `07-mobile-dasbor-bos-light.png` · `14-…-dark.png`

- KPI ke-4: label `Belanja BOS`, nilai **18**, caption `Nov 2026`, ikon `shopping-cart`.
- **BOS Strip** setelah dua baris KPI (padding 11/12, radius 14, gap 10):
  chip 30 (`mint-soft`, `clipboard-list` 14 mint) · teks vertical gap 2:
  "Pengadaan BOS · Nov 2026" 10/700 + "027/BAP-BOS/XI/2026 · 18 unit" 8.5 `muted` ·
  badge `Sah` (mint, 8). Tinggi ±52px, bisa di-tap → dokumen BAP.
- Aktivitas 4 baris, Stok 3 item (agar konten tidak terpotong di 844px).

## 7. Ringkasan perubahan layar yang dihapus

Layar berikut **dihapus** dari desain dan tidak boleh diimplementasikan:

- `Dasbor Eksekutif — Redesign/Dark` (desktop) → digabung ke `/dashboard` (bagian 6).
- `Mobile Dasbor Eksekutif — Redesign/Dark` → digabung ke `/dashboard` versi mobile.
- Role `HEADMASTER` beserta menu/guard-nya.
- Route `/procurement/archive` → menjadi tab "Arsip BAP" di `/reports` (bagian 2).

## 9. Template cetak laporan (A4) — pengganti format lama

Ref: `reference/png/16-cetak-laporan-stok.png`, `17-…-peminjaman`, `18-…-mutasi`, `19-…-barang-masuk`
Empat dokumen A4 (794×1123, padding 48/52) yang **memakai template yang sama dengan BAP**:
KOP resmi → garis ganda → judul + periode → strip ringkasan 3 sel → tabel bergaris → catatan →
baris total → tanggal → 2 blok tanda tangan → footer.

Perbedaan antar laporan hanya judul, ringkasan, dan kolom tabel (sesuai data yang sudah ada di
`src/components/reports/*`):

| Laporan | Judul | Kolom tabel |
| --- | --- | --- |
| Stok | `LAPORAN STOK BARANG` | No 22 · Nama & Spesifikasi flex · Barcode 56 · Lokasi 86 · Kategori 66 · Stok 30 (kanan) · Status 58 (kanan) |
| Peminjaman | `LAPORAN RIWAYAT PEMINJAMAN` | No 22 · Tgl Pinjam 56 · Peminjam 104 · Barang & Spesifikasi flex · Tgl Kembali 56 · Status 50 · Kondisi 44 (kanan) |
| Mutasi Gudang | `LAPORAN MUTASI GUDANG` | No 22 · Waktu 62 · Tipe 36 · Barang & Spesifikasi flex · Jumlah 36 (kanan) · Catatan 112 |
| Barang Masuk | `LAPORAN BARANG MASUK` | No 22 · Tanggal 54 · Barang 122 · Spesifikasi flex · Lokasi 70 · Jumlah 30 (kanan) · Keterangan 84 |

Ketentuan:

- **Strip ringkasan** (di bawah judul): 3 sel bergaris, tiap sel label 7/700 caps `muted` +
  nilai 11/800 mono (mis. `JENIS BARANG 40` · `TOTAL UNIT 312` · `STOK RENDAH 18`).
- **Tabel**: border 1px `ink`, header `surface-2`, tinggi baris seragam, kolom angka rata kanan,
  status ditulis sebagai **teks berwarna** (bukan badge) agar tidak terpotong saat dicetak:
  `Baik` mint · `Rendah` amber · `Habis`/`Rusak` rose · `Aktif` brand · `Kembali` mint.
- **Catatan** kecil 7.5 `muted` di bawah tabel (definisi status/urutan data).
- **Baris total** `surface-2` bergaris: kiri "Total … · N jenis/transaksi", kanan jumlah unit.
- **Tanggal** rata kanan: "Purwareja Klampok, 06 November 2026".
- **Tanda tangan 2 kolom** (padding kiri-kanan 60): kiri `Dibuat oleh, Admin TU` — kanan
  `Diperiksa oleh, Guru Pengawas`; masing-masing role 9/600, ruang 52px, nama 9.5/700 underline,
  NIP 8 `muted`.
- **Footer** 2 baris 7 `muted`: sumber data + "Dicetak … · Halaman 1 dari N".
- **Tanpa** blok Kepala Sekolah di laporan mana pun.
- Saat dicetak: pakai aturan `.sheet` yang sama (lihat `05-print-and-qr.md`), font dalam pt
  (body 9.5pt, tabel 7.5–8pt, judul 10.5pt), dan `@page { size: A4; margin: 0 }`.

## 8. `/verify/[token]` — Verifikasi Publik (mobile web)

Ref: `08-verifikasi-publik-light.png` · `15-…-dark.png`

Tanpa shell aplikasi; `bg-app`, konten padding **26/20/20**, gap 14, centered. Bisa dibuka tanpa login.

1. **Brand**: mark 40 `brand` radius 12 + "SMK HKTI 2" 14/800, "Sistem Inventaris Sekolah Resmi (HIKA)" 9 `muted`.
2. **Hero**: lingkaran 64 `mint-soft` border `#0EA47A33` + `shield-check` 30 `mint`;
   headline **13.5/800** ls 0.4 "DOKUMEN ASLI & TERVERIFIKASI"; sub 10 `muted` lebar 300 lh 1.5.
3. **Kartu dokumen** (radius 16, `surface`, border):
   - Head `brand-soft` padding 12/14: "BERITA ACARA PENERIMAAN BARANG" 9/800 ls 0.4 `brand-deep`
     + "BAP · Dana BOS Reguler 2026" 8 + ikon `badge-check` 18 `brand`.
   - Fields (padding 2/14) — tiap baris padding 8/0, border bawah:
     label 7.5/700 caps `muted`, nilai 9.5/600 `ink-soft`:
     `Nomor Dokumen` `027/BAP-BOS/XI/2026` · `Sumber Dana` `Bantuan Operasional Sekolah (BOS)
     Reguler 2026` · `Tanggal Pengesahan` `Jumat, 06 November 2026 · 14:30 WIB` ·
     `Guru Pengawas / Pemeriksa` `Drs. Budi Santoso (NIP. 19780512 200501 1 008)` ·
     `Status Fisik Barang` `100% Lengkap & Kondisi Baik` (**mint/700**).
   - Mini tabel (padding 8/14/10): head `BARANG DISETUJUI` / `VOLUME` 7.5 caps ·
     4 baris padding 6/0 border bawah: nama 9.5 + volume 9.5/700 mono.
   - Strip `mint-soft` padding 9/14 centered: `check` 11 + "Terverifikasi sistem · 18 unit sesuai
     dokumen" 8.5/700 `mint`.
4. **Spacer** lalu footer 2 baris centered: "SMK HKTI 2 Purwareja Klampok" 8/700 `ink-soft`,
   "Terenkripsi SHA-256 Digital Signature · HIKA Inventaris" 7.5 `muted`.
5. Token invalid → tampilkan versi netral: ikon `shield-x` rose, "Dokumen Tidak Ditemukan",
   penjelasan, tombol "Hubungi Admin TU".

---

## Catatan tema gelap

- Layar 1, 2, 4 (dasbor), 5, 6, 8 punya varian gelap dengan struktur **identik**; bedanya hanya token.
- Yang berubah nilai (lihat `reference/png/09…15`):
  app bg `#202124`, surface `#292A2D`, surface-2 `#303134`, line `#3C4043`,
  ink `#E8EAED`, muted `#9AA0A6`, brand `#1A73E8`, brand-soft `#2D3037`,
  navy `#1B1C1F`, nav aktif `#3C4043`, user card `#2A2B2E`, teks sub sidebar `#80868B`,
  overlay modal `#000000A6`.
- **Dokumen BAP A4 tidak punya versi gelap** — kertas selalu putih (dan cetak hitam-putih).
