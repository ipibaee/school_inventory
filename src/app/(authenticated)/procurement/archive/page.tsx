import Link from "next/link"
import { listBaps, getBapSummary } from "@/lib/queries/procurement"
import { MonthTabs } from "@/components/procurement/MonthTabs"
import { ArchiveTable } from "@/components/procurement/ArchiveTable"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProcurementArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const currentYear = new Date().getFullYear()

  const selectedYear = params.year ? parseInt(params.year) : currentYear
  const selectedMonth = params.month ? parseInt(params.month) : 0
  const page = params.page ? parseInt(params.page) : 1

  const [{ data: baps, total }, summary] = await Promise.all([
    listBaps({
      year: selectedYear,
      month: selectedMonth,
      q: params.q,
      page,
      perPage: 15,
    }),
    getBapSummary({ year: selectedYear }),
  ])

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* ── Desktop PageHeader ── */}
      <div className="hidden lg:block">
        <PageHeader
          title="Arsip BAP Pengadaan"
          subtitle="Riwayat Berita Acara Penerimaan barang inventaris sekolah per bulan."
          actions={
            <div className="flex items-center gap-2.5">
              <Link href="/procurement">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="size-3.5" />
                  <span>Buat Pengadaan Baru</span>
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* ── Mobile AppBar ── */}
      <div className="lg:hidden">
        <MobileAppBar
          title="Arsip BAP"
          subtitle={`Tahun ${selectedYear} · ${summary.totalBap} Dokumen`}
          back="/procurement"
          actions={
            <Link href="/procurement">
              <Button variant="primary" size="sm" className="h-8 px-2 text-xs">
                <Plus className="size-3.5" />
              </Button>
            </Link>
          }
        />
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-3 px-4 lg:px-0">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Month pill tabs */}
          <div className="flex-1 min-w-0">
            <MonthTabs selectedMonth={selectedMonth} />
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1.5 shrink-0 bg-surface border border-line rounded-[10px] px-3 py-1.5 text-xs text-ink font-semibold">
            <Calendar className="size-3.5 text-muted-ink" />
            <span>Tahun {selectedYear}</span>
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-line bg-surface text-xs text-muted-ink">
          <span>
            Total Dokumen Tahun {selectedYear}:{" "}
            <strong className="text-ink font-bold">{summary.totalBap} Berita Acara</strong>
          </span>
          <span>
            Total Volume Barang Diterima:{" "}
            <strong className="text-brand font-bold">{summary.totalUnits} Unit</strong>
          </span>
        </div>
      </div>

      {/* ── Data Table / Cards ── */}
      <div className="px-4 lg:px-0">
        <ArchiveTable baps={baps} />
      </div>
    </div>
  )
}
