"use client"

import React, { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { getBapArchiveData } from "@/actions/procurement"
import { MonthTabs } from "@/components/procurement/MonthTabs"
import { ArchiveTable } from "@/components/procurement/ArchiveTable"
import { Button } from "@/components/ui/button"
import { Calendar, Search, Plus, Loader2 } from "lucide-react"

export function BapArchiveReport() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [data, setData] = useState<any>({
    data: [],
    total: 0,
    totalPages: 1,
    summary: { totalBap: 0, totalUnits: 0 },
  })
  const [isPending, startTransition] = useTransition()

  const loadData = (year: number, month: number, q: string, p: number) => {
    startTransition(async () => {
      const result = await getBapArchiveData({
        year,
        month,
        q: q.trim() || undefined,
        page: p,
      })
      setData(result)
    })
  }

  useEffect(() => {
    loadData(selectedYear, selectedMonth, searchQuery, page)
  }, [selectedYear, selectedMonth, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadData(selectedYear, selectedMonth, searchQuery, 1)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Month pill tabs */}
          <div className="flex-1 min-w-0">
            <MonthTabs
              selectedMonth={selectedMonth}
              onSelect={(m) => {
                setSelectedMonth(m)
                setPage(1)
              }}
            />
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1.5 shrink-0 bg-surface border border-line rounded-[10px] px-3 py-1.5 text-xs text-ink font-semibold">
            <Calendar className="size-3.5 text-muted-ink" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value))
                setPage(1)
              }}
              className="bg-transparent border-0 outline-none cursor-pointer text-xs font-semibold text-ink"
            >
              {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(
                (yr) => (
                  <option key={yr} value={yr} className="bg-surface text-ink">
                    Tahun {yr}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Filter Summary Banner & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-line bg-surface text-xs text-muted-ink">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Total Dokumen Tahun {selectedYear}:{" "}
              <strong className="text-ink font-bold">
                {data.summary?.totalBap || 0} Berita Acara
              </strong>
            </span>
            <span className="text-line">•</span>
            <span>
              Total Volume Diterima:{" "}
              <strong className="text-brand font-bold">
                {data.summary?.totalUnits || 0} Unit
              </strong>
            </span>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center w-full sm:w-[220px]"
          >
            <Search className="absolute left-3 size-3.5 text-muted-ink pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor BAP atau guru..."
              className="h-8 w-full rounded-[8px] border border-line bg-surface-2 pl-8 pr-3 text-[11.5px] text-ink placeholder:text-muted-ink outline-none focus:border-brand"
            />
          </form>
        </div>
      </div>

      {/* ── Data List ── */}
      {isPending ? (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 text-brand animate-spin" />
          <span className="text-xs text-muted-ink">Memuat data arsip BAP...</span>
        </div>
      ) : (
        <ArchiveTable baps={data.data || []} />
      )}

      {/* ── Quick Action Bottom ── */}
      <div className="flex items-center justify-between text-xs text-muted-ink px-1 pt-1 print:hidden">
        <span>
          Menampilkan {(data.data || []).length} dari {data.total || 0} dokumen BAP
        </span>
        <Link href="/procurement">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Plus className="size-3.5" />
            <span>Buat Pengadaan BOS Baru</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
