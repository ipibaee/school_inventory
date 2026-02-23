import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BorrowForm } from "@/components/borrow/BorrowForm"
import { ReturnForm } from "@/components/borrow/ReturnForm"
import { ActiveLoans } from "@/components/borrow/ActiveLoans"

export default function BorrowPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Peminjaman & Pengembalian</h2>
            </div>

            <Tabs defaultValue="borrow" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="borrow">Pinjam Barang</TabsTrigger>
                    <TabsTrigger value="return">Kembalikan Barang</TabsTrigger>
                    <TabsTrigger value="active">Peminjaman Aktif</TabsTrigger>
                </TabsList>
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
