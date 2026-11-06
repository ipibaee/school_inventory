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
