# HIKA Inventaris — V2 Handoff (all-in-one)

> Gabungan: ANTIGRAVITY-V2.md · 01-screens.md · 02-data-model.md · 03-roles-flows.md · 04-server-actions.md · 05-print-and-qr.md · 06-components.md · 07-implementation-plan.md
> Referensi visual: `reference/png/` (19 gambar), `reference/html/`, `spec/`.


---

# Prompt untuk Antigravity — Modul Pengadaan BOS / BAP (v2)

> Copy seluruh isi file ini sebagai instruksi. Kerjakan di repo `school_inventory`
> (Next.js 16 App Router, Prisma 5 + PostgreSQL, NextAuth 5, Tailwind v4, shadcn/ui).

---

## Tugas

Implementasikan **modul baru**: pengajuan pengadaan barang Dana BOS → pemeriksaan fisik oleh
Guru Pengawas → Berita Acara Penerimaan Barang (BAP) sah ber-QR → arsip BAP di halaman Laporan →
halaman verifikasi publik, **plus** blok informasi BOS di dasbor yang sudah ada.

Desain (PNG + layer tree + HTML) ada di `design-handoff/v2-pengadaan-bos/`.
Gaya visual **wajib mengikuti design system v1** (token di `design-handoff/tokens.css`,
komponen di `design-handoff/03-components.md`).

## Keputusan yang sudah final — jangan diubah

1. **Hanya satu dasbor.** `/dashboard` tetap satu-satunya dasbor. Tambahkan di dalamnya:
   KPI "Pengadaan BOS" (menggantikan "Transaksi Hari Ini") dan satu blok **BOS Strip**
   (nomor BAP, badge status, jumlah jenis/unit, pemeriksa, tombol "Lihat BAP").
   **Jangan** membuat `/executive` atau dasbor kedua (layar eksekutif sudah dihapus).
2. **Arsip BAP = tab di `/reports`**, bukan menu/route sendiri. Tambah tab ke-5 `Arsip BAP`
   di halaman Laporan (desktop & mobile), lalu isi tab itu dengan filter tahun/bulan,
   ringkasan, dan tabel BAP. Hapus rencana route `/procurement/archive`.
3. **Tidak ada role Kepala Sekolah.** Role tetap `ADMIN`, `TECHNICIAN`, `TEACHER`.
   Jangan menambah `HEADMASTER`, jangan membuat guard/menu khusus kepala sekolah.
   Dokumen BAP **tidak** memuat tanda tangan Kepala Sekolah: hanya Penyimpan/Teknisi Barang
   dan Guru Pengawas (+ QR). Laporan cetak memakai 2 tanda tangan: "Dibuat oleh, Admin TU" dan
   "Diperiksa oleh, Guru Pengawas".

## Baca dulu

1. `design-handoff/v2-pengadaan-bos/01-screens.md`
2. `design-handoff/v2-pengadaan-bos/02-data-model.md`
3. `design-handoff/v2-pengadaan-bos/03-roles-flows.md`
4. `design-handoff/v2-pengadaan-bos/04-server-actions.md`
5. `design-handoff/v2-pengadaan-bos/05-print-and-qr.md`
6. `design-handoff/v2-pengadaan-bos/06-components.md`
7. `design-handoff/v2-pengadaan-bos/07-implementation-plan.md`
8. Referensi: `reference/png/*.png` (light + dark), `reference/html/*.html` (ukuran/markup),
   `spec/*.md` (angka per layer)

## Route yang harus dibuat / diubah

| Route | Status | Halaman |
| --- | --- | --- |
| `/procurement` | **baru** | form pengajuan + tabel barang belanjaan |
| `/procurement/[id]` | **baru** | dokumen BAP A4 (preview + cetak), riwayat |
| `/procurement/[id]/check` | **baru** | checklist pemeriksaan fisik (mobile), aksi sahkan |
| `/reports` | **ubah** | tambah tab "Arsip BAP" + **ganti format cetak laporan** (template A4 resmi, lihat `01-screens.md` §9) |
| `/dashboard` | **ubah** | KPI "Pengadaan BOS" + blok BOS Strip |
| `/verify/[token]` | **baru** | **publik, tanpa login** — hasil scan QR dokumen |

## Aturan

- **Jangan** mengubah modul lain (inventaris, peminjaman, barcode) selain menambah entri menu
  "Pengadaan BOS" di sidebar.
- Semua nomor/statistik dari DB. Jangan hardcode "18 Unit" atau "027/BAP-BOS/XI/2026".
- Nomor BAP dibentuk `{seq:3digit}/BAP-BOS/{bulan romawi}/{tahun}` dan **hanya** diberikan
  saat pengajuan dikirim (status `SUBMITTED`), memakai counter atomik per tahun.
- QR **wajib** mengarah ke `/verify/{qrToken}` dengan `qrToken` acak 32 hex, unik, tidak bisa ditebak.
- Halaman `/verify/[token]` harus bisa diakses tanpa login (longgarkan `middleware`/`authConfig`)
  dan mencatat kunjungan verifikasi.
- Cetak BAP wajib A4, ukuran font memakai **pt** (lihat `05-print-and-qr.md`), bukan px desain.
- Pengesahan (publish) harus atomik: tandai barang terverifikasi + buat `Transaction` stok masuk
  + daftarkan barang baru di Inventaris, semuanya dalam satu `$transaction`.
- Tema gelap otomatis lewat token; jangan menulis warna `dark:` manual kecuali yang ditetapkan
  (sidebar `#1B3364`/`#3C4043`, overlay `#0B1B2E99`/`#000000A6`).

## Dependensi yang boleh ditambah

- `qrcode` (+ `@types/qrcode`) untuk generate QR (SVG/data URL) di server.
- `date-fns` (sudah ada) untuk format tanggal Indonesia.
- **Jangan** menambah library chart.

## Definisi selesai

- Alur end-to-end berjalan: buat draft → kirim → guru periksa (checklist) → sahkan →
  BAP bernomor + QR → stok masuk & barang baru terdaftar → muncul di tab Arsip BAP pada Laporan →
  ringkasannya tampil di blok BOS pada Dasbor → QR discan menampilkan halaman verifikasi valid.
- Light & dark sesuai referensi; desktop 1440×880 dan mobile 390×844.
- Tidak ada role/menu/halaman khusus Kepala Sekolah.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` hijau.
- Tidak ada regresi pada modul lama.


---

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


---

# 02 · Data model

Tambahan model Prisma. **Tidak mengubah** model lama kecuali menambah relasi balik di `Item`
dan `User`.

Database: PostgreSQL. Konvensi repo: status/peran disimpan sebagai `String` + validasi `zod`
(bukan enum Prisma), supaya konsisten dengan `Transaction.type` dan `Borrowing.status`.

---

## 1. Model baru

```prisma
// ---------------------------------------------------------------------------
// Pengadaan BOS & Berita Acara Penerimaan Barang (BAP)
// ---------------------------------------------------------------------------

model Procurement {
  id          String  @id @default(cuid())

  // Identitas dokumen — null selama masih DRAFT
  bapNumber   String? @unique          // "027/BAP-BOS/XI/2026"
  qrToken     String? @unique          // 32 hex, dipakai URL /verify/{qrToken}

  periodMonth Int                      // 1..12
  periodYear  Int
  source      String  @default("BOS_REGULER") // BOS_REGULER | BOSP
  note        String?

  status      String  @default("DRAFT")        // DRAFT | SUBMITTED | VERIFIED | REJECTED
  totalUnits  Int     @default(0)              // cache, dihitung saat publish
  totalItems  Int     @default(0)              // cache jumlah baris

  // Pihak-pihak
  createdById  String
  createdBy    User    @relation("ProcurementCreated", fields: [createdById], references: [id])
  inspectorId  String?
  inspector    User?   @relation("ProcurementInspector", fields: [inspectorId], references: [id])
  verifiedById String?
  verifiedBy   User?   @relation("ProcurementVerified", fields: [verifiedById], references: [id])

  // Stempel waktu
  submittedAt DateTime?
  verifiedAt  DateTime?
  rejectedAt  DateTime?
  rejectNote  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items     ProcurementItem[]
  logs      ProcurementLog[]
  visits    VerificationVisit[]

  @@unique([periodMonth, periodYear], name: "unique_period")
  @@index([periodYear, periodMonth])
  @@index([status])
}

model ProcurementItem {
  id            String      @id @default(cuid())
  procurementId String
  procurement   Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)

  kind          String  @default("BARU")   // BARU | LAMA  (LAMA = diambil dari inventaris)
  itemId        String?                    // terisi bila kind = LAMA
  item          Item?   @relation(fields: [itemId], references: [id], onDelete: SetNull)

  name          String
  specification String?
  categoryName  String?
  quantity      Int
  unit          String  @default("Unit")   // Unit | Roll | Set | Box | Buah
  barcode       String?                    // untuk barang BARU, boleh dikosongkan

  condition     String  @default("BAIK")   // BAIK | RUSAK | KURANG
  checked       Boolean @default(false)    // dicentang Guru Pengawas
  checkedAt     DateTime?
  checkedById   String?

  sortOrder     Int     @default(0)
  createdAt     DateTime @default(now())

  @@index([procurementId])
}

// Audit trail aksi (dibuat/ubah/kirim/periksa/sahkan/tolak/unduh)
model ProcurementLog {
  id            String      @id @default(cuid())
  procurementId String
  procurement   Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  action        String      // CREATED | UPDATED | ITEM_ADDED | ITEM_REMOVED | SUBMITTED | CHECKED | PUBLISHED | REJECTED | PRINTED
  actorId       String?
  note          String?
  createdAt     DateTime    @default(now())

  @@index([procurementId])
}

// Setiap kali QR discan & halaman verifikasi dibuka
model VerificationVisit {
  id            String      @id @default(cuid())
  procurementId String
  procurement   Procurement @relation(fields: [procurementId], references: [id], onDelete: Cascade)
  ip            String?
  userAgent     String?
  visitedAt     DateTime    @default(now())

  @@index([procurementId])
}

// Counter nomor BAP per tahun — atomik, hindari duplikat saat bersamaan
model Counter {
  key   String @id            // "bap:2026"
  value Int    @default(0)
}
```

## 2. Perubahan pada model lama (hanya relasi balik)

```prisma
model Item {
  // ... field lama tetap
  procurementItems ProcurementItem[]
}

model User {
  // ... field lama tetap
  role String @default("TEACHER") // ADMIN | TECHNICIAN | TEACHER  (tidak ada role Kepala Sekolah)
  createdProcurements  Procurement[] @relation("ProcurementCreated")
  inspectedProcurements Procurement[] @relation("ProcurementInspector")
  verifiedProcurements Procurement[] @relation("ProcurementVerified")
}
```

## 3. Migrasi

```bash
npx prisma migrate dev --name procurement_bos
npx prisma generate
```

Data lama tidak terpengaruh (semua model baru, semua field baru nullable/default).
Tidak ada perubahan pada kolom `role` (role Kepala Sekolah dibatalkan).

## 4. Penomoran BAP (atomik)

Format: `{seq:3}/{BAP-BOS}/{bulan romawi}/{tahun}` → `027/BAP-BOS/XI/2026`.

```ts
// src/lib/bap-number.ts
const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

export function formatBapNumber(seq: number, month: number, year: number) {
  return `${String(seq).padStart(3, "0")}/BAP-BOS/${ROMAN[month - 1]}/${year}`;
}

/** Ambil nomor berikutnya tanpa menaikkan counter (untuk preview di form). */
export async function peekNextBapNumber(year: number) {
  const c = await prisma.counter.findUnique({ where: { key: `bap:${year}` } });
  return formatBapNumber((c?.value ?? 0) + 1, /* bulan berjalan */ new Date().getMonth() + 1, year);
}

/** Dipakai saat SUBMIT — aman untuk request bersamaan. */
export async function takeNextBapNumber(tx: Prisma.TransactionClient, year: number, month: number) {
  const c = await tx.counter.upsert({
    where: { key: `bap:${year}` },
    create: { key: `bap:${year}`, value: 1 },
    update: { value: { increment: 1 } },
  });
  return formatBapNumber(c.value, month, year);
}
```

> Di desain, nomor Desember (028) lebih besar dari November (027) karena BAP dibuat lebih dulu —
> konfirmasi ke user bahwa urutan = **urutan pembuatan dokumen**, bukan urutan bulan.

## 5. Aturan data penting

| Aturan | Alasan |
| --- | --- |
| Satu periode (bulan+tahun) hanya boleh punya **satu** `Procurement` (`@@unique`) | mencegah BAP ganda untuk periode yang sama |
| `bapNumber` baru diisi saat `SUBMITTED` | draft belum punya nomor resmi (form menampilkan *preview*) |
| `qrToken` dibuat bersamaan dengan `bapNumber` | QR hanya ada pada dokumen yang sudah dikirim |
| `totalUnits` / `totalItems` dihitung ulang saat publish | dipakai arsip & dasbor tanpa agregasi tiap render |
| `ProcurementItem.itemId` hanya untuk `kind = LAMA` | barang baru belum ada di `Item` sebelum disahkan |
| Stok baru bertambah **setelah** `VERIFIED` | barang belum diterima saat draft/diperiksa |

## 6. Integrasi stok saat publish (`publishBap`)

Dalam satu `prisma.$transaction`:

1. Validasi: `status === "SUBMITTED"`, semua item `checked === true`, minimal 1 item.
2. Untuk tiap item:
   - `kind = LAMA` & `itemId` ada → `transaction.create({ type: "IN", quantity, itemId, note: "BAP {bapNumber}" })`
     + `item.update({ quantity: { increment } })`.
   - `kind = BARU` → cari/buat `Location` "Gudang", `Category` (dari `categoryName`),
     lalu `item.create` (barcode = `barcode` atau generate `Date.now()` 5 digit seperti modul lama)
     + `transaction.create({ type: "IN", ... })`.
3. `procurement.update({ status: "VERIFIED", verifiedAt: now, verifiedById, totalUnits, totalItems })`.
4. `procurement.log.create({ action: "PUBLISHED", actorId })`.
5. `revalidatePath` untuk `/procurement`, `/procurement/[id]`, `/reports`, `/dashboard`, `/inventory`.

## 7. Query yang dibutuhkan

```ts
// Arsip + filter
const baps = await prisma.procurement.findMany({
  where: {
    status: { in: ["SUBMITTED", "VERIFIED", "REJECTED"] },
    periodYear: year,
    ...(month ? { periodMonth: month } : {}),
  },
  include: { inspector: true, verifiedBy: true, _count: { select: { items: true } } },
  orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }, { createdAt: "desc" }],
});

// Ringkasan filter
const summary = await prisma.procurement.aggregate({
  where: { periodYear: year, status: { in: ["SUBMITTED", "VERIFIED"] } },
  _count: { _all: true },
  _sum: { totalUnits: true },
});

// Dasbor eksekutif
const [totalAssets, unitsThisMonth, bapThisMonth, activeLoans] = await Promise.all([
  prisma.item.aggregate({ _sum: { quantity: true }, _count: { _all: true } }),
  prisma.procurement.aggregate({
    _sum: { totalUnits: true },
    where: { periodMonth: month, periodYear: year, status: "VERIFIED" },
  }),
  prisma.procurement.findFirst({
    where: { periodMonth: month, periodYear: year, status: "VERIFIED" },
    include: { verifiedBy: true, inspector: true },
  }),
  prisma.borrowing.aggregate({ _sum: { quantity: 1 }, where: { status: "ACTIVE" } }), // sesuaikan skema Borrowing
]);

// Realisasi 12 bulan
const monthly = await prisma.procurement.groupBy({
  by: ["periodMonth"],
  where: { periodYear: year, status: "VERIFIED" },
  _sum: { totalUnits: true },
});
```

## 8. Seed demo (opsional, untuk verifikasi visual)

Buat `prisma/seed-procurement.js` yang mengisi:

- 11 `Procurement` tahun 2026 (Jul–Des) dengan total unit 8–26, satu `SUBMITTED` (Desember, 8 unit),
  sisanya `VERIFIED` dengan `bapNumber` berurutan, `qrToken` acak, `verifiedAt` tanggal terkait.
- 4 `ProcurementItem` untuk BAP November (10 Roll Kabel UTP, 2 Unit Switch Hub, 5 Unit Mouse,
  1 Unit SSD), semua `checked: true`.
- User: `budi@…` (`TEACHER`, guru pengawas) dan `admin@…` (`ADMIN`).
- `SchoolSettings`: cukup data yang ada (nama sekolah, alamat, telepon, email, website, logo).
  **Tidak perlu** field kepala sekolah — dokumen BAP & laporan tidak memuat tanda tangannya.

Semua angka di dokumen desain (159 unit/tahun, 420 unit arsip) tidak harus persis — yang penting
konsisten antar layar.


---

# 03 · Peran, izin, dan alur

> Keputusan final: **tidak ada role Kepala Sekolah**. Role tetap tiga: `ADMIN`,
> `TECHNICIAN`, `TEACHER`. Tanda tangan "Mengetahui, Kepala Sekolah" pada dokumen BAP tetap
> dicetak, tetapi bukan seorang user sistem — datanya dari `SchoolSettings`.

---

## 1. Peran

Role disimpan di `User.role` (String) — **tidak ada nilai baru**.

| Role | Sebutan di UI | Tugas dalam modul ini |
| --- | --- | --- |
| `ADMIN` | Admin TU | membuat/mengubah pengajuan, memilih guru pengawas, mencetak BAP |
| `TECHNICIAN` | Teknisi / Penyimpan Barang | menyusun daftar barang, menerima fisik barang |
| `TEACHER` | Guru Pengawas | memeriksa fisik, mencentang item, mengesahkan BAP |

## 2. Matriks izin

| Aksi | ADMIN | TECHNICIAN | TEACHER | Publik |
| --- | :-: | :-: | :-: | :-: |
| Lihat `/procurement` | ✓ | ✓ | ✓ (read-only) | – |
| Buat draft / ubah draft | ✓ | ✓ | – | – |
| Tambah/hapus item | ✓ | ✓ | – | – |
| Pilih guru pengawas | ✓ | – | – | – |
| Kirim ke guru pengawas | ✓ | ✓ | – | – |
| Checklist pemeriksaan | – | – | ✓ (hanya yang ditunjuk) | – |
| Sahkan / terbitkan BAP | – | – | ✓ | – |
| Tolak BAP | – | – | ✓ | – |
| Tab Arsip BAP di `/reports` | ✓ | ✓ | ✓ | – |
| Cetak BAP | ✓ | ✓ | ✓ | – |
| Dasbor + blok BOS | ✓ | ✓ | ✓ | – |
| Verifikasi QR | – | – | – | ✓ |

Penegakan: **server action wajib** memeriksa sesi + role (`requireUser([...])`), bukan hanya
menyembunyikan tombol. Route protection:

```ts
const protectedPrefixes = ["/dashboard","/inventory","/borrow","/reports","/settings","/procurement"]
// /verify/** sengaja TIDAK diproteksi
```

Tidak ada guard tambahan untuk dasbor — semua user login boleh melihat `/dashboard`.

## 3. State machine `Procurement.status`

```
        ┌──────────── buat / ubah ─────────────┐
        ▼                                      │
     DRAFT ──submit──▶ SUBMITTED ──publish──▶ VERIFIED
        ▲                  │
        └──── revisi ──────┤
                           └──reject──▶ REJECTED ──revisi──▶ DRAFT
```

| Status | Arti | Yang boleh terjadi |
| --- | --- | --- |
| `DRAFT` | masih disusun, belum bernomor | edit semua field & item, hapus, submit |
| `SUBMITTED` | nomor BAP & QR sudah terbit, menunggu pemeriksaan | guru mencentang item & publish/reject; admin hanya baca |
| `VERIFIED` | sah; stok sudah masuk | cetak, lihat QR, muncul di Arsip BAP & strip Dasbor |
| `REJECTED` | dikembalikan guru dengan alasan | admin merevisi → kembali `DRAFT` (nomor dipertahankan) |

Aturan transisi:

- `submit`: minimal 1 item, jumlah > 0, guru pengawas terisi, periode belum dipakai BAP lain.
- `publish`: **semua** item `checked = true`, dan `status = SUBMITTED`.
- `reject`: wajib `rejectNote`.
- `VERIFIED` final. Perbaikan = buat pengajuan baru / revisi bertanda (di luar scope implementasi).

## 4. Alur utama (happy path)

```
Admin TU / Teknisi          Sistem                        Guru Pengawas
──────────────────          ──────                        ─────────────
1. Isi form pengajuan,
   pilih bulan + guru,
   tambah barang
2. Simpan draft ──────────▶ status DRAFT
3. Kirim ─────────────────▶ ambil nomor BAP + qrToken
                            status SUBMITTED ────────────▶ 4. buka /procurement/[id]/check
                                                           cek fisik, centang 4 item, catatan
                                                           tap "Sahkan & Terbitkan BAP"
                                                           ▼
                                             publish: stok IN, item BARU dibuat,
                                             status VERIFIED, verifiedAt, log
                                                           │
                                             modal "Pengesahan Berhasil" (QR)
                                                           │
5. Lihat/cetak BAP dari tab Arsip BAP ◀── dokumen A4 + QR ─┘
6. Ringkasan muncul di blok BOS pada /dashboard
Publik: scan QR ──▶ /verify/{qrToken} ──▶ data BAP + status sah
```

## 5. Alur QR

| Tahap | Detail |
| --- | --- |
| Generate | saat `submit`: `crypto.randomBytes(16).toString("hex")` (32 hex) |
| Isi QR | `${process.env.NEXTAUTH_URL}/verify/${qrToken}` |
| Render | server: `qrcode` → SVG, disisipkan dalam kotak 19mm / 74px |
| Halaman | `/verify/[token]` server component **tanpa auth**, hanya `status = VERIFIED` |
| Logging | `VerificationVisit` (ip + user-agent) via `POST /api/verify/[token]/visit` |
| Token salah | "Dokumen tidak ditemukan" (tanpa bocor info) |
| Cache | `dynamic = "force-dynamic"` |

QR tidak memuat data sensitif — hanya token.

## 6. Navigasi

**Sidebar desktop** — tambah satu item setelah `Inventaris`:

| Label | Ikon | Route |
| --- | --- | --- |
| Pengadaan BOS | `clipboard-list` | `/procurement` |

Tidak ada menu "Arsip BAP" — akses lewat tab di `/reports` (dan tombol "Lihat BAP" di Dasbor).

**Bottom nav mobile** tetap 5 tab (Dasbor, Inventaris, Barcode, Pinjam, Laporan).
`Pengadaan BOS` bisa ditaruh di sheet "Menu lainnya" dari avatar, atau lewat tombol
"Buat Daftar Pengadaan" di kartu Stok Hampir Habis pada Dasbor.

## 7. Notifikasi & audit

- Toast (sonner): draft tersimpan, pengajuan terkirim, item diperbarui, BAP disahkan/ditolak.
- `ProcurementLog` mencatat tiap transisi + `actorId`; ditampilkan sebagai timeline
  di halaman `/procurement/[id]`.
- Cetak boleh dicatat `PRINTED` (opsional).

## 8. Edge case

| Kasus | Perilaku |
| --- | --- |
| Dua admin submit periode sama bersamaan | `@@unique([periodMonth, periodYear])` → error "BAP periode ini sudah ada" |
| Guru membuka checklist BAP bukan tugasnya | 403 + redirect ke `/reports` |
| Guru menutup browser di tengah pemeriksaan | `checked` per item tersimpan |
| Barang inventaris dihapus setelah dipakai BAP | relasi `onDelete: SetNull`; nama/spek disimpan di `ProcurementItem` |
| BAP dicetak sebelum sah | tombol cetak untuk `SUBMITTED`/`VERIFIED`, watermark "DRAFT" bila `SUBMITTED` |
| QR dokumen lama (BAP dihapus) | halaman verifikasi → "Dokumen tidak ditemukan" |
| Zona waktu | simpan UTC, tampilkan `Asia/Jakarta` |
| Belum ada BAP bulan ini | strip Dasbor menampilkan "Belum ada BAP · Buat Pengajuan" |


---

# 04 · Server actions & query

Semua di `src/actions/procurement.ts` (+ `src/lib/bap.ts` untuk helper). Pola mengikuti
action yang sudah ada (`"use server"`, `auth()`, `revalidatePath`, return `{ ok, error }`
atau `throw`, dan `zod` untuk validasi).

---

## 1. Bentuk hasil standar

```ts
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
```

Helper sesi/role di `src/lib/guard.ts`:

```ts
export async function requireUser(roles?: Role[]) {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  if (roles && !roles.includes(session.user.role as Role)) throw new Error("FORBIDDEN");
  return session.user as { id: string; role: Role; name: string | null };
}
```

## 2. Validasi (zod)

```ts
export const procurementMetaSchema = z.object({
  periodMonth: z.coerce.number().int().min(1).max(12),
  periodYear: z.coerce.number().int().min(2020).max(2100),
  source: z.enum(["BOS_REGULER", "BOSP"]),
  inspectorId: z.string().cuid(),
  note: z.string().max(500).optional().or(z.literal("")),
});

export const itemSchema = z.object({
  kind: z.enum(["BARU", "LAMA"]),
  itemId: z.string().cuid().optional(),
  name: z.string().min(2).max(120),
  specification: z.string().max(160).optional().or(z.literal("")),
  categoryName: z.string().max(60).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(9999),
  unit: z.enum(["Unit", "Roll", "Set", "Box", "Buah", "Lembar"]).default("Unit"),
  barcode: z.string().max(40).optional().or(z.literal("")),
});

export const checkItemSchema = z.object({
  itemId: z.string().cuid(),
  checked: z.boolean(),
  condition: z.enum(["BAIK", "RUSAK", "KURANG"]).default("BAIK"),
});
```

## 3. Daftar action

### 3.1 `createProcurement(input)`

- Role: `ADMIN`, `TECHNICIAN`.
- Validasi `procurementMetaSchema`.
- Tolak bila periode sudah ada (`unique_period`).
- `status: "DRAFT"`, `createdById: user.id`, log `CREATED`.
- Revalidate `/procurement`.

### 3.2 `updateProcurementMeta(id, input)`

- Role: `ADMIN`, `TECHNICIAN`; hanya `status = DRAFT` atau `REJECTED`.
- Boleh ubah bulan/tahun (cek unik), sumber, guru pengawas, catatan.
- Log `UPDATED`.

### 3.3 `addItemFromWarehouse(procurementId, itemId, quantity)`

- Role: `ADMIN`, `TECHNICIAN`.
- Ambil `Item` + `Category`; simpan **snapshot** `name`, `specification`, `categoryName`, `unit`.
- `kind: "LAMA"`, `itemId`, `barcode` dari item.
- Tolak bila item yang sama sudah ada di pengajuan (tambahkan qty atau beri error — pilih:
  increment qty pada baris yang ada).

### 3.4 `addNewItem(procurementId, input)`

- Role: `ADMIN`, `TECHNICIAN`.
- `kind: "BARU"`, `itemId: null`, `barcode` opsional (boleh kosong → digenerate saat publish).

### 3.5 `updateItem(itemId, patch)` / `removeItem(itemId)`

- Hanya saat `DRAFT`/`REJECTED`.
- `removeItem` → log `ITEM_REMOVED`.

### 3.6 `submitProcurement(id)`

```ts
export async function submitProcurement(id: string) {
  const user = await requireUser(["ADMIN", "TECHNICIAN"]);
  return prisma.$transaction(async (tx) => {
    const p = await tx.procurement.findUnique({ where: { id }, include: { items: true } });
    if (!p) return { ok: false, error: "Pengajuan tidak ditemukan" };
    if (p.status !== "DRAFT" && p.status !== "REJECTED") return { ok: false, error: "Status tidak valid" };
    if (p.items.length === 0) return { ok: false, error: "Tambahkan minimal satu barang" };
    if (!p.inspectorId) return { ok: false, error: "Pilih guru pengawas" };

    const bapNumber = p.bapNumber ?? (await takeNextBapNumber(tx, p.periodYear, p.periodMonth));
    const qrToken = p.qrToken ?? crypto.randomBytes(16).toString("hex");

    const updated = await tx.procurement.update({
      where: { id },
      data: {
        bapNumber, qrToken, status: "SUBMITTED", submittedAt: new Date(),
        totalItems: p.items.length,
        totalUnits: p.items.reduce((a, i) => a + i.quantity, 0),
      },
    });
    await tx.procurementLog.create({ data: { procurementId: id, action: "SUBMITTED", actorId: user.id } });
    return { ok: true, data: { bapNumber: updated.bapNumber } };
  }).then((r) => { revalidatePath("/procurement"); revalidatePath("/reports"); return r; });
}
```

### 3.7 `toggleItemChecked(itemId, checked, condition?)`

- Role: `TEACHER` (hanya inspector yang ditunjuk) atau `ADMIN` bila diminta.
- Update `checked`, `checkedAt`, `checkedById`, `condition`.
- Log `CHECKED`. Revalidate halaman check.

### 3.8 `saveInspectorNote(procurementId, note)`

- Role: `TEACHER`; simpan ke `note` (gabung dengan catatan pengadaan) atau field terpisah
  `inspectorNote` bila ingin dipisah — desain menampilkan satu kolom catatan.

### 3.9 `publishBap(id)` — inti

```ts
export async function publishBap(id: string) {
  const user = await requireUser(["TEACHER"]);
  const result = await prisma.$transaction(async (tx) => {
    const p = await tx.procurement.findUnique({
      where: { id },
      include: { items: true, createdBy: true },
    });
    if (!p) throw new Error("NOT_FOUND");
    if (p.status !== "SUBMITTED") throw new Error("INVALID_STATUS");
    if (p.items.some((i) => !i.checked)) throw new Error("ITEMS_NOT_ALL_CHECKED");

    const gudang =
      (await tx.location.findFirst({ where: { name: { equals: "Gudang", mode: "insensitive" } } })) ??
      (await tx.location.create({ data: { name: "Gudang" } }));

    for (const it of p.items) {
      if (it.kind === "LAMA" && it.itemId) {
        await tx.transaction.create({
          data: { itemId: it.itemId, type: "IN", quantity: it.quantity, note: `BAP ${p.bapNumber}` },
        });
        await tx.item.update({
          where: { id: it.itemId },
          data: { quantity: { increment: it.quantity } },
        });
      } else {
        const categoryName = it.categoryName?.trim() || "Belum dikategorikan";
        const category =
          (await tx.category.findFirst({ where: { name: categoryName } })) ??
          (await tx.category.create({ data: { name: categoryName } }));
        const barcode = it.barcode?.trim() || String(Date.now()).slice(-5);
        const created = await tx.item.create({
          data: {
            name: it.name,
            barcode,
            specification: it.specification ?? null,
            quantity: it.quantity,
            minStock: 1,
            categoryId: category.id,
            locationId: gudang.id,
          },
        });
        await tx.transaction.create({
          data: { itemId: created.id, type: "IN", quantity: it.quantity, note: `BAP ${p.bapNumber}` },
        });
        await tx.procurementItem.update({ where: { id: it.id }, data: { itemId: created.id } });
      }
    }

    const updated = await tx.procurement.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: user.id,
        totalUnits: p.items.reduce((a, i) => a + i.quantity, 0),
        totalItems: p.items.length,
      },
    });
    await tx.procurementLog.create({ data: { procurementId: id, action: "PUBLISHED", actorId: user.id } });
    return updated;
  });

  ["/procurement", `/procurement/${id}`, "/reports", "/dashboard", "/inventory"]
    .forEach((p) => revalidatePath(p));
  return { ok: true, data: { bapNumber: result.bapNumber, qrToken: result.qrToken } };
}
```

### 3.10 `rejectBap(id, reason)` · `reopenToDraft(id)`

- `TEACHER` menolak dengan alasan wajib → `REJECTED` + `rejectNote` + log.
- `ADMIN`/`TECHNICIAN` membuka kembali `REJECTED` → `DRAFT` (nomor & token dipertahankan).

### 3.11 Query (bukan action — `src/lib/queries/procurement.ts`)

```ts
export async function listBaps({ year, month, q, page = 1, perPage = 10 }) { ... }
export async function getBapSummary({ year }) { ... }
export async function getProcurementDetail(id) { ... }   // items + users + logs
export async function getBapByToken(token) { ... }        // hanya status VERIFIED
// Untuk blok BOS di /dashboard (bukan dasbor terpisah):
export async function getDashboardBosSummary({ year, month }) { ... }  // BAP terakhir + total unit
export async function getWarehouseSuggestions({ limit = 3 }) { ... }
```

## 4. Format & util

`src/lib/format.ts`:

```ts
export const formatNumberID = (n: number) => new Intl.NumberFormat("id-ID").format(n);
export const formatDateID = (d: Date) =>
  formatInTimeZone(d, "Asia/Jakarta", "dd MMM yyyy", { locale: id });       // "06 Nov 2026"
export const formatLongDateID = (d: Date) =>
  formatInTimeZone(d, "Asia/Jakarta", "EEEE, dd MMMM yyyy", { locale: id }); // "Jumat, 06 November 2026"
export const formatTimeID = (d: Date) => formatInTimeZone(d, "Asia/Jakarta", "HH:mm", { locale: id });
```

## 5. Komponen server vs client

| Halaman | Jenis | Catatan |
| --- | --- | --- |
| `/procurement` | server (fetch data) + client form | form pakai `react-hook-form` + `zodResolver` (sudah ada) |
| `/reports` (tab Arsip BAP) | server | filter lewat `searchParams` (`?tab=bap&year=&month=&q=&page=`), tabel server-rendered |
| `/dashboard` (blok BOS) | server | satu query ringkas, tidak memblok render KPI lain |
| `/procurement/[id]` | server | tombol cetak = client (`react-to-print`) |
| `/procurement/[id]/check` | server + client checklist | toggle optimistis (`useOptimistic`/`useTransition`) |
| `/verify/[token]` | server, **tanpa auth** | `dynamic = "force-dynamic"` |

## 6. Error & pesan

Gunakan pesan bahasa Indonesia yang jelas dan tampilkan lewat toast/sonner:

| Kode | Pesan UI |
| --- | --- |
| `UNAUTHENTICATED` | "Sesi berakhir, silakan masuk kembali." |
| `FORBIDDEN` | "Anda tidak punya akses untuk aksi ini." |
| `INVALID_STATUS` | "Status dokumen sudah berubah. Muat ulang halaman." |
| `ITEMS_NOT_ALL_CHECKED` | "Semua barang harus diperiksa sebelum disahkan." |
| `PERIOD_EXISTS` | "BAP untuk periode ini sudah ada." |
| `NOT_FOUND` | "Dokumen tidak ditemukan." |


---

# 05 · Cetak BAP (A4) & QR verifikasi

---

## 1. Skala desain → cetak

Frame desain **794 × 1123 px** = **A4 210 × 297 mm** (96 dpi) — jadi `1 px ≈ 0,2646 mm ≈ 0,75 pt`.

Desain memakai ukuran px kecil (body 10–11px) hanya agar proporsinya terbaca di kanvas.
**Saat implementasi, pakai `pt`/`mm`**, jangan px — kalau px dipakai apa adanya, hasil cetak
akan ~7pt dan terlalu kecil untuk dokumen resmi.

| Elemen desain | px | Cetak (pt) |
| --- | --- | --- |
| Margin halaman (padding) | 52 / 48 | **16mm** kiri-kanan · **14mm** atas-bawah |
| Nama provinsi | 11 | 8 |
| Nama dinas | 10 | 7,5 |
| Nama sekolah | 17 | **14** |
| Alamat / kontak | 7,5 | 6,5 |
| Garis ganda | 3 + 1 | **1,2pt** + **0,4pt** (jarak 1mm) |
| Judul BAP | 13,5 | **10,5** (bold, ls .06em) |
| Nomor BAP | 10,5 | **8** (mono) |
| Body paragraf | 10–11 | **9,5** (lh 1,6) |
| Header tabel | 8 | **7** (bold, uppercase) |
| Isi tabel – nama | 9 | **8** (bold) |
| Isi tabel – spek | 7,5 | **6,5** |
| Isi tabel – angka/kode | 8,5 | **7,5** (mono) |
| Total row | 8,5 | **7,5** bold |
| Label tanda tangan | 9 | **7,5** |
| Nama (underline) | 9,5 | **8** bold |
| NIP | 8 | **6,5** |
| QR | 86px (74 isi) | **22mm** (isi 19mm) |
| Footer | 7 | **5,5** |

Lebar kolom tabel (dari 178mm area cetak): No **11mm** · Kode **24mm** · Nama **flex** ·
Volume **13mm** (kanan) · Satuan **12mm** · Kondisi **18mm** (kanan).

## 2. Struktur komponen

```
src/components/procurement/
├── BapDocument.tsx        // layout A4 murni (props: data) — dipakai layar & print
├── BapPrintButton.tsx     // "use client" react-to-print
├── QrBox.tsx              // svg QR dari string (server component)
├── ProcurementForm.tsx
├── ProcurementItemsTable.tsx
├── WarehouseQuickPick.tsx
├── ArchiveTable.tsx
├── MonthTabs.tsx
├── FilterSummary.tsx
├── ChecklistItemCard.tsx
├── ChecklistProgressBar.tsx
├── PublishSuccessDialog.tsx
├── ExecutiveKpiCard.tsx
├── MonthlyRealizationChart.tsx
├── PendingBatchList.tsx
└── VerifyDocumentCard.tsx
```

`BapDocument` harus **pure** (hanya props) supaya dipakai dua tempat: preview di
`/procurement/[id]` dan area `react-to-print`.

## 3. Print CSS

Tambahkan ke `src/app/globals.css` (atau `bap-print.css` yang di-import halaman):

```css
@page {
  size: A4;
  margin: 0;
}

@media print {
  html, body {
    background: #fff !important;
    color: #000 !important;
  }
  /* sembunyikan seluruh chrome aplikasi */
  .no-print, header, nav, aside, [data-app-chrome] { display: none !important; }
  .print-root {
    display: block !important;
    width: 210mm;
    min-height: 297mm;
  }
  .sheet {
    width: 210mm;
    min-height: 297mm;
    padding: 14mm 16mm;
    margin: 0;
    background: #fff;
    box-shadow: none;
    border: 0;
    color: #000;
  }
  .sheet table { border-collapse: collapse; width: 100%; }
  .sheet th, .sheet td { border: 0.35mm solid #000; }
  .sheet tr, .sheet td, .sheet th { break-inside: avoid; page-break-inside: avoid; }
  .sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .qr-box svg { width: 19mm; height: 19mm; }
}
```

> Halaman BAP di layar sudah berukuran A4 (794px) — cukup `scale` visual dengan CSS
> `transform: scale()` pada container saat viewport sempit, jangan mengubah layout dalamnya.

## 4. Tombol cetak

```tsx
"use client";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export function BapPrintButton({ label = "Cetak BAP" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: ref, documentTitle: "BAP-BOS" });
  return (
    <>
      <button onClick={print} className="…primary">{label}</button>
      <div ref={ref} className="print-root hidden print:block">
        {/* BapDocument dirender di sini (data sama) */}
      </div>
    </>
  );
}
```

Catatan: `react-to-print` sudah ada di dependencies. Untuk "Unduh PDF" gunakan
`window.print()` (pilih "Save as PDF") — hindari menambah library PDF baru.

## 5. QR

### 5.1 Generate (server, saat submit)

```ts
// src/lib/qr.ts
import QRCode from "qrcode";

export async function bapQrSvg(token: string) {
  const base = process.env.NEXTAUTH_URL ?? "https://inventaris.smkhkti2.sch.id";
  const url = `${base}/verify/${token}`;
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0B1B2E", light: "#FFFFFF" },
  });
}
```

Render di dokumen (ukuran dalam mm agar tajam saat dicetak):

```tsx
<div className="qr-box" style={{ border: "0.35mm solid #0B1B2E", padding: "1.2mm" }}
     dangerouslySetInnerHTML={{ __html: svg }} />
```

- QR **tetap hitam di atas putih** pada kedua tema (jangan ikut `dark:`).
- Ukuran minimum yang bisa dipindai: 18–20 mm. Desain memakai 19 mm isi — aman.
- Jarak QR ke tepi ≥ 5 mm.
- Teks di bawah QR: `QR Verifikasi Sah Sistem HIKA` (5,5pt bold).

### 5.2 Halaman verifikasi

```tsx
// src/app/verify/[token]/page.tsx
export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bap = await getBapByToken(token); // status VERIFIED + qrToken cocok
  if (!bap) return <VerifyNotFound />;
  return (
    <VerifyLayout>
      <VerifyDocumentCard bap={bap} /> {/* sesuai layar 8 */}
    </VerifyLayout>
  );
}
```

Layout publik: tanpa sidebar, tanpa bottom nav, `bg-app`, maksimal lebar 390px di tengah
(desktop: kartu 420–480px dengan latar app-bg). Pastikan `metadata` di-set
(`title: "Verifikasi BAP · SMK HKTI 2"`, `robots: { index: false }`).

### 5.3 Logging kunjungan

```tsx
"use client";
useEffect(() => {
  fetch(`/api/verify/${token}/visit`, { method: "POST" }).catch(() => {});
}, [token]);
```

Route handler `src/app/api/verify/[token]/visit/route.ts` → `prisma.verificationVisit.create`
(ip dari `x-forwarded-for`, user-agent dari header). Rate-limit ringan (mis. 1 log / token / 10 menit)
supaya tabel tidak membengkak.

### 5.4 Keamanan

| Hal | Aturan |
| --- | --- |
| Token | 32 hex acak (`crypto.randomBytes(16)`), **bukan** id/cuid dokumen |
| Akses | hanya `status = VERIFIED` yang bisa diverifikasi |
| Data yang tampil | nomor, sumber dana, tanggal sah, guru pemeriksa, ringkasan barang, total unit — **tanpa** harga/NIP lengkap bila tidak diperlukan (desain menampilkan NIP guru; boleh disamarkan sebagian) |
| Hash/integrity | label "Terenkripsi SHA-256" boleh ditampilkan bila memang ada signature; kalau belum diimplementasikan, ganti teksnya menjadi "Dokumen terverifikasi sistem HIKA" |
| Robots | `noindex` |

## 6. Halaman `/procurement/[id]` (preview + aksi)

- Layout: header halaman (breadcrumb, judul "Berita Acara Penerimaan Barang", nomor, badge status)
  + toolbar `no-print` (Cetak BAP, Unduh PDF, Kembali, Riwayat) + kertas A4 di tengah.
- Kertas: `background: #fff`, `box-shadow` hanya di layar (bukan saat print), radius 2px.
- Bila status `SUBMITTED`: tampilkan watermark tipis "MENUNGGU PENGESAHAN" diagonal (60% putih,
  huruf 40px, rotate −24°) yang **hilang** saat `VERIFIED`.
- Di bawah kertas: kartu "Riwayat" (timeline `ProcurementLog`) dan tombol aksi sesuai role.


---

# 06 · Komponen

Komponen dasar (panel, tombol, badge, field, page header, sidebar, bottom nav) **sudah ada**
dari handoff v1 — lihat `design-handoff/03-components.md` + `design-handoff/tokens.css`.
Dokumen ini hanya komponen **baru** untuk modul pengadaan, beserta API dan resep kelasnya.

Semua resep memakai token: `bg-surface`, `bg-surface-2`, `border-line`, `text-ink`,
`text-ink-soft`, `text-muted-ink`, `bg-brand`, `bg-brand-soft`, `text-brand-deep`,
`bg-mint-soft`, `text-mint`, `bg-amber-soft`, `text-amber`, `bg-rose-soft`, `text-rose`.
Radius: kartu desktop 16 (`rounded-2xl`), mobile 14 (`rounded-[14px]`), kontrol 10, pill 999.

---

## 1. `MonthTabs`

```tsx
<MonthTabs value={String(month ?? "all")} onChange={(m) => router.push(`?month=${m}`)} />
```

- Container: `flex gap-1.5` (`gap-6px`).
- Item: `px-3.5 py-1.5 rounded-full text-[10.5px] font-bold transition-colors`.
- Aktif: `bg-brand text-white`.
- Pasif: `bg-surface border border-line text-ink-soft hover:bg-surface-2`.
- Label: `Semua`, `Jan`…`Des`. Di mobile boleh `overflow-x-auto scrollbar-none`.

## 2. `FilterSummary`

```tsx
<FilterSummary total={11} units={420} search={<SearchInput />} />
```

- `flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4.5 py-3`.
- Stat: `flex items-center gap-2` → chip `size-7 rounded-lg bg-brand-soft grid place-items-center`
  (ikon 14 `text-brand`), label `text-[11px] text-muted-ink`, nilai `text-xs font-extrabold text-ink`.
- Pemisah antar stat: `gap-4.5`.

## 3. `ProcurementItemsTable`

Props: `items`, `editable`, `onEdit`, `onRemove`.

- Wrapper: `panel overflow-hidden` + `<table className="w-full table-fixed">`.
- `<colgroup>`: **22 / 66 / auto / 86 / 46 / 46 / 46** px (desktop).
- `<thead className="bg-surface-2">` → `th px-4.5 py-2.5 text-[10px] font-bold uppercase tracking-[.5px] text-muted-ink`;
  kolom angka & aksi `text-right`.
- `<tbody>` → `tr border-b border-line last:border-0`, `td px-4.5 py-2.5 align-middle`.
- Nama barang: `text-[12.5px] font-bold text-ink` + spek `text-[10.5px] text-muted-ink` (dua baris).
- Angka: `font-mono tabular-nums text-xs font-bold text-right`.
- Aksi: dua icon button 13px (`pencil` muted, `trash-2` rose), `gap-2`.
- Mobile: jangan pakai tabel — render `ItemListCard` (nama + spek + qty + badge jenis).

## 4. `ProcurementMetaCard`

Kartu kiri 400px berisi: Bulan/Tahun, Nomor BAP (auto), Guru Pengawas, Sumber Dana, Catatan.

- Kartu `panel`, header `px-5 py-4 border-b border-line` (judul 15.5/700 + sub 12 muted + badge status).
- Body `p-5 grid gap-3.5`.
- Input read-only nomor: `relative` + ikon `Lock` kiri, teks `font-mono`, chip `AUTO`
  (`text-[9px] font-bold text-brand bg-brand-soft rounded-full px-2 py-0.5`).
- Textarea `min-h-[88px] resize-none`.
- Footer bar: `bg-surface-2 border-t border-line px-5 py-3 flex justify-between text-[10.5px]`.

## 5. `ApprovalSteps`

Props: `steps: { label, state: "done"|"current"|"todo" }[]`.

- Kartu `panel p-4 space-y-3`; tiap baris `flex items-center gap-2.5`.
- Dot `size-5.5 rounded-full grid place-items-center`:
  done `bg-mint-soft text-mint`, current `bg-brand-soft text-brand`, todo `bg-surface-2 text-muted-ink`.
- Label `text-[11.5px]` (done/current `font-semibold text-ink`, todo `text-muted-ink`).
- Status kanan `text-[9.5px] font-bold` warna sesuai state.

## 6. `WarehouseQuickPick`

Props: `items` (nama, spek, stok, satuan), `onAdd(itemId)`.

- Kartu `panel`; header `px-4.5 py-3.5 border-b` (judul 13/700 + sub 10.5 muted + link).
- Baris `flex items-center gap-2.5 px-4.5 py-2.5 border-b last:border-0`:
  chip 30 (`bg-brand-soft`, `Package` 14 brand) · teks (nama 11.5/700, spek 10 muted) ·
  badge stok (neutral 9.5) · tombol plus 26 (`bg-brand-soft rounded-lg`).

## 7. `ArchiveTable`

- Sama seperti `ProcurementItemsTable` tapi `<colgroup>` **150 / 104 / 112 / auto / 78 / 158 / 122**
  dan `table-fixed` wajib agar header & isi rata.
- Sel BAP: `div` dua baris — nomor `font-mono text-[11.5px] font-bold` + state
  `text-[9.5px]` (`text-muted-ink` / `text-amber` untuk draft).
- Tombol aksi: `secondary`/`soft` kecil — `px-3 py-1.5 rounded-lg text-[10.5px] font-bold` + ikon 12.
- Pagination: `size-[26px] rounded-lg text-[10.5px] font-bold font-mono` (aktif `bg-brand text-white`).
- Mobile: `BapArchiveCard` (nomor + badge di baris 1, periode/tanggal/guru di baris 2,
  unit + tombol di baris 3).

## 8. `BapDocument`

Pure component, props:

```ts
type BapDocumentProps = {
  school: SchoolSettings;      // nama, alamat, telepon, npsn, website, logoUrl
  bapNumber: string;
  periodLabel: string;         // "November 2026"
  approvedAt: Date;            // "Jumat, 06 November 2026"
  items: { no, barcode, name, specification, volume, unit, condition }[];
  totalUnits: number;
  storageOfficer: { name: string; nip?: string };
  inspector: { name: string; nip?: string };
  headmaster: { name: string; nip?: string };
  qrSvg: string;               // dari bapQrSvg()
  status: "SUBMITTED" | "VERIFIED";
};
```

Aturan render:

- Root `div.sheet` (210mm × min 297mm, padding 14mm 16mm, `bg-white text-[#0B1B2E]`).
- **Jangan** pakai token tema di dalam `.sheet` — dokumen selalu terang.
- Kop: `flex items-center gap-4` (logo 16.9mm) + teks tengah `flex-1 text-center` + spacer
  selebar logo agar simetris.
- Garis ganda: dua `div` (`h-[1.2pt]` dan `h-[0.4pt]`, `bg-current`, jarak 1mm).
- Tabel: `border-collapse` + border 0.35mm `#0B1B2E`, header `bg-[#FAFCFE]`.
- Blok tanda tangan: `flex justify-between items-start` lalu blok "Mengetahui" di tengah bawah.
- `underline` pada nama = `border-b border-current inline-block pb-0.5` (bukan `text-decoration`)
  agar rapi saat dicetak.

## 9. `QrBox`

```tsx
<QrBox svg={qrSvg} size="19mm" caption="QR Verifikasi Sah Sistem HIKA" />
```

- Kotak `border-[0.35mm] border-[#0B1B2E] p-[1.2mm] bg-white` + `svg` dari `qrcode`.
- Jangan pakai `dangerouslySetInnerHTML` dari input user — hanya dari `bapQrSvg()`.

## 10. `ChecklistItemCard`

```tsx
<ChecklistItemCard item={{...}} onToggle={...} />
```

- Kartu `rounded-[14px] border border-line bg-surface p-3 flex flex-col gap-2`.
- Baris atas `flex items-start gap-2.5`:
  - Checkbox `size-5 rounded-md` — checked: `bg-brand text-white grid place-items-center` dengan
    `Check` 12; unchecked: `border-[1.5px] border-line bg-surface`.
  - Info `flex-1 min-w-0`: badge jenis (`text-[8px]`), nama `text-[11.5px] font-extrabold`,
    spek `text-[9px] text-muted-ink`, warning `flex items-center gap-1 text-[8.5px] font-semibold text-amber`.
  - Kanan: qty `font-mono text-[10px] font-bold`.
- Baris bawah `border-t border-line pt-2 flex items-center justify-between`:
  - kiri: pill `Kondisi Baik` (`bg-mint-soft text-mint text-[8px] font-bold px-2 py-0.5 rounded-full`)
    atau `Belum diperiksa` (`text-[8.5px] text-muted-ink`).
  - kanan: `Dicek 14:24 WIB` (`font-mono text-[8px] text-muted-ink`).
- Aksesibilitas: seluruh kartu bisa diklik (`<label>` atau `role="checkbox"` + `aria-checked`),
  area sentuh ≥ 44px.

## 11. `ChecklistProgressBar`

- `flex flex-col gap-1.5`: baris teks (`text-[9.5px]`, kiri 600 `text-ink-soft`, kanan 700 `text-brand`)
  + track `h-1 rounded-full bg-[#EDF2F8] dark:bg-[#3C4043]` dengan isi `bg-brand`
  (`width: ${pct}%`).
- Tombol sahkan: full width, `rounded-[10px] px-4 py-3 text-xs font-bold`,
  disabled: `bg-surface-2 border border-line text-muted-ink` + ikon `Lock`;
  enabled: `bg-brand text-white` + ikon `Check`/`CheckCircle2`.

## 12. `PublishSuccessDialog`

- Overlay `fixed inset-0 z-50 bg-[#0B1B2E]/60 dark:bg-black/65 grid place-items-center p-6`.
- Dialog `w-[342px] rounded-[18px] bg-surface p-6 flex flex-col gap-3 shadow-[0_18px_44px_rgba(11,27,46,.27)]`.
- Isi: circle 56 `bg-mint-soft` + `Check` 28 `text-mint` (centered) · judul `text-lg font-extrabold
  tracking-[-0.6px] text-center` · sub `text-[10.5px] text-muted-ink text-center leading-relaxed` ·
  `QrBox` 140px · kartu detail `bg-surface-2 border border-line rounded-xl p-3` 2 baris ·
  2 tombol full width.
- Mobile: `items-end` + `rounded-t-[18px]` sheet, `animate-slide-up`; desktop tetap centered.
- Tutup: tombol, klik overlay, `Esc`; fokus awal ke tombol primary (`autoFocus` / ref).
- Setelah "Lihat Surat BAP Resmi" → `router.push('/procurement/{id}')`.

## 13. `DashboardBosStrip` (pengganti dasbor eksekutif)

Blok BOS di dasbor, satu baris penuh, di antara KPI Row dan Body.

```tsx
<DashboardBosStrip bap={bapThisMonth} />
```

- Kartu `panel flex items-center gap-3.5 px-4.5 py-3.5`.
- Chip `size-[38px] rounded-[10px] bg-mint-soft` + `ClipboardList` 18 `text-mint`.
- Teks (flex-1, flex-col gap-[3px]):
  baris 1 — `text-[13px] font-bold` "Pengadaan BOS · November 2026" + `StatusBadge tone="mint"` "Sah & Lengkap";
  baris 2 — nomor BAP `font-mono text-[10.5px] font-semibold text-ink-soft`, meta
  `text-[10.5px] text-muted-ink` "4 jenis · 18 unit", dot `size-[3px] rounded-full bg-line`,
  `UserCheck` 11 + "Budi Santoso" `text-[10.5px] text-ink-soft`.
- Kanan: tombol secondary `Lihat BAP` (`FileText`, `px-3.5 py-2 text-xs`) → `/procurement/[id]`.
- Bila belum ada BAP bulan ini: judul "Belum ada BAP bulan ini", meta "Buat pengajuan baru
  untuk periode November 2026", tombol primary `Buat Pengajuan`.
- Mobile: `p-3 rounded-[14px] gap-2.5`, chip 30 (`rounded-lg`, ikon 14), teks 10/8.5,
  badge `Sah` 8, seluruh kartu bisa di-tap.

## 14. `KpiCard` (dipakai juga untuk "Pengadaan BOS")

KPI ke-4 dasbor memakai `MetricCard` yang sudah ada, dengan isi:
label `Pengadaan BOS`, nilai `18`, satuan `Unit`, caption `Unit masuk · Nov 2026`,
chip `mint-soft` + ikon `shopping-cart` `text-mint`.

## 15. `ArchiveTab` (isi tab Arsip BAP di Laporan)

Gabungan: `MonthTabs` + `FilterSummary` + `ArchiveTable` + pagination (lihat §1–§3 dan §7).
Tidak perlu page/shell baru — render di dalam `/reports` saat `tab=bap`.

## 16. `BapArchiveCard` (mobile)

- `rounded-xl border border-line bg-surface p-3 flex flex-col gap-1.5`:
  chip PDF 24 (`bg-rose-soft`, `FileText` 12 rose) + tombol unduh 22 (`bg-surface-2`, `Download` 11),
  bulan `text-[10px] font-bold`, meta `text-[8px] text-muted-ink`, link `Unduh PDF`
  (`inline-flex items-center gap-1 text-[8px] font-bold text-brand`).

## 17. Reuse dari v1

| Kebutuhan | Pakai |
| --- | --- |
| Shell desktop/mobile | `Sidebar`, `MobileBottomNav`, `PageHeader`, `MobileAppBar` |
| Kartu | `.panel` / `.panel-sm` utility |
| Tombol | `Button` variant `primary` / `secondary` / `soft` / `danger` / `ghost` / `icon` |
| Badge status | `StatusBadge` (`mint` / `amber` / `rose` / `brand` / `neutral`) |
| Field & select | `Field`, `Input`, `Select`, `Textarea` |
| Toast | `sonner` |
| Empty state | `EmptyState` |


---

# 07 · Rencana implementasi & checklist

Urutan kerja yang bisa dieksekusi bertahap, tiap fase harus hijau (`tsc`, `lint`, `build`)
sebelum lanjut.

---

## Aturan umum

- Modul lama **tidak diubah** selain: entri menu "Pengadaan BOS", blok BOS di `/dashboard`,
  tab Arsip BAP di `/reports`, relasi balik di `Item`/`User`, dan pengecualian `/verify` di middleware.
- **Tidak ada role Kepala Sekolah** dan **tidak ada `/executive`** — jangan membuatnya.
- Semua teks UI bahasa Indonesia, format tanggal `id-ID`, mata uang tidak ditampilkan di modul ini.
- Warna & ukuran mengikuti `tokens.css` + spesifikasi di `01-screens.md`.
- Jangan menambah library chart; grafik realisasi dibuat dengan flex (lihat `06-components.md`).
- Nomor dokumen, QR, dan stok **hanya** berubah lewat server action, tidak pernah dari client.

---

## Fase 1 — Fondasi data (½ hari)

1. `prisma/schema.prisma`: tambah `Procurement`, `ProcurementItem`, `ProcurementLog`,
   `VerificationVisit`, `Counter`, relasi balik di `Item` & `User` (lihat `02-data-model.md`).
2. `npx prisma migrate dev --name procurement_bos` + `npx prisma generate`.
3. `src/lib/format.ts` (format angka/tanggal `Asia/Jakarta`), `src/lib/bap-number.ts`,
   `src/lib/guard.ts`, `src/lib/qr.ts`.
4. Seed demo `prisma/seed-procurement.js` (opsional tapi sangat membantu verifikasi visual).
5. Cek: `npx prisma studio` menampilkan tabel baru; aplikasi lama tetap jalan.

## Fase 2 — Navigasi & peran (½ hari)

1. `src/auth.config.ts`: tambah `/procurement` ke daftar protected, biarkan `/verify` publik.
2. `src/components/layout/Sidebar.tsx`: item "Pengadaan BOS" (`clipboard-list`) setelah Inventaris.
3. Mobile: tautan Pengadaan di sheet menu avatar.
4. Cek: menu tampil sesuai role; user lama tidak terganggu.

## Fase 3 — Server action & query (1 hari)

1. `src/actions/procurement.ts` — semua action di `04-server-actions.md`.
2. `src/lib/queries/procurement.ts` — query arsip, ringkasan, detail, verifikasi, eksekutif.
3. Uji dengan `node --experimental-strip-types` atau langsung dari halaman sementara:
   create → addItem → submit → toggleCheck → publish (pastikan stok & item baru terbentuk).
4. Pastikan `publishBap` idempoten-guard: status bukan `SUBMITTED` → error, tidak dobel stok.

## Fase 4 — `BapDocument` + cetak (1 hari)

1. `BapDocument.tsx` (pure, ukuran pt/mm sesuai `05-print-and-qr.md`).
2. `QrBox.tsx` + `bapQrSvg`.
3. `BapPrintButton.tsx` (`react-to-print`) + CSS `@page` / `.sheet` di `globals.css`.
4. Halaman `/procurement/[id]`: header + toolbar `no-print` + kertas + riwayat.
5. Cek cetak: Chrome → Print → A4, margin "None", **Background graphics ON** →
   dokumen pas 1 halaman, garis tabel utuh, QR ≥ 19mm, tidak ada baris terbelah.

## Fase 5 — Halaman pengajuan (1,5 hari)

1. `/procurement/page.tsx` (server) + `ProcurementForm` (client, react-hook-form + zod).
2. `ProcurementMetaCard`, `ApprovalSteps`, `ProcurementItemsTable`, `WarehouseQuickPick`.
3. Aksi: simpan draft (autosave/optimistis), tambah dari gudang (dialog pilih item),
   tambah barang baru (dialog), edit/hapus baris, kirim ke guru pengawas (konfirmasi).
4. Tampilkan nomor BAP preview dari `peekNextBapNumber` selama `DRAFT`.
5. Cek: form kosong, validasi, submit ganda, periode sudah ada.

## Fase 6 — Tab Arsip BAP di Laporan (1 hari)

1. `/reports/page.tsx`: tambah tab ke-5 "Arsip BAP" (`?tab=bap`) di desktop (underline tabs)
   dan mobile (chips); tambahkan juga tab non-aktif itu di keempat tab lain.
2. Komponen `ArchiveTab`: `MonthTabs`, `FilterSummary`, `ArchiveTable`, pagination,
   filter via `searchParams` (`?tab=bap&year=&month=&q=&page=`).
3. Aksi per baris: `Cetak BAP` → `/procurement/[id]` (auto-open print), `Detail` → dokumen draft.
4. Mobile: `BapArchiveCard` list.
5. Jangan membuat route/menu `/procurement/archive`.

## Fase 7 — Pemeriksaan guru (1 hari)

1. `/procurement/[id]/check/page.tsx`: guard role + hanya inspector yang ditunjuk.
2. `ChecklistItemCard` (toggle → `toggleItemChecked` dengan `useOptimistic`),
   `ChecklistProgressBar`, catatan pemeriksa (`saveInspectorNote`, debounce 800ms).
3. Tombol "Sahkan & Terbitkan BAP" disabled sampai semua `checked`, lalu `publishBap`.
4. `PublishSuccessDialog` (QR, detail verifikasi, 2 tombol) → redirect ke dokumen.
5. Cek: refresh di tengah jalan (state tersimpan), double-tap tombol (tidak dobel publish).

## Fase 8 — Blok BOS di Dasbor (½ hari)

1. `/dashboard/page.tsx`: ganti KPI ke-4 menjadi "Pengadaan BOS" (nilai + caption dari DB).
2. Tambah `DashboardBosStrip` di antara KPI Row dan Body (desktop), dan versi ringkas
   setelah KPI 2×2 (mobile). Body dasbor menyusut — pastikan Aktivitas 5 baris / Stok 3 item
   agar tidak overflow.
3. Kosong: "Belum ada BAP · Buat Pengajuan".
4. **Jangan** membuat halaman/route dasbor kedua.

## Fase 9 — Verifikasi publik (½ hari)

1. `/verify/[token]/page.tsx` (tanpa auth, `force-dynamic`, `robots: noindex`).
2. `VerifyDocumentCard`, state tidak ditemukan, logging kunjungan via API route.
3. Uji: token valid (BAP sah), token acak, token BAP yang belum disahkan (harus tidak ditemukan).
4. Cek QR dari hasil cetak (scan dengan HP) mengarah ke halaman yang benar.

## Fase 10 — Polish (½ hari)

1. Tema gelap: cek semua halaman baru dengan toggle — pastikan tidak ada teks gelap di atas gelap.
2. Empty state + skeleton loading (`loading.tsx`) untuk tiap route baru.
3. Aksesibilitas: label input, `aria-checked` pada checklist, fokus ring, `aria-label` ikon.
4. `npx tsc --noEmit` · `npm run lint` · `npm run build`.
5. Regresi modul lama: dashboard, inventaris, barcode, peminjaman, laporan, pengaturan.

---

## Daftar file (perkiraan)

```
prisma/schema.prisma                                  (+ model baru)
prisma/seed-procurement.js                            (baru, opsional)
src/lib/bap-number.ts                                 (baru)
src/lib/qr.ts                                         (baru)
src/lib/format.ts                                     (baru)
src/lib/guard.ts                                      (baru)
src/lib/queries/procurement.ts                        (baru)
src/actions/procurement.ts                            (baru)
src/app/(authenticated)/procurement/page.tsx          (baru)
src/app/(authenticated)/procurement/[id]/page.tsx     (baru)
src/app/(authenticated)/procurement/[id]/check/page.tsx (baru)
src/app/verify/[token]/page.tsx                       (baru, publik)
src/app/api/verify/[token]/visit/route.ts             (baru)
src/components/procurement/*                          (14 komponen, lihat 05 & 06)
src/app/(authenticated)/reports/page.tsx              (edit: tab Arsip BAP)
src/app/(authenticated)/dashboard/page.tsx            (edit: KPI BOS + strip)
src/components/layout/Sidebar.tsx                     (edit: menu Pengadaan)
src/auth.config.ts                                    (edit: proteksi route)
src/app/globals.css                                   (edit: @page + .sheet print)
```

---

## Checklist acceptance

### Fungsional

- [ ] Admin membuat pengajuan periode baru, menambah 2 barang dari gudang + 2 barang baru,
      menyimpan draft, lalu mengirim ke guru pengawas.
- [ ] Nomor BAP muncul (`027/BAP-BOS/XI/2026`) **hanya** setelah dikirim; QR token terbuat.
- [ ] Guru membuka `/procurement/[id]/check`, mencentang item satu per satu (state tersimpan
      saat refresh), mengisi catatan, tombol sahkan baru aktif saat 4/4.
- [ ] Sahkan → stok bertambah di Inventaris, barang BARU muncul sebagai item baru di Gudang,
      `Transaction` tipe `IN` tercatat dengan catatan nomor BAP.
- [ ] BAP muncul di arsip dengan badge *Terverifikasi Sah*, bisa dicetak, dan PDF/NYA
      menampilkan QR yang bisa discan.
- [ ] Scan QR → `/verify/{token}` menampilkan data benar tanpa login; token salah →
      "Dokumen tidak ditemukan"; kunjungan tercatat.
- [ ] Arsip BAP muncul sebagai tab di halaman Laporan (desktop & mobile), filter bulan/tahun jalan.
- [ ] Blok BOS muncul di Dasbor: badge sah, nomor BAP, jumlah unit, tombol "Lihat BAP".
- [ ] Tidak ada menu/halaman/role Kepala Sekolah di aplikasi.
- [ ] Periode ganda ditolak; user tanpa role ditolak di server (bukan hanya UI).

### Visual

- [ ] Desktop 1440×880: sidebar 264, main padding 26/32, KPI/kartu radius 16.
- [ ] Mobile 390×844: app bar ±59, bottom nav 62, action bar di atas nav, bukan menutupi konten.
- [ ] Tabel arsip & pengadaan: header dan isi **rata per kolom** (pakai `table-fixed`/`colgroup`).
- [ ] Light & dark sesuai `reference/png/01…15`; tidak ada teks `#0B1B2E` di latar gelap.
- [ ] Dokumen A4 tetap putih di kedua tema, cetak 1 halaman A4.
- [ ] Badge status konsisten: mint = sah, amber = menunggu, neutral = draft, rose = tolak.

### Teknis

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` hijau.
- [ ] Tidak ada `any` baru di action publik; validasi zod di semua input.
- [ ] `publishBap` atomik (uji dengan dua tab bersamaan → satu sukses, satu `INVALID_STATUS`).
- [ ] `.env` baru: `NEXTAUTH_URL` dipakai untuk isi QR (dokumentasikan di README deploy).
- [ ] `middleware` tidak memblokir `/verify/**`.

---

## Skenario uji manual (ringkas)

| # | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | Buat BAP periode yang sudah ada | toast "BAP untuk periode ini sudah ada", tidak ada data ganda |
| 2 | Kirim draft tanpa barang | tombol disabled + pesan "Tambahkan minimal satu barang" |
| 3 | Guru lain membuka `/check` BAP bukan tugasnya | 403 / redirect arsip |
| 4 | Publish dua kali (double click) | publish kedua gagal, stok tidak dobel |
| 5 | Cetak BAP status SUBMITTED | watermark "MENUNGGU PENGESAHAN" muncul, QR belum aktif |
| 6 | Scan QR BAP SUBMITTED | halaman "Dokumen tidak ditemukan" |
| 7 | Buka `/verify` di mode gelap | halaman publik tetap terbaca (token tema) |
| 8 | Hapus item inventaris yang dipakai BAP lama | dokumen lama tetap utuh (snapshot nama/spesifikasi) |
| 9 | Buka `/reports?tab=bap` (Arsip BAP) | tab aktif, filter & tabel berjalan, tidak ada route `/procurement/archive` |
| 10 | Refresh di tengah checklist | centang & catatan tetap tersimpan |

