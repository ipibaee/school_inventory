"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveBorrowing, returnItem } from "@/actions/borrow"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BarcodeScanner } from "@/components/scanning/BarcodeScanner"
import { useScanListener } from "@/hooks/use-scan-listener"

export function ReturnForm() {
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
            toast.success("Barang berhasil dikembalikan")
            setBorrowing(null)
            setCondition("Good")
            setBarcode("")
            barcodeInputRef.current?.focus()
        } else {
            toast.error(result.error || "Gagal mengembalikan barang")
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Scan Barang untuk Dikembalikan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            ref={barcodeInputRef}
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="Scan Barcode..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch(e)
                                }
                            }}
                        />
                        <BarcodeScanner onScan={handleScan} />
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? "Mencari..." : "Cari"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {borrowing && (
                <Card className="border-green-500/50 bg-green-50/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" /> Peminjaman Aktif Ditemukan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Nama Barang</label>
                                <p className="text-lg font-semibold">{borrowing.item.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                                <p className="font-mono">{borrowing.item.barcode}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Dipinjam Oleh</label>
                                <p className="font-medium">{borrowing.studentName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tanggal Kembali</label>
                                <p>{new Date(borrowing.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Kondisi Barang</label>
                                <Select value={condition} onValueChange={setCondition}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Good">Baik</SelectItem>
                                        <SelectItem value="Damaged">Rusak</SelectItem>
                                        <SelectItem value="Lost">Hilang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                                onClick={handleReturn}
                                disabled={loading}
                            >
                                {loading ? "Memproses..." : "Konfirmasi Pengembalian"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
