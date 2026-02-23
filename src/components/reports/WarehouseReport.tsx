"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Printer, ArrowDownLeft, ArrowUpRight } from "lucide-react"
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

    if (loading) {
        return <div>Memuat data...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end print:hidden">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                </Button>
            </div>

            <div className="print:p-0">
                <ReportHeader title="Laporan Keluar/Masuk Gudang" />

                <Card className="print:border-0 print:shadow-none">
                    <CardHeader className="print:hidden">
                        <CardTitle>Riwayat Keluar/Masuk Gudang</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 print:p-0">
                        <Table className="border print:border-black">
                            <TableHeader>
                                <TableRow className="print:border-black">
                                    <TableHead className="print:text-black print:font-bold">Tanggal</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Tipe</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Barang</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Spesifikasi</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Jumlah</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Keterangan / Tujuan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((t) => (
                                    <TableRow key={t.id} className="print:border-black">
                                        <TableCell>
                                            {format(new Date(t.date), "dd MMM yyyy HH:mm", { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            {t.type === "IN" ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 print:bg-transparent print:text-black print:border print:border-black">
                                                    <ArrowDownLeft className="w-3 h-3 mr-1" /> Masuk
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 print:bg-transparent print:text-black print:border print:border-black">
                                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Keluar
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{t.item.name}</div>
                                            <div className="text-xs text-muted-foreground print:text-black">{t.item.barcode}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">{t.item.specification || "-"}</TableCell>
                                        <TableCell className="font-bold">
                                            {t.quantity}
                                        </TableCell>
                                        <TableCell>{t.note || "-"}</TableCell>
                                    </TableRow>
                                ))}
                                {transactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Belum ada riwayat transaksi gudang.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
