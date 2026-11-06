"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Printer, MapPin, Tag, Search, Loader2 } from "lucide-react"
import { getStockReport } from "@/actions/reports"
import { ReportA4Sheet } from "./ReportA4Sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function StockReport() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLocation, setSelectedLocation] = useState<string>("all")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            const data = await getStockReport()
            setItems(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    const handlePrint = () => {
        window.print()
    }

    const locations = useMemo(() => {
        const map = new Map<string, string>()
        items.forEach((i) => {
            if (i.location) map.set(i.location.id, i.location.name)
        })
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    }, [items])

    const categories = useMemo(() => {
        const map = new Map<string, string>()
        items.forEach((i) => {
            if (i.category) map.set(i.category.id, i.category.name)
        })
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    }, [items])

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchLoc = selectedLocation === "all" || item.location?.id === selectedLocation
            const matchCat = selectedCategory === "all" || item.category?.id === selectedCategory
            const matchSearch =
                !searchQuery ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.barcode.toLowerCase().includes(searchQuery.toLowerCase())
            return matchLoc && matchCat && matchSearch
        })
    }, [items, selectedLocation, selectedCategory, searchQuery])

    const totalUnits = useMemo(() => {
        return filteredItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    }, [filteredItems])

    const lowStockCount = useMemo(() => {
        return filteredItems.filter((i) => (i.quantity || 0) <= (i.minStock || 5)).length
    }, [filteredItems])

    return (
        <div className="flex flex-col gap-4">
            {/* Filter bar - Screen only */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-[180px]">
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger size="sm">
                                <MapPin className="size-3.5 mr-1.5 text-muted-ink" />
                                <SelectValue placeholder="Semua Lokasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Lokasi</SelectItem>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[180px]">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger size="sm">
                                <Tag className="size-3.5 mr-1.5 text-muted-ink" />
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-[220px]">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-muted-ink pointer-events-none" />
                        <Input
                            placeholder="Cari dalam laporan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>
                    <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5 cursor-pointer">
                        <Printer className="size-3.5" />
                        <span>Cetak</span>
                    </Button>
                </div>
            </div>

            {/* ── Official A4 Document Sheet for Print ── */}
            <div className="hidden print:block">
                <ReportA4Sheet
                    title="LAPORAN STOK BARANG"
                    subtitle="Rekapitulasi Inventaris Sarana dan Prasarana Sekolah"
                    metrics={[
                        { label: "JENIS BARANG", value: filteredItems.length },
                        { label: "TOTAL UNIT", value: totalUnits },
                        { label: "STOK RENDAH", value: lowStockCount },
                    ]}
                    columns={[
                        { header: "No", width: "24px", align: "center" },
                        { header: "Nama & Spesifikasi", align: "left" },
                        { header: "Barcode", width: "65px", align: "left" },
                        { header: "Lokasi", width: "80px", align: "left" },
                        { header: "Kategori", width: "65px", align: "left" },
                        { header: "Stok", width: "35px", align: "right" },
                        { header: "Status", width: "45px", align: "right" },
                    ]}
                    totalLabel={`Total Keseluruhan · ${filteredItems.length} jenis barang`}
                    totalValue={`${totalUnits} Unit`}
                    notes="Status Stok: Baik (> Stok Minimum), Rendah (≤ Stok Minimum), Habis (0 Unit)."
                >
                    {filteredItems.map((item, idx) => {
                        const isLow = item.quantity <= item.minStock
                        const isOut = item.quantity === 0
                        return (
                            <tr key={item.id} className="border-b border-black/60">
                                <td className="py-1 px-1.5 text-center font-mono text-[7pt] border-r border-black/60">
                                    {idx + 1}
                                </td>
                                <td className="py-1 px-1.5 border-r border-black/60">
                                    <span className="font-bold text-black">{item.name}</span>
                                    {item.specification && (
                                        <span className="block text-[6.5pt] text-black/60">
                                            {item.specification}
                                        </span>
                                    )}
                                </td>
                                <td className="py-1 px-1.5 font-mono text-[6.5pt] border-r border-black/60">
                                    {item.barcode}
                                </td>
                                <td className="py-1 px-1.5 text-[7pt] border-r border-black/60">
                                    {item.location?.name || "-"}
                                </td>
                                <td className="py-1 px-1.5 text-[7pt] border-r border-black/60">
                                    {item.category?.name || "-"}
                                </td>
                                <td className="py-1 px-1.5 font-mono font-bold text-right border-r border-black/60">
                                    {item.quantity}
                                </td>
                                <td
                                    className={`py-1 px-1.5 font-bold text-right ${
                                        isOut
                                            ? "text-[#D93A47]"
                                            : isLow
                                            ? "text-[#C77605]"
                                            : "text-[#0EA47A]"
                                    }`}
                                >
                                    {isOut ? "Habis" : isLow ? "Rendah" : "Baik"}
                                </td>
                            </tr>
                        )
                    })}
                </ReportA4Sheet>
            </div>

            {/* Report Table Card - Screen only */}
            <div className="panel rounded-2xl flex flex-col overflow-hidden print:hidden">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-[14.5px] font-bold text-ink">Laporan Rekapitulasi Stok</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Status inventaris laboratorium per hari ini
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-ink">
                            <span>Jenis:</span>
                            <strong className="text-ink font-mono">{filteredItems.length}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-ink">
                            <span>Total Unit:</span>
                            <strong className="text-brand font-mono">{totalUnits}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-ink">
                            <span>Stok Rendah:</span>
                            <strong className="text-rose font-mono">{lowStockCount}</strong>
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>LOKASI</TableHead>
                            <TableHead>KATEGORI</TableHead>
                            <TableHead>NAMA BARANG</TableHead>
                            <TableHead>SPESIFIKASI</TableHead>
                            <TableHead>BARCODE</TableHead>
                            <TableHead className="text-right">JUMLAH</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-ink">
                                    <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                                    <span>Menyiapkan data laporan...</span>
                                </TableCell>
                            </TableRow>
                        ) : filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-ink">
                                    Tidak ada data untuk filter yang dipilih.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => {
                                const isLow = item.quantity <= item.minStock
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-xs text-ink-soft">{item.location?.name}</TableCell>
                                        <TableCell className="text-xs text-ink-soft">{item.category?.name}</TableCell>
                                        <TableCell className="font-bold text-[13px] text-ink">{item.name}</TableCell>
                                        <TableCell className="text-xs text-muted-ink">{item.specification || "-"}</TableCell>
                                        <TableCell className="font-mono text-xs text-ink-soft">{item.barcode}</TableCell>
                                        <TableCell
                                            className={cn(
                                                "text-right font-mono font-bold text-[13px] tabular-nums",
                                                isLow ? "text-rose" : "text-ink"
                                            )}
                                        >
                                            {item.quantity}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Table Footer with Summary */}
                <div className="px-5 py-3 border-t border-line bg-surface-2 flex items-center justify-between text-xs text-ink-soft font-medium">
                    <span>Total Keseluruhan · {filteredItems.length} jenis barang</span>
                    <span className="font-mono font-extrabold text-[13.5px] text-ink">
                        {totalUnits} unit
                    </span>
                </div>
            </div>
        </div>
    )
}
