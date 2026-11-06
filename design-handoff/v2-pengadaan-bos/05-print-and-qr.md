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
