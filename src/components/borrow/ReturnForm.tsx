"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getActiveBorrowing, returnItem } from "@/actions/borrow"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle, ScanBarcode, Search, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BarcodeScanner } from "@/components/scanning/BarcodeScanner"
import { useScanListener } from "@/hooks/use-scan-listener"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ReturnFormProps {
    onSuccess?: () => void
}

export function ReturnForm({ onSuccess }: ReturnFormProps) {
    const [barcode, setBarcode] = useState("")
    const [borrowing, setBorrowing] = useState<any>(null)
    const [condition, setCondition] = useState("Good")
    const [loading, setLoading] = useState(false)
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    const handleScan = async (code: string) => {
        if (!code) return

        setLoading(true)
        const result = await getActiveBorrowing(code)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
            setBorrowing(null)
        } else {
            setBorrowing(result.borrowing)
            setBarcode(code)
            toast.success("Data peminjaman ditemukan")
        }
    }

    useScanListener(handleScan)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (barcode) handleScan(barcode)
    }

    const handleReturn = async () => {
        if (!borrowing) return

        setLoading(true)
        const result = await returnItem(borrowing.id, condition)
        setLoading(false)

        if (result.success) {
            toast.success("Barang berhasil dikembalikan ke inventaris!")
            setBorrowing(null)
            setCondition("Good")
            setBarcode("")
            barcodeInputRef.current?.focus()
            onSuccess?.()
        } else {
            toast.error(result.error || "Gagal mengembalikan barang")
        }
    }

    return (
        <div className="panel rounded-2xl flex flex-col overflow-hidden max-w-2xl mx-auto">
            <div className="p-4 lg:p-[18px_20px] border-b border-line bg-surface">
                <h3 className="text-[14.5px] font-bold text-ink">
                    Pengembalian Barang
                </h3>
                <p className="text-xs text-muted-ink mt-0.5">
                    Scan barcode barang yang dipinjam untuk memproses pengembalian ke sistem.
                </p>
            </div>

            <div className="p-4 lg:p-[20px] flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex flex-col gap-1.5">
                    <Label htmlFor="scanBarcodeReturn" className="label-caps">
                        SCAN / KETIK BARCODE BARANG
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ScanBarcode className="absolute left-3.5 top-3 size-4 text-muted-ink pointer-events-none" />
                            <Input
                                id="scanBarcodeReturn"
                                ref={barcodeInputRef}
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Scan barcode barang yang dikembalikan..."
                                className="pl-10"
                                autoFocus
                            />
                        </div>
                        <BarcodeScanner onScan={handleScan} />
                        <Button type="submit" variant="secondary" disabled={loading || !barcode}>
                            {loading ? <Loader2 className="size-4 animate-spin" /> : "Cari"}
                        </Button>
                    </div>
                </form>

                {borrowing && (
                    <div className="p-4 rounded-[12px] bg-surface-2 border border-line flex flex-col gap-4 animate-fade-in mt-2">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-ink">
                                    DATA PEMINJAMAN
                                </span>
                                <span className="text-[15px] font-bold text-ink">
                                    {borrowing.item?.name}
                                </span>
                                <span className="text-xs text-muted-ink">
                                    Peminjam: <strong className="text-ink">{borrowing.studentName}</strong>
                                </span>
                                <span className="text-xs text-muted-ink">
                                    Tenggat: {format(new Date(borrowing.dueDate), "PPP", { locale: id })}
                                </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-amber px-2.5 py-1 rounded-full bg-amber-soft">
                                Aktif Dipinjam
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 pt-2 border-t border-line">
                            <Label className="label-caps">KONDISI SAAT DIKEMBALIKAN</Label>
                            <Select value={condition} onValueChange={setCondition}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Good">Baik / Lengkap</SelectItem>
                                    <SelectItem value="Damaged">Rusak Sebagian</SelectItem>
                                    <SelectItem value="Lost">Hilang / Tidak Lengkap</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleReturn}
                            disabled={loading}
                            className="mt-2"
                        >
                            {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
                            <span>Konfirmasi Pengembalian</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
