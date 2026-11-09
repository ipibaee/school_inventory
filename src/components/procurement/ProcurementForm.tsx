"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  createProcurement,
  updateProcurementMeta,
  removeItem,
  submitProcurement,
} from "@/actions/procurement"
import { WarehouseQuickPickDialog } from "./WarehouseQuickPickDialog"
import { AddNewItemDialog } from "./AddNewItemDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MONTH_NAMES_ID } from "@/lib/format"
import { toast } from "sonner"
import {
  Save,
  Send,
  PackageSearch,
  Plus,
  Trash2,
  Lock,
  UserCheck,
  Check,
  Timer,
  Archive,
  Info,
  Package,
  Loader2,
  FileText,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProcurementFormProps {
  initialProcurement?: any
  inspectors: any[]
  warehouseSuggestions: any[]
  categories: any[]
  previewBapNumber: string
  currentYear: number
  currentMonth: number
}

export function ProcurementForm({
  initialProcurement,
  inspectors,
  warehouseSuggestions,
  categories,
  previewBapNumber,
  currentYear,
  currentMonth,
}: ProcurementFormProps) {
  const router = useRouter()

  const [procurement, setProcurement] = useState<any>(initialProcurement)
  const [periodMonth, setPeriodMonth] = useState<number>(
    initialProcurement?.periodMonth || currentMonth
  )
  const [periodYear, setPeriodYear] = useState<number>(
    initialProcurement?.periodYear || currentYear
  )
  const [source, setSource] = useState(
    initialProcurement?.source || "BOS_REGULER"
  )
  const [inspectorId, setInspectorId] = useState(
    initialProcurement?.inspectorId || (inspectors[0]?.id ?? "")
  )
  const [note, setNote] = useState(initialProcurement?.note || "")

  const [savingDraft, setSavingDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const [openWarehousePick, setOpenWarehousePick] = useState(false)
  const [openAddNewItem, setOpenAddNewItem] = useState(false)
  const [preselectedWarehouseId, setPreselectedWarehouseId] = useState<string | null>(null)

  // Sinkronisasi otomatis jika data initialProcurement berubah
  useEffect(() => {
    if (initialProcurement) {
      setProcurement(initialProcurement)
    }
  }, [initialProcurement])

  const items = procurement?.items || []
  const totalUnits = items.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0)

  // Handler reaktif saat barang berhasil ditambah/diubah
  const handleItemsUpdated = (updatedItems?: any[]) => {
    if (updatedItems) {
      setProcurement((prev: any) => ({
        ...prev,
        items: updatedItems,
      }))
    }
    router.refresh()
  }

  // Pastikan draft tersimpan dulu bila belum pernah ada ID
  const ensureDraftSaved = async (): Promise<string | null> => {
    if (procurement?.id) {
      await updateProcurementMeta(procurement.id, {
        periodMonth,
        periodYear,
        source,
        inspectorId,
        note,
      })
      return procurement.id
    }

    setSavingDraft(true)
    const res = await createProcurement({
      periodMonth,
      periodYear,
      source,
      inspectorId,
      note,
    })
    setSavingDraft(false)

    if (!res.ok) {
      toast.error(res.error || "Gagal membuat draft pengadaan")
      return null
    }

    if (res.data?.id) {
      setProcurement({
        id: res.data.id,
        periodMonth,
        periodYear,
        source,
        inspectorId,
        note,
        status: "DRAFT",
        items: [],
      })
      return res.data.id
    }
    return null
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true)
    const id = await ensureDraftSaved()
    setSavingDraft(false)
    if (id) {
      toast.success("Draft pengadaan berhasil disimpan")
      router.refresh()
    }
  }

  const handleOpenWarehouseModal = async (target?: string | unknown) => {
    const itemId = typeof target === "string" ? target : null
    if (itemId) {
      setPreselectedWarehouseId(itemId)
    } else {
      setPreselectedWarehouseId(null)
    }
    const id = await ensureDraftSaved()
    if (id) {
      setOpenWarehousePick(true)
    }
  }

  const handleOpenAddNewModal = async () => {
    const id = await ensureDraftSaved()
    if (id) {
      setOpenAddNewItem(true)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    const res = await removeItem(itemId)
    if (res.ok) {
      toast.success("Barang dihapus dari daftar")
      if ("data" in res && res.data?.items) {
        setProcurement((prev: any) => ({
          ...prev,
          items: res.data!.items,
        }))
      } else {
        setProcurement((prev: any) => ({
          ...prev,
          items: (prev?.items || []).filter((it: any) => it.id !== itemId),
        }))
      }
      router.refresh()
    } else {
      toast.error(res.error || "Gagal menghapus barang")
    }
  }

  const handleConfirmSubmit = async () => {
    if (!procurement?.id) {
      toast.error("Simpan draft terlebih dahulu")
      return
    }
    if (items.length === 0) {
      toast.error("Tambahkan minimal satu barang belanjaan")
      return
    }
    if (!inspectorId) {
      toast.error("Pilih Guru Pengawas Pemeriksa")
      return
    }

    setSubmitting(true)
    const res = await submitProcurement(procurement.id)
    setSubmitting(false)
    setShowSubmitModal(false)

    if (res.ok) {
      toast.success(
        `Pengadaan berhasil diajukan! No BAP: ${res.data?.bapNumber}. Menunggu pemeriksaan Guru Pengawas.`
      )
      router.push(`/procurement/${procurement.id}`)
    } else {
      toast.error(res.error || "Gagal mengajukan dokumen")
    }
  }

  const isLocked = procurement?.status && procurement?.status !== "DRAFT" && procurement?.status !== "REJECTED"

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* ── Topbar Actions (Desktop & Mobile) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-ink">
            <Link href="/inventory" className="hover:text-ink">Inventaris</Link>
            <span>/</span>
            <span className="text-brand font-semibold">Pengadaan BOS</span>
          </div>
          <h2 className="text-[20px] lg:text-[24px] font-extrabold text-ink tracking-tight">
            Pengajuan Pengadaan Barang BOS
          </h2>
          <p className="text-[12px] text-muted-ink">
            Formulir pencatatan barang belanjaan Dana BOS bulanan sebelum diperiksa tim pengawas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={savingDraft || isLocked}
            className="gap-2"
          >
            {savingDraft ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>Simpan Draft</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (items.length === 0) {
                toast.error("Tambahkan minimal satu barang belanjaan terlebih dahulu")
                return
              }
              setShowSubmitModal(true)
            }}
            disabled={submitting || items.length === 0 || isLocked}
            className="gap-2"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            <span>Kirim ke Guru Pengawas</span>
          </Button>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start px-4 lg:px-0">
        {/* ── KOLOM KIRI (Informasi Berita Acara & Alur) ── */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 shrink-0">
          {/* Card Informasi */}
          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-line bg-surface">
              <div className="flex flex-col">
                <span className="text-[14.5px] font-bold text-ink">Informasi Berita Acara</span>
                <span className="text-[11px] text-muted-ink">Data ini tercetak pada dokumen BAP resmi.</span>
              </div>
              <Badge variant={procurement?.status === "SUBMITTED" ? "amber" : "secondary"}>
                {procurement?.status || "Draft"}
              </Badge>
            </div>

            <div className="p-4 flex flex-col gap-3.5">
              {/* Row Bulan & Tahun */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                    Bulan
                  </label>
                  <select
                    value={periodMonth}
                    disabled={isLocked}
                    onChange={(e) => setPeriodMonth(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-[10px] border border-line bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {MONTH_NAMES_ID.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                    Tahun
                  </label>
                  <select
                    value={periodYear}
                    disabled={isLocked}
                    onChange={(e) => setPeriodYear(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-[10px] border border-line bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nomor BAP Otomatis */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Nomor BAP (Otomatis)
                  </label>
                  <Badge variant="brand" className="text-[9px] py-0 px-1.5 h-4">
                    AUTO
                  </Badge>
                </div>
                <div className="flex items-center gap-2 h-10 px-3 rounded-[10px] border border-line bg-surface-2 text-xs font-mono font-bold text-ink">
                  <Lock className="size-3.5 text-muted-ink shrink-0" />
                  <span className="flex-1 truncate">
                    {procurement?.bapNumber || previewBapNumber}
                  </span>
                  <Check className="size-3.5 text-mint shrink-0" />
                </div>
              </div>

              {/* Guru Pengawas Pemeriksa */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                  Guru Pengawas Pemeriksa *
                </label>
                <div className="relative">
                  <select
                    value={inspectorId}
                    disabled={isLocked}
                    onChange={(e) => setInspectorId(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-[10px] border border-line bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {inspectors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name} ({ins.role === "ADMIN" ? "Admin" : "Guru"})
                      </option>
                    ))}
                  </select>
                  <UserCheck className="size-4 text-muted-ink absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Sumber Dana */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                  Sumber Dana
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" className="py-1 px-2.5 text-xs">
                    {source === "BOSP" ? "Dana BOSP 2026" : "Dana BOSP / BOS Reguler 2026"}
                  </Badge>
                </div>
              </div>

              {/* Catatan Pengadaan */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                  Catatan Pengadaan
                </label>
                <textarea
                  value={note}
                  disabled={isLocked}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Belanja rutin bulan ini untuk kebutuhan Lab. Software 1 dan ruang guru."
                  rows={3}
                  className="w-full p-2.5 rounded-[10px] border border-line bg-surface text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                />
              </div>
            </div>

            <div className="p-3 bg-surface-2 border-t border-line flex items-center justify-between text-[11px] text-muted-ink">
              <span>{procurement?.id ? "Draft tersimpan" : "Belum disimpan"}</span>
              {procurement?.id && (
                <Link
                  href={`/procurement/${procurement.id}`}
                  className="font-bold text-brand hover:underline"
                >
                  Pratinjau Lembar BAP →
                </Link>
              )}
            </div>
          </div>

          {/* Card Alur Verifikasi */}
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col gap-3">
            <span className="text-[13px] font-bold text-ink">Alur Verifikasi Dokumen</span>

            <div className="flex flex-col gap-2.5 text-[11.5px]">
              <div className="flex items-center gap-2.5">
                <div className="size-5 rounded-full bg-mint-soft grid place-items-center shrink-0">
                  <Check className="size-3 text-mint" />
                </div>
                <span className="flex-1 font-medium text-ink">Draft pengajuan belanja</span>
                <span className="text-[10px] font-bold text-mint">
                  {procurement?.status ? "Selesai" : "Aktif"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`size-5 rounded-full grid place-items-center shrink-0 ${
                    procurement?.status === "SUBMITTED"
                      ? "bg-brand-soft text-brand"
                      : "bg-surface-2 text-muted-ink"
                  }`}
                >
                  <Timer className="size-3" />
                </div>
                <span className="flex-1 font-medium text-ink">Pemeriksaan fisik oleh Guru</span>
                <span className="text-[10px] font-bold text-muted-ink">
                  {procurement?.status === "SUBMITTED"
                    ? "Menunggu"
                    : procurement?.status === "VERIFIED"
                    ? "Selesai"
                    : "Belum"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`size-5 rounded-full grid place-items-center shrink-0 ${
                    procurement?.status === "VERIFIED"
                      ? "bg-mint-soft text-mint"
                      : "bg-surface-2 text-muted-ink"
                  }`}
                >
                  <Archive className="size-3" />
                </div>
                <span className="flex-1 font-medium text-muted-ink">Disahkan &amp; Stok Masuk</span>
                <span className="text-[10px] font-bold text-muted-ink">
                  {procurement?.status === "VERIFIED" ? "Selesai" : "Belum"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── KOLOM KANAN (Daftar Barang Belanjaan) ── */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            {/* Header Daftar Barang */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="text-[14.5px] font-bold text-ink">Daftar Barang Belanjaan</span>
                <Badge variant="brand" className="text-[10px]">
                  {items.length} Jenis Barang
                </Badge>
              </div>

              {!isLocked && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenWarehouseModal}
                    className="gap-1.5"
                  >
                    <PackageSearch className="size-3.5" />
                    <span>Pilih dari Gudang</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAddNewModal}
                    className="gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    <span>Tambah Barang Baru</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Tabel Barang */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-2 border-b border-line text-[10px] font-bold uppercase tracking-wider text-muted-ink">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-20 text-center">Jenis</th>
                    <th className="py-2.5 px-3">Nama Barang &amp; Spesifikasi</th>
                    <th className="py-2.5 px-3 w-28">Kategori</th>
                    <th className="py-2.5 px-3 w-20 text-right">Jumlah</th>
                    <th className="py-2.5 px-3 w-20 text-center">Satuan</th>
                    {!isLocked && <th className="py-2.5 px-3 w-16 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isLocked ? 6 : 7}
                        className="py-12 text-center text-muted-ink"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Package className="size-8 text-muted-ink/40" />
                          <span className="font-semibold text-ink text-sm">
                            Belum Ada Barang yang Ditambahkan
                          </span>
                          <span className="text-xs text-muted-ink max-w-sm">
                            Klik tombol &quot;Pilih dari Gudang&quot; untuk barang lama atau &quot;Tambah Barang Baru&quot; untuk barang yang belum pernah dibeli.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((it: any, idx: number) => (
                      <tr key={it.id || idx} className="hover:bg-surface-2/40 transition-colors">
                        <td className="py-3 px-3 text-center text-muted-ink font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {it.kind === "BARU" ? (
                            <Badge variant="brand" className="text-[9px] py-0 px-1.5">
                              Baru
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] py-0 px-1.5">
                              Gudang
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-ink text-[12.5px]">{it.name}</div>
                          {it.specification && (
                            <div className="text-[10.5px] text-muted-ink">
                              {it.specification}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted-ink">
                          {it.categoryName || "Umum"}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-ink text-sm">
                          {it.quantity}
                        </td>
                        <td className="py-3 px-3 text-center text-ink-soft">
                          {it.unit || "Unit"}
                        </td>
                        {!isLocked && (
                          <td className="py-3 px-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(it.id)}
                              className="size-7 text-rose hover:bg-rose/10"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Ringkasan */}
            <div className="p-3.5 bg-surface-2 border-t border-line flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-ink font-medium">Total Barang:</span>
                <span className="font-extrabold text-ink text-sm">
                  {items.length} Jenis · {totalUnits} Unit
                </span>
              </div>
              <span className="text-[11px] text-muted-ink">
                Sumber Dana: {source === "BOSP" ? "BOSP" : "Dana BOS Reguler"} {periodYear}
              </span>
            </div>
          </div>

          {/* ── Rekomendasi Gudang (Quick Pick List) ── */}
          {!isLocked && warehouseSuggestions.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-ink">Stok Gudang Tersedia</span>
                  <span className="text-[10.5px] text-muted-ink">Barang yang sudah ada di inventaris sekolah.</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenWarehouseModal}
                  className="text-[11px] font-bold text-brand hover:underline"
                >
                  Lihat Semua Stok →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {warehouseSuggestions.slice(0, 3).map((wItem) => (
                  <div
                    key={wItem.id}
                    onClick={() => handleOpenWarehouseModal(wItem.id)}
                    className="p-3 rounded-xl border border-line bg-surface-2/60 hover:bg-surface-2 transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-bold text-ink truncate">
                        {wItem.name}
                      </span>
                      <span className="text-[10px] text-muted-ink truncate">
                        Stok Gudang: {wItem.quantity} unit · {wItem.category?.name || "Umum"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenWarehouseModal(wItem.id)
                      }}
                      className="size-7 shrink-0 text-brand"
                      title="Tambah ke pengajuan"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint Card */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-line/60 bg-surface-2 text-[11px] text-muted-ink">
            <Info className="size-4 text-brand shrink-0" />
            <span>
              Barang belanjaan baru akan otomatis dicatat ke Katalog Master Inventaris setelah BAP disahkan oleh Guru Pengawas.
            </span>
          </div>
        </div>
      </div>

      {/* ── Dialog Modals ── */}
      {procurement?.id && (
        <>
          <WarehouseQuickPickDialog
            open={openWarehousePick}
            onOpenChange={setOpenWarehousePick}
            procurementId={procurement.id}
            warehouseItems={warehouseSuggestions}
            defaultSelectedId={preselectedWarehouseId}
            onSuccess={handleItemsUpdated}
          />

          <AddNewItemDialog
            open={openAddNewItem}
            onOpenChange={setOpenAddNewItem}
            procurementId={procurement.id}
            categories={categories}
            onSuccess={handleItemsUpdated}
          />
        </>
      )}

      {/* Modal Konfirmasi Submit ke Guru */}
      <AlertDialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim ke Guru Pengawas?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen BAP periode {periodMonth}/{periodYear} akan diterbitkan dengan nomor resmi dan diserahkan kepada Guru Pengawas untuk pemeriksaan fisik di gudang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {submitting ? "Mengirim..." : "Ya, Kirim Pengajuan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
