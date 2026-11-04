"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getActiveLoans, returnItem } from "@/actions/borrow"
import { format, isPast, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import { Clock, Loader2, ArrowRight } from "lucide-react"
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

interface ActiveLoansProps {
    compact?: boolean
    onUpdated?: () => void
}

export function ActiveLoans({ compact = false, onUpdated }: ActiveLoansProps) {
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
            onUpdated?.()
        } else {
            toast.error("Gagal mengembalikan barang")
        }
    }

    return (
        <div className="panel rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 lg:p-[18px_20px] border-b border-line bg-surface">
                <div className="flex items-center gap-2">
                    <span className="size-7 rounded-[8px] bg-amber-soft grid place-items-center text-amber shrink-0">
                        <Clock className="size-3.5" />
                    </span>
                    <h3 className="text-[14.5px] font-bold text-ink">
                        Peminjaman Aktif
                    </h3>
                </div>
                <Badge variant="warning" className="text-[10px] px-2 py-0.5">
                    {loans.length}
                </Badge>
            </div>

            <div className="p-4 lg:p-[18px_20px] flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center py-10 text-muted-ink">
                        <Loader2 className="size-5 animate-spin mr-2" />
                        <span className="text-xs">Memuat data peminjaman...</span>
                    </div>
                ) : loans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-ink">
                        Tidak ada peminjaman aktif saat ini.
                    </div>
                ) : (
                    loans.map((loan) => {
                        const isOverdue =
                            isPast(new Date(loan.dueDate)) &&
                            differenceInDays(new Date(), new Date(loan.dueDate)) > 0

                        return (
                            <div
                                key={loan.id}
                                className="p-3 rounded-[10px] bg-surface-2 border border-line flex flex-col gap-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-ink truncate">
                                            {loan.studentName}
                                        </span>
                                        <span className="text-[11px] text-muted-ink truncate">
                                            {loan.item?.name} · {loan.item?.barcode}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={isOverdue ? "rose" : "warning"}
                                        dot
                                        className="text-[10px] px-2 py-0 shrink-0"
                                    >
                                        {isOverdue ? "Terlambat" : "Dipinjam"}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-[10.5px] text-muted-ink pt-1 border-t border-line/60">
                                    <span>
                                        Tenggat: {format(new Date(loan.dueDate), "d MMM yyyy", { locale: id })}
                                    </span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="font-bold text-brand hover:underline cursor-pointer"
                                            >
                                                Kembalikan
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Konfirmasi Pengembalian</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tandai barang "{loan.item?.name}" yang dipinjam oleh{" "}
                                                    {loan.studentName} sebagai sudah dikembalikan dalam kondisi baik?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleQuickReturn(loan.id)}
                                                    className="bg-brand text-white hover:bg-brand/90"
                                                >
                                                    Ya, Kembalikan
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
