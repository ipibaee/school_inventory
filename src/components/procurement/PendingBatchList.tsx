import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MONTH_NAMES_ID } from "@/lib/format"
import { Clock, CheckCircle2, ArrowRight } from "lucide-react"

interface PendingBatchListProps {
  pendingBatches: any[]
}

export function PendingBatchList({ pendingBatches }: PendingBatchListProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14.5px] font-bold text-ink">
            Pengadaan Menunggu Evaluasi
          </span>
          <span className="text-[11px] text-muted-ink">
            Daftar pengadaan yang sedang diproses
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {pendingBatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-ink">
            Tidak ada pengadaan yang sedang menunggu evaluasi.
          </div>
        ) : (
          pendingBatches.map((batch) => {
            const monthName = MONTH_NAMES_ID[batch.periodMonth - 1] || batch.periodMonth
            return (
              <div
                key={batch.id}
                className="p-3.5 rounded-xl border border-line bg-surface-2/60 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink text-xs">
                      {batch.bapNumber || "Draft Pengajuan"}
                    </span>
                    {batch.status === "SUBMITTED" ? (
                      <Badge variant="amber" className="text-[9px] py-0 px-1.5">
                        Menunggu Guru
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] py-0 px-1.5">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-ink mt-0.5">
                    Periode: {monthName} {batch.periodYear} · {batch._count?.items || 0} Barang
                  </span>
                  <span className="text-[10px] text-muted-ink">
                    Pengawas: {batch.inspector?.name || "Belum dipilih"}
                  </span>
                </div>

                <Link href={`/procurement/${batch.id}`}>
                  <Button variant="secondary" size="sm" className="h-7 text-xs gap-1 shrink-0">
                    <span>Lihat</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-auto p-3.5 bg-surface-2 border-t border-line text-center text-xs">
        <Link
          href="/procurement/archive"
          className="font-bold text-brand hover:underline"
        >
          Buka Arsip Lengkap →
        </Link>
      </div>
    </div>
  )
}
