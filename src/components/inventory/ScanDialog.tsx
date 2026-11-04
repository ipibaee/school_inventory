"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScanBarcode, Plus, Search, Loader2 } from "lucide-react"
import { getItemByBarcode, updateItem } from "@/actions/inventory"
import { ItemForm } from "./ItemForm"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ScanDialogProps {
    categories: { id: string; name: string }[]
    locations: { id: string; name: string }[]
    trigger?: React.ReactNode
}

export function ScanDialog({ categories, locations, trigger }: ScanDialogProps) {
    const [open, setOpen] = useState(false)
    const [barcode, setBarcode] = useState("")
    const [loading, setLoading] = useState(false)
    const [scannedItem, setScannedItem] = useState<any>(null)
    const [addStockQty, setAddStockQty] = useState(1)
    const [mode, setMode] = useState<"scan" | "add-stock" | "new-item">("scan")
    const [defaults, setDefaults] = useState<any>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const gudangLocation = locations.find((l) => l.name === "Gudang")

    useEffect(() => {
        if (open && mode === "scan") {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open, mode])

    const performScan = async (codeToScan: string) => {
        if (!codeToScan) return

        setLoading(true)
        try {
            let item = null
            if (gudangLocation) {
                item = await getItemByBarcode(codeToScan, gudangLocation.id)
            } else {
                item = await getItemByBarcode(codeToScan)
            }

            if (item) {
                setScannedItem(item)
                setMode("add-stock")
                setAddStockQty(1)
                toast.success(`Barang ditemukan: ${item.name}`)
            } else {
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
                toast.info("Barang belum terdaftar di Gudang. Silakan lengkapi data.")
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
                quantity: scannedItem.quantity + addStockQty,
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
        setMode("scan")
        setAddStockQty(1)
        setDefaults(null)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                setOpen(val)
                if (!val) resetState()
            }}
        >
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="secondary" className="gap-2">
                        <ScanBarcode className="size-4" />
                        <span>Scan Barcode</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "scan" && "Scan Cepat Barcode"}
                        {mode === "add-stock" && "Tambah Stok Gudang"}
                        {mode === "new-item" && "Registrasi Barang Baru"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "scan" &&
                            "Arahkan scanner barcode atau masukkan kode manual untuk mendeteksi barang."}
                        {mode === "add-stock" &&
                            "Barang sudah ada di Gudang. Tambahkan jumlah unit yang masuk."}
                        {mode === "new-item" &&
                            "Barang belum ada di Gudang. Daftarkan barang baru dengan barcode ini."}
                    </DialogDescription>
                </DialogHeader>

                {mode === "scan" && (
                    <form onSubmit={handleScan} className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="scanBarcode" className="label-caps">
                                KODE BARCODE
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="scanBarcode"
                                    ref={inputRef}
                                    placeholder="Tempel atau scan barcode di sini..."
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading || !barcode}
                                    className="px-4"
                                >
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Search className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {mode === "add-stock" && scannedItem && (
                    <div className="flex flex-col gap-4 py-2">
                        <div className="p-3.5 rounded-[12px] bg-brand-soft border border-brand/20 flex flex-col gap-1">
                            <span className="text-[14px] font-bold text-ink">
                                {scannedItem.name}
                            </span>
                            <span className="text-xs text-muted-ink">
                                Barcode: {scannedItem.barcode} · Lokasi: {scannedItem.location?.name}
                            </span>
                            <span className="text-xs font-bold text-brand mt-1">
                                Stok Saat Ini: {scannedItem.quantity} unit
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="addQty" className="label-caps">
                                JUMLAH TAMBAHAN
                            </Label>
                            <Input
                                id="addQty"
                                type="number"
                                min="1"
                                value={addStockQty}
                                onChange={(e) => setAddStockQty(parseInt(e.target.value) || 1)}
                                className="w-full"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="secondary" onClick={resetState}>
                                Scan Lain
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleAddStock}
                                disabled={loading || addStockQty <= 0}
                            >
                                {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
                                <span>Simpan Tambahan Stok</span>
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {mode === "new-item" && (
                    <div className="py-2">
                        <ItemForm
                            categories={categories}
                            locations={locations}
                            defaultBarcode={barcode}
                            forcedLocationId={gudangLocation?.id}
                            defaults={defaults}
                            onSuccess={() => {
                                setOpen(false)
                                resetState()
                                toast.success("Barang baru berhasil ditambahkan ke Gudang")
                            }}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
