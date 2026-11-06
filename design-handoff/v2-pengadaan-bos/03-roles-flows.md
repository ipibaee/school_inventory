# 03 · Peran, izin, dan alur

---

## 1. Peran

Role disimpan di `User.role` (String). Tambahkan satu nilai baru: **`HEADMASTER`**.

| Role | Sebutan di UI | Tugas dalam modul ini |
| --- | --- | --- |
| `ADMIN` | Admin TU | membuat/mengubah pengajuan, memilih guru pengawas, mencetak BAP |
| `TECHNICIAN` | Teknisi / Penyimpan Barang | menyusun daftar barang, menerima fisik barang |
| `TEACHER` | Guru Pengawas | memeriksa fisik, mencentang item, mengesahkan BAP |
| `HEADMASTER` | Kepala Sekolah | memantau dasbor eksekutif, mencetak rekap, melihat BAP |

Satu user hanya punya satu role. `HEADMASTER` **tidak** boleh membuat/mengubah pengajuan
(hanya baca + cetak) — supaya jejak audit tetap jelas.

## 2. Matriks izin

| Aksi | ADMIN | TECHNICIAN | TEACHER | HEADMASTER | Publik |
| --- | :-: | :-: | :-: | :-: | :-: |
| Lihat `/procurement` | ✓ | ✓ | ✓ (read-only) | ✓ (read-only) | – |
| Buat draft / ubah draft | ✓ | ✓ | – | – | – |
| Tambah/hapus item | ✓ | ✓ | – | – | – |
| Pilih guru pengawas | ✓ | – | – | – | – |
| Kirim ke guru pengawas | ✓ | ✓ | – | – | – |
| Checklist pemeriksaan | – | – | ✓ (hanya yang ditunjuk) | – | – |
| Sahkan / terbitkan BAP | – | – | ✓ | – | – |
| Tolak BAP | – | – | ✓ | – | – |
| Arsip BAP | ✓ | ✓ | ✓ | ✓ | – |
| Cetak BAP | ✓ | ✓ | ✓ | ✓ | – |
| Dasbor eksekutif | – | – | – | ✓ | – |
| Verifikasi QR | – | – | – | – | ✓ |

Penegakan: **server action wajib** memeriksa sesi + role (`assertRole`), bukan hanya
menyembunyikan tombol. Route protection di `middleware`/`authConfig`:

```ts
const protectedPrefixes = ["/dashboard","/inventory","/borrow","/reports","/settings",
                           "/procurement","/executive"]
const isExecutive = pathname.startsWith("/executive")
// /verify/** sengaja TIDAK diproteksi
```

Tambah di `authConfig.callbacks.authorized`:

```ts
if (isExecutive && (session?.user as any)?.role !== "HEADMASTER") {
  return Response.redirect(new URL("/dashboard", nextUrl))
}
```

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
| `SUBMITTED` | nomor BAP & QR sudah terbit, menunggu pemeriksaan | guru mencentang item, menulis catatan, publish/reject; admin hanya baca |
| `VERIFIED` | sah; stok sudah masuk | cetak, lihat QR; tidak bisa diubah (perubahan = BAP baru) |
| `REJECTED` | dikembalikan guru dengan alasan | admin merevisi → kembali `DRAFT` (nomor dipertahankan) |

Aturan transisi:

- `submit`: minimal 1 item, semua item punya jumlah > 0, guru pengawas terisi,
  periode belum dipakai BAP lain.
- `publish`: **semua** item `checked = true`, dan `status = SUBMITTED`.
- `reject`: wajib `rejectNote`.
- `VERIFIED` bersifat final (immutable) — untuk memperbaiki, buat pengajuan baru atau
  mekanisme revisi bertanda (di luar scope v1 implementasi).

## 4. Alur utama (happy path)

```
Admin TU            Sistem                        Guru Pengawas          Kepala Sekolah
────────            ──────                        ─────────────          ──────────────
1. Isi form
   pilih bulan,
   guru pengawas,
   tambah barang ───▶ simpan draft (DRAFT)
2. Kirim ──────────▶ ambil nomor BAP (027/…)
                     buat qrToken
                     status SUBMITTED ───────────▶ 3. buka /procurement/[id]/check
                                                   cek fisik di gudang
                                                   centang 4 item + catatan
                                                   tap "Sahkan & Terbitkan BAP"
                                                   ▼
                                  publish: stok IN, item BARU dibuat,
                                  status VERIFIED, verifiedAt, log
                                                   │
                     modal "Pengesahan Berhasil" ◀─┘
                     (QR + detail verifikasi)
                                                   │
4. Arsip BAP / cetak ◀────────── dokumen A4 + QR ──┘
                                                         5. /executive memantau
                                                            realisasi & status BAP
Publik: scan QR dokumen ──▶ /verify/{qrToken} ──▶ data BAP + status sah
```

## 5. Alur QR

| Tahap | Detail |
| --- | --- |
| Generate | saat `submit`: `qrToken = crypto.randomBytes(16).toString("hex")` (32 hex) |
| Isi QR | `${process.env.NEXTAUTH_URL}/verify/${qrToken}` (fallback `https://inventaris.smkhkti2.sch.id`) |
| Render | server: `qrcode` → `toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M" })`; sisipkan sebagai `dangerouslySetInnerHTML` di kotak 74px / 22mm |
| Halaman verifikasi | `/verify/[token]` (server component, **tanpa auth**), cari `Procurement` berdasarkan `qrToken` yang `status = VERIFIED` |
| Logging | catat `VerificationVisit` (ip + user-agent) — gunakan `after()` (Next 15/16) atau route handler `POST /api/verify/[token]/visit` dari client agar tidak dobel log saat render |
| Token salah | tampil state "Dokumen tidak ditemukan" (jangan bocorkan info) |
| Cache | `export const dynamic = "force-dynamic"` pada `/verify/[token]` |

QR **tidak** memuat data sensitif — hanya token. Semua isi dokumen diambil dari DB.

## 6. Navigasi

**Sidebar desktop** — tambah satu item setelah `Inventaris`:

| Label | Ikon | Route |
| --- | --- | --- |
| Pengadaan BOS | `clipboard-list` | `/procurement` (+ `/procurement/archive` sebagai sub-tab) |

Item arsip tidak perlu menu terpisah — masuk lewat tab/halaman `/procurement` (tombol
"Arsip BAP" di samping "Pengajuan") atau breadcrumb.

**Sidebar mobile / bottom nav** — tetap 5 tab (Dasbor, Inventaris, Barcode, Pinjam, Laporan).
`Pengadaan BOS` ditaruh di sheet "Menu lainnya" dari avatar app bar, atau di halaman
Pengaturan → tautan cepat. `Arsip BAP` juga bisa diakses dari dasbor eksekutif mobile.

**Menu Kepala Sekolah** — jika role `HEADMASTER`, sidebar menampilkan
`Dasbor` → `/executive` (bukan `/dashboard`), plus `Arsip BAP`.

## 7. Notifikasi & audit

- Toast (sonner) untuk: draft tersimpan, pengajuan terkirim, item diperbarui, BAP disahkan,
  BAP ditolak.
- `ProcurementLog` mencatat setiap transisi + `actorId`, ditampilkan di halaman detail
  (timeline kecil di bawah dokumen atau sheet "Riwayat").
- Setiap pencetakan boleh dicatat sebagai `action: "PRINTED"` (opsional, frekuensi tinggi).

## 8. Edge case yang harus ditangani

| Kasus | Perilaku |
| --- | --- |
| Dua admin submit periode sama bersamaan | `@@unique([periodMonth, periodYear])` → tampilkan error "BAP periode ini sudah ada" |
| Guru membuka checklist BAP yang bukan tugasnya | 403 + redirect ke arsip |
| Guru menutup browser di tengah pemeriksaan | `checked` per item tersimpan (server action per toggle), lanjutkan kapan saja |
| Barang dihapus dari inventaris setelah dipilih | relasi `onDelete: SetNull`; simpan `name`/`spek` di `ProcurementItem` agar dokumen tetap utuh |
| BAP di-print sebelum sah | tombol cetak hanya untuk `SUBMITTED`/`VERIFIED`, beri watermark "DRAFT" bila `SUBMITTED` |
| QR discan dokumen lama (BAP dihapus) | halaman verifikasi → "Dokumen tidak ditemukan" |
| Zona waktu | simpan UTC, tampilkan `Asia/Jakarta` (`date-fns` + `formatInTimeZone`) |
