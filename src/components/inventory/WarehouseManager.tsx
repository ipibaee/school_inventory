"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getItemByBarcode } from "@/actions/inventory"
import { processWarehouseTransaction } from "@/actions/warehouse"
import { toast } from "sonner"
import { ArrowDownLeft, ArrowUpRight, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WarehouseManagerProps {
    locations: { id: string; name: string }[]
}

export function WarehouseManager({ locations }: WarehouseManagerProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <TransactionPanel
                type="IN"
                title="Barang Masuk"
                color="mint"
                icon={<ArrowDownLeft className="size-4" />}
                locations={locations}
            />
            <TransactionPanel
                type="OUT"
                title="Barang Keluar"
                color="rose"
                icon={<ArrowUpRight className="size-4" />}
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
    locations,
}: {
    type: "IN" | "OUT"
    title: string
    color: "mint" | "rose"
    icon: React.ReactNode
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

    const isMint = color === "mint"

    return (
        <div className="panel rounded-2xl flex flex-col overflow-hidden">
            <div
                className={cn(
                    "flex items-center gap-2.5 px-[22px] py-4 border-b border-line",
                    isMint ? "bg-mint-soft text-mint" : "bg-rose-soft text-rose"
                )}
            >
                <div
                    className={cn(
                        "size-7 rounded-[8px] grid place-items-center",
                        isMint ? "bg-mint text-white" : "bg-rose text-white"
                    )}
                >
                    {icon}
                </div>
                <h3 className="text-[15.5px] font-bold leading-tight">{title}</h3>
            </div>

            <div className="p-[22px] flex flex-col gap-5 flex-1">
                {/* Scan Section */}
                <div className="flex flex-col gap-1.5">
                    <Label className="label-caps">SCAN BARCODE</Label>
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            placeholder="Scan atau ketik barcode..."
                            value={barcode}
                            onChange={(e) => {
                                const val = e.target.value
                                setBarcode(val)
                                if (val.length === 5) {
                                    performScan(val)
                                }
                            }}
                            disabled={loading}
                            className="font-mono text-sm h-10 flex-1"
                            autoFocus={type === "IN"}
                        />
                        <Button
                            variant="secondary"
                            className="px-3"
                            onClick={() => performScan(barcode)}
                            disabled={loading || !barcode}
                        >
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Search className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Item Details */}
                {item ? (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="p-3.5 rounded-[12px] bg-surface-2 border border-line flex items-start justify-between">
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-bold text-[13.5px] text-ink truncate">
                                    {item.name}
                                </span>
                                <span className="text-xs text-muted-ink mt-0.5 truncate">
                                    {item.category.name} · {item.location.name}
                                </span>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] uppercase font-bold text-muted-ink block">
                                    Stok Saat Ini
                                </span>
                                <span className="text-xl font-extrabold text-brand tabular-nums">
                                    {item.quantity}
                                </span>
                            </div>
                        </div>

                        {/* Quantity & Note */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`qty-${type}`} className="label-caps">
                                    JUMLAH
                                </Label>
                                <Input
                                    id={`qty-${type}`}
                                    type="number"
                                    min="1"
                                    max={type === "OUT" ? item.quantity : undefined}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor={`note-${type}`} className="label-caps">
                                    CATATAN (OPSIONAL)
                                </Label>
                                <Input
                                    id={`note-${type}`}
                                    placeholder="Contoh: Pengadaan baru"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={resetForm}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={loading || quantity <= 0 || (type === "OUT" && quantity > item.quantity)}
                                className="flex-1"
                            >
                                {loading && <Loader2 className="size-4 animate-spin mr-1.5" />}
                                <span>Konfirmasi {title}</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-line rounded-[12px] bg-surface-2/40">
                        <span className="text-xs font-semibold text-ink-soft">
                            Belum ada barang dipilih
                        </span>
                        <span className="text-[11px] text-muted-ink mt-0.5">
                            Scan barcode untuk memulai transaksi logistik.
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
