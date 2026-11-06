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
