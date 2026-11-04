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
