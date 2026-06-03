import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockReport } from "@/components/reports/StockReport"
import { BorrowingReport } from "@/components/reports/BorrowingReport"
import { IncomingItemsReport } from "@/components/reports/IncomingItemsReport"
import { WarehouseReport } from "@/components/reports/WarehouseReport"

export default function ReportsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Laporan</h2>
            </div>

            <Tabs defaultValue="stock" className="space-y-4 print:space-y-0">
                <div className="flex items-center justify-between print:hidden">
                    <TabsList className="flex overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0 md:flex-wrap justify-start gap-1.5 bg-transparent border-0 p-0 max-w-full w-[calc(100%+2rem)] md:w-full">
                        <TabsTrigger value="stock" className="shrink-0 cursor-pointer">Laporan Stok</TabsTrigger>
                        <TabsTrigger value="borrowing" className="shrink-0 cursor-pointer">Riwayat Peminjam</TabsTrigger>
                        <TabsTrigger value="warehouse" className="shrink-0 cursor-pointer">Riwayat Gudang</TabsTrigger>
                        <TabsTrigger value="incoming" className="shrink-0 cursor-pointer">Barang Masuk</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="stock" className="space-y-4 print:block">
                    <StockReport />
                </TabsContent>
                <TabsContent value="borrowing" className="space-y-4 print:block">
                    <BorrowingReport />
                </TabsContent>
                <TabsContent value="warehouse" className="space-y-4 print:block">
                    <WarehouseReport />
                </TabsContent>
                <TabsContent value="incoming" className="space-y-4 print:block">
                    <IncomingItemsReport />
                </TabsContent>
            </Tabs>
        </div>
    )
}
