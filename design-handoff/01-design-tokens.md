# 01 · Design Tokens

Semua nilai di bawah berasal dari file desain `iventaris.pen` (tema `mode: light | dark`).
Implementasinya ada di **`tokens.css`** → tempel menggantikan blok `:root`, `.dark`, dan
`@theme inline` di `src/app/globals.css`.

---

## 1. Warna

### 1.1 Netral & permukaan

| Token | Light | Dark | Dipakai untuk |
| --- | --- | --- | --- |
| `app-bg` | `#F4F7FB` | `#202124` | Background halaman / area main |
| `surface` | `#FFFFFF` | `#292A2D` | Kartu, sidebar mobile, input, tabel |
| `surface-2` | `#FAFCFE` | `#303134` | Header tabel, footer kartu, dropzone |
| `line` | `#E3EAF3` | `#3C4043` | Semua border 1px, garis tabel |
| `ink` | `#0B1B2E` | `#E8EAED` | Teks utama, angka |
| `ink-soft` | `#3B4A5F` | `#BDC1C6` | Teks sekunder, label form, kode |
| `muted` | `#74849A` | `#9AA0A6` | Teks tersier, caption, placeholder, ikon pasif |

### 1.2 Brand

| Token | Light | Dark | Dipakai untuk |
| --- | --- | --- | --- |
| `brand` | `#2B4EFF` | `#1A73E8` | Tombol utama, item aktif, link, angka penting |
| `brand-deep` | `#1633C7` | `#8AB4F8` | Teks di atas `brand-soft` |
| `brand-soft` | `#EBEFFF` | `#2D3037` | Latar chip ikon, badge netral, hover |
| `cyan` | `#0E9BB5` | `#78D9EC` | Aksen data/grafik sekunder |

### 1.3 Navy (sidebar desktop + panel gelap)

| Token | Light | Dark | Dipakai untuk |
| --- | --- | --- | --- |
| `navy` | `#0A1730` | `#1B1C1F` | Latar sidebar desktop, brand panel login, kartu sesi |
| `navy-2` | `#122444` | `#2A2B2E` | Kartu user di sidebar, panel dalam navy |

Warna lokal khusus sidebar (bukan token global, definisikan di `globals.css` seperti di `tokens.css`):

| Nama | Light | Dark | Dipakai |
| --- | --- | --- | --- |
| `nav-active` | `#1B3364` | `#34373D` | Latar item nav aktif |
| `nav-idle` | `#93A7C4` | `#9AA0A6` | Ikon + label nav non-aktif |
| `nav-label` | `#5C7295` | `#6B7076` | Label grup menu ("MENU UTAMA") |
| `nav-brand-product` | `#8296B4` | `#9AA0A6` | Sub-teks brand & email user di sidebar |

### 1.4 Status (semantik)

Selalu pakai pasangan **warna + latar lembut**. Jangan pakai warna status untuk dekorasi.

| Status | Warna | Latar | Contoh label |
| --- | --- | --- | --- |
| Aman / masuk / tersedia | `mint` `#0EA47A` | `mint-soft` `#E4F7F0` | "Tersedia", "masuk" |
| Perhatian / menipis / dipinjam | `amber` `#C77605` | `amber-soft` `#FDF2DE` | "Menipis", "Dipinjam" |
| Bahaya / habis / keluar | `rose` `#D93A47` | `rose-soft` `#FDEBEC` | "Stok Rendah", "Habis", "keluar" |
| Info / pindah / netral | `brand` `#2B4EFF` | `brand-soft` `#EBEFFF` | "pindah", jumlah item |

Dark mode: `mint #81C995`, `amber #FDD663`, `rose #F28B82` dengan latar `#2C3630`, `#38321F`, `#3A2B2A`.

### 1.5 Aturan warna

- Maksimal **satu** warna aksen kuat (`brand`) per layar untuk elemen utama; sisanya netral.
- Border selalu `line` 1px — jangan pakai shadow untuk memisahkan kartu.
- Shadow hanya untuk **dialog/overlay**: `0 18px 48px -12px rgb(11 27 46 / .28)`.
- Jangan hardcode hex di komponen; pakai utility token (`bg-surface`, `text-ink`, `border-line`, `bg-brand`, …).
- Ikon di atas `brand` selalu `#FFFFFF`.
- Overlay modal: `rgb(11 27 46 / 0.60)` (light) — sama di dark.

---

## 2. Tipografi

**Font:** `Plus Jakarta Sans` (200–800), dimuat via `next/font/google` di `src/app/layout.tsx`
sebagai `--font-plus-jakarta`. Angka kode memakai font yang sama dengan `tabular-nums`.

### 2.1 Skala desktop (acuan layar 1440)

| Peran | Size | Weight | Letter-spacing | Line-height | Warna |
| --- | --- | --- | --- | --- | --- |
| Hero login | 42 | 800 | −1.4px | 1.12 | white |
| Judul halaman | 27 | 800 | −0.8px | default | `ink` |
| Subjudul halaman | 13.5 | 400 | 0 | default | `muted` |
| Judul section dokumen | 32 | 800 | −0.9px | default | `ink` |
| Judul kartu | 15.5 | 700 | 0 | default | `ink` |
| Sub kartu | 12 | 400 | 0 | default | `muted` |
| Body / teks tabel utama | 13.5 | 400 | 0 | 1.55 | `ink` |
| Nama barang (tabel) | 12.5 | 700 | 0 | default | `ink` |
| Spesifikasi barang (tabel) | 10.5 | 400 | 0 | default | `muted` |
| Kode/barcode | 10.5 | 400 | 0.2px | default | `ink-soft` |
| Label metrik | 13 | 600 | 0 | default | `ink-soft` |
| Nilai metrik | 34 | 800 | −1.2px | default | `ink` |
| Caption metrik | 12 | 400 | 0 | 1.4 | `muted` |
| Nav item | 14 | 600 | 0 | default | `nav-idle` / white |
| Label grup nav | 9.5 | 400 | 1.2px (caps) | default | `nav-label` |
| Nama user sidebar | 12.5 | 700 | 0 | default | white |
| Email user sidebar | 10 | 400 | 0 | default | `nav-brand-product` |
| Header tabel (th) | 10 | 700 | 0.5px (caps) | default | `muted` |
| Label tombol | 13.5 | 700 | 0 | default | white / `ink-soft` / `rose` |
| Label badge | 11.5 | 700 | 0 | default | warna status |
| Label form | 11.5 | 700 | 0 | default | `ink-soft` |
| Placeholder / isi input | 13 | 400 | 0 | default | `muted` / `ink` |
| Eyebrow | 10.5 | 400 | 1.4px (caps) | default | `brand` / `#7FA6FF` |
| Footer kecil | 10.5 | 400 | 0 | default | `muted` |

### 2.2 Skala mobile (acuan 390)

| Peran | Size | Weight | Catatan |
| --- | --- | --- | --- |
| Judul app bar | 16 | 800 | ls −0.4px |
| Sub app bar | 9.5 | 400 | `muted` |
| Label KPI | 9.5 | 600 | `muted` |
| Nilai KPI | 23 | 800 | ls −0.8px |
| Caption KPI | 9 | 400 | lh 1.35 |
| Judul kartu | 12.5–13.5 | 700 | |
| Item list | 11.5 | 700 | |
| Meta list | 9.5 | 400 | `muted` |
| Label nav bawah | 9 | 500 / 700 (aktif) | |
| Chip / tab | 10.5–11 | 600–700 | |
| Badge status | 8.5–10 | 700 | dot 5px |
| Label form | 8.5–9 | 600 | caps |

### 2.3 Aturan teks

- Judul & angka pakai `font-extrabold` (800) + tracking negatif; teks lain normal.
- Semua header tabel, label form, dan eyebrow ditulis **UPPERCASE** dengan letter-spacing.
- Jangan memakai lebih dari 3 ukuran font dalam satu kartu.
- Angka (stok, total, barcode) pakai `tabular-nums` (`code-ink`).

---

## 3. Radius

| Nilai | Pemakaian |
| --- | --- |
| 6px | label barcode, tag mikro |
| 8px | icon button kecil, tab mobile |
| 9px | input mobile, chip ikon kecil |
| 10px | field, tombol, item nav, badge kotak |
| 12px | kartu user sidebar, dropzone |
| 14px | kartu mobile, viewfinder scan |
| 16px | kartu & panel desktop |
| 18–20px | dialog |
| 999px | badge status, chip filter, avatar, radio |

## 4. Spacing

Kelipatan 2px. Yang dipakai di desain: `2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 32`.

| Konteks | Desktop | Mobile |
| --- | --- | --- |
| Padding halaman (main) | 26px vertikal / 32px horizontal | 0 top / 16px horizontal / 12px bottom |
| Gap antar section | 16–22px | 10–12px |
| Padding kartu | 22px | 13–14px |
| Padding kartu kompak | 18px | 12px |
| Padding baris tabel | 11px vertikal / 20px horizontal | 9px / 12px |
| Padding field | 9–11px vertikal / 11–14px horizontal | 9px / 10px |
| Gap ikon–label | 8–12px | 6–8px |
| Tinggi kontrol | 36–38px (icon btn), 40–42px (field/tombol) | 32–38px |

## 5. Border & shadow

- Border: selalu `1px solid var(--line)`. Pemisah internal boleh `border-b`/`border-t` saja.
- Tanpa inner shadow, tanpa backdrop-blur, tanpa gradient dekoratif.
- Shadow hanya: kartu `--shadow-panel` (opsional, sangat halus), dialog `--shadow-dialog`.
- Satu-satunya gradient yang dipakai: viewfinder kamera (`#101B2E → #050912`).

## 6. Ikon

Library: **lucide-react** (sudah ada di dependencies).

| Ukuran | Konteks |
| --- | --- |
| 11–13px | ikon inline di meta, chevron, aksi tabel |
| 14–16px | ikon di input, tombol, icon button, tab mobile |
| 18–20px | nav sidebar, brand mark |
| 19px | bottom nav mobile |
| 26px | logo preview besar |

Peta ikon per menu (konsisten di sidebar, bottom nav, dan judul):

| Menu | Ikon |
| --- | --- |
| Dasbor | `layout-dashboard` |
| Inventaris | `boxes` |
| Cetak Barcode | `barcode` |
| Peminjaman | `shopping-cart` |
| Laporan | `chart-column` |
| Pengaturan | `settings` |
| Login/logout | `log-out` |
| Brand | `graduation-cap` |
| Scan kamera | `camera`, `scan-line`, `scan-barcode` |
| Stok rendah | `triangle-alert` |
| Barang masuk | `package-plus` |
| Pindah barang | `arrow-right-left` / `arrow-left-right` |
| Tema | `sun`, `moon`, `monitor` |
| Aksi tabel | `pencil`, `download`, `sliders-horizontal`, `printer` |

## 7. Dark mode

- Struktur layer **identik**; hanya nilai token yang berubah. Jangan buat markup terpisah.
- `next-themes` dengan `attribute="class"` sudah terpasang → cukup `dark:` + CSS variable.
- Di dark mode: `navy` menjadi `#1B1C1F` (sidebar tidak lagi biru tua), `brand` menjadi `#1A73E8`,
  latar kartu `#292A2D`, border `#3C4043`.
- Jangan memakai `opacity` untuk meredupkan teks — pakai token `muted`.
- Cetak (print) selalu memaksa hitam-putih (lihat `@media print` di `tokens.css`).
