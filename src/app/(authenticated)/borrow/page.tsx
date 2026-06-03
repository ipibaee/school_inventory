import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BorrowForm } from "@/components/borrow/BorrowForm"
import { ReturnForm } from "@/components/borrow/ReturnForm"
import { ActiveLoans } from "@/components/borrow/ActiveLoans"

export default function BorrowPage() {
    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Peminjaman & Pengembalian</h2>
            </div>

            <Tabs defaultValue="borrow" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="flex overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0 md:flex-wrap justify-start gap-1.5 bg-transparent border-0 p-0 max-w-full w-[calc(100%+2rem)] md:w-full">
                        <TabsTrigger value="borrow" className="shrink-0 cursor-pointer">Pinjam Barang</TabsTrigger>
                        <TabsTrigger value="return" className="shrink-0 cursor-pointer">Kembalikan Barang</TabsTrigger>
                        <TabsTrigger value="active" className="shrink-0 cursor-pointer">Peminjaman Aktif</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="borrow" className="space-y-4">
                    <BorrowForm />
                </TabsContent>
                <TabsContent value="return" className="space-y-4">
                    <ReturnForm />
                </TabsContent>
                <TabsContent value="active" className="space-y-4">
                    <ActiveLoans />
                </TabsContent>
            </Tabs>
        </div>
    )
}
