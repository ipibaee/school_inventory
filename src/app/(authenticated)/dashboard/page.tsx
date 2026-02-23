import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, ArrowRightLeft, Clock, TrendingUp } from "lucide-react"
import { getDashboardStats, getRecentActivity, getLowStockItems } from "@/actions/dashboard"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()
    const lowStockItems = await getLowStockItems()

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dasbor</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Di semua lokasi
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Peringatan Stok Rendah</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Barang di bawah stok minimum
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Peminjaman Aktif</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.activeLoans}</div>
                        <p className="text-xs text-muted-foreground">
                            Barang sedang dipinjam
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktivitas Hari Ini</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                            Transaksi hari ini
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada aktivitas terbaru.</p>
                            ) : (
                                recentActivity.map((tx) => (
                                    <div key={tx.id} className="flex items-center">
                                        <div className={`ml-4 space-y-1 ${tx.type === 'IN' ? 'border-l-4 border-green-500 pl-4' : 'border-l-4 border-red-500 pl-4'}`}>
                                            <p className="text-sm font-medium leading-none">
                                                {tx.type === 'IN' ? 'Barang Dikembalikan/Ditambah' : 'Barang Dipinjam/Keluar'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {tx.item.name} ({tx.quantity})
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            {format(new Date(tx.date), "PP p", { locale: id })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Barang Stok Rendah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {lowStockItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Semua stok aman.</p>
                            ) : (
                                lowStockItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.location.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-red-600 font-bold text-sm">{item.quantity}</span>
                                            <span className="text-xs text-muted-foreground block">Min: {item.minStock}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
