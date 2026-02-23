import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockReport } from "@/components/reports/StockReport"
import { BorrowingReport } from "@/components/reports/BorrowingReport"
import { IncomingItemsReport } from "@/components/reports/IncomingItemsReport"
import { WarehouseReport } from "@/components/reports/WarehouseReport"

export default function ReportsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">Laporan</h2>
            </div>

            <Tabs defaultValue="stock" className="space-y-4 print:space-y-0">
                <TabsList className="print:hidden">
                    <TabsTrigger value="stock">Laporan Stok</TabsTrigger>
                    <TabsTrigger value="borrowing">Riwayat Peminjam</TabsTrigger>
                    <TabsTrigger value="warehouse">Riwayat Gudang</TabsTrigger>
                    <TabsTrigger value="incoming">Barang Masuk</TabsTrigger>
                </TabsList>
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
