"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleItemChecked, saveInspectorNote, publishBap } from "@/actions/procurement"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MONTH_NAMES_ID, formatDateTimeId } from "@/lib/format"
import { toast } from "sonner"
import {
  Check,
  ClipboardCheck,
  TriangleAlert,
  Lock,
  Loader2,
  FileText,
  ArrowLeft,
  CheckCircle2,
  PencilLine,
  ExternalLink,
} from "lucide-react"

interface ChecklistClientProps {
  procurement: any
  currentUserId?: string
}

export function ChecklistClient({ procurement, currentUserId }: ChecklistClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<any[]>(procurement.items || [])
  const [note, setNote] = useState(procurement.note || "")
  const [savingNote, setSavingNote] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Success dialog state
  const [successData, setSuccessData] = useState<{
    bapNumber: string
    qrToken: string
    verifiedAt: Date
  } | null>(null)

  const monthName = MONTH_NAMES_ID[procurement.periodMonth - 1] || procurement.periodMonth
  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length
  const isAllChecked = totalCount > 0 && checkedCount === totalCount
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  const handleToggle = async (item: any) => {
    const newChecked = !item.checked

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, checked: newChecked, checkedAt: newChecked ? new Date() : null } : i
      )
    )

    const res = await toggleItemChecked(item.id, newChecked, "BAIK")
    if (!res.ok) {
      toast.error(res.error || "Gagal mengubah status pemeriksaan")
      // Revert optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i))
      )
    }
  }

  const handleNoteBlur = async () => {
    setSavingNote(true)
    const res = await saveInspectorNote(procurement.id, note)
    setSavingNote(false)
    if (res.ok) {
      toast.success("Catatan berhasil disimpan")
    }
  }

  const handlePublish = async () => {
    if (!isAllChecked) {
      toast.error("Semua barang harus dicentang/diverifikasi sebelum disahkan")
      return
    }

    setPublishing(true)
    const res = await publishBap(procurement.id)
    setPublishing(false)

    if (!res.ok) {
      toast.error(res.error || "Gagal mengesahkan BAP")
      return
    }

    toast.success("BAP Berhasil Disahkan! Stok gudang telah diperbarui.")
    if (res.data) {
      setSuccessData({
        bapNumber: res.data.bapNumber,
        qrToken: res.data.qrToken,
        verifiedAt: new Date(),
      })
    }
  }

  return (
    <div className="flex flex-col gap-3.5 pb-24 max-w-[640px] mx-auto w-full px-4 sm:px-0">
      {/* ── Banner Periode ── */}
      <div className="rounded-2xl border border-line bg-brand-soft/60 dark:bg-brand/10 p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="size-4 text-brand" />
          <span className="text-[12.5px] font-bold text-brand-deep dark:text-[#8AB4F8]">
            Periode: {monthName} {procurement.periodYear}
          </span>
        </div>
        <p className="text-[11px] text-brand-deep/80 dark:text-[#8AB4F8]/80 leading-relaxed">
          {totalCount} Jenis Barang ({procurement.totalUnits || items.reduce((a, b) => a + (b.quantity || 0), 0)} Unit).
          Silakan periksa fisik barang di gudang sekolah sebelum disahkan.
        </p>
      </div>

      {/* ── Checklist Cards Per Barang ── */}
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isChecked = !!item.checked
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item)}
              className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col gap-2.5 ${
                isChecked
                  ? "border-mint/40 bg-surface shadow-xs"
                  : "border-line bg-surface hover:bg-surface-2"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Custom Checkbox */}
                <div
                  className={`size-6 rounded-[8px] flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                    isChecked
                      ? "bg-brand text-white border-none"
                      : "border-[1.5px] border-line bg-surface"
                  }`}
                >
                  {isChecked && <Check className="size-4 stroke-[3]" />}
                </div>

                {/* Info Barang */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    {item.kind === "BARU" ? (
                      <Badge variant="brand" className="text-[9px] py-0 px-1.5">
                        Barang Baru
                      </Badge>
                    ) : (
                      <Badge variant="mint" className="text-[9px] py-0 px-1.5">
                        Stok Gudang
                      </Badge>
                    )}
                    {item.barcode && (
                      <span className="text-[10px] font-mono text-muted-ink">
                        {item.barcode}
                      </span>
                    )}
                  </div>

                  <h4 className="text-[13.5px] font-bold text-ink leading-tight">
                    {item.name}
                  </h4>

                  {item.specification && (
                    <p className="text-[11px] text-muted-ink leading-tight">
                      {item.specification}
                    </p>
                  )}
                </div>

                {/* Qty */}
                <div className="shrink-0 text-right">
                  <span className="text-[13px] font-extrabold text-ink">
                    {item.quantity} {item.unit || "Unit"}
                  </span>
                </div>
              </div>

              {/* Bottom Card: Status Kondisi */}
              <div className="flex items-center justify-between pt-2 border-t border-line/60 text-[10.5px]">
                {isChecked ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-mint">
                    <Check className="size-3" />
                    Kondisi Fisik Baik
                  </span>
                ) : (
                  <span className="text-muted-ink font-medium">
                    Belum diperiksa fisik
                  </span>
                )}

                <span className="text-muted-ink text-[10px]">
                  {isChecked ? "Sudah diverifikasi" : "Menunggu verifikasi"}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Catatan Pemeriksa ── */}
      <div className="rounded-2xl border border-line bg-surface p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-ink">
            Catatan Pemeriksa (Opsional)
          </span>
          {savingNote && (
            <span className="text-[10px] text-brand flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" /> Menyimpan...
            </span>
          )}
        </div>
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Tuliskan catatan kondisi fisik atau kelengkapan jika ada..."
            rows={2}
            className="w-full p-2.5 rounded-[10px] border border-line bg-surface-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
          />
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="fixed bottom-[62px] inset-x-0 bg-surface/95 backdrop-blur-md border-t border-line p-3 z-30 max-w-[640px] mx-auto">
        <div className="flex flex-col gap-2">
          {/* Progress row */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-ink-soft">
              {checkedCount} dari {totalCount} barang terverifikasi
            </span>
            <span className="text-brand font-bold">{progressPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Button Sahkan & Terbitkan */}
          <Button
            type="button"
            variant="primary"
            disabled={!isAllChecked || publishing}
            onClick={handlePublish}
            className={`w-full h-11 text-xs font-bold gap-2 ${
              isAllChecked
                ? "bg-[#0EA47A] hover:bg-[#0EA47A]/90 text-white"
                : "bg-surface-2 text-muted-ink border border-line"
            }`}
          >
            {publishing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isAllChecked ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
            <span>
              {isAllChecked
                ? "Sahkan & Terbitkan BAP Sekarang"
                : "Centang Semua Barang untuk Mengesahkan"}
            </span>
          </Button>
        </div>
      </div>

      {/* ── MODAL DIALOG PENGESAHAN BERHASIL ── */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[360px] rounded-[18px] border border-line bg-surface p-6 shadow-2xl flex flex-col items-center text-center gap-3 animate-slide-up">
            <div className="size-14 rounded-full bg-mint-soft grid place-items-center text-mint shrink-0">
              <Check className="size-7 stroke-[3]" />
            </div>

            <h3 className="text-[17px] font-extrabold text-ink leading-tight">
              Pengesahan Berhasil!
            </h3>

            <p className="text-[11px] text-muted-ink leading-relaxed">
              BAP Pengadaan BOS Bulan {monthName} {procurement.periodYear} telah sah. Stok barang otomatis masuk ke gudang.
            </p>

            <div className="w-full p-3 rounded-xl bg-surface-2 border border-line text-left flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-ink">No. BAP:</span>
                <span className="font-mono font-bold text-ink">{successData.bapNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-ink">Waktu Sah:</span>
                <span className="font-semibold text-ink text-[10.5px]">
                  {formatDateTimeId(successData.verifiedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-ink">Token QR:</span>
                <span className="font-mono text-[9.5px] text-brand truncate max-w-[140px]">
                  {successData.qrToken}
                </span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 mt-1">
              <Link href={`/procurement/${procurement.id}`} className="w-full">
                <Button variant="primary" className="w-full text-xs font-bold gap-1.5 h-9">
                  <FileText className="size-3.5" />
                  <span>Lihat Surat BAP Resmi &amp; Cetak</span>
                </Button>
              </Link>

              <a
                href={`/verify/${successData.qrToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full text-xs font-semibold gap-1.5 h-9 text-brand border-brand/30 hover:bg-brand-soft/40">
                  <ExternalLink className="size-3.5" />
                  <span>Uji Halaman Verifikasi QR Daring</span>
                </Button>
              </a>

              <Link href="/dashboard" className="w-full">
                <Button variant="secondary" className="w-full text-xs font-semibold gap-1.5 h-9">
                  <ArrowLeft className="size-3.5" />
                  <span>Kembali ke Dasbor</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
