"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScanBarcode, Plus } from "lucide-react"
import { getItemByBarcode, updateItem } from "@/actions/inventory"
import { ItemForm } from "./ItemForm"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ScanDialogProps {
    categories: { id: string; name: string }[]
    locations: { id: string; name: string }[]
}

export function ScanDialog({ categories, locations }: ScanDialogProps) {
    const [open, setOpen] = useState(false)
    const [barcode, setBarcode] = useState("")
    const [loading, setLoading] = useState(false)
    const [scannedItem, setScannedItem] = useState<any>(null)
    const [addStockQty, setAddStockQty] = useState(1)
    const [mode, setMode] = useState<"scan" | "add-stock" | "new-item">("scan")
    const [defaults, setDefaults] = useState<any>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const gudangLocation = locations.find(l => l.name === "Gudang")

    useEffect(() => {
        if (open && mode === "scan") {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open, mode])

    const performScan = async (codeToScan: string) => {
        if (!codeToScan) return

        setLoading(true)
        try {
            // 1. Try to find in Gudang first
            let item = null
            if (gudangLocation) {
                item = await getItemByBarcode(codeToScan, gudangLocation.id)
            } else {
                // Fallback if Gudang not found (shouldn't happen)
                item = await getItemByBarcode(codeToScan)
            }

            if (item) {
                setScannedItem(item)
                setMode("add-stock")
                setAddStockQty(1)
            } else {
                // 2. If not in Gudang, check globally to pre-fill data
                const globalItem = await getItemByBarcode(codeToScan)
                if (globalItem) {
                    setDefaults({
                        name: globalItem.name,
                        categoryId: globalItem.categoryId,
                        specification: (globalItem as any).specification,
                        minStock: globalItem.minStock,
                    })
                } else {
                    setDefaults(null)
                }
                setMode("new-item")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat memindai barcode")
        } finally {
            setLoading(false)
        }
    }

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault()
        performScan(barcode)
    }

    const handleAddStock = async () => {
        if (!scannedItem) return

        setLoading(true)
        try {
            const result = await updateItem(scannedItem.id, {
                quantity: scannedItem.quantity + addStockQty
            })

            if (result.success) {
                toast.success(`Stok ${scannedItem.name} berhasil ditambahkan`)
                setOpen(false)
                resetState()
                router.refresh()
            } else {
                toast.error("Gagal menambahkan stok")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }

    const resetState = () => {
        setBarcode("")
        setScannedItem(null)
        setDefaults(null)
        setMode("scan")
        setAddStockQty(1)
    }

    const onOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            resetState()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ScanBarcode className="mr-2 h-4 w-4" /> Scan Barcode
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "scan" && "Scan Barcode"}
                        {mode === "add-stock" && "Tambah Stok Barang"}
                        {mode === "new-item" && "Barang Baru"}
                    </DialogTitle>
                </DialogHeader>

                {mode === "scan" && (
                    <form onSubmit={handleScan} className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Scan barcode atau ketik manual untuk mencari barang.
                            </p>
                            <Input
                                ref={inputRef}
                                placeholder="Scan barcode..."
                                value={barcode}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setBarcode(val)
                                    if (val.length === 5) {
                                        performScan(val)
                                    }
                                }}
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !barcode}>
                            {loading ? "Mencari..." : "Cari Barang"}
                        </Button>
                    </form>
                )}

                {mode === "add-stock" && scannedItem && (
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <h3 className="font-semibold">{scannedItem.name}</h3>
                            <p className="text-sm text-muted-foreground">Barcode: {scannedItem.barcode}</p>
                            <p className="text-sm text-muted-foreground">Stok Saat Ini: {scannedItem.quantity}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Jumlah Tambahan</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setAddStockQty(Math.max(1, addStockQty - 1))}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    className="w-24 text-center"
                                    value={addStockQty}
                                    onChange={(e) => setAddStockQty(parseInt(e.target.value) || 0)}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setAddStockQty(addStockQty + 1)}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={resetState}>Batal</Button>
                            <Button onClick={handleAddStock} disabled={loading}>
                                {loading ? "Menyimpan..." : "Simpan Stok"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "new-item" && (
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-800 mb-4">
                            <p className="text-sm">
                                Barcode <strong>{barcode}</strong> belum terdaftar. Silakan lengkapi data barang baru.
                            </p>
                        </div>
                        <ItemForm
                            categories={categories}
                            locations={locations}
                            defaultBarcode={barcode}
                            forcedLocationId={gudangLocation?.id}
                            defaults={defaults}
                            onSuccess={() => {
                                setOpen(false)
                                resetState()
                            }}
                        />
                        <div className="flex justify-start">
                            <Button variant="ghost" size="sm" onClick={resetState} className="mt-2">
                                &larr; Kembali ke Scan
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
