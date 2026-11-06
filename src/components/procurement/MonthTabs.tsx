"use client"

import { useRouter, useSearchParams } from "next/navigation"

const MONTHS_SHORT = [
  { label: "Semua", value: 0 },
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "Mei", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Ags", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Okt", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Des", value: 12 },
]

export function MonthTabs({ selectedMonth }: { selectedMonth: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (monthVal: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (monthVal > 0) {
      params.set("month", monthVal.toString())
    } else {
      params.delete("month")
    }
    params.set("page", "1")
    router.push(`/procurement/archive?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
      {MONTHS_SHORT.map((m) => {
        const isActive = selectedMonth === m.value
        return (
          <button
            key={m.label}
            type="button"
            onClick={() => handleSelect(m.value)}
            className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all shrink-0 cursor-pointer ${
              isActive
                ? "bg-brand text-white shadow-none"
                : "bg-surface text-ink-soft border border-line hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
