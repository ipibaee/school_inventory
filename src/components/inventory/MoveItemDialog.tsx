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
import { ArrowRightLeft, Search } from "lucide-react"
import { getItemByBarcode } from "@/actions/inventory"
import { moveItem } from "@/actions/move"
import { toast } from "sonner"

interface MoveItemDialogProps {
    locations: { id: string; name: string }[]
    defaultSourceLocationId?: string
}

export function MoveItemDialog({ locations, defaultSourceLocationId }: MoveItemDialogProps) {
    const [open, setOpen] = useState(false)
    const [barcode, setBarcode] = useState("")
    const [item, setItem] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    const [sourceLocationId, setSourceLocationId] = useState(defaultSourceLocationId || "")
    const [targetLocationId, setTargetLocationId] = useState("")
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleScan = async (barcodeOverride?: string) => {
        const codeToScan = barcodeOverride || barcode
        if (!codeToScan) return
        setLoading(true)
        try {
            // If source location is selected, try to find item there first
            const foundItem = await getItemByBarcode(codeToScan, sourceLocationId)

            if (foundItem) {
                setItem(foundItem)
                // If we found the item, and we didn't have a source location set, set it to the item's location
                if (!sourceLocationId) {
                    setSourceLocationId(foundItem.locationId)
                } else if (sourceLocationId !== foundItem.locationId) {
                    // Warning if item found but not in selected source (if getItemByBarcode falls back)
                    // But our updated getItemByBarcode with locationId should be strict if provided.
                    // If it returned something, it matches.
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
            toast.error("Mohon lengkapi data")
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
                quantity: quantity
            })

            if (result.success) {
                toast.success("Barang berhasil dipindahkan")
                setOpen(false)
                resetForm()
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
        setTargetLocationId("")
        // Keep source location if it was passed as default
        if (!defaultSourceLocationId) setSourceLocationId("")
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Pindah Barang
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Pindahkan Barang</DialogTitle>
                    <DialogDescription>
                        Pindahkan stok barang antar ruangan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Dari Lokasi</Label>
                            <Select
                                value={sourceLocationId}
                                onValueChange={(val) => {
                                    setSourceLocationId(val)
                                    setItem(null) // Reset item if location changes
                                }}
                                disabled={!!defaultSourceLocationId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Lokasi Asal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ke Lokasi</Label>
                            <Select value={targetLocationId} onValueChange={setTargetLocationId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Lokasi Tujuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id} disabled={loc.id === sourceLocationId}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Scan Barcode</Label>
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={barcode}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setBarcode(val)
                                    if (val.length === 5) {
                                        // Auto scan when 5 digits are entered
                                        // We need to use a timeout to allow state to update or pass val directly
                                        // Since handleScan uses state 'barcode', we might need to pass it or wait.
                                        // Better to refactor handleScan to accept optional barcode
                                        handleScan(val)
                                    }
                                }}
                                placeholder="Scan barcode..."
                                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                            />
                            <Button size="icon" onClick={() => handleScan()} disabled={loading || !sourceLocationId}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {item && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                            <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">Stok di {locations.find(l => l.id === sourceLocationId)?.name}: {item.quantity}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Jumlah Dipindah</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={item.quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button onClick={handleMove} disabled={loading || !item || !targetLocationId}>
                        {loading ? "Memproses..." : "Pindahkan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
