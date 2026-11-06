import { notFound } from "next/navigation"
import Link from "next/link"
import { getProcurementDetail } from "@/lib/queries/procurement"
import { getSchoolSettings } from "@/actions/settings"
import { bapQrSvg } from "@/lib/qr"
import { BapDocument } from "@/components/procurement/BapDocument"
import { BapPrintButton } from "@/components/procurement/BapPrintButton"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateId, formatDateTimeId } from "@/lib/format"
import { getCurrentUser } from "@/lib/guard"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  History,
  FileCheck2,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [bap, schoolSettings, currentUser] = await Promise.all([
    getProcurementDetail(id),
    getSchoolSettings(),
    getCurrentUser(),
  ])

  if (!bap) {
    notFound()
  }

  const qrSvg = bap.qrToken ? await bapQrSvg(bap.qrToken) : undefined

  const statusBadge = () => {
    switch (bap.status) {
      case "VERIFIED":
        return <Badge variant="mint">Terverifikasi Sah</Badge>
      case "SUBMITTED":
        return <Badge variant="amber">Menunggu Pemeriksaan</Badge>
      case "REJECTED":
        return <Badge variant="rose">Perlu Revisi</Badge>
      default:
        return <Badge variant="secondary">Draft Pengajuan</Badge>
    }
  }

  const isInspector =
    currentUser?.id === bap.inspectorId ||
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "TEACHER"

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* ── Desktop Topbar ── */}
      <div className="hidden lg:block no-print">
        <PageHeader
          title={bap.bapNumber || "Berita Acara Penerimaan"}
          subtitle={`Periode ${bap.periodMonth}/${bap.periodYear} · Dibuat oleh ${bap.createdBy?.name || "Admin"}`}
          actions={
            <div className="flex items-center gap-2.5">
              <Link href="/procurement/archive">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <ArrowLeft className="size-3.5" />
                  <span>Kembali ke Arsip</span>
                </Button>
              </Link>

              {bap.status === "SUBMITTED" && isInspector && (
                <Link href={`/procurement/${bap.id}/check`}>
                  <Button variant="primary" size="sm" className="gap-1.5 bg-[#0EA47A] hover:bg-[#0EA47A]/90">
                    <FileCheck2 className="size-3.5" />
                    <span>Lakukan Pemeriksaan Fisik</span>
                  </Button>
                </Link>
              )}

              {bap.status === "DRAFT" && (
                <Link href="/procurement">
                  <Button variant="secondary" size="sm">
                    Edit Draft
                  </Button>
                </Link>
              )}

              <BapPrintButton
                bap={bap}
                schoolSettings={schoolSettings}
                qrSvg={qrSvg}
                label="Cetak Lembar BAP (A4)"
              />
            </div>
          }
        />
      </div>

      {/* ── Mobile App Bar ── */}
      <div className="lg:hidden no-print">
        <MobileAppBar
          title="Dokumen BAP"
          subtitle={bap.bapNumber || "Draft BAP"}
          back="/procurement/archive"
          actions={
            <BapPrintButton
              bap={bap}
              schoolSettings={schoolSettings}
              qrSvg={qrSvg}
              label="Cetak"
            />
          }
        />
      </div>

      {/* ── Status Banner (no-print) ── */}
      <div className="no-print mx-4 lg:mx-0 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-3">
          {statusBadge()}
          <span className="text-[12px] text-muted-ink">
            {bap.status === "VERIFIED" &&
              `Disahkan pada ${formatDateTimeId(bap.verifiedAt)} oleh ${bap.verifiedBy?.name || "Guru Pengawas"}`}
            {bap.status === "SUBMITTED" &&
              `Menunggu verifikasi fisik oleh ${bap.inspector?.name || "Guru Pengawas"}`}
            {bap.status === "DRAFT" && "Dokumen masih dalam bentuk draft penyusunan barang."}
            {bap.status === "REJECTED" && `Ditolak/revisi: ${bap.rejectNote || "Perlu penyesuaian"}`}
          </span>
        </div>

        {bap.status === "SUBMITTED" && isInspector && (
          <Link href={`/procurement/${bap.id}/check`} className="lg:hidden">
            <Button size="sm" variant="primary" className="bg-[#0EA47A] text-xs">
              Mulai Periksa Fisik
            </Button>
          </Link>
        )}
      </div>

      {/* ── Lembar Dokumen A4 Terpusat ── */}
      <div className="flex justify-center overflow-x-auto p-2 sm:p-4">
        <div className="shadow-lg border border-line/60 rounded-[3px] bg-white transition-transform origin-top">
          <BapDocument
            bap={bap}
            schoolSettings={schoolSettings}
            qrSvg={qrSvg}
          />
        </div>
      </div>

      {/* ── Riwayat Log Aktivitas Dokumen (no-print) ── */}
      {bap.logs && bap.logs.length > 0 && (
        <div className="no-print mx-4 lg:mx-0 mt-4 rounded-2xl border border-line bg-surface p-5 max-w-[800px] w-full self-center">
          <div className="flex items-center gap-2 mb-3.5">
            <History className="size-4 text-brand" />
            <h3 className="text-[13.5px] font-bold text-ink">Riwayat Audit Dokumen</h3>
          </div>

          <div className="flex flex-col gap-2.5">
            {bap.logs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-4 py-2 border-b border-line/60 last:border-b-0 text-[11.5px]"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">
                    {log.action === "CREATED" && "Dokumen dibuat"}
                    {log.action === "UPDATED" && "Data pengadaan diperbarui"}
                    {log.action === "ITEM_ADDED" && "Penambahan barang"}
                    {log.action === "ITEM_REMOVED" && "Penghapusan barang"}
                    {log.action === "SUBMITTED" && "Diajukan ke Guru Pengawas"}
                    {log.action === "PUBLISHED" && "Disahkan & Terbit BAP (Stok Masuk Gudang)"}
                    {log.action === "REJECTED" && "Pengajuan ditolak / perlu revisi"}
                  </span>
                  <span className="text-[10.5px] text-muted-ink">{log.note}</span>
                </div>
                <span className="text-[10px] text-muted-ink shrink-0 font-mono">
                  {formatDateTimeId(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
