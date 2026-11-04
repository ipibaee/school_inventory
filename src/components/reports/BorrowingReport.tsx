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
import { ReportHeader } from "./ReportHeader"
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

    return (
        <div className="flex flex-col gap-4">
            {/* Filter bar */}
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
                    <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5">
                        <Printer className="size-3.5" />
                        <span>Cetak</span>
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <ReportHeader title="Laporan Riwayat Peminjam" />

            {/* Report Table Card */}
            <div className="panel rounded-2xl flex flex-col overflow-hidden print:border-0 print:shadow-none">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between print:hidden">
                    <div className="flex flex-col">
                        <h3 className="text-[14.5px] font-bold text-ink">Riwayat Peminjaman & Pengembalian</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Data sirkulasi peminjaman laboratorium
                        </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                        {filteredTransactions.length} transaksi
                    </Badge>
                </div>

                <Table className="print:border print:border-black">
                    <TableHeader>
                        <TableRow className="print:border-black">
                            <TableHead className="print:text-black">TGL PINJAM</TableHead>
                            <TableHead className="print:text-black">PEMINJAM</TableHead>
                            <TableHead className="print:text-black">BARANG</TableHead>
                            <TableHead className="print:text-black">SPESIFIKASI</TableHead>
                            <TableHead className="print:text-black">TGL KEMBALI</TableHead>
                            <TableHead className="print:text-black">STATUS</TableHead>
                            <TableHead className="print:text-black">KONDISI</TableHead>
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
                                <TableRow key={tx.id} className="print:border-black">
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

                <div className="px-5 py-3 border-t border-line bg-surface-2 flex items-center justify-between text-xs text-muted-ink print:border-black">
                    <span>Total riwayat tercatat</span>
                    <span className="font-mono font-bold text-ink">
                        {filteredTransactions.length} Peminjaman
                    </span>
                </div>
            </div>
        </div>
    )
}
