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
  role String @default("TEACHER") // ADMIN | TECHNICIAN | TEACHER | HEADMASTER
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
`role` cukup ditambah nilai `HEADMASTER` — tidak perlu migrasi kolom.

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
5. `revalidatePath` untuk `/procurement`, `/procurement/archive`, `/procurement/[id]`, `/executive`,
   `/inventory`, `/dashboard`.

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
- User: `headmaster@smkhkti2.sch.id` (role `HEADMASTER`), `budi@…` (`TEACHER`),
  `admin@…` (`ADMIN`).

Semua angka di dokumen desain (159 unit/tahun, 420 unit arsip) tidak harus persis — yang penting
konsisten antar layar.
