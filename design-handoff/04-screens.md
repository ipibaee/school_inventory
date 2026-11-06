# 04 · Screens (route → layar desain)

Setiap bagian memakai pola yang sama: **tujuan → struktur desktop → struktur mobile → konten → state**.
Teks di dalam tanda kutip adalah copy persis dari desain (dipakai apa adanya, boleh diganti data dinamis).

Semua route berada di `src/app/...` dan sudah ada. Redesign **tidak menambah route baru**.

---

## 1. `/login`

**File:** `src/app/login/page.tsx`, `src/components/auth/LoginForm.tsx`
**Layar:** `Login — Redesign`, `Login — Dark`, `Mobile Login — Redesign`, `Mobile Login — Dark`

### Desktop (1440×880) — split 660 / 780

**Panel kiri (660px, `bg-navy`, padding 52px)** — dekoratif/branding:

- Glow: satu elips radial `brand` (opacity 40%) di area bawah, `pointer-events-none`, jangan pakai blob animasi.
- Brand: mark 40×40 radius 12 `bg-brand` + `graduation-cap` 21px putih; teks "SMK HKTI 2" 15/800 putih,
  "HIKA Inventaris" 11 `#8296B4`. Gap 12px.
- Spacer, lalu blok copy (gap 18px):
  - Eyebrow `10.5px` caps ls 1.4 `#7FA6FF`: "SISTEM MANAJEMEN INVENTARIS & LABORATORIUM"
  - Headline `42px/800` ls −1.4 lh 1.12 putih: "Satu sumber data untuk seluruh perangkat sekolah."
  - Sub `14px` lh 1.65 `#A6B7D0`, lebar maks 460px: "Catat barang masuk, keluar, dan peminjaman
    laboratorium. Stok selalu akurat tanpa rekap manual."
  - 3 stat chip (gap 12): kartu `bg-white/6` border `white/10` radius 12 padding 13/16,
    angka 20/800 putih + label 10.5 `#8296B4` →
    "40 / Jenis barang", "9 / Ruang & lab", "128 / Transaksi"
- Spacer, footer `10.5px` `#6C82A3`: "© 2026 SMK HKTI 2 · Purwareja Klampok"

**Panel kanan (780px, `bg-surface`, padding 52/48, konten di tengah, lebar form 346px)**

- Eyebrow `10.5px` caps ls 1.4 `brand`: "MASUK KE AKUN"
- H2 `28px/800` ls −0.8: "Selamat datang kembali"
- Sub `13px` lh 1.55 `muted`: "Gunakan email sekolah untuk mengakses dashboard inventaris."
- Field EMAIL (label 11.5/700 caps, ikon `mail`): placeholder "admin@smkhkti2.sch.id"
- Field PASSWORD (ikon `lock`, toggle `eye` di kanan): placeholder "••••••••••"
- Baris: checkbox `check` + "Ingat perangkat ini" (11.5 `ink-soft`) — kanan: "Lupa password?" (11.5/700 `brand`)
- Tombol `Masuk` full-width (primary, ikon `arrow-right`)
- Divider "atau"
- Baris bantuan: ikon `life-buoy` + "Butuh bantuan? Hubungi admin TU"

### Mobile (390×844) — satu kolom

- Brand di atas (mark 30–32 + teks), spacer kecil, lalu: eyebrow, judul 22–24/800, sub 11.5–12.
- Field sama tapi padding 9–10/12, radius 10, label 9px caps.
- Teks bantuan dan footer sama; footer `9.5px` `muted` di paling bawah.
- Tombol Masuk full width, tinggi 44px.

### State

default · loading (tombol `disabled` + spinner) · invalid (border `rose` + pesan 10.5 `rose` di bawah field)
· error global (kotak `rose-soft` radius 10 padding 12, teks 11.5 `rose`).

### Catatan implementasi

- Hapus `MouseParallaxBackground` dan glass card dari halaman login.
- Panel kiri `hidden lg:flex` agar mobile hanya menampilkan form.
- Jangan ubah pemanggilan `signIn` / server action; hanya markup & kelas.

---

## 2. `/dashboard`

**File:** `src/app/(authenticated)/dashboard/page.tsx`
**Layar:** `Dasbor — Redesign/Dark`, `Mobile Dasbor — Redesign/Dark`

> **Revisi (v2):** dasbor tetap **satu-satunya** dasbor. KPI ke-4 diganti menjadi
> "Pengadaan BOS" (18 Unit) dan ditambahkan **BOS Strip** penuh lebar di antara KPI Row dan Body
> (nomor BAP + badge "Sah & Lengkap" + jumlah jenis/unit + pemeriksa + tombol "Lihat BAP").
> Detail: `v2-pengadaan-bos/01-screens.md` bagian Dasbor. Aktivitas jadi 5 baris,
> Stok Hampir Habis 3 item agar tetap muat.

### Desktop

1. **Topbar**: judul "Dasbor Inventaris", sub "Status stok barang dan ringkasan aktivitas sekolah terkini."
   Actions: search (236px), icon `sun`/`moon` (ThemeToggle), icon `bell`, tombol "Tambah Barang" (primary, `plus`).
2. **KPI row** (4 kartu, gap 14) — dari `getDashboardStats()`:
   | Label | Caption | Ikon | Warna |
   | --- | --- | --- | --- |
   | Total Barang | "Di semua laboratorium & ruang" | `boxes` | brand |
   | Stok Rendah | "Barang perlu segera diisi" | `triangle-alert` | rose |
   | Peminjaman Aktif | "Masih dipinjam pengguna" | `clock` | amber |
   | Transaksi Hari Ini | "Mutasi masuk & keluar" | `arrow-left-right` | mint |
3. **Body** (2 kolom, gap 16):
   - **Aktivitas Terbaru** (`flex-1`) — header: judul 15.5/700, sub "Timeline pencatatan barang dan
     mutasi logistik.", label kanan "LIVE" (mono 10 ls 1 `mint`). Isi: 5–6 `ActivityRow`
     (contoh: "Barang Dipinjam / Keluar" — `Mouse Kabel · 32 unit` — "2 Nov · 02.05").
     Footer bar: "Menampilkan 6 dari 128 aktivitas" + "Lihat semua →".
   - **Stok Hampir Habis** (322px) — header ikon `triangle-alert` rose + judul + sub
     "Segera lakukan pengadaan barang berikut." Isi: 4 `StockItem` (nama, lokasi, qty mono 14/700,
     track 5px). Footer link "Lihat semua →".

### Mobile

- App bar: mark + "Dasbor" / "4 Nov 2026 · Admin" + icon tema, bell, avatar.
- KPI 2×2 (gap 10).
- Kartu "Aktivitas Terbaru" (baris: chip ikon, teks, jam `02.05`, meta "keluar · barang"),
  header kanan "Lihat semua".
- Kartu "Stok Hampir Habis" dengan jumlah "18 barang" di header, baris: nama + "0/5".
- Bottom nav, tab Dasbor aktif.

### Catatan

- Grafik tidak ada di desain — **jangan** menambah chart baru; jika ada chart lama, ganti jadi
  bar sederhana atau hapus (desain hanya memakai KPI + list + progress).
- Data yang tidak tersedia di query: tampilkan `0` / "—", jangan mengarang angka.

---

## 3. `/inventory`

**File:** `src/app/(authenticated)/inventory/page.tsx`
**Layar:** `Inventaris — Redesign/Dark`, `Mobile Inventaris — Redesign/Dark`

### Desktop

1. **Topbar**: judul "Inventaris", sub "40 jenis barang tersebar di 9 ruang dan laboratorium."
   Actions: tombol sekunder "Scan Barcode" (ikon `camera`) + primary "Tambah Barang".
2. **Filter lokasi** — baris kartu kecil per lokasi (gap 10, bisa scroll horizontal), tiap kartu:
   nama lokasi + jumlah unit. Item pertama "Semua Barang · 40", lalu Gudang 128, R. Maintenance 14,
   Lab. Software1 36, Lab. Software2 36, Lab. Simdig1 18, Lab. Grafis 22, Lab. Lan 9, Lab. Hardware 12.
   Kartu aktif: latar `brand-soft`, border `brand` 1px, teks `brand-deep`.
3. **Kartu daftar barang** (`panel`, `flex-1`):
   - Header: judul "Daftar Barang" + badge "40 item", kanan: search 240 + icon `sliders-horizontal`
     + icon `download` (export).
   - Table (§7 di `03-components.md`) + pagination di footer ("Menampilkan 10 dari 40 barang", 1·2·3·4).
4. Aksi baris: `pencil` (buka `ItemForm` dialog), `KeyRound`/move bila ada, badge status.

### Mobile

- App bar: "Inventaris" / "40 barang · 9 lokasi", kanan jumlah "40" + ikon `scan-line` + `camera`.
- Baris search (ikon `search`, placeholder "Cari barang atau barcode…") + icon button filter.
- Chips lokasi: Semua · Gudang · Lab. Software 1 · Lab. Grafis (scroll horizontal).
- List kartu (§9) + FAB `plus`.
- Tap kartu → detail/aksi (Edit, Pindah, Riwayat).

### State

loading skeleton kartu · kosong ("Belum ada barang di lokasi ini") · error retry · filter aktif.

---

## 4. `/inventory/barcode`

**File:** `src/app/(authenticated)/inventory/barcode/page.tsx`, `BarcodeGenerator.tsx`
**Layar:** `Cetak Barcode — Redesign/Dark`, `Mobile Barcode — Redesign/Dark`

### Desktop

1. **Topbar**: judul "Cetak Barcode", sub "Kelola dan cetak label barcode untuk inventaris sekolah."
   Actions: secondary "Export PDF" (`download`) + primary "Cetak Label" (`printer`).
2. **Body** 2 kolom (gap 16):
   - **Kiri (326px) — Pengaturan Printer** (`panel`): header "Pengaturan Printer" + sub
     "Satuan dalam milimeter (mm)". Field 2 kolom (gap 10): Lebar Label 33 mm · Tinggi Label 15 mm ·
     Mode 2 Kolom · Jarak (Gap) 2 mm · Skala Barcode 1 x · Tahun 2026 · Bulan 11 · Orientasi Portrait.
     Footer: "Kertas A4 · 2 × 12 label" + "Atur ulang".
   - **Kanan — Pratinjau Label** (`panel`): header "Pratinjau Label" + jumlah label. Grid 2 kolom
     (default) label barcode pada "kertas" `#EEF3F9` (dark `#303134`) dengan padding 12.
     Label: lihat §12 `03-components.md`.
3. Aksi tambahan: pilih barang yang akan dicetak (checkbox di label / di list), "Buat Barang Baru".

### Mobile

- App bar + tombol back, judul "Cetak Barcode" / "Label 33 × 15 mm", kanan jumlah label.
- Kartu Pengaturan (2 kolom field, gap 8) → pratinjau 2 label (scroll) → footer sticky
  "Cetak Label" full width.

### Catatan penting

- Ukuran **mm** harus tetap dipakai untuk print (CSS `mm`), jangan dikonversi ke px saat cetak.
- `@media print`: sembunyikan sidebar, app bar, bottom nav, tombol; hanya area label yang tercetak.
- Jangan mengubah logika `react-barcode` / `react-to-print`, hanya bungkus visual.

---

## 5. `/borrow`

**File:** `src/app/(authenticated)/borrow/page.tsx`, `BorrowForm.tsx`, `ReturnForm.tsx`, `ActiveLoans.tsx`
**Layar:** `Peminjaman — Redesign/Dark`, `Mobile Peminjaman — Redesign/Dark`

### Desktop

1. **Topbar**: judul "Peminjaman & Pengembalian", sub "Catat peminjaman alat laboratorium dan
   pantau pengembaliannya." Kanan: segmented tab "Pinjam Barang" / "Kembalikan Barang"
   (container `surface` border `line` radius 11 padding 4; tab aktif `bg-brand` teks putih radius 8).
2. **Body** 2 kolom:
   - **Form Card** (`flex-1`): header "Formulir Peminjaman" + "LANGKAH 1 DARI 2".
     Body (gap 14): row NAMA PEMINJAM (`user`) + TANGGAL KEMBALI (`calendar`, date picker),
     label TAMBAH BARANG + scan input (`scan-barcode`) + tombol "Tambah".
     Divider, lalu **Keranjang**: header `shopping-cart` + "Keranjang" + badge "2 barang" + "Kosongkan".
     Baris keranjang: chip `package`, nama + kode · lokasi, kotak qty (−/+), tombol hapus (`trash`/`x`).
     Footer: total unit + tombol primary "Simpan Peminjaman".
   - **ActiveLoans** (`panel` sisi kanan, ±340px): daftar peminjaman aktif — nama peminjam,
     barang + qty, tanggal kembali, badge status (`Dipinjam` amber / `Terlambat` rose), aksi "Kembalikan".
3. **Tab Kembalikan**: `ReturnForm` dengan gaya sama — scan/cari peminjam, daftar barang dipinjam,
   qty yang dikembalikan, tombol "Konfirmasi Pengembalian".

### Mobile

- App bar + tab segmen 2 pilihan (full width, gap 4, padding 8).
- Kartu form (padding 13) → baris scan + tombol kamera `brand` 38×38 → kartu keranjang.
- Footer sticky dengan tombol "Simpan Peminjaman".

### State

Keranjang kosong (empty state), qty melebihi stok (input `rose` + pesan), sukses (toast + reset form),
loading simpan.

---

## 6. `/reports`

**File:** `src/app/(authenticated)/reports/page.tsx` + `src/components/reports/*`
**Layar:** `Laporan — Redesign/Dark`, `Mobile Laporan — Redesign/Dark`

> **Revisi (v2):** format **cetak laporan diganti** dengan template A4 resmi (KOP + judul +
> ringkasan + tabel bergaris + 2 tanda tangan: Admin TU & Guru Pengawas, tanpa Kepala Sekolah)
> — lihat `v2-pengadaan-bos/01-screens.md` §9.
> Ada juga **tab ke-5 "Arsip BAP"** (setelah Barang Masuk) di desktop & mobile.
> Isinya daftar Berita Acara Penerimaan Barang per bulan + filter tahun/bulan + cetak.
> Tab ini menggantikan rencana halaman arsip terpisah. Detail: `v2-pengadaan-bos/01-screens.md`.

### Desktop

1. **Topbar**: judul "Laporan", sub "Rekap stok, peminjaman, dan mutasi gudang siap cetak."
   Kanan: secondary "Export Excel" (`file-down`) + primary "Cetak Laporan" (`printer`).
2. **Tabs underline** (gap 22, border-bottom `line`): "Laporan Stok" (aktif, `brand` + underline 2px),
   "Riwayat Peminjam", "Riwayat Gudang", "Barang Masuk".
3. **Filter bar**: 3 select berlabel caps (`LOKASI` `map-pin` "Semua Lokasi", `KATEGORI` `tag`
   "Semua Kategori", `PERIODE` `calendar-range` "November 2026") + search 240 di kanan.
4. **Report Card** (`panel`): head berisi judul laporan + meta "per 4 November 2026 · 09.41" dan
   3 mini stat (Jenis 40 · Unit 312 · Rendah 18, nilai rendah `rose`).
   Tabel: NAMA BARANG · BARCODE · LOKASI · KATEGORI · JUMLAH. Baris terakhir ringkasan
   "Total keseluruhan · 40 jenis barang" dengan angka 312 (bg `surface-2`, bold).
   Footer cetak: "Sumber data: HIKA Inventaris · dicetak oleh Admin Sekolah" + "Halaman 1 dari 5".

### Mobile

- App bar "Laporan" / "Rekap siap cetak" + ikon print.
- Chips laporan (scroll horizontal, aktif `bg-brand`).
- 2 select filter sejajar (gap 8, padding 8/10, teks 9.5).
- Kartu tabel ringkas (judul + jumlah) → list baris 2 baris teks.

### Catatan

- Tab lain (Peminjam/Gudang/Masuk) memakai pola kartu + tabel yang sama; kolom menyesuaikan data.
- `ReportHeader` dipakai untuk kop cetak: nama sekolah + judul + periode + logo. Jangan ubah struktur
  cetak (A4, margin, footer halaman).

---

## 7. `/settings`

**File:** `src/app/(authenticated)/settings/page.tsx` + `src/components/settings/*`
**Layar:** `Pengaturan — Redesign/Dark`, `Mobile Pengaturan — Redesign/Dark`

### Desktop

1. **Topbar**: judul "Pengaturan", sub "Kelola informasi sekolah dan tampilan aplikasi."
2. **2 kolom**:
   - **Kiri (`flex-1`) — Kartu Identitas Sekolah**: header "Identitas Sekolah" + sub
     "Tampil pada kop laporan dan label barcode.", ikon `building-2`.
     Field: NAMA SEKOLAH / INSTANSI · NOMOR TELEPON (row 1), ALAMAT LENGKAP (full),
     EMAIL · WEBSITE (row 2), KEPALA SEKOLAH · TAHUN AKADEMIK (row 3).
     Footer bar: catatan "Perubahan langsung tampil di kop laporan" + "Reset".
   - **Kanan (332px)**:
     - **Logo Sekolah** — dropzone `surface-2` border putus `#BFCEE0`, preview 56×56 radius 14
       `bg-brand`, hint "Klik atau tarik gambar ke sini", "PNG atau JPG · maks 500 KB".
     - **Tema** — 3 opsi radio: Terang (`sun`, aktif `brand-soft` + border `#2B4EFF55`),
       Gelap (`moon`), Ikuti sistem (`monitor`). `next-themes`.
     - **Kartu sesi** (`bg-navy`): "Sesi & Keamanan" + sub "Keluar dari semua perangkat aktif.",
       tombol "Keluar dari semua perangkat" (primary, `log-out`).
     - Manajemen pengguna (bila role admin): tabel user dengan pola tabel yang sama.

### Mobile

- App bar + back, judul "Pengaturan" / "Identitas & tampilan".
- Kartu Identitas (field satu kolom, label 8.5/700 caps), kartu Logo (preview 44 + "Ganti"),
  kartu Tema (3 opsi radio 13px), lalu footer sticky `surface` border-top dengan
  tombol "Simpan Perubahan" full width (`check`).

### State

dirty (tombol simpan aktif) · saving (loading) · validasi field wajib · sukses toast.

---

## 8. Scan kamera (dialog / halaman overlay)

**File:** `src/components/inventory/ScanDialog.tsx`, `src/components/scanning/BarcodeScanner.tsx`,
`src/hooks/use-scan-listener.ts`
**Layar:** `Scan Kamera — Redesign/Dark` (overlay di atas Inventaris), `Mobile Scan Kamera`

### Desktop

- Overlay penuh `bg-[#0B1B2E]/60` di atas halaman Inventaris (sidebar & topbar tetap terlihat redup).
- Dialog 512px, radius 18, padding 22 (§13 `03-components.md`).
- Viewfinder 286px tinggi, gradient gelap, sudut `#8AB4F8`, garis scan animasi, kartu hasil deteksi.
- Caption: "Barcode terdeteksi: Monitor 24" · 77564 — pastikan barang sesuai sebelum menyimpan."

### Mobile

- Layar penuh gelap (`#0B0F16`), kamera feed + gradient overlay.
- Top bar: close bulat `white/12`, judul "Scan Barcode" / "Arahkan ke label barang", tombol flash &
  galeri 34×34 bulat.
- Tengah: pill "Auto-detect aktif" (dot `mint`), viewfinder 254×152 dengan sudut, kartu kode.
- Bawah: hasil terakhir + tombol "Gunakan Kode" (primary full width) dan "Scan Lagi".

### Catatan

- Tetap pakai `html5-qrcode`; jangan ganti library.
- Kamera hanya mulai saat dialog dibuka; matikan saat ditutup (baterai).
- Listener keyboard (USB scanner) tetap aktif di halaman inventaris — beri feedback visual saat
  kode masuk (flash border `brand` pada field).

---

## 9. Halaman dokumentasi desain (tidak diimplementasikan)

- `Sistem Desain` — palet warna, tipografi, radius; hanya referensi.
- `Komponen` — contoh komponen; hanya referensi.

Keduanya **tidak** menjadi route di aplikasi.
