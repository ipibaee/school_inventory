"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getActiveLoans, returnItem } from "@/actions/borrow"
import { format, isPast, differenceInDays } from "date-fns"
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ActiveLoans() {
    const [loans, setLoans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchLoans = async () => {
        setLoading(true)
        const data = await getActiveLoans()
        setLoans(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchLoans()
    }, [])

    const handleQuickReturn = async (borrowingId: string) => {
        const result = await returnItem(borrowingId, "Good")
        if (result.success) {
            toast.success("Barang berhasil dikembalikan")
            fetchLoans()
        } else {
            toast.error("Gagal mengembalikan barang")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Peminjaman Aktif
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Peminjam</TableHead>
                                <TableHead>Barang</TableHead>
                                <TableHead>Tanggal Pinjam</TableHead>
                                <TableHead>Tanggal Kembali</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Memuat...
                                    </TableCell>
                                </TableRow>
                            ) : loans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Tidak ada peminjaman aktif.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                loans.map((loan) => {
                                    const isOverdue = isPast(new Date(loan.dueDate)) && differenceInDays(new Date(), new Date(loan.dueDate)) > 0

                                    return (
                                        <TableRow key={loan.id}>
                                            <TableCell>
                                                <div className="font-medium">{loan.studentName}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{loan.item.name}</div>
                                                <div className="text-xs text-muted-foreground">{loan.item.barcode}</div>
                                            </TableCell>
                                            <TableCell>{format(new Date(loan.borrowDate), "dd MMM yyyy")}</TableCell>
                                            <TableCell>
                                                <div className={isOverdue ? "text-red-600 font-bold" : ""}>
                                                    {format(new Date(loan.dueDate), "dd MMM yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isOverdue ? (
                                                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Terlambat
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        Aktif
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="outline">Kembalikan</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Konfirmasi Pengembalian</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menandai barang ini sudah dikembalikan?
                                                                Ini mengasumsikan barang dalam kondisi <strong>Baik</strong>.
                                                                Untuk kondisi lain, gunakan tab "Kembalikan Barang".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleQuickReturn(loan.id)}>
                                                                Konfirmasi Pengembalian
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
