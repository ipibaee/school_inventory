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
import { Printer, Calendar as CalendarIcon, Search, Loader2 } from "lucide-react"
import { getBorrowingReport } from "@/actions/reports"
import { ReportA4Sheet } from "./ReportA4Sheet"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function BorrowingReport() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const data = await getBorrowingReport(date?.from, date?.to)
            setTransactions(data)
            setLoading(false)
        }
        fetchData()
    }, [date])

    const handlePrint = () => {
        window.print()
    }

    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            if (!searchQuery) return true
            const q = searchQuery.toLowerCase()
            return (
                tx.studentName.toLowerCase().includes(q) ||
                tx.item?.name.toLowerCase().includes(q) ||
                tx.item?.barcode.toLowerCase().includes(q)
            )
        })
    }, [transactions, searchQuery])

    const activeCount = useMemo(() => {
        return filteredTransactions.filter((t) => t.status === "ACTIVE").length
    }, [filteredTransactions])

    const returnedCount = useMemo(() => {
        return filteredTransactions.filter((t) => t.status === "RETURNED").length
    }, [filteredTransactions])

    const periodStr = date?.from
        ? `${format(date.from, "d MMMM yyyy", { locale: id })} s.d. ${
              date.to ? format(date.to, "d MMMM yyyy", { locale: id }) : "-"
          }`
        : "Semua Riwayat"

    return (
        <div className="flex flex-col gap-4">
            {/* Filter bar - Screen only */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "w-full sm:w-[260px] justify-start text-left text-xs",
                                    !date && "text-muted-ink"
                                )}
                            >
                                <CalendarIcon className="mr-2 size-3.5 text-muted-ink" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "d MMM yyyy", { locale: id })} -{" "}
                                            {format(date.to, "d MMM yyyy", { locale: id })}
                                        </>
                                    ) : (
                                        format(date.from, "d MMM yyyy", { locale: id })
                                    )
                                ) : (
                                    <span>Pilih rentang tanggal</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50 bg-surface border border-line rounded-[12px] shadow-dialog" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(range: any) => setDate(range)}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-[220px]">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-muted-ink pointer-events-none" />
                        <Input
                            placeholder="Cari peminjam atau barang..."
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
                    title="LAPORAN RIWAYAT PEMINJAMAN"
                    subtitle="Pencatatan Peminjaman dan Pengembalian Sarana Laboratorium"
                    period={periodStr}
                    metrics={[
                        { label: "TOTAL TRANSAKSI", value: filteredTransactions.length },
                        { label: "SEDANG DIPINJAM", value: activeCount },
                        { label: "TELAH KEMBALI", value: returnedCount },
                    ]}
                    columns={[
                        { header: "No", width: "24px", align: "center" },
                        { header: "Tgl Pinjam", width: "65px", align: "left" },
                        { header: "Peminjam", width: "95px", align: "left" },
                        { header: "Barang & Spesifikasi", align: "left" },
                        { header: "Tgl Kembali", width: "65px", align: "left" },
                        { header: "Status", width: "50px", align: "center" },
                        { header: "Kondisi", width: "45px", align: "right" },
                    ]}
                    totalLabel={`Total Riwayat · ${filteredTransactions.length} transaksi`}
                    totalValue={`${filteredTransactions.length} Peminjaman`}
                    notes="Status Peminjaman: Kembali (Telah dikembalikan), Dipinjam (Masih aktif berjalan), Terlambat (Melebihi batas tempo)."
                >
                    {filteredTransactions.map((tx, idx) => {
                        const isReturned = tx.status === "RETURNED"
                        const isActive = tx.status === "ACTIVE"
                        return (
                            <tr key={tx.id} className="border-b border-black/60">
                                <td className="py-1 px-1.5 text-center font-mono text-[7pt] border-r border-black/60">
                                    {idx + 1}
                                </td>
                                <td className="py-1 px-1.5 font-mono text-[6.5pt] border-r border-black/60">
                                    {format(new Date(tx.borrowDate), "dd/MM/yyyy")}
                                </td>
                                <td className="py-1 px-1.5 font-bold text-[7.5pt] border-r border-black/60">
                                    {tx.studentName}
                                </td>
                                <td className="py-1 px-1.5 border-r border-black/60">
                                    <span className="font-bold text-black">{tx.item?.name}</span>
                                    <span className="block font-mono text-[6pt] text-black/60">
                                        {tx.item?.barcode}
                                    </span>
                                </td>
                                <td className="py-1 px-1.5 font-mono text-[6.5pt] border-r border-black/60">
                                    {tx.returnDate ? format(new Date(tx.returnDate), "dd/MM/yyyy") : "-"}
                                </td>
                                <td
                                    className={`py-1 px-1.5 text-center font-bold text-[7pt] border-r border-black/60 ${
                                        isReturned
                                            ? "text-[#0EA47A]"
                                            : isActive
                                            ? "text-[#2B4EFF]"
                                            : "text-[#D93A47]"
                                    }`}
                                >
                                    {isReturned ? "Kembali" : isActive ? "Dipinjam" : "Terlambat"}
                                </td>
                                <td className="py-1 px-1.5 text-right text-[7pt]">
                                    {tx.condition || "-"}
                                </td>
                            </tr>
                        )
                    })}
                </ReportA4Sheet>
            </div>

            {/* Screen Table Card */}
            <div className="panel rounded-2xl flex flex-col overflow-hidden print:hidden">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-[14.5px] font-bold text-ink">Catatan Logistik Peminjaman</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Menampilkan transaksi dalam 30 hari terakhir
                        </p>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>TGL PINJAM</TableHead>
                            <TableHead>PEMINJAM</TableHead>
                            <TableHead>BARANG</TableHead>
                            <TableHead>SPESIFIKASI</TableHead>
                            <TableHead>TGL KEMBALI</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>KONDISI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-ink">
                                    <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                                    <span>Memuat riwayat peminjaman...</span>
                                </TableCell>
                            </TableRow>
                        ) : filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-ink">
                                    Tidak ada data riwayat peminjaman dalam periode ini.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs text-ink-soft whitespace-nowrap">
                                        {format(new Date(tx.borrowDate), "d/MM/yyyy")}
                                    </TableCell>
                                    <TableCell className="font-bold text-[13px] text-ink">
                                        {tx.studentName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[13px] text-ink">{tx.item?.name}</span>
                                            <span className="font-mono text-[10.5px] text-muted-ink">{tx.item?.barcode}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-ink">
                                        {tx.item?.specification || "-"}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-ink-soft whitespace-nowrap">
                                        {tx.returnDate ? format(new Date(tx.returnDate), "d/MM/yyyy") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                tx.status === "RETURNED"
                                                    ? "mint"
                                                    : tx.status === "ACTIVE"
                                                    ? "warning"
                                                    : "rose"
                                            }
                                            dot
                                            className="text-[10.5px] uppercase"
                                        >
                                            {tx.status === "RETURNED"
                                                ? "Kembali"
                                                : tx.status === "ACTIVE"
                                                ? "Dipinjam"
                                                : "Terlambat"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-ink-soft">
                                        {tx.condition || "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="px-5 py-3 border-t border-line bg-surface-2 flex items-center justify-between text-xs text-muted-ink">
                    <span>Total riwayat tercatat</span>
                    <span className="font-mono font-bold text-ink">
                        {filteredTransactions.length} Peminjaman
                    </span>
                </div>
            </div>
        </div>
    )
}
