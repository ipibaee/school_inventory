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
import { Printer, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { getIncomingItemsReport } from "@/actions/reports"
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

    const totalIncoming = useMemo(() => {
        return transactions.reduce((sum, t) => sum + (t.quantity || 0), 0)
    }, [transactions])

    const periodStr = date?.from
        ? `${format(date.from, "d MMMM yyyy", { locale: id })} s.d. ${
              date.to ? format(date.to, "d MMMM yyyy", { locale: id }) : "-"
          }`
        : "Semua Riwayat"

    return (
        <div className="flex flex-col gap-4">
            {/* Filter bar - Screen only */}
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

                <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1.5 cursor-pointer">
                    <Printer className="size-3.5" />
                    <span>Cetak Laporan</span>
                </Button>
            </div>

            {/* ── Official A4 Document Sheet for Print ── */}
            <div className="hidden print:block">
                <ReportA4Sheet
                    title="LAPORAN BARANG MASUK"
                    subtitle="Pencatatan Penerimaan Barang Baru dan Logistik Inventaris"
                    period={periodStr}
                    metrics={[
                        { label: "TRANSAKSI MASUK", value: transactions.length },
                        { label: "TOTAL UNIT", value: `${totalIncoming} Unit` },
                        {
                            label: "LOKASI AKTIF",
                            value: new Set(transactions.map((t) => t.item?.location?.id).filter(Boolean)).size,
                        },
                    ]}
                    columns={[
                        { header: "No", width: "24px", align: "center" },
                        { header: "Tanggal", width: "65px", align: "left" },
                        { header: "Barang", width: "120px", align: "left" },
                        { header: "Spesifikasi", align: "left" },
                        { header: "Lokasi", width: "80px", align: "left" },
                        { header: "Jumlah", width: "40px", align: "right" },
                        { header: "Keterangan", width: "95px", align: "left" },
                    ]}
                    totalLabel={`Total Barang Masuk · ${transactions.length} penerimaan`}
                    totalValue={`${totalIncoming} Unit`}
                    notes="Daftar penerimaan barang bersumber dari pengadaan dana BOS dan mutasi masuk inventaris sekolah."
                >
                    {transactions.map((tx, idx) => (
                        <tr key={tx.id} className="border-b border-black/60">
                            <td className="py-1 px-1.5 text-center font-mono text-[7pt] border-r border-black/60">
                                {idx + 1}
                            </td>
                            <td className="py-1 px-1.5 font-mono text-[6.5pt] border-r border-black/60">
                                {format(new Date(tx.date), "dd/MM/yy HH:mm", { locale: id })}
                            </td>
                            <td className="py-1 px-1.5 font-bold text-[7.5pt] border-r border-black/60">
                                {tx.item?.name}
                            </td>
                            <td className="py-1 px-1.5 text-[6.5pt] text-black/70 border-r border-black/60">
                                {tx.item?.specification || "-"}
                            </td>
                            <td className="py-1 px-1.5 text-[7pt] border-r border-black/60">
                                {tx.item?.location?.name || "-"}
                            </td>
                            <td className="py-1 px-1.5 font-mono font-bold text-right text-[7.5pt] border-r border-black/60 text-[#0EA47A]">
                                +{tx.quantity}
                            </td>
                            <td className="py-1 px-1.5 text-[6.5pt] text-black/70">
                                {tx.note || "Pengadaan Baru"}
                            </td>
                        </tr>
                    ))}
                </ReportA4Sheet>
            </div>

            {/* Screen Table Card */}
            <div className="panel rounded-2xl flex flex-col overflow-hidden print:hidden">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between">
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

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>TANGGAL</TableHead>
                            <TableHead>BARANG</TableHead>
                            <TableHead>SPESIFIKASI</TableHead>
                            <TableHead>LOKASI</TableHead>
                            <TableHead className="text-right">JUMLAH</TableHead>
                            <TableHead>KETERANGAN</TableHead>
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
                                <TableRow key={tx.id}>
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
