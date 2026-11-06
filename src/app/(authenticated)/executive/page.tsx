import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/guard"
import {
  getExecutiveOverview,
  getMonthlyRealization,
  getPendingBatches,
} from "@/lib/queries/procurement"
import { ExecutiveKpiCard } from "@/components/procurement/ExecutiveKpiCard"
import { MonthlyRealizationChart } from "@/components/procurement/MonthlyRealizationChart"
import { PendingBatchList } from "@/components/procurement/PendingBatchList"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Boxes,
  ShoppingCart,
  ShieldCheck,
  ArrowRightLeft,
  Calendar,
  Printer,
  Shield,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ExecutiveDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  // Hanya HEADMASTER dan ADMIN yang boleh mengakses
  if (user.role !== "HEADMASTER" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const params = await searchParams
  const currentYear = new Date().getFullYear()
  const year = params.year ? parseInt(params.year) : currentYear
  const month = new Date().getMonth() + 1

  const [overview, realization, pendingBatches] = await Promise.all([
    getExecutiveOverview({ year, month }),
    getMonthlyRealization({ year }),
    getPendingBatches({ limit: 4 }),
  ])

  const bapStatusLabel = () => {
    if (!overview.currentMonthBap) return "Belum Diajukan"
    if (overview.currentMonthBap.status === "VERIFIED") return "Sah & Lengkap"
    if (overview.currentMonthBap.status === "SUBMITTED") return "Menunggu Guru"
    return "Draft"
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* ── Desktop PageHeader ── */}
      <div className="hidden lg:block">
        <PageHeader
          title="Dasbor Monitoring Eksekutif"
          subtitle="Ringkasan aset sekolah dan realisasi pengadaan barang Dana BOS."
          actions={
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-surface border border-line rounded-[10px] px-3 py-1.5 text-xs text-ink font-semibold">
                <Calendar className="size-3.5 text-muted-ink" />
                <span>Tahun {year}</span>
              </div>

              <Link href={`/procurement/archive?year=${year}`}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Printer className="size-3.5" />
                  <span>Cetak Arsip BAP</span>
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* ── Mobile AppBar ── */}
      <div className="lg:hidden">
        <MobileAppBar
          title="Dasbor Eksekutif"
          subtitle="Monitoring Aset & Dana BOS"
          actions={
            <Link href={`/procurement/archive?year=${year}`}>
              <Button variant="primary" size="sm" className="h-8 px-2 text-xs">
                <Printer className="size-3.5" />
              </Button>
            </Link>
          }
        />
      </div>

      {/* Mode Badge Banner */}
      <div className="mx-4 lg:mx-0 flex items-center justify-between p-3 rounded-xl border border-line bg-surface text-xs">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-brand" />
          <span className="font-bold text-ink">Mode Kepala Sekolah (Eksekutif)</span>
          <span className="text-muted-ink hidden sm:inline">
            · Tampilan pemantauan realisasi aset dan belanja BOS
          </span>
        </div>
        <Badge variant="mint" className="text-[10px]">
          Aktif
        </Badge>
      </div>

      {/* ── 4 KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 px-4 lg:px-0">
        <ExecutiveKpiCard
          label="Total Aset Terdata"
          value={overview.totalAssetsCount}
          unit="Unit"
          caption={`${overview.totalAssetCategories} kategori inventaris`}
          icon={<Boxes className="size-4" />}
          variant="brand"
        />

        <ExecutiveKpiCard
          label="Pengadaan BOS Bulan Ini"
          value={overview.currentMonthBap?.totalUnits || 0}
          unit="Unit"
          caption={`Bulan ${month} Tahun ${year}`}
          icon={<ShoppingCart className="size-4" />}
          variant="brand"
        />

        <ExecutiveKpiCard
          label="Status BAP Bulan Ini"
          value={
            <Badge
              variant={
                overview.currentMonthBap?.status === "VERIFIED"
                  ? "mint"
                  : overview.currentMonthBap?.status === "SUBMITTED"
                  ? "amber"
                  : "secondary"
              }
              className="text-xs py-0.5 px-2 font-bold"
            >
              {bapStatusLabel()}
            </Badge>
          }
          caption={
            overview.currentMonthBap?.inspector
              ? `Pengawas: ${overview.currentMonthBap.inspector.name}`
              : "Belum diajukan"
          }
          icon={<ShieldCheck className="size-4" />}
          variant="mint"
        />

        <ExecutiveKpiCard
          label="Barang Sedang Dipinjam"
          value={overview.activeLoansCount}
          unit="Unit"
          caption="Peminjaman aktif siswa/guru"
          icon={<ArrowRightLeft className="size-4" />}
          variant="amber"
        />
      </div>

      {/* ── 2 COLUMN BODY: REALISASI BULANAN & MENUNGGU EVALUASI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-0">
        <div className="lg:col-span-2">
          <MonthlyRealizationChart
            realization={realization}
            totalUnitsYear={overview.totalUnitsYear}
            year={year}
          />
        </div>

        <div>
          <PendingBatchList pendingBatches={pendingBatches} />
        </div>
      </div>
    </div>
  )
}
