# HIKA Inventaris — Handoff Lengkap (all-in-one)

> File gabungan dari: ANTIGRAVITY-PROMPT.md, 01-design-tokens.md, 02-layout-shells.md, 03-components.md, 04-screens.md, 05-implementation-plan.md.
> Referensi gambar: folder `reference/png/`.


---

# Prompt untuk Antigravity — Redesign UI HIKA Inventaris

> Copy seluruh isi file ini sebagai pesan pertama di Antigravity, di dalam repo
> `school_inventory`. Semua file pendukung ada di folder `design-handoff/`.

---

## Tugas

Redesign **seluruh UI** aplikasi Next.js di repo ini (HIKA Inventaris — sistem inventaris sekolah)
mengikuti desain di folder `design-handoff/`. Ini **murni perubahan visual + layout**:
fitur, route, server action, schema Prisma, dan auth **tidak boleh berubah**.

Gaya baru: *clean institutional SaaS* — flat, border 1px, radius 10–16px, satu warna aksen
(biru `#2B4EFF`), sidebar navy solid, font Plus Jakarta Sans, light + dark mode.

**Hapus total** gaya lama: glassmorphism, `backdrop-blur`, blob/parallax background,
gradient dekoratif, animasi float.

## Baca dulu, berurutan

1. `design-handoff/01-design-tokens.md` — warna, tipografi, radius, spacing, ikon
2. `design-handoff/tokens.css` — salinan token yang harus dipakai (ganti isi `src/app/globals.css`)
3. `design-handoff/02-layout-shells.md` — shell desktop & mobile
4. `design-handoff/03-components.md` — komponen + resep Tailwind
5. `design-handoff/04-screens.md` — isi tiap halaman
6. `design-handoff/05-implementation-plan.md` — urutan kerja + checklist
7. Referensi visual: `design-handoff/reference/png/*.png`
   Markup acuan: `design-handoff/reference/html/*.html`
   Angka detail per layer: `design-handoff/spec/*.md`

## Token wajib (ringkas)

| Peran | Light | Dark |
| --- | --- | --- |
| app background | `#F4F7FB` | `#202124` |
| surface (kartu) | `#FFFFFF` | `#292A2D` |
| surface-2 | `#FAFCFE` | `#303134` |
| border / line | `#E3EAF3` | `#3C4043` |
| teks utama (ink) | `#0B1B2E` | `#E8EAED` |
| teks sekunder (ink-soft) | `#3B4A5F` | `#BDC1C6` |
| teks tersier (muted) | `#74849A` | `#9AA0A6` |
| brand | `#2B4EFF` | `#1A73E8` |
| brand-soft | `#EBEFFF` | `#2D3037` |
| navy (sidebar) | `#0A1730` | `#1B1C1F` |
| navy-2 (user card) | `#122444` | `#2A2B2E` |
| mint / mint-soft | `#0EA47A` / `#E4F7F0` | `#81C995` / `#2C3630` |
| amber / amber-soft | `#C77605` / `#FDF2DE` | `#FDD663` / `#38321F` |
| rose / rose-soft | `#D93A47` / `#FDEBEC` | `#F28B82` / `#3A2B2A` |

- Sidebar lokal: item aktif `#1B3364` (dark `#34373D`), item idle `#93A7C4` (dark `#9AA0A6`),
  label grup `#5C7295`.
- Font: **Plus Jakarta Sans** (200–800) via `next/font/google` → `--font-plus-jakarta`.
- Radius: 6 (tag) · 8 · 9 · 10 (field/tombol/nav) · 12 · 14 (kartu mobile) · 16 (kartu desktop) · 999 (pill).
- Ukuran kunci: sidebar **264px**; padding main desktop **26px 32px**; topbar judul **27px/800**;
  bottom nav mobile **62px**; app bar mobile **±59px**; kartu desktop padding **22px**,
  kartu mobile padding **13–14px**.

## Shell

- **Desktop (≥1024px):** sidebar 264px navy (brand → "MENU UTAMA" → nav item → spacer → user card),
  main dengan padding 26/32 dan `PageHeader` (judul + subjudul + actions) di setiap halaman.
- **Mobile (<1024px):** app bar (mark/back + judul 16/800 + sub 9.5 + aksi 32px) + konten
  (padding `0 16px 12px`, gap 10–12) + **bottom nav 62px** dengan 5 tab:
  Dasbor / Inventaris / Barcode / Pinjam / Laporan.
- Tabel di mobile berubah menjadi **list kartu**, bukan scroll horizontal.

## Halaman (semua sudah ada, jangan tambah route)

`/login` · `/dashboard` · `/inventory` · `/inventory/barcode` · `/borrow` · `/reports` · `/settings`
+ dialog scan kamera. Detail per halaman: `04-screens.md`.

## Larangan

- ❌ Jangan ubah `prisma/`, `src/actions/`, `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
  `src/lib/`, atau nama query/aksi.
- ❌ Jangan tambah dependency (ikon: `lucide-react` yang sudah ada; barcode: `react-barcode`;
  kamera: `html5-qrcode`).
- ❌ Jangan hapus fitur apa pun (scan keyboard listener, print mm, export PDF, dark mode, role admin).
- ❌ Jangan pakai `backdrop-blur`, shadow besar, gradient dekoratif, atau emoji sebagai ikon.
- ❌ Jangan hardcode hex selain daftar yang diizinkan di `05-implementation-plan.md`.
- ❌ Jangan copy-paste HTML export mentah — tulis ulang sebagai komponen React yang rapi
  (`PageHeader`, `MetricCard`, `StatusBadge`, `DataTable`, `MobileAppBar`, `EmptyState`, dst).

## Urutan kerja

1. `layout.tsx` (font) + `globals.css` (token dari `tokens.css`) → cek dev server.
2. Shell: `AuthenticatedLayoutClient`, `Sidebar`, `MobileBottomNav`, `PageHeader`, `MobileAppBar`.
3. Primitif shadcn: `button`, `badge`, `card`, `input`, `select`, `table`, `dialog`, `tabs`, `skeleton`.
4. Halaman satu per satu: login → dashboard → inventory → barcode → borrow → reports → settings.
   Setelah tiap halaman: bandingkan dengan `reference/png/NN-*.png` (light & dark, desktop & mobile).
5. Print styles (label barcode mm, laporan A4) + bersih-bersih sisa glass/float.
6. Verifikasi akhir: `npx tsc --noEmit`, `npm run lint`, `npm run build` harus hijau.

## Definisi selesai

- Tampilan 1440×880 dan 390×844 sesuai screenshot referensi (struktur, ukuran, warna, tipografi).
- Light & dark konsisten, tidak ada teks berkontras rendah.
- Semua fungsi lama tetap jalan (login, tambah/edit barang, pindah barang, pinjam/kembali,
  cetak barcode, export & cetak laporan, ganti tema, kelola user).
- Tidak ada error build/TypeScript, tidak ada hydration warning baru.
- Di akhir, laporkan: file yang diubah, komponen baru, dan screenshot/hasil pengecekan per halaman.


---

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


---

# 02 · Layout Shells

Ada **dua shell**, bukan satu yang di-scale: desktop (≥1024px) dan mobile (<1024px).
Keduanya memakai token yang sama, tapi ukuran dan susunannya beda.

```
Desktop 1440×880                        Mobile 390×844
┌──────────┬──────────────────────┐    ┌────────────────────────┐
│ Sidebar  │ Main                 │    │ App Bar       (≈59px)  │
│ 264px    │ padding 26 / 32      │    ├────────────────────────┤
│ navy     │ gap 16–22            │    │ Content (scroll)       │
│          │  ┌ Topbar ─────────┐ │    │ padding 0/16/12/16     │
│ brand    │  │ title + actions │ │    │ gap 10–12              │
│ nav      │  └─────────────────┘ │    │                        │
│ spacer   │  ┌ Body ───────────┐ │    ├────────────────────────┤
│ user     │  │ cards / table   │ │    │ Bottom Nav  (62px)     │
└──────────┴──└─────────────────┘─┘    └────────────────────────┘
```

---

## 1. Shell desktop

### 1.1 Sidebar (`src/components/layout/Sidebar.tsx`)

| Properti | Nilai |
| --- | --- |
| Lebar | **264px** tetap, tinggi penuh (`h-screen`), `shrink-0` |
| Latar | `navy` (`#0A1730` / dark `#1B1C1F`) |
| Padding | 24px atas-bawah · 18px kiri-kanan |
| Gap antar blok | 24px |
| Layout | `flex flex-col`; nav di tengah, spacer `flex-1` sebelum user card |

**Blok brand** (`h-` otomatis, gap 12, items-center)

- Mark: kotak 38×38, `rounded-[11px]`, `bg-brand`, ikon `graduation-cap` 20px putih.
- Teks (flex-col, gap 1px):
  - Nama sekolah `14.5px/800`, putih, tracking −0.2px → dari `settings.schoolName`
  - Produk `11px/500`, `nav-brand-product` → "HIKA Inventaris"

**Blok nav**

- Label grup: `9.5px`, `uppercase`, `letter-spacing: 1.2px`, warna `nav-label`, teks "MENU UTAMA".
- Daftar item: flex-col, **gap 4px**.
- Item (`Nav Item`):
  - `w-full`, padding `10px 14px`, `rounded-[10px]`, gap 12px, items-center
  - ikon 18px, label `14px/600`
  - non-aktif: teks + ikon `nav-idle`; aktif: `bg-[#1B3364]` (dark `#34373D`), teks & ikon putih
  - hover non-aktif: `bg-white/5` (dark `bg-white/6`)
  - opsional badge jumlah di kanan (`justify-end`, mono `11px`, warna sama dengan label)
- Urutan menu: Dasbor · Inventaris · Cetak Barcode · Peminjaman · Laporan · Pengaturan

**User card** (bawah, setelah spacer)

- `rounded-[12px]`, `bg-navy-2`, padding 11px, gap 10px, items-center
- Avatar 32×32 bulat `bg-brand`, inisial `13px/800` putih
- Nama user `12.5px/700` putih; email `10px` `nav-brand-product`, `truncate`
- Tombol logout: ikon `log-out` 15px `nav-brand-product`, hover putih

### 1.2 Main

| Properti | Nilai |
| --- | --- |
| Latar | `app-bg` |
| Padding | **26px** vertikal · **32px** horizontal |
| Gap antar blok | 22px (Dasbor) · 18px (Inventaris, Barcode, Peminjaman, Pengaturan) · 16px (Laporan) |
| Overflow | konten di-scroll di dalam `<main>`; shell tidak ikut scroll |

### 1.3 Topbar (dipakai semua halaman desktop)

```
[ Title block (flex-col, gap 5px) ]        [ Actions (flex, gap 9–10) ]
  Judul  27px/800 ls−0.8px  ink               cari (236–240px) · icon btn 38 · icon btn 38 · tombol utama
  Sub    13.5px             muted
```

- Topbar: `justify-between items-center`, lebar penuh.
- Icon button: 36–38px persegi, `rounded-[9px]/[10px]`, `bg-surface`, `border border-line`, ikon 15–16px `muted`.
- Search field: 236–240px, `Field` komponen (ikon `search` + placeholder 13px).
- Tombol utama di kanan topbar: `ButtonPrimary` (lihat `03-components.md`).

> `src/components/layout/Header.tsx` sebaiknya diganti menjadi `PageHeader` yang menerima
> `title`, `subtitle`, `actions` — dipakai di setiap halaman, bukan header global satu varian.

### 1.4 Pola isi halaman desktop

1. **Dasbor** → `Topbar` → `KPI Row` (4 kartu, gap 14) → `Body` (2 kolom, gap 16: kiri `flex-1`
   Aktivitas, kanan **322px** Stok Hampir Habis).
2. **Inventaris** → `Topbar` → `Filter Lokasi` (baris kartu lokasi, scroll horizontal bila perlu) →
   kartu daftar barang (`flex-1`) dengan header + tabel + pagination.
3. **Cetak Barcode** → `Topbar` → `Body` 2 kolom: kiri **326px** panel pengaturan printer,
   kanan `flex-1` pratinjau label + tombol cetak.
4. **Peminjaman** → `Topbar` → tab (Pinjam / Kembalikan) → 2 kolom: formulir + keranjang.
5. **Laporan** → `Topbar` → tab laporan → filter bar → kartu tabel + ringkasan + footer cetak.
6. **Pengaturan** → `Topbar` → 2 kolom: kiri `flex-1` kartu identitas sekolah, kanan **332px**
   kartu logo, kartu tema, kartu sesi.

Rincian tiap halaman: `04-screens.md`.

---

## 2. Shell mobile

Breakpoint: `< 1024px`. Sidebar desktop disembunyikan; bottom nav tampil.

### 2.1 App bar (sticky top)

| Properti | Nilai |
| --- | --- |
| Padding | 13–14px vertikal · 16px horizontal |
| Latar | transparan mengikuti `app-bg` (bukan kartu) |
| Susunan | kiri: mark/back + judul · kanan: aksi (theme, notif, avatar) |
| Tinggi total | ±59–61px |

- Mark 30×30 `rounded-[9px] bg-brand`, ikon 16px putih — hanya di halaman root (Dasbor).
- Halaman turunan memakai tombol back 30×30 `bg-surface border-line rounded-[9px]`.
- Judul `16px/800` ls −0.4 + sub `9.5px` `muted` (mis. "4 Nov 2026 · Admin").
- Aksi kanan: icon button 32×32 `rounded-[9px]` (theme `sun/moon`, `bell`), avatar 32 bulat
  `bg-brand-soft` dengan inisial `12px/800` `brand`.

### 2.2 Content

- Padding `0 16px 12–14px`, gap 10–12px, `overflow-y-auto`, `flex-1`.
- KPI 2 kolom: gap 10px, kartu `rounded-[14px]` padding 13px, label 9.5/600, chip ikon 22×22
  `rounded-[7px]` ikon 11px, nilai 23/800 ls−0.8, caption 9/400 lh1.35.
- Kartu umum: `rounded-[14px]`, padding 13–14px, border `line`.
- Baris list inventaris: kartu `rounded-[12px]` padding 10–11px, ikon `package` dalam chip 32px,
  nama 11.5/700, meta 9.5 `muted`, qty kanan 12.5/800 (rose bila rendah).
- FAB (Inventaris): 52×52, `bg-brand`, `rounded-[16px]`, ikon `plus` 22px putih,
  `absolute bottom-[86px] right-16` (di atas bottom nav).
- Sheet/dialog mobile: menempel bawah, `rounded-t-[18px]`, padding 18px, `animate-slide-up`.

### 2.3 Bottom nav (`src/components/layout/MobileBottomNav.tsx`)

| Properti | Nilai |
| --- | --- |
| Tinggi | **62px** |
| Latar | `surface`, `border-t border-line` |
| Padding | 0 · 6px |
| Item | 5 tab, `flex-1`, flex-col, gap 3px, ikon 19px + label 9px |
| Aktif | warna `brand`, label weight 700 |
| Non-aktif | `muted`, label weight 500 |

Tab: **Dasbor** (`layout-dashboard`) · **Inventaris** (`boxes`) · **Barcode** (`barcode`) ·
**Pinjam** (`shopping-cart`) · **Laporan** (`chart-column`).

> Pengaturan tidak ada di bottom nav mobile; akses lewat avatar di app bar → halaman Pengaturan.

---

## 3. Perilaku responsif

- Satu route, dua presentasi: gunakan `lg:` untuk elemen desktop dan default (mobile-first) untuk mobile.
- Tabel desktop menjadi **list kartu** di mobile (bukan tabel horizontal scroll). Data & aksi sama.
- Sidebar desktop boleh dipertahankan sebagai `Sheet` untuk tablet, tapi jangan menampilkan
  sidebar + bottom nav sekaligus pada lebar yang sama.
- Tinggi kartu KPI mobile: biarkan konten menentukan (`h-auto`), jangan dipaksa sama tinggi
  kecuali dalam satu baris 2 kolom (pakai `items-stretch`).
- Jangan pakai `position: fixed` untuk topbar mobile di dalam container ber-`overflow` lain;
  pakai `sticky top-0 z-20 bg-app`.


---

# 03 · Components

Spesifikasi komponen hasil redesign + resep kelas Tailwind (v4, token dari `tokens.css`).
Struktur data/a11y harus tetap memakai komponen shadcn yang sudah ada (`ui/*`) — yang diganti
adalah **styling & ukuran**, bukan API.

Ringkasan yang berubah dari versi lama:

| Komponen lama | Aksi |
| --- | --- |
| `glass-card` di `Card` | hapus blur/transparan → `panel` (surface + border 1px + radius 16) |
| `Button` cva | ganti `variant` + `size` sesuai tabel §4 |
| `Badge` | jadi pill dengan dot 6px, radius penuh |
| `Input` | tinggi 40–42, radius 10, border `line`, fokus ring `brand` |
| `Sidebar` | navy solid, item aktif `#1B3364` |
| `Header` | diganti `PageHeader` (title + subtitle + actions) |
| `MobileBottomNav` | solid, 62px, ikon 19 + label 9 |
| `MouseParallaxBackground` | **hapus** dari layout |

---

## 1. NavItem (sidebar)

```
┌───────────────────────────────┐
│ [icon 18]  Label          (3) │   pad 10/14 · gap 12 · radius 10
└───────────────────────────────┘
```

| State | Latar | Teks/ikon |
| --- | --- | --- |
| idle | transparan | `nav-idle` (#93A7C4) |
| hover | `white/5` | `white` |
| active | `#1B3364` (dark `#34373D`) | `#FFFFFF`, label weight tetap 600 |

Tailwind:

```tsx
<Link
  className={cn(
    "group flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold transition-colors",
    active
      ? "bg-[#1B3364] text-white dark:bg-[#34373D]"
      : "text-[#93A7C4] hover:bg-white/5 hover:text-white dark:text-[#9AA0A6]",
  )}
>
  <Icon className="size-[18px] shrink-0" strokeWidth={2} />
  <span className="flex-1 truncate">{label}</span>
  {count != null && (
    <span className="font-mono text-[11px] tabular-nums opacity-80">{count}</span>
  )}
</Link>
```

## 2. MetricCard (KPI)

Desktop 4 kolom · mobile 2 kolom.

| Properti | Desktop | Mobile |
| --- | --- | --- |
| Kartu | `panel` radius 16, padding 22, gap 18 | radius 14, padding 13, gap 6 |
| Label | 13px/600 `ink-soft` | 9.5px/600 `muted` |
| Icon chip | 34×34 radius 10, `bg-{status}-soft`, ikon 17 | 22×22 radius 7, ikon 11 |
| Value | 34px/800 ls −1.2 `ink` | 23px/800 ls −0.8 `ink` |
| Caption | 12px lh1.4 `muted` | 9px lh1.35 `muted` |

Varian warna (chip + ikon): netral→`brand-soft`/`brand`, bahaya→`rose-soft`/`rose`,
perhatian→`amber-soft`/`amber`, sukses→`mint-soft`/`mint`.

```tsx
<div className="panel flex flex-col gap-[18px] p-[22px]">
  <div className="flex items-center justify-between">
    <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
    <span className="grid size-[34px] place-items-center rounded-[10px] bg-brand-soft">
      <Icon className="size-[17px] text-brand" />
    </span>
  </div>
  <div className="text-[34px] font-extrabold leading-none tracking-[-1.2px] tabular-nums text-ink">
    {value}
  </div>
  <p className="text-xs leading-[1.4] text-muted-ink">{caption}</p>
</div>
```

## 3. Badge status

Pill, tinggi ±22px, dot 6px + label 11.5/700 (mobile 8.5–10/700).

| Varian | Latar | Teks & dot |
| --- | --- | --- |
| available | `mint-soft` | `mint` |
| low | `rose-soft` | `rose` |
| warning | `amber-soft` | `amber` |
| neutral | `brand-soft` | `brand` |

```tsx
<span className="inline-flex items-center gap-[7px] rounded-full bg-mint-soft px-[11px] py-[5px] text-[11.5px] font-bold text-mint">
  <span className="size-1.5 rounded-full bg-mint" />
  Tersedia
</span>
```

Label yang dipakai di desain: **Tersedia** (stok > 0), **Stok Rendah** / **Menipis** (≤ threshold),
**Habis** (0), **masuk / keluar / pindah** untuk timeline, **40 item** untuk badge netral.

## 4. Button

Basis: `inline-flex items-center gap-2 rounded-[10px] px-[18px] py-[11px] text-[13.5px] font-bold transition-colors`,
ikon 16px.

| Varian | Latar | Teks | Border | Dipakai |
| --- | --- | --- | --- | --- |
| `primary` | `brand` | white | – | Tambah Barang, Simpan, Masuk, Print |
| `secondary` | `surface` | `ink-soft` | `line` | Scan Barcode, Export, Batal |
| `soft` | `brand-soft` | `brand-deep` | – | aksi ringan di kartu |
| `danger` | `rose-soft` | `rose` | – | Hapus, Cetak Label merah |
| `ghost` | transparan | `muted` → `ink` | – | aksi di baris tabel |
| `icon` | `surface`, 36–38px persegi, radius 9–10 | `muted` | `line` | theme, bell, filter, download |

Semua tombol: `disabled:opacity-45 disabled:pointer-events-none`,
`focus-visible:ring-2 ring-brand/40`, `active:translate-y-px`.
Mobile: padding `9px 14px`, teks 12.5px, radius 9–10.

## 5. Field / Input

| Properti | Nilai |
| --- | --- |
| Kontainer | `surface`, border `line` 1px, radius 10, padding `11px 14px`, gap 10, items-center |
| Ikon kiri | 16px `muted` |
| Teks | 13px; isi `ink`, placeholder `muted` |
| Fokus | border `brand`, ring `brand/25` 3px |
| Error | border `rose`, teks bantuan `10.5px` `rose` |
| Select | tambah chevron `chevron-down` 12px di kanan |
| Search | sama, ikon `search`; lebar 236–240px (desktop) |

Field group (form): label `11.5px/700` `ink-soft` UPPERCASE + gap 6px di atas input,
helper `10.5px` `muted` di bawah. Di mobile: label `8.5–9px/600`, gap 4px, input padding 9/10.

Area teks (alamat): `textarea` radius 9–10, min 2 baris, padding sama.

Checkbox: 14×14, radius 4, tercentang `bg-brand` + `check` putih; label 11.5px `ink-soft`.
Radio: 14×14 bulat, terpilih `brand` dengan dot putih 4.5px.

## 6. Panel / Card

```tsx
<section className="panel flex flex-col">
  <header className="flex items-start justify-between gap-4 border-b border-line px-[22px] py-[18px]">
    <div>
      <h2 className="text-[15.5px] font-bold text-ink">Aktivitas Terbaru</h2>
      <p className="mt-1 text-xs text-muted-ink">Timeline pencatatan barang dan mutasi logistik.</p>
    </div>
    <span className="font-mono text-[10px] tracking-[1px] text-mint">LIVE</span>
  </header>
  <div className="flex flex-col gap-[18px] p-[22px]">…</div>
  <footer className="flex items-center justify-between rounded-[10px] border border-line bg-surface-2 px-4 py-[13px]">
    <span className="text-[11.5px] text-muted-ink">Menampilkan 6 dari 128 aktivitas</span>
    <span className="text-[11.5px] font-bold text-brand">Lihat semua →</span>
  </footer>
</section>
```

- Padding kartu desktop: 22px (isi), 18×20 (header), 13×16 (footer bar).
- Padding kartu mobile: 13–14px, radius 14.
- Jangan menaruh kartu di dalam kartu tanpa alasan struktural.

## 7. Table (desktop)

Grid kolom Inventaris/Laporan (total lebar isi 1176 − 32·2 pad = 1112):

| Kolom | Lebar | Isi |
| --- | --- | --- |
| NAMA BARANG | `flex-1` | nama 12.5/700 + spesifikasi 10.5 `muted` |
| BARCODE | 92px | mono 10.5 |
| LOKASI | 118px | 11px |
| KATEGORI | 92px | 11px `muted` |
| STOK | 58px | mono 12/700, rata kanan, `rose` bila rendah |
| STATUS | 108px | Badge |
| AKSI | 40px | ikon `pencil` 13px `muted` |

- Header: `bg-surface-2`, padding `9px 20px`, `border-b border-line`, th `10px/700 uppercase ls .5px muted`.
- Baris: padding `11px 20px`, `border-b border-line` (baris terakhir tanpa border), gap 14px.
- Hover baris: `bg-surface-2/70`. Klik baris = buka detail (bila ada).
- Header kartu tabel: judul 15/700 + badge jumlah, kanan: search 240 + 2 icon button 36.
- Footer: "Menampilkan 10 dari 40 barang" + pagination kotak 28×28 radius 8
  (aktif: `bg-brand` teks putih; pasif: `bg-surface border-line`), gap 6.

Implementasi React: pakai `ui/table.tsx` yang sudah ada, override className. Tabel dibungkus
`overflow-x-auto` hanya untuk tablet; di mobile gunakan list kartu (§9).

## 8. Timeline / ActivityRow

```
[chip 32 radius 9 ikon 15]  Judul 13.5/700  [badge kecil]      waktu mono 10.5 muted
                            Meta 11.5 muted
```

- Chip warna = jenis aktivitas: masuk → `mint-soft`/`mint`, keluar → `rose-soft`/`rose`,
  pindah → `brand-soft`/`brand`.
- Badge kecil (masuk/keluar/pindah) memakai §3 dengan label lowercase.
- Baris: gap 13px, items-center, `justify-between` untuk blok waktu.
- Jarak antar baris 16px.

## 9. ListItem (mobile, pengganti tabel)

```tsx
<li className="flex items-center gap-3 rounded-[12px] border border-line bg-surface px-[11px] py-[10px]">
  <span className="grid size-8 place-items-center rounded-[9px] bg-brand-soft">
    <Package className="size-4 text-brand" />
  </span>
  <div className="min-w-0 flex-1">
    <p className="truncate text-[11.5px] font-bold text-ink">Mouse Kabel</p>
    <p className="truncate text-[9.5px] text-muted-ink">Logitech B100 · 45685</p>
  </div>
  <span className="font-mono text-[12.5px] font-extrabold tabular-nums text-ink">112</span>
</li>
```

- Gap antar item 8px. Qty `rose` bila 0–threshold.
- Tap target minimal 44px tinggi (padding 10–11px + konten).
- Halaman inventaris mobile menambahkan: app bar, baris search + tombol scan, chips lokasi
  (scroll horizontal, `scrollbar-none`), list, FAB `plus`.

## 10. Chip & Tab

| Varian | Bentuk | Aktif | Pasif |
| --- | --- | --- | --- |
| Filter chip | pill, padding `6px 11px`, 10.5/700 | `bg-brand` teks putih | `bg-surface border-line` teks `ink-soft` |
| Tab segmen (2 pilihan) | `flex-1`, radius 9, padding `8px 0`, 11/700 | `bg-surface border-line` teks `ink` | transparan, teks `muted` |
| Tab underline (Laporan) | padding `10px 0`, 11/700 | teks `ink` + garis bawah 2px `brand` | teks `muted` |

Gap 4–7px; chip bisa di-scroll horizontal di mobile.

## 11. Progress track (stok)

Tinggi 5px, radius 3, `bg-[#EDF2F8]` (dark `#3C4043`), isi `rose` (atau `mint` bila aman),
lebar = `min(stok/threshold,1)*100%`. Angka qty 14px/700 mono di atas kanan.

## 12. Barcode label (pratinjau cetak)

Ukuran nyata mengikuti `printerSettings` (default **33 × 15 mm**, gap 2mm, 2 kolom, A4).
Di pratinjau layar, label diskalakan tapi proporsinya dijaga.

Isi label (6 elemen, semua proporsional terhadap tinggi label):

1. Baris atas: nama sekolah (mono 6.5px) ⟷ kode (mono 6.5px), `muted`
2. Nama barang — 8.5px/700 `ink`, `truncate`
3. Barcode (react-barcode) + nomor di kanan (mono 8px/700)
4. Footer: lokasi (6.5px `muted`)

Kotak label: `white`, border `#C9D6E5` 1px, radius 5, padding `8px 10px`, gap 3px.

## 13. Scan dialog / overlay

- Overlay: `fixed inset-0 z-50 grid place-items-center bg-[#0B1B2E]/60 p-4`.
- Dialog desktop: lebar 512px, radius 18, padding 22, gap 14, `shadow-dialog`.
- Head: chip ikon 36 radius 10 `brand-soft` + `camera`, judul 15/700, sub 11 `muted`,
  tombol close 28×28 `surface-2` radius 8.
- Viewfinder: tinggi 286, radius 14, gradient `#101B2E → #050912`, `overflow-hidden`.
  - Sudut bidik 26×26, stroke `#8AB4F8` 3px, radius ujung bulat.
  - Garis scan 432×2 `#8AB4F8` + glow, animasi `animate-scan-line`.
  - Kartu hasil deteksi: putih 95%, radius 8, padding `14px 18px` (barcode + kode mono 10/700).
- Caption: ikon `scan-line` 13 `mint` + teks 10.5 lh1.45 `ink-soft`.
- Mobile: sheet dari bawah, radius atas 18, tinggi ±60% layar, tombol aksi di footer.

## 14. UserCard & avatar

- Sidebar: kartu `bg-navy-2` radius 12 padding 11, avatar 32 `bg-brand` + inisial 13/800 putih,
  nama 12.5/700 putih (truncate), email 10 `nav-brand-product` (truncate), logout ikon 15.
- Mobile app bar: avatar 32 `bg-brand-soft`, inisial 12/800 `brand`.
- Inisial = huruf pertama nama user, uppercase.

## 15. PageHeader (pengganti Header global)

```tsx
<div className="flex items-center justify-between gap-4">
  <div className="flex flex-col gap-[5px]">
    <h1 className="text-[27px] font-extrabold leading-tight tracking-[-0.8px] text-ink">{title}</h1>
    <p className="text-[13.5px] text-muted-ink">{subtitle}</p>
  </div>
  {actions && <div className="flex items-center gap-2.5">{actions}</div>}
</div>
```

Mobile: judul 16/800 + sub 9.5 di dalam app bar (bukan PageHeader terpisah).

## 16. Empty state

Ikon 32px `muted` dalam lingkaran `surface-2` 56px, judul 13/700 `ink`, deskripsi 11.5 `muted`,
satu tombol `secondary`. Container: padding 40, `items-center`, gap 10.

## 17. Toast / notifikasi

`sonner` dipertahankan. Styling: `surface` + border `line`, radius 12, judul 12.5/700,
deskripsi 11.5 `muted`, ikon status `mint`/`rose`. Posisi `top-right` (desktop) / `top-center` (mobile).


---

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


---

# 05 · Implementation Plan

Urutan kerja yang disarankan. Setiap langkah harus **build-able** sebelum lanjut.
Repo: Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · next-themes · Prisma.

---

## Aturan global

1. **Jangan ubah** `prisma/`, `src/actions/`, `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
   `src/lib/`, `src/hooks/` — kecuali menambah helper presentasional.
2. Jangan menambah dependency baru. Semua ikon memakai `lucide-react` yang sudah ada.
3. Jangan menambah route. Redesign hanya mengubah tampilan route yang sudah ada.
4. Semua warna/ukuran dari token (`bg-surface`, `text-ink`, `border-line`, `bg-brand`, …).
   Hardcode hex hanya untuk: sidebar (`#1B3364`), panel navy login (`#7FA6FF`, `#A6B7D0`, `#8296B4`),
   viewfinder kamera (`#101B2E→#050912`, `#8AB4F8`), dan kertas label (`#EEF3F9`, `#C9D6E5`).
5. Mobile-first: kelas default = mobile, `lg:` = desktop. Jangan memakai `md:` untuk shell
   (breakpoint shell = `lg`, 1024px).
6. Aplikasi harus tetap bisa di-print (label barcode, laporan) dan tetap mendukung dark mode.

---

## Langkah 1 — Fondasi: font & token

**1.1 `src/app/layout.tsx`** — ganti font:

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// <html lang="id" className={jakarta.variable}>
// <body className="font-sans">
```

Ubah juga `lang="en"` → `lang="id"`, dan `metadata.title` → `"HIKA Inventaris · SMK HKTI 2"`.

**1.2 `src/app/globals.css`** — ganti seluruh isi dengan `design-handoff/tokens.css`.
Yang **harus dihapus**: `glassmorphism`, `@keyframes float/float-reverse`, `bg-radial`, `backdrop-blur`
manual, `-.dark` print hack lama. Yang **dipertahankan**: `@media print`, `scrollbar-none`.

**1.3 Cek** `npm run dev` → halaman login masih tampil (walau berantakan), tidak ada error CSS.

---

## Langkah 2 — Shell aplikasi

**2.1 `src/components/layout/AuthenticatedLayoutClient.tsx`** — tulis ulang jadi:

```tsx
<div className="flex h-screen w-full overflow-hidden bg-app">
  {/* Sidebar desktop: 264px, hanya lg ke atas */}
  <aside className="hidden w-[264px] shrink-0 lg:flex print:hidden">
    <Sidebar user={user} settings={settings} />
  </aside>

  {/* Area konten */}
  <div className="flex min-w-0 flex-1 flex-col">
    <main className="flex-1 overflow-y-auto px-4 pb-24 pt-0 lg:px-8 lg:pb-8 lg:pt-[26px] print:overflow-visible print:p-0">
      <div className="mx-auto w-full max-w-[1600px]">{children}</div>
    </main>
  </div>

  <MobileBottomNav user={user} />
</div>
```

Hapus: dua div glow `animate-float`, `bg-radial`, state `isCollapsed` (desain tidak punya mode collapse),
dan `<Header />` global (diganti `PageHeader` per halaman pada Langkah 4).

**2.2 `Sidebar.tsx`** — struktur baru: brand → label grup → nav list → spacer → user card.
Hapus tombol collapse/chevron, hapus warna `text-sky-500` dll. Pakai `NavItem` (§1 komponen).
Lebar penuh (`w-full`), padding `24px 18px`, `bg-navy`, teks putih.

**2.3 `MobileBottomNav.tsx`** — 5 tab, tinggi 62px, `bg-surface border-t border-line`,
ikon 19 + label 9, aktif `brand`. Sembunyikan saat `print`.

**2.4 `Header.tsx`** → jadikan `PageHeader.tsx`:

```tsx
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: React.ReactNode;
})
```

Konten: judul 27/800 ls −0.8, sub 13.5 `muted`, actions `flex gap-2.5`.
Hapus `Header` dari layout; panggil `PageHeader` di setiap halaman (desktop).
Di mobile, informasi yang sama ditampilkan lewat `MobileAppBar` (buat komponen baru
`src/components/layout/MobileAppBar.tsx` dengan props `title`, `subtitle`, `back?`, `actions?`).

**2.5** Cek: semua route masih bisa dibuka, sidebar & bottom nav tampil benar di light/dark.

---

## Langkah 3 — Primitif UI (shadcn)

| File | Perubahan |
| --- | --- |
| `ui/button.tsx` | variants: `primary`, `secondary`, `soft`, `danger`, `ghost`, `icon`; size default h-10 px-[18px] text-[13.5px] font-bold rounded-[10px], `sm` untuk mobile |
| `ui/badge.tsx` | pill + dot; variants `mint`, `rose`, `amber`, `brand`, `neutral` |
| `ui/card.tsx` | `rounded-2xl border border-line bg-surface shadow-none` (hapus glass & backdrop blur) |
| `ui/input.tsx`, `ui/textarea.tsx` | `h-10 rounded-[10px] border-line bg-surface px-3.5 text-[13px] placeholder:text-muted-ink focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25` |
| `ui/select.tsx` | trigger sama seperti input + chevron 12px |
| `ui/dialog.tsx`, `ui/alert-dialog.tsx` | overlay `bg-[#0B1B2E]/60`, content `rounded-[18px] border-line bg-surface shadow-dialog p-[22px]` |
| `ui/table.tsx` | header `bg-surface-2` + `text-[10px] font-bold uppercase tracking-[.5px] text-muted-ink`, row `border-b border-line px-5 py-[11px]` |
| `ui/tabs.tsx` | underline & segmented style (§10 komponen) |
| `ui/skeleton.tsx` | `bg-surface-2` |
| `ui/sonner.tsx` | kartu `surface` border `line` radius 12 |
| `ui/avatar.tsx` | fallback `bg-brand` teks putih 13/800 |

Hapus seluruh pemakaian `glass-card/glass-panel/glass-input/glass-button` (19 tempat di 9 file),
ganti dengan `panel` / `bg-navy` / input standar.

---

## Langkah 4 — Halaman (satu per satu, verifikasi visual tiap selesai)

Urutan yang disarankan (paling banyak dipakai lebih dulu):

1. `/login` → `login/page.tsx`, `auth/LoginForm.tsx`
2. `/dashboard` → `dashboard/page.tsx` (KPI + aktivitas + stok)
3. `/inventory` → `inventory/page.tsx` (+ `ItemForm`, `InventoryActions`, `MoveItemDialog`, `ScanDialog`)
4. `/inventory/barcode` → `barcode/page.tsx`, `BarcodeGenerator.tsx`
5. `/borrow` → `borrow/page.tsx`, `BorrowForm`, `ReturnForm`, `ActiveLoans`
6. `/reports` → `reports/page.tsx`, `components/reports/*`
7. `/settings` → `settings/page.tsx`, `SchoolProfileForm`, `PrinterSettingsForm`, `UserManagement`
8. Polish: `loading.tsx`, empty states, toast, focus ring

Untuk setiap halaman:

- Desktop: `PageHeader` + blok isi sesuai `04-screens.md`.
- Mobile: `MobileAppBar` + konten padding `0 16px 12px` + bottom nav; tabel → list kartu.
- Setelah selesai: cek dengan Playwright/DevTools pada 1440×880 dan 390×844, light + dark.
  Bandingkan dengan `reference/png/NN-*.png`.

---

## Langkah 5 — Print & artefak

- `BarcodeGenerator`: pastikan area label memakai `mm` dan `@media print` menyembunyikan chrome.
- `reports`: kop cetak (`ReportHeader`) memakai font & warna sama; paksa hitam-putih saat print.
- `@page { size: A4; margin: 12mm; }` bila belum ada.

---

## Langkah 6 — Bersih-bersih

- Hapus `src/components/ui/MouseParallaxBackground.tsx` bila tidak dipakai lagi.
- Hapus keyframes `float` / `animate-float` / `bg-radial` yang tersisa.
- Pastikan tidak ada `backdrop-blur` / `bg-white/xx` acak di luar daftar hardcode yang diizinkan.
- `npx tsc --noEmit` · `npm run lint` · `npm run build` hijau.

---

## Checklist acceptance

**Umum**

- [ ] `npm run build` sukses, tidak ada hydration warning baru.
- [ ] Light & dark sama-sama benar; tidak ada teks yang tidak terbaca (kontras ≥ 4.5:1 untuk body).
- [ ] Tidak ada glassmorphism/backdrop-blur/blob/parallax.
- [ ] Font Plus Jakarta Sans ter-load (cek Network), fallback aman.
- [ ] 1440×880 dan 390×844 tidak ada scroll horizontal pada body.

**Shell**

- [ ] Sidebar 264px, navy, item aktif `#1B3364`, tanpa tombol collapse.
- [ ] Topbar per halaman: judul 27px + sub 13.5px + actions rata kanan.
- [ ] Bottom nav 62px, 5 tab, aktif `brand`, tidak muncul di desktop.
- [ ] Konten tidak tertutup bottom nav (padding bawah ≥ 88px di mobile).

**Halaman**

- [ ] Login: split 660/780, panel brand navy, form 346px, semua state.
- [ ] Dasbor: 4 KPI, aktivitas, stok hampir habis, "LIVE" badge.
- [ ] Inventaris: filter lokasi, tabel 7 kolom, pagination, badge status, aksi edit.
- [ ] Barcode: panel printer 326px, pratinjau grid label, print bersih (ukuran mm benar).
- [ ] Peminjaman: tab Pinjam/Kembalikan, keranjang qty ±, peminjaman aktif.
- [ ] Laporan: 4 tab, 3 filter, ringkasan + total, footer cetak.
- [ ] Pengaturan: identitas, logo, tema (3 opsi), sesi; simpan berfungsi.
- [ ] Scan: dialog overlay (desktop) & fullscreen (mobile), kamera start/stop benar.

**Aksesibilitas**

- [ ] Semua input punya `<label>`/`aria-label`; ikon-only button punya `aria-label`.
- [ ] Fokus terlihat (`ring-2 ring-brand/40`) di semua kontrol interaktif.
- [ ] Badge status tidak hanya warna — selalu ada teks.
- [ ] Tombol ≥ 44×44px di mobile (kecuali ikon inline non-interaktif).

---

## Cara verifikasi cepat

```bash
npm run dev            # buka http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

Banduan visual (desktop 1440×880, light):

| Halaman | File referensi |
| --- | --- |
| Login | `reference/png/03-login-light.png` |
| Dasbor | `reference/png/02-dasbor-light.png` |
| Inventaris | `reference/png/04-inventaris-light.png` |
| Barcode | `reference/png/05-cetak-barcode-light.png` |
| Peminjaman | `reference/png/06-peminjaman-light.png` |
| Laporan | `reference/png/07-laporan-light.png` |
| Pengaturan | `reference/png/08-pengaturan-light.png` |
| Scan | `reference/png/16-scan-kamera-light.png` |
| Mobile (semua) | `reference/png/18-*.png` … `33-*.png` |

Markup acuan per halaman (Tailwind, hasil export dari desain, ukuran px asli):
`reference/html/desktop-light-1.html`, `desktop-light-2.html`, `mobile-light-1.html`,
`mobile-light-2.html`, `design-system.html`. **Gunakan sebagai acuan ukuran & struktur —
tulis ulang sebagai komponen React, jangan copy-paste div statis.**

