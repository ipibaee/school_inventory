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
