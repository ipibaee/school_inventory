"use client"

import { useState, useRef } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowRightLeft, Search, Loader2 } from "lucide-react"
import { getItemByBarcode } from "@/actions/inventory"
import { moveItem } from "@/actions/move"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MoveItemDialogProps {
    locations: { id: string; name: string }[]
    defaultSourceLocationId?: string
    trigger?: React.ReactNode
}

export function MoveItemDialog({
    locations,
    defaultSourceLocationId,
    trigger,
}: MoveItemDialogProps) {
    const [open, setOpen] = useState(false)
    const [barcode, setBarcode] = useState("")
    const [item, setItem] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [sourceLocationId, setSourceLocationId] = useState(defaultSourceLocationId || "")
    const [targetLocationId, setTargetLocationId] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleScan = async (barcodeOverride?: string) => {
        const codeToScan = barcodeOverride || barcode
        if (!codeToScan) return
        setLoading(true)
        try {
            const foundItem = await getItemByBarcode(codeToScan, sourceLocationId)

            if (foundItem) {
                setItem(foundItem)
                if (!sourceLocationId) {
                    setSourceLocationId(foundItem.locationId)
                }
                toast.success(`Barang ditemukan: ${foundItem.name}`)
            } else {
                toast.error("Barang tidak ditemukan di lokasi asal")
                setItem(null)
            }
        } catch (error) {
            toast.error("Gagal mencari barang")
        } finally {
            setLoading(false)
        }
    }

    const handleMove = async () => {
        if (!item || !sourceLocationId || !targetLocationId) {
            toast.error("Mohon lengkapi data pemindahan")
            return
        }

        if (sourceLocationId === targetLocationId) {
            toast.error("Lokasi asal dan tujuan tidak boleh sama")
            return
        }

        setLoading(true)
        try {
            const result = await moveItem({
                barcode: item.barcode,
                fromLocationId: sourceLocationId,
                toLocationId: targetLocationId,
                quantity: quantity,
            })

            if (result.success) {
                toast.success("Barang berhasil dipindahkan")
                setOpen(false)
                resetForm()
                router.refresh()
            } else {
                toast.error(result.error || "Gagal memindahkan barang")
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
        setSourceLocationId(defaultSourceLocationId || "")
        setTargetLocationId("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="secondary" className="gap-2">
                        <ArrowRightLeft className="size-4" />
                        <span>Pindah Barang</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Pindah Lokasi Barang</DialogTitle>
                    <DialogDescription>
                        Pindahkan stok barang dari satu ruangan atau lab ke lokasi lain.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Barcode Search */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="barcode" className="label-caps">
                            BARCODE BARANG
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="barcode"
                                ref={inputRef}
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleScan()
                                    }
                                }}
                                placeholder="Scan atau ketik barcode..."
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleScan()}
                                disabled={loading || !barcode}
                                className="px-3"
                            >
                                {loading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Search className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Item Found Information */}
                    {item && (
                        <div className="p-3.5 rounded-[12px] bg-brand-soft border border-brand/20 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-ink">{item.name}</span>
                                <span className="text-xs font-bold text-brand">Stok: {item.quantity}</span>
                            </div>
                            <span className="text-[11px] text-muted-ink">
                                Barcode: {item.barcode} · Lokasi saat ini: {item.location?.name}
                            </span>
                        </div>
                    )}

                    {/* Source and Target Locations */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="label-caps">LOKASI ASAL</Label>
                            <Select
                                value={sourceLocationId}
                                onValueChange={setSourceLocationId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Asal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="label-caps">LOKASI TUJUAN</Label>
                            <Select
                                value={targetLocationId}
                                onValueChange={setTargetLocationId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tujuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations
                                        .filter((loc) => loc.id !== sourceLocationId)
                                        .map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quantity" className="label-caps">
                            JUMLAH PEMINDAHAN
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={item ? item.quantity : undefined}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full"
                        />
                        {item && quantity > item.quantity && (
                            <span className="text-[10.5px] text-rose font-semibold">
                                Jumlah melebihi stok yang tersedia ({item.quantity}).
                            </span>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setOpen(false)
                            resetForm()
                        }}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleMove}
                        disabled={
                            loading ||
                            !item ||
                            !sourceLocationId ||
                            !targetLocationId ||
                            quantity <= 0 ||
                            (item && quantity > item.quantity)
                        }
                    >
                        {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
                        <span>Pindahkan Barang</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
