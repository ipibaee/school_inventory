"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingCart,
    User,
    Calendar as CalendarIcon,
    ScanBarcode,
    Plus,
    X,
    Package,
    Loader2,
} from "lucide-react"
import { getItemByBarcode, createBorrowing } from "@/actions/borrow"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { BarcodeScanner } from "@/components/scanning/BarcodeScanner"
import { useScanListener } from "@/hooks/use-scan-listener"

interface BorrowFormProps {
    onSuccess?: () => void
}

export function BorrowForm({ onSuccess }: BorrowFormProps) {
    const [barcode, setBarcode] = useState("")
    const [cart, setCart] = useState<any[]>([])
    const [studentName, setStudentName] = useState("")
    const [dueDate, setDueDate] = useState<Date | undefined>(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
    const [loading, setLoading] = useState(false)
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        barcodeInputRef.current?.focus()
    }, [cart])

    const handleScan = async (code: string) => {
        if (!code) return

        if (cart.find((item) => item.barcode === code)) {
            toast.error("Barang sudah ada di keranjang")
            setBarcode("")
            return
        }

        const item = await getItemByBarcode(code)
        if (item) {
            if (item.quantity <= 0) {
                toast.error("Stok barang habis")
            } else {
                setCart((prev) => [...prev, item])
                toast.success(`${item.name} ditambahkan ke keranjang`)
            }
        } else {
            toast.error("Barang tidak ditemukan")
        }
        setBarcode("")
    }

    useScanListener(handleScan)

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (barcode) handleScan(barcode)
    }

    const removeFromCart = (itemId: string) => {
        setCart(cart.filter((item) => item.id !== itemId))
    }

    const handleCheckout = async () => {
        if (!studentName || !dueDate || cart.length === 0) {
            toast.error("Informasi kurang lengkap", {
                description: "Mohon isi nama peminjam dan tambahkan minimal 1 barang.",
            })
            return
        }

        setLoading(true)
        const result = await createBorrowing({
            studentName,
            itemIds: cart.map((item) => item.id),
            dueDate,
        })
        setLoading(false)

        if (result.success) {
            toast.success("Peminjaman berhasil dicatat!", {
                description: `${cart.length} barang dipinjam oleh ${studentName}`,
            })
            setCart([])
            setStudentName("")
            setBarcode("")
            onSuccess?.()
        } else {
            toast.error(result.error || "Gagal memproses peminjaman")
        }
    }

    return (
        <div className="panel rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 lg:px-[20px] py-4 border-b border-line bg-surface">
                <div>
                    <h3 className="text-[14.5px] font-bold text-ink">
                        Formulir Peminjaman
                    </h3>
                    <p className="text-xs text-muted-ink mt-0.5">
                        Isi nama peminjam, tenggat pengembalian, dan scan barang.
                    </p>
                </div>
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-ink font-semibold">
                    LANGKAH 1 DARI 2
                </span>
            </div>

            <div className="p-4 lg:p-[20px] flex flex-col gap-4">
                {/* Row 1: Student Name & Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="borrowerName" className="label-caps">
                            NAMA PEMINJAM
                        </Label>
                        <div className="relative flex items-center">
                            <User className="absolute left-3.5 size-4 text-muted-ink pointer-events-none" />
                            <Input
                                id="borrowerName"
                                placeholder="Nama lengkap siswa atau guru..."
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="label-caps">TANGGAL KEMBALI</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10 px-3.5",
                                        !dueDate && "text-muted-ink"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-muted-ink" />
                                    {dueDate ? (
                                        <span className="text-ink font-medium text-[13px]">
                                            {format(dueDate, "PPP", { locale: id })}
                                        </span>
                                    ) : (
                                        <span className="text-muted-ink text-[13px]">Pilih tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50 bg-surface border border-line rounded-[12px] shadow-dialog" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dueDate}
                                    onSelect={setDueDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Row 2: Add item scan */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="scanBarcodeBorrow" className="label-caps">
                        TAMBAH BARANG (SCAN / MANUAL)
                    </Label>
                    <form onSubmit={handleManualAdd} className="flex gap-2">
                        <div className="relative flex-1">
                            <ScanBarcode className="absolute left-3.5 top-3 size-4 text-muted-ink pointer-events-none" />
                            <Input
                                id="scanBarcodeBorrow"
                                ref={barcodeInputRef}
                                placeholder="Scan barcode atau ketik kode barang..."
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <BarcodeScanner onScan={handleScan} />
                        <Button type="submit" variant="secondary" disabled={!barcode}>
                            Tambah
                        </Button>
                    </form>
                </div>

                {/* Cart Section */}
                <div className="border border-line rounded-[12px] overflow-hidden flex flex-col mt-2">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-2 border-b border-line">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="size-4 text-ink-soft" />
                            <span className="text-xs font-bold text-ink">Keranjang</span>
                            <Badge variant="brand" className="text-[10px] px-2 py-0">
                                {cart.length} barang
                            </Badge>
                        </div>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setCart([])}
                                className="text-[11px] font-bold text-muted-ink hover:text-rose transition-colors cursor-pointer"
                            >
                                Kosongkan
                            </button>
                        )}
                    </div>

                    <div className="p-3 flex flex-col gap-2 min-h-[100px] max-h-[260px] overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-ink">
                                Keranjang masih kosong. Scan barcode barang untuk memasukkannya ke daftar pinjam.
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-2.5 rounded-[9px] bg-surface-2 border border-line flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-7 rounded-[7px] bg-brand-soft grid place-items-center text-brand shrink-0">
                                            <Package className="size-3.5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-ink truncate leading-tight">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] text-muted-ink truncate leading-tight">
                                                {item.barcode} · {item.location?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(item.id)}
                                        className="size-6 rounded-[6px] hover:bg-rose-soft text-muted-ink hover:text-rose grid place-items-center transition-colors cursor-pointer shrink-0"
                                        title="Hapus"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Submit */}
                <div className="flex items-center justify-between pt-2 border-t border-line">
                    <span className="text-xs text-muted-ink">
                        Total yang akan dipinjam: <strong className="text-ink">{cart.length} unit</strong>
                    </span>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleCheckout}
                        disabled={loading || cart.length === 0 || !studentName}
                        className="gap-2"
                    >
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        <span>Simpan Peminjaman</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
