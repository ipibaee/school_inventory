import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MONTH_NAMES_ID } from "@/lib/format"

interface MonthlyRealizationChartProps {
  realization: Array<{
    month: number
    units: number
    id?: string
    bapNumber?: string
  }>
  totalUnitsYear: number
  year: number
}

export function MonthlyRealizationChart({
  realization,
  totalUnitsYear,
  year,
}: MonthlyRealizationChartProps) {
  // Hitung nilai maksimum untuk persentase bar
  const maxUnits = Math.max(1, ...realization.map((r) => r.units))
  const avgUnits = Math.round((totalUnitsYear / 12) * 10) / 10

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14.5px] font-bold text-ink">
            Realisasi Pengadaan Barang Bulanan
          </span>
          <span className="text-[11px] text-muted-ink">
            Jumlah unit barang belanja Dana BOS {year} yang disahkan
          </span>
        </div>
        <Badge variant="brand" className="text-xs">
          Total {totalUnitsYear} Unit
        </Badge>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-2">
        {realization.map((item) => {
          const monthName = MONTH_NAMES_ID[item.month - 1]
          const pct = Math.round((item.units / maxUnits) * 100)
          const isHighlight = item.units > 0 && item.month === new Date().getMonth() + 1

          return (
            <div
              key={item.month}
              className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors ${
                isHighlight ? "bg-brand-soft/70 dark:bg-brand/15" : "hover:bg-surface-2"
              }`}
            >
              <span className={`w-8 text-[11px] font-bold shrink-0 ${isHighlight ? "text-brand" : "text-ink-soft"}`}>
                {monthName.slice(0, 3)}
              </span>

              {/* Progress track */}
              <div className="flex-1 h-2 rounded-full bg-surface-2 border border-line/40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isHighlight ? "bg-brand" : "bg-brand/35"
                  }`}
                  style={{ width: `${item.units === 0 ? 0 : Math.max(4, pct)}%` }}
                />
              </div>

              {/* Qty value */}
              <span className="w-8 text-right text-[11.5px] font-bold text-ink shrink-0">
                {item.units}
              </span>

              {/* Action link */}
              <div className="w-16 text-right shrink-0">
                {item.id ? (
                  <Link
                    href={`/procurement/${item.id}`}
                    className="text-[10px] font-bold text-brand hover:underline"
                  >
                    Lihat BAP
                  </Link>
                ) : (
                  <span className="text-[10px] text-muted-ink/40">-</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-auto p-3.5 bg-surface-2 border-t border-line flex items-center justify-between text-xs text-muted-ink">
        <span>Rata-rata {avgUnits} unit per bulan</span>
        <Link
          href={`/procurement/archive?year=${year}`}
          className="font-bold text-brand hover:underline"
        >
          Lihat Semua Arsip →
        </Link>
      </div>
    </div>
  )
}
