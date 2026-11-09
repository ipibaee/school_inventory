"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateId, MONTH_NAMES_ID } from "@/lib/format"
import { FileText, Printer, ArrowRight, ScanBarcode } from "lucide-react"

interface ArchiveTableProps {
  baps: any[]
}

export function ArchiveTable({ baps }: ArchiveTableProps) {
  if (baps.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center flex flex-col items-center justify-center gap-2">
        <FileText className="size-8 text-muted-ink/40" />
        <span className="font-bold text-ink text-sm">
          Tidak Ada Dokumen BAP pada Periode Ini
        </span>
        <span className="text-xs text-muted-ink max-w-sm">
          Gunakan filter bulan lain atau buat pengajuan pengadaan baru pada menu Pengadaan BOS.
        </span>
      </div>
    )
  }

  const renderBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="mint">Terverifikasi Sah</Badge>
      case "SUBMITTED":
        return <Badge variant="amber">Menunggu Guru</Badge>
      case "REJECTED":
        return <Badge variant="rose">Perlu Revisi</Badge>
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  return (
    <>
      {/* ── Desktop Table View (≥1024px) ── */}
      <div className="hidden lg:block rounded-2xl border border-line bg-surface overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-2 border-b border-line text-[10px] font-bold uppercase tracking-wider text-muted-ink">
              <th className="py-3 px-4">No. BAP</th>
              <th className="py-3 px-3">Periode</th>
              <th className="py-3 px-3">Tanggal Sah</th>
              <th className="py-3 px-3">Guru Pengawas</th>
              <th className="py-3 px-3 text-right">Total Barang</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {baps.map((bap) => {
              const monthName = MONTH_NAMES_ID[bap.periodMonth - 1] || bap.periodMonth
              const totalItems = bap._count?.items || bap.items?.length || 0
              const totalUnits = bap.totalUnits || bap.items?.reduce((a: number, b: any) => a + (b.quantity || 0), 0) || 0

              return (
                <tr key={bap.id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-ink text-[12.5px]">
                    <Link
                      href={`/procurement/${bap.id}`}
                      className="hover:text-brand hover:underline"
                    >
                      {bap.bapNumber || "DRAFT (Belum Sah)"}
                    </Link>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-ink">
                    {monthName} {bap.periodYear}
                  </td>
                  <td className="py-3.5 px-3 text-muted-ink">
                    {bap.verifiedAt ? formatDateId(bap.verifiedAt, "dd MMM yyyy") : "-"}
                  </td>
                  <td className="py-3.5 px-3 text-ink-soft font-medium">
                    {bap.verifiedBy?.name || bap.inspector?.name || "Belum ditunjuk"}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="font-extrabold text-ink text-sm">
                      {totalUnits}
                    </span>{" "}
                    <span className="text-[10.5px] text-muted-ink">Unit ({totalItems} jenis)</span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {renderBadge(bap.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {bap.status === "VERIFIED" && (
                        <Link href={`/procurement/${bap.id}/barcode`}>
                          <Button variant="secondary" size="sm" className="h-7 text-xs px-2.5 gap-1 text-brand hover:text-brand-dark">
                            <ScanBarcode className="size-3" />
                            <span>Barcode</span>
                          </Button>
                        </Link>
                      )}
                      <Link href={`/procurement/${bap.id}`}>
                        <Button variant="secondary" size="sm" className="h-7 text-xs px-2.5 gap-1">
                          <Printer className="size-3 text-muted-ink" />
                          <span>Cetak BAP</span>
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List View (<1024px) ── */}
      <div className="lg:hidden flex flex-col gap-3">
        {baps.map((bap) => {
          const monthName = MONTH_NAMES_ID[bap.periodMonth - 1] || bap.periodMonth
          const totalUnits = bap.totalUnits || bap.items?.reduce((a: number, b: any) => a + (b.quantity || 0), 0) || 0

          return (
            <div
              key={bap.id}
              className="rounded-2xl border border-line bg-surface p-4 flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-ink text-[13px]">
                    {bap.bapNumber || "DRAFT DOKUMEN"}
                  </span>
                  <span className="text-[11px] text-muted-ink">
                    Periode: {monthName} {bap.periodYear}
                  </span>
                </div>
                {renderBadge(bap.status)}
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-y border-line/60">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-ink">Pemeriksa:</span>
                  <span className="font-medium text-ink">
                    {bap.verifiedBy?.name || bap.inspector?.name || "Belum ditunjuk"}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted-ink">Volume Belanja:</span>
                  <span className="font-bold text-ink text-sm">
                    {totalUnits} Unit
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-ink font-mono">
                  {bap.verifiedAt ? formatDateId(bap.verifiedAt, "dd/MM/yyyy") : "Belum disahkan"}
                </span>

                <Link href={`/procurement/${bap.id}`}>
                  <Button variant="secondary" size="sm" className="h-7 text-xs gap-1">
                    <span>Lihat &amp; Cetak</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
