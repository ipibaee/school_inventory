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
import { Printer } from "lucide-react"
import { getStockReport } from "@/actions/reports"
import { ReportHeader } from "./ReportHeader"

export function StockReport() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="space-y-4">
            <div className="flex justify-end print:hidden">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                </Button>
            </div>

            <div className="print:p-0">
                <ReportHeader title="Laporan Stok Barang" />

                <Card className="print:border-0 print:shadow-none">
                    <CardHeader className="print:hidden">
                        <CardTitle>Stok Saat Ini</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 print:p-0">
                        <Table className="border print:border-black">
                            <TableHeader>
                                <TableRow className="print:border-black">
                                    <TableHead className="print:text-black print:font-bold">Lokasi</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Kategori</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Nama Barang</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Spesifikasi</TableHead>
                                    <TableHead className="print:text-black print:font-bold">Barcode</TableHead>
                                    <TableHead className="text-right print:text-black print:font-bold">Jumlah</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Memuat...</TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Tidak ada barang ditemukan.</TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id} className="print:border-black">
                                            <TableCell>{item.location.name}</TableCell>
                                            <TableCell>{item.category.name}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-sm">{item.specification || "-"}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.barcode}</TableCell>
                                            <TableCell className={`text-right ${item.quantity <= item.minStock ? "text-red-600 font-bold print:text-black" : ""}`}>
                                                {item.quantity}
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
