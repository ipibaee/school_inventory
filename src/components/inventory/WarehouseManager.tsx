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
import { cn } from "@/lib/utils"

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

    const borderColor = color === "green" ? "border-emerald-500/20" : "border-rose-500/20"
    const bgColor = color === "green" ? "bg-emerald-500/5 dark:bg-emerald-500/10" : "bg-rose-500/5 dark:bg-rose-500/10"
    const textColor = color === "green" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"

    return (
        <Card className={cn(
            "relative overflow-hidden border-0 shadow-lg",
            color === "green" ? "hover:shadow-emerald-500/5" : "hover:shadow-rose-500/5"
        )}>
            <div className={cn(
                "absolute top-0 left-0 w-full h-[4px]",
                color === "green" ? "bg-emerald-500" : "bg-rose-500"
            )} />
            <CardHeader className={cn("border-b", borderColor, bgColor)}>
                <CardTitle className={cn("flex items-center gap-2 font-bold", textColor)}>
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Scan Section */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider pl-1 text-slate-500">Scan Barcode</Label>
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
                            className="text-lg font-mono tracking-widest h-11"
                            autoFocus={type === "IN"}
                        />
                        <Button variant="outline" size="icon" className="h-11 w-11 cursor-pointer" onClick={() => performScan(barcode)} disabled={loading}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Item Details */}
                {item ? (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 border border-border/40 dark:border-white/5 bg-white/20 dark:bg-black/10 rounded-xl space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0 pr-2">
                                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 truncate">{item.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{item.category.name} • {item.location.name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[10px] uppercase font-semibold text-slate-400">Stok Saat Ini</div>
                                    <div className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5">{item.quantity}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider pl-1 text-slate-500">Jumlah {type === "IN" ? "Masuk" : "Keluar"}</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="text-lg font-bold h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider pl-1 text-slate-500">Keterangan (Opsional)</Label>
                                <Input
                                    placeholder={type === "IN" ? "Contoh: Pembelian baru" : "Contoh: Rusak / Hilang"}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <Button
                                className={cn(
                                    "w-full text-white font-medium cursor-pointer",
                                    color === "green" 
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/10" 
                                        : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-md shadow-rose-500/10"
                                )}
                                onClick={handleSubmit}
                                disabled={loading}
                                size="lg"
                            >
                                {loading ? "Memproses..." : `Simpan Transaksi ${type === "IN" ? "Masuk" : "Keluar"}`}
                            </Button>
                            <Button variant="outline" className="h-11 cursor-pointer" onClick={resetForm} disabled={loading}>
                                Batal
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500 border-2 border-dashed border-border/40 dark:border-white/5 rounded-xl bg-white/5 dark:bg-black/5">
                        <Package className="h-10 w-10 mb-3 opacity-30 text-blue-500 animate-pulse" />
                        <p className="text-sm font-semibold">Silakan scan barcode barang</p>
                        <p className="text-xs text-slate-400 mt-1">Masukkan 5 digit kode barcode barang Anda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
