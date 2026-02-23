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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Calendar as CalendarIcon } from "lucide-react"
import { getBorrowingReport } from "@/actions/reports"
import { ReportHeader } from "./ReportHeader"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function BorrowingReport() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pilih rentang tanggal</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                </Button>
            </div>

            <div className="print:p-0">
                <ReportHeader title="Laporan Riwayat Peminjam" />

                <Card className="print:border-0 print:shadow-none">
                    <CardHeader className="print:hidden">
                        <CardTitle>Riwayat Peminjam</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 print:p-0">
                        <Table className="border print:border-black">
                            <TableHeader>
                                <TableRow className="print:border-black">
                                    <TableHead className="print:text-black print:font-bold">Tanggal Pinjam</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Peminjam</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Barang</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Spesifikasi</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Tgl Kembali</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Status</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Kondisi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">Memuat...</TableCell>
                                    </TableRow>
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">Tidak ada riwayat peminjaman.</TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id} className="print:border-black">
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(tx.borrowDate), "dd/MM/yy")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{tx.studentName}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{tx.item.name}</div>
                                                <div className="text-xs text-muted-foreground print:text-black">{tx.item.barcode}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {tx.item.specification || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {tx.returnDate ? format(new Date(tx.returnDate), "dd/MM/yy") : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={tx.status === "RETURNED" ? "default" : "destructive"} className="print:border print:border-black print:text-black print:bg-transparent">
                                                    {tx.status === "RETURNED" ? "DIKEMBALIKAN" : tx.status === "ACTIVE" ? "DIPINJAM" : "TERLAMBAT"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {tx.condition || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
