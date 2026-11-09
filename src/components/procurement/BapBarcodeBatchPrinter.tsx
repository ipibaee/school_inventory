"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import Barcode from "react-barcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import {
  Printer,
  ArrowLeft,
  Settings2,
  Package,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react"

interface BapItem {
  id: string
  name: string
  specification?: string | null
  categoryName?: string | null
  quantity: number
  unit: string
  barcode?: string | null
}

interface BapBarcodeBatchPrinterProps {
  procurement: {
    id: string
    bapNumber?: string | null
    periodMonth: number
    periodYear: number
    source: string
    items: BapItem[]
    verifiedAt?: string | Date | null
  }
  schoolSettings?: {
    schoolName?: string | null
    logoUrl?: string | null
  } | null
}

interface PrintableLabel {
  key: string
  itemName: string
  barcode: string
  unitIndex: number
  totalUnits: number
  categoryName: string
}

export function BapBarcodeBatchPrinter({
  procurement,
  schoolSettings,
}: BapBarcodeBatchPrinterProps) {
  // Mapping item selection dan jumlah cetak per item
  const [itemSelections, setItemSelections] = useState<
    Record<string, { selected: boolean; count: number }>
  >(() => {
    const initial: Record<string, { selected: boolean; count: number }> = {}
    procurement.items.forEach((item) => {
      initial[item.id] = {
        selected: true,
        count: Math.max(1, item.quantity || 1),
      }
    })
    return initial
  })

  // Pengaturan Ukuran Label Stiker (Standar Thermal 2 Kolom)
  const [labelWidth, setLabelWidth] = useState(33) // mm
  const [labelHeight, setLabelHeight] = useState(15) // mm
  const [gapSize, setGapSize] = useState(2) // mm
  const [showSettings, setShowSettings] = useState(false)
  const [includeLogo, setIncludeLogo] = useState(true)

  const printRef = useRef<HTMLDivElement>(null)

  // Toggle select all
  const allSelected = procurement.items.every(
    (it) => itemSelections[it.id]?.selected
  )
  const toggleSelectAll = () => {
    const nextState = !allSelected
    setItemSelections((prev) => {
      const updated = { ...prev }
      procurement.items.forEach((it) => {
        updated[it.id] = {
          ...updated[it.id],
          selected: nextState,
        }
      })
      return updated
    })
  }

  // Toggle individual item
  const toggleItem = (itemId: string) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selected: !prev[itemId]?.selected,
      },
    }))
  }

  // Update print count for an item
  const updateCount = (itemId: string, count: number) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        count: Math.max(1, count),
      },
    }))
  }

  // Buat daftar semua label individual yang akan dicetak
  const labelsToPrint: PrintableLabel[] = []
  procurement.items.forEach((item) => {
    const sel = itemSelections[item.id]
    if (sel?.selected && sel.count > 0) {
      const barcodeValue = item.barcode || item.id.slice(-6).toUpperCase()
      for (let i = 1; i <= sel.count; i++) {
        labelsToPrint.push({
          key: `${item.id}-${i}`,
          itemName: item.name,
          barcode: barcodeValue,
          unitIndex: i,
          totalUnits: sel.count,
          categoryName: item.categoryName || "Umum",
        })
      }
    }
  })

  // Kelompokkan dalam pasangan 2 kolom untuk baris cetak stiker
  const chunkedLabels: (PrintableLabel | null)[][] = []
  for (let i = 0; i < labelsToPrint.length; i += 2) {
    chunkedLabels.push([
      labelsToPrint[i],
      labelsToPrint[i + 1] ? labelsToPrint[i + 1] : null,
    ])
  }

  const totalPageWidth = labelWidth * 2 + gapSize

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page {
        size: ${totalPageWidth}mm ${labelHeight}mm;
        margin: 0 !important;
      }
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  })

  return (
    <div className="flex flex-col gap-4 pb-16">
      {/* ── Header Desktop ── */}
      <div className="hidden lg:block no-print">
        <PageHeader
          title="Cetak Label Barcode Barang BOS"
          subtitle={`No. BAP: ${procurement.bapNumber || "Pengadaan BOS"} · Layout Stiker 2 Kolom Otomatis`}
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/procurement/${procurement.id}`}>
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <ArrowLeft className="size-3.5" />
                  <span>Kembali ke BAP</span>
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="gap-1.5 text-xs"
              >
                <Settings2 className="size-3.5" />
                <span>Pengaturan Stiker</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => handlePrint()}
                disabled={labelsToPrint.length === 0}
                className="gap-2 text-xs"
              >
                <Printer className="size-4" />
                <span>Cetak {labelsToPrint.length} Stiker Barcode</span>
              </Button>
            </div>
          }
        />
      </div>

      {/* ── Header Mobile ── */}
      <div className="lg:hidden no-print">
        <MobileAppBar
          title="Cetak Label Barcode"
          subtitle={procurement.bapNumber || "Barang BOS"}
          back={`/procurement/${procurement.id}`}
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => handlePrint()}
              disabled={labelsToPrint.length === 0}
              className="gap-1.5 text-xs"
            >
              <Printer className="size-3.5" />
              <span>Cetak ({labelsToPrint.length})</span>
            </Button>
          }
        />
      </div>

      <div className="px-4 lg:px-0 flex flex-col gap-4 no-print">
        {/* Banner Penjelasan Alur */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-surface-2 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="size-4 text-brand shrink-0" />
            <span className="text-muted-ink">
              Barang belanjaan yang telah disahkan otomatis dihitung per unit fisik untuk dicetak ke label stiker barcode 2 kolom (double column).
            </span>
          </div>
          <Badge variant="brand" className="shrink-0 text-[10px]">
            {labelsToPrint.length} Label Siap Cetak
          </Badge>
        </div>

        {/* Panel Pengaturan Ukuran Kertas Stiker (Dapat Ditutup/Buka) */}
        {showSettings && (
          <div className="p-4 rounded-xl border border-line bg-surface flex flex-col gap-3 transition-all animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-brand" />
                <span className="text-xs font-bold text-ink">
                  Dimensi Label Stiker (Printer Thermal / Barcode Roll)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLabelWidth(33)
                  setLabelHeight(15)
                  setGapSize(2)
                  setIncludeLogo(true)
                }}
                className="text-[11px] h-7 gap-1"
              >
                <RotateCcw className="size-3" />
                <span>Reset Standar (33×15 mm)</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-ink block mb-1">
                  Lebar Stiker (mm)
                </label>
                <Input
                  type="number"
                  min={20}
                  max={100}
                  value={labelWidth}
                  onChange={(e) => setLabelWidth(Number(e.target.value) || 33)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-ink block mb-1">
                  Tinggi Stiker (mm)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={60}
                  value={labelHeight}
                  onChange={(e) => setLabelHeight(Number(e.target.value) || 15)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-ink block mb-1">
                  Jarak Antar Kolom (mm)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={gapSize}
                  onChange={(e) => setGapSize(Number(e.target.value) || 2)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-ink font-semibold select-none text-[11.5px]">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    className="rounded border-line"
                  />
                  <span>Tampilkan Logo Sekolah</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Grid: Kiri Daftar Barang, Kanan Pratinjau Stiker ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Kolom Kiri: Tabel Seleksi Barang */}
          <div className="lg:col-span-5 rounded-2xl border border-line bg-surface overflow-hidden">
            <div className="p-3.5 border-b border-line bg-surface-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-brand hover:opacity-80 flex items-center gap-1.5 text-xs font-bold"
                >
                  {allSelected ? (
                    <CheckSquare className="size-4" />
                  ) : (
                    <Square className="size-4" />
                  )}
                  <span>Pilih Semua Barang</span>
                </button>
              </div>
              <span className="text-[11px] text-muted-ink font-medium">
                {procurement.items.length} Barang
              </span>
            </div>

            <div className="divide-y divide-line max-h-[500px] overflow-y-auto">
              {procurement.items.map((item) => {
                const sel = itemSelections[item.id] || {
                  selected: false,
                  count: item.quantity,
                }
                return (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                      sel.selected ? "bg-surface" : "bg-surface-2/40 opacity-70"
                    }`}
                  >
                    <div
                      className="flex items-start gap-2.5 min-w-0 cursor-pointer select-none flex-1"
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="mt-0.5 text-brand shrink-0">
                        {sel.selected ? (
                          <CheckSquare className="size-4" />
                        ) : (
                          <Square className="size-4 text-muted-ink" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-ink truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-muted-ink truncate">
                          Barcode: {item.barcode || "-"} · {item.categoryName || "Umum"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10.5px] text-muted-ink">Qty:</span>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        value={sel.count}
                        disabled={!sel.selected}
                        onChange={(e) =>
                          updateCount(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-14 h-7 text-center text-xs font-bold font-mono"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 bg-surface-2 border-t border-line flex items-center justify-between text-xs">
              <span className="text-muted-ink">Total Stiker Barcode:</span>
              <span className="font-extrabold text-ink text-sm">
                {labelsToPrint.length} Label
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau Lembar Stiker 2 Kolom */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                Pratinjau Layout 2 Kolom (Double Column)
              </span>
              <span className="text-[11px] text-muted-ink">
                Standar Stiker {labelWidth}×{labelHeight} mm
              </span>
            </div>

            {labelsToPrint.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-line rounded-2xl bg-surface flex flex-col items-center justify-center gap-2 text-muted-ink text-xs">
                <Package className="size-8 text-muted-ink/40" />
                <span className="font-semibold text-ink">Tidak Ada Label Dipilih</span>
                <span>Centang salah satu barang di sebelah kiri untuk mencetak stiker barcode.</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-line bg-surface-2/60 overflow-x-auto max-h-[500px] overflow-y-auto">
                <div className="flex flex-col gap-2 items-center">
                  {chunkedLabels.map((pair, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex items-center justify-center"
                      style={{ gap: `${gapSize * 3.78}px` }}
                    >
                      {/* Kolom 1 */}
                      {pair[0] && (
                        <div
                          className="flex flex-col items-center justify-between p-1 bg-white text-black border border-gray-300 rounded shadow-xs overflow-hidden select-none"
                          style={{
                            width: `${labelWidth * 3.78}px`,
                            height: `${labelHeight * 3.78}px`,
                          }}
                        >
                          <div className="text-[6.5px] font-bold text-center leading-tight whitespace-nowrap w-full overflow-hidden text-black uppercase tracking-tight">
                            {schoolSettings?.schoolName || "SMK HKTI 2 PURWOREJO"}
                          </div>

                          <div className="flex items-center justify-between w-full flex-1 gap-1 px-1">
                            {includeLogo && schoolSettings?.logoUrl && (
                              <div className="w-[18%] flex items-center justify-center shrink-0">
                                <img
                                  src={schoolSettings.logoUrl}
                                  alt="Logo"
                                  className="max-w-full max-h-[20px] object-contain"
                                />
                              </div>
                            )}

                            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                              <Barcode
                                value={pair[0].barcode}
                                width={1}
                                height={20}
                                fontSize={0}
                                margin={0}
                                displayValue={false}
                              />
                              <div className="text-[6px] font-bold text-center leading-tight mt-0.5 whitespace-nowrap w-full overflow-hidden text-black">
                                {pair[0].itemName.substring(0, 16)} · {pair[0].barcode} ({pair[0].unitIndex}/{pair[0].totalUnits})
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Kolom 2 */}
                      {pair[1] ? (
                        <div
                          className="flex flex-col items-center justify-between p-1 bg-white text-black border border-gray-300 rounded shadow-xs overflow-hidden select-none"
                          style={{
                            width: `${labelWidth * 3.78}px`,
                            height: `${labelHeight * 3.78}px`,
                          }}
                        >
                          <div className="text-[6.5px] font-bold text-center leading-tight whitespace-nowrap w-full overflow-hidden text-black uppercase tracking-tight">
                            {schoolSettings?.schoolName || "SMK HKTI 2 PURWOREJO"}
                          </div>

                          <div className="flex items-center justify-between w-full flex-1 gap-1 px-1">
                            {includeLogo && schoolSettings?.logoUrl && (
                              <div className="w-[18%] flex items-center justify-center shrink-0">
                                <img
                                  src={schoolSettings.logoUrl}
                                  alt="Logo"
                                  className="max-w-full max-h-[20px] object-contain"
                                />
                              </div>
                            )}

                            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                              <Barcode
                                value={pair[1].barcode}
                                width={1}
                                height={20}
                                fontSize={0}
                                margin={0}
                                displayValue={false}
                              />
                              <div className="text-[6px] font-bold text-center leading-tight mt-0.5 whitespace-nowrap w-full overflow-hidden text-black">
                                {pair[1].itemName.substring(0, 16)} · {pair[1].barcode} ({pair[1].unitIndex}/{pair[1].totalUnits})
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Slot kosong di kolom kedua bila ganjil */
                        <div
                          className="border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center text-[8px] text-gray-400"
                          style={{
                            width: `${labelWidth * 3.78}px`,
                            height: `${labelHeight * 3.78}px`,
                          }}
                        >
                          (Kosong)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                onClick={() => handlePrint()}
                disabled={labelsToPrint.length === 0}
                className="w-full sm:w-auto gap-2 text-xs"
              >
                <Printer className="size-4" />
                <span>Cetak Sekarang ({labelsToPrint.length} Label)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hidden Print Content untuk react-to-print ── */}
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
        <div ref={printRef}>
          {chunkedLabels.map((pair, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                width: `${totalPageWidth}mm`,
                height: `${labelHeight}mm`,
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                alignItems: "center",
                justifyContent: "center",
                gap: `${gapSize}mm`,
                backgroundColor: "white",
                pageBreakAfter: "always",
                overflow: "hidden",
              }}
            >
              {/* Kolom 1 Print */}
              {pair[0] && (
                <div
                  style={{
                    width: `${labelWidth}mm`,
                    height: `${labelHeight}mm`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5mm 0.8mm",
                    overflow: "hidden",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      fontSize: "5pt",
                      fontWeight: "bold",
                      textAlign: "center",
                      lineHeight: "1",
                      whiteSpace: "nowrap",
                      width: "100%",
                      overflow: "hidden",
                      color: "#000",
                      textTransform: "uppercase",
                    }}
                  >
                    {schoolSettings?.schoolName || "SMK HKTI 2 PURWOREJO"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      flex: 1,
                      gap: "0.8mm",
                    }}
                  >
                    {includeLogo && schoolSettings?.logoUrl && (
                      <div
                        style={{
                          width: "18%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={schoolSettings.logoUrl}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "7mm",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <Barcode
                          value={pair[0].barcode}
                          width={1}
                          height={18}
                          fontSize={0}
                          margin={0}
                          displayValue={false}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: "4.5pt",
                          fontWeight: "bold",
                          textAlign: "center",
                          lineHeight: "1",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                          overflow: "hidden",
                          marginTop: "0.2mm",
                          color: "#000",
                        }}
                      >
                        {pair[0].itemName.substring(0, 16)} · {pair[0].barcode} ({pair[0].unitIndex}/{pair[0].totalUnits})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kolom 2 Print */}
              {pair[1] ? (
                <div
                  style={{
                    width: `${labelWidth}mm`,
                    height: `${labelHeight}mm`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5mm 0.8mm",
                    overflow: "hidden",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      fontSize: "5pt",
                      fontWeight: "bold",
                      textAlign: "center",
                      lineHeight: "1",
                      whiteSpace: "nowrap",
                      width: "100%",
                      overflow: "hidden",
                      color: "#000",
                      textTransform: "uppercase",
                    }}
                  >
                    {schoolSettings?.schoolName || "SMK HKTI 2 PURWOREJO"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      flex: 1,
                      gap: "0.8mm",
                    }}
                  >
                    {includeLogo && schoolSettings?.logoUrl && (
                      <div
                        style={{
                          width: "18%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={schoolSettings.logoUrl}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "7mm",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <Barcode
                          value={pair[1].barcode}
                          width={1}
                          height={18}
                          fontSize={0}
                          margin={0}
                          displayValue={false}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: "4.5pt",
                          fontWeight: "bold",
                          textAlign: "center",
                          lineHeight: "1",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                          overflow: "hidden",
                          marginTop: "0.2mm",
                          color: "#000",
                        }}
                      >
                        {pair[1].itemName.substring(0, 16)} · {pair[1].barcode} ({pair[1].unitIndex}/{pair[1].totalUnits})
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Ruang kosong bila kolom kedua tidak ada */
                <div style={{ width: `${labelWidth}mm`, height: `${labelHeight}mm` }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
