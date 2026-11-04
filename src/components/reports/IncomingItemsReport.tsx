"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Printer, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { getIncomingItemsReport } from "@/actions/reports"
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

export function IncomingItemsReport() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const data = await getIncomingItemsReport(date?.from, date?.to)
            setTransactions(data)
            setLoading(false)
        }
        fetchData()
    }, [date])

    const handlePrint = () => {
        window.print()
    }

    const totalIncoming = transactions.reduce((sum, t) => sum + t.quantity, 0)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 print:hidden">
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

                <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5">
                    <Printer className="size-3.5" />
                    <span>Cetak Laporan</span>
                </Button>
            </div>

            <ReportHeader title="Laporan Barang Masuk" />

            <div className="panel rounded-2xl flex flex-col overflow-hidden print:border-0 print:shadow-none">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between print:hidden">
                    <div className="flex flex-col">
                        <h3 className="text-[14.5px] font-bold text-ink">Barang Masuk</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Pencatatan pengadaan dan barang yang baru masuk sistem
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="mint" dot>
                            {totalIncoming} unit masuk
                        </Badge>
                    </div>
                </div>

                <Table className="print:border print:border-black">
                    <TableHeader>
                        <TableRow className="print:border-black">
                            <TableHead className="print:text-black">TANGGAL</TableHead>
                            <TableHead className="print:text-black">BARANG</TableHead>
                            <TableHead className="print:text-black">SPESIFIKASI</TableHead>
                            <TableHead className="print:text-black">LOKASI</TableHead>
                            <TableHead className="text-right print:text-black">JUMLAH</TableHead>
                            <TableHead className="print:text-black">KETERANGAN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-ink">
                                    <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                                    <span>Memuat data barang masuk...</span>
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-ink">
                                    Tidak ada data barang masuk pada periode ini.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => (
                                <TableRow key={tx.id} className="print:border-black">
                                    <TableCell className="font-mono text-xs text-ink-soft whitespace-nowrap">
                                        {format(new Date(tx.date), "d/MM/yy HH:mm", { locale: id })}
                                    </TableCell>
                                    <TableCell className="font-bold text-[13px] text-ink">
                                        {tx.item?.name}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-ink">
                                        {tx.item?.specification || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-ink-soft">
                                        {tx.item?.location?.name || "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-[13px] text-mint tabular-nums">
                                        +{tx.quantity}
                                    </TableCell>
                                    <TableCell className="text-xs text-ink-soft">
                                        {tx.note || "Pengadaan Baru"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
