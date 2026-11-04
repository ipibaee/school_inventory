"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { getWarehouseReport } from "@/actions/reports"
import { Button } from "@/components/ui/button"
import { Printer, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { ReportHeader } from "./ReportHeader"

export function WarehouseReport() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const data = await getWarehouseReport()
            setTransactions(data)
            setLoading(false)
        }
        fetchData()
    }, [])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end print:hidden">
                <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5">
                    <Printer className="size-3.5" />
                    <span>Cetak Laporan</span>
                </Button>
            </div>

            <ReportHeader title="Laporan Keluar/Masuk Gudang" />

            <div className="panel rounded-2xl flex flex-col overflow-hidden print:border-0 print:shadow-none">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between print:hidden">
                    <div className="flex flex-col">
                        <h3 className="text-[14.5px] font-bold text-ink">Mutasi Gudang</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Riwayat transaksi logistik keluar dan masuk gudang
                        </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                        {transactions.length} mutasi
                    </Badge>
                </div>

                <Table className="print:border print:border-black">
                    <TableHeader>
                        <TableRow className="print:border-black">
                            <TableHead className="print:text-black">WAKTU</TableHead>
                            <TableHead className="print:text-black">TIPE</TableHead>
                            <TableHead className="print:text-black">BARANG</TableHead>
                            <TableHead className="print:text-black">SPESIFIKASI</TableHead>
                            <TableHead className="text-right print:text-black">JUMLAH</TableHead>
                            <TableHead className="print:text-black">CATATAN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-ink">
                                    <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                                    <span>Memuat riwayat gudang...</span>
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-ink">
                                    Belum ada transaksi gudang.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t) => {
                                const isIncoming = t.type === "IN"
                                return (
                                    <TableRow key={t.id} className="print:border-black">
                                        <TableCell className="font-mono text-xs text-ink-soft whitespace-nowrap">
                                            {format(new Date(t.date), "d/MM/yy HH:mm", { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={isIncoming ? "mint" : "rose"}
                                                dot
                                                className="text-[10.5px] uppercase"
                                            >
                                                {isIncoming ? "Masuk" : "Keluar"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-[13px] text-ink">
                                            {t.item?.name}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-ink">
                                            {t.item?.specification || "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-[13px] tabular-nums text-ink">
                                            {t.quantity}
                                        </TableCell>
                                        <TableCell className="text-xs text-ink-soft">
                                            {t.note || "-"}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
