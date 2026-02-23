"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getItemByBarcode } from "@/actions/inventory"
import { processWarehouseTransaction } from "@/actions/warehouse"
import { toast } from "sonner"
import { ArrowDownLeft, ArrowUpRight, Search, RefreshCw, Package } from "lucide-react"

interface WarehouseManagerProps {
    locations: { id: string; name: string }[]
}

export function WarehouseManager({ locations }: WarehouseManagerProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionPanel
                type="IN"
                title="Barang Masuk"
                color="green"
                icon={<ArrowDownLeft className="h-5 w-5" />}
                locations={locations}
            />
            <TransactionPanel
                type="OUT"
                title="Barang Keluar"
                color="red"
                icon={<ArrowUpRight className="h-5 w-5" />}
                locations={locations}
            />
        </div>
    )
}

function TransactionPanel({
    type,
    title,
    color,
    icon,
    locations
}: {
    type: "IN" | "OUT",
    title: string,
    color: "green" | "red",
    icon: React.ReactNode,
    locations: { id: string; name: string }[]
}) {
    const [barcode, setBarcode] = useState("")
    const [item, setItem] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const performScan = async (code: string) => {
        if (!code) return
        setLoading(true)
        try {
            const foundItem = await getItemByBarcode(code)
            if (foundItem) {
                setItem(foundItem)
                toast.success(`Barang ditemukan: ${foundItem.name}`)
            } else {
                toast.error("Barang tidak ditemukan")
                setItem(null)
            }
        } catch (error) {
            toast.error("Gagal mencari barang")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!item) return
        if (quantity <= 0) {
            toast.error("Jumlah harus lebih dari 0")
            return
        }
        // Note is now optional for both IN and OUT

        setLoading(true)
        try {
            const result = await processWarehouseTransaction({
                type,
                barcode: item.barcode,
                quantity,
                note,
            })

            if (result.success) {
                toast.success(`Transaksi ${title} berhasil!`)
                resetForm()
            } else {
                toast.error(result.error || "Gagal memproses transaksi")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setBarcode("")
        setItem(null)
        setQuantity(1)
        setNote("")
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const borderColor = color === "green" ? "border-green-200" : "border-red-200"
    const bgColor = color === "green" ? "bg-green-50" : "bg-red-50"
    const textColor = color === "green" ? "text-green-700" : "text-red-700"
    const buttonVariant = color === "green" ? "default" : "destructive"

    return (
        <Card className={`border-t-4 ${color === "green" ? "border-t-green-500" : "border-t-red-500"} shadow-md`}>
            <CardHeader className={`${bgColor} border-b ${borderColor}`}>
                <CardTitle className={`flex items-center gap-2 ${textColor}`}>
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Scan Section */}
                <div className="space-y-2">
                    <Label>Scan Barcode</Label>
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            placeholder="Scan 5 digit..."
                            value={barcode}
                            onChange={(e) => {
                                const val = e.target.value
                                setBarcode(val)
                                if (val.length === 5) {
                                    performScan(val)
                                }
                            }}
                            disabled={loading}
                            className="text-lg font-mono tracking-widest"
                            autoFocus={type === "IN"}
                        />
                        <Button variant="outline" size="icon" onClick={() => performScan(barcode)} disabled={loading}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Item Details */}
                {item ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">{item.category.name} - {item.location.name}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Stok Saat Ini</div>
                                    <div className="text-2xl font-bold">{item.quantity}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Jumlah {type === "IN" ? "Masuk" : "Keluar"}</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="text-lg font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keterangan (Opsional)</Label>
                                <Input
                                    placeholder={type === "IN" ? "Contoh: Pembelian baru" : "Contoh: Rusak / Hilang / Kadaluarsa"}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <Button
                                className={`w-full ${color === "green" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                                onClick={handleSubmit}
                                disabled={loading}
                                size="lg"
                            >
                                {loading ? "Memproses..." : `Simpan Transaksi ${type === "IN" ? "Masuk" : "Keluar"}`}
                            </Button>
                            <Button variant="outline" onClick={resetForm} disabled={loading}>
                                Batal
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Package className="h-12 w-12 mb-2 opacity-20" />
                        <p>Silakan scan barcode barang</p>
                    </div>
                )}
            </CardContent>
        </Card >
    )
}
