"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Printer, Loader2 } from "lucide-react"
import { ReportA4Sheet } from "./ReportA4Sheet"

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

    const totalIncoming = useMemo(() => {
        return transactions
            .filter((t) => t.type === "IN")
            .reduce((sum, t) => sum + (t.quantity || 0), 0)
    }, [transactions])

    const totalOutgoing = useMemo(() => {
        return transactions
            .filter((t) => t.type === "OUT")
            .reduce((sum, t) => sum + (t.quantity || 0), 0)
    }, [transactions])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end print:hidden">
                <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5 cursor-pointer">
                    <Printer className="size-3.5" />
                    <span>Cetak Laporan</span>
                </Button>
            </div>

            {/* ── Official A4 Document Sheet for Print ── */}
            <div className="hidden print:block">
                <ReportA4Sheet
                    title="LAPORAN MUTASI GUDANG"
                    subtitle="Catatan Keluar dan Masuk Barang Persediaan Laboratorium"
                    metrics={[
                        { label: "TOTAL MUTASI", value: transactions.length },
                        { label: "BARANG MASUK", value: `${totalIncoming} Unit` },
                        { label: "BARANG KELUAR", value: `${totalOutgoing} Unit` },
                    ]}
                    columns={[
                        { header: "No", width: "24px", align: "center" },
                        { header: "Waktu", width: "70px", align: "left" },
                        { header: "Tipe", width: "45px", align: "center" },
                        { header: "Barang & Spesifikasi", align: "left" },
                        { header: "Jumlah", width: "45px", align: "right" },
                        { header: "Catatan", width: "130px", align: "left" },
                    ]}
                    totalLabel={`Total Mutasi · ${transactions.length} pencatatan`}
                    totalValue={`${totalIncoming + totalOutgoing} Unit`}
                    notes="Mutasi IN (Barang masuk gudang / pengadaan), Mutasi OUT (Barang dikeluarkan / pemakaian)."
                >
                    {transactions.map((t, idx) => {
                        const isIncoming = t.type === "IN"
                        return (
                            <tr key={t.id} className="border-b border-black/60">
                                <td className="py-1 px-1.5 text-center font-mono text-[7pt] border-r border-black/60">
                                    {idx + 1}
                                </td>
                                <td className="py-1 px-1.5 font-mono text-[6.5pt] border-r border-black/60">
                                    {format(new Date(t.date), "dd/MM/yy HH:mm", { locale: id })}
                                </td>
                                <td
                                    className={`py-1 px-1.5 text-center font-bold text-[7pt] border-r border-black/60 ${
                                        isIncoming ? "text-[#0EA47A]" : "text-[#D93A47]"
                                    }`}
                                >
                                    {isIncoming ? "Masuk" : "Keluar"}
                                </td>
                                <td className="py-1 px-1.5 border-r border-black/60">
                                    <span className="font-bold text-black">{t.item?.name}</span>
                                    {t.item?.specification && (
                                        <span className="block text-[6.5pt] text-black/60">
                                            {t.item?.specification}
                                        </span>
                                    )}
                                </td>
                                <td className="py-1 px-1.5 text-right font-mono font-bold text-[7.5pt] border-r border-black/60">
                                    {t.quantity}
                                </td>
                                <td className="py-1 px-1.5 text-[6.5pt] text-black/70">
                                    {t.note || "-"}
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
                        <h3 className="text-[14.5px] font-bold text-ink">Mutasi Gudang</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Riwayat transaksi logistik keluar dan masuk gudang
                        </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                        {transactions.length} mutasi
                    </Badge>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>WAKTU</TableHead>
                            <TableHead>TIPE</TableHead>
                            <TableHead>BARANG</TableHead>
                            <TableHead>SPESIFIKASI</TableHead>
                            <TableHead className="text-right">JUMLAH</TableHead>
                            <TableHead>CATATAN</TableHead>
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
                                    <TableRow key={t.id}>
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
