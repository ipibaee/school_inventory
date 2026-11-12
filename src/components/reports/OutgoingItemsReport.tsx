"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useReactToPrint } from "react-to-print"
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
import { getOutgoingItemsReport } from "@/actions/reports"
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

export function OutgoingItemsReport() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    })

    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const data = await getOutgoingItemsReport(date?.from, date?.to)
            setTransactions(data)
            setLoading(false)
        }
        fetchData()
    }, [date])

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Laporan-Barang-Keluar-${new Date().toISOString().slice(0, 10)}`,
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 0mm !important;
            }
            @media print {
                html, body {
                    background: #FFFFFF !important;
                    color: #000000 !important;
                    margin: 0mm !important;
                    padding: 0mm !important;
                }
                .no-print, header, nav, aside {
                    display: none !important;
                }
                .report-a4-sheet {
                    width: 210mm !important;
                    min-height: 297mm !important;
                    padding: 12mm 14mm !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `,
    })

    const totalOutgoing = useMemo(() => {
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
            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    <ReportA4Sheet
                        title="LAPORAN BARANG KELUAR"
                        subtitle="Pencatatan Pengeluaran Barang Persediaan dan Logistik Inventaris"
                        period={periodStr}
                        metrics={[
                            { label: "TRANSAKSI KELUAR", value: transactions.length },
                            { label: "TOTAL UNIT KELUAR", value: `${totalOutgoing} Unit` },
                            {
                                label: "LOKASI ASAL",
                                value: new Set(transactions.map((t) => t.item?.location?.id).filter(Boolean)).size,
                            },
                        ]}
                        columns={[
                            { header: "No", width: "24px", align: "center" },
                            { header: "Tanggal", width: "55px", align: "left" },
                            { header: "Barang", width: "95px", align: "left" },
                            { header: "Spesifikasi", align: "left" },
                            { header: "Lokasi", width: "65px", align: "left" },
                            { header: "Jumlah", width: "38px", align: "right" },
                            { header: "Keterangan", width: "85px", align: "left" },
                        ]}
                        totalLabel={`Total Barang Keluar · ${transactions.length} transaksi`}
                        totalValue={`${totalOutgoing} Unit`}
                        notes="Daftar pengeluaran barang bersumber dari mutasi keluar, pemakaian lab, dan logistik inventaris sekolah."
                    >
                        {transactions.map((tx, idx) => (
                            <tr key={tx.id} className="border-b border-black">
                                <td className="py-1 px-1.5 text-center font-mono text-[7pt] border-r border-black">
                                    {idx + 1}
                                </td>
                                <td className="py-1 px-1.5 font-mono text-[6.5pt] border-r border-black">
                                    {format(new Date(tx.date), "dd/MM/yy HH:mm", { locale: id })}
                                </td>
                                <td className="py-1 px-1.5 font-bold text-[7.5pt] border-r border-black">
                                    {tx.item?.name}
                                </td>
                                <td className="py-1 px-1.5 text-[6.5pt] text-black/70 border-r border-black">
                                    {tx.item?.specification || "-"}
                                </td>
                                <td className="py-1 px-1.5 text-[7pt] border-r border-black">
                                    {tx.item?.location?.name || "-"}
                                </td>
                                <td className="py-1 px-1.5 font-mono font-bold text-right text-[7.5pt] border-r border-black text-[#D93A47]">
                                    -{tx.quantity}
                                </td>
                                <td className="py-1 px-1.5 text-[6.5pt] text-black/80">
                                    {tx.note || "Pemakaian"}
                                </td>
                            </tr>
                        ))}
                    </ReportA4Sheet>
                </div>
            </div>

            {/* Screen Table Card */}
            <div className="panel rounded-2xl flex flex-col overflow-hidden print:hidden">
                <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-[14.5px] font-bold text-ink">Barang Keluar</h3>
                        <p className="text-xs text-muted-ink mt-0.5">
                            Pencatatan pengeluaran barang persediaan dan logistik laboratorium
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="rose" dot>
                            {totalOutgoing} unit keluar
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
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2 text-muted-ink text-xs">
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Memuat riwayat barang keluar...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-ink">
                                    Tidak ada catatan barang keluar pada periode ini.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs">
                                        {format(new Date(tx.date), "d/MM/yy HH:mm", { locale: id })}
                                    </TableCell>
                                    <TableCell className="font-bold text-ink">
                                        {tx.item?.name}
                                    </TableCell>
                                    <TableCell className="text-muted-ink text-xs">
                                        {tx.item?.specification || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-ink">
                                        {tx.item?.location?.name || "-"}
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-rose text-right text-xs">
                                        -{tx.quantity}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-ink">
                                        {tx.note || "Pemakaian"}
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
