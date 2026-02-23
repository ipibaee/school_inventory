"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Trash, ShoppingCart, User, Calendar as CalendarIcon } from "lucide-react"
import { getItemByBarcode, createBorrowing } from "@/actions/borrow"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { BarcodeScanner } from "@/components/scanning/BarcodeScanner"
import { useScanListener } from "@/hooks/use-scan-listener"

export function BorrowForm() {
    const [barcode, setBarcode] = useState("")
    const [cart, setCart] = useState<any[]>([])
    const [studentName, setStudentName] = useState("")
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    const [loading, setLoading] = useState(false)
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        barcodeInputRef.current?.focus()
    }, [cart])

    const handleScan = async (code: string) => {
        if (!code) return

        // Check if item is already in cart
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
            toast.error("Informasi kurang", {
                description: "Mohon isi nama peminjam dan tambahkan barang ke keranjang."
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
            toast.success("Peminjaman berhasil", {
                description: `${cart.length} barang dipinjam oleh ${studentName}`
            })
            setCart([])
            setStudentName("")
            setBarcode("")
        } else {
            toast.error("Gagal memproses peminjaman", {
                description: result.error
            })
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Peminjam
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nama</label>
                            <Input
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-2">Tanggal Kembali</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "PPP") : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Tambah Barang
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                ref={barcodeInputRef}
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Scan Barcode..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleManualAdd(e)
                                    }
                                }}
                            />
                            <BarcodeScanner onScan={handleScan} />
                            <Button onClick={handleManualAdd}>Tambah</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Keranjang ({cart.length} barang)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Barcode</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.barcode}</TableCell>
                                            <TableCell>{item.location.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                Keranjang kosong. Scan barang untuk memulai.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-8 pt-8 border-t">
                            <Button
                                className="w-full h-12 text-lg"
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                            >
                                {loading ? "Memproses..." : "Selesaikan Peminjaman"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
