import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, AlertTriangle, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, CheckCircle2, Activity } from "lucide-react"
import { getDashboardStats, getRecentActivity, getLowStockItems } from "@/actions/dashboard"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()
    const lowStockItems = await getLowStockItems()

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-200 bg-clip-text text-transparent">
                    Dasbor Inventaris
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Status stok barang dan ringkasan aktivitas sekolah terkini.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Items */}
                <Card className="relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 border-indigo-500/15 dark:border-indigo-500/5 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Barang</CardTitle>
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center border border-indigo-500/20">
                            <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3.5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {stats.totalItems}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Di semua laboratorium & ruang
                        </p>
                    </CardContent>
                </Card>

                {/* Low Stock Warning */}
                <Card className="relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/5 dark:hover:shadow-rose-500/10 border-rose-500/15 dark:border-rose-500/5 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">Stok Rendah</CardTitle>
                        <div className="h-8 w-8 rounded-xl bg-rose-500/10 dark:bg-rose-400/10 flex items-center justify-center border border-rose-500/20">
                            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className={cn(
                            "text-3.5xl font-extrabold tracking-tight",
                            stats.lowStockItems > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                        )}>
                            {stats.lowStockItems}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className={cn("h-1.5 w-1.5 rounded-full", stats.lowStockItems > 0 ? "bg-rose-500" : "bg-emerald-500")} /> 
                            {stats.lowStockItems > 0 ? "Memerlukan pengisian ulang" : "Semua stok aman"}
                        </p>
                    </CardContent>
                </Card>

                {/* Active Loans */}
                <Card className="relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 dark:hover:shadow-amber-500/10 border-amber-500/15 dark:border-amber-500/5 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">Peminjaman Aktif</CardTitle>
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center border border-amber-500/20">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3.5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {stats.activeLoans}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Sedang digunakan siswa/guru
                        </p>
                    </CardContent>
                </Card>

                {/* Today Transactions */}
                <Card className="relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/5 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">Transaksi Hari Ini</CardTitle>
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-3.5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {stats.todayTransactions}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mutasi keluar & masuk hari ini
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Feeds Section */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Recent Activities */}
                <Card className="lg:col-span-4 border-0 shadow-lg relative overflow-hidden bg-white/30 dark:bg-zinc-950/20 backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/20" />
                    <CardHeader className="border-b border-border/40 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400">Timeline pencatatan barang dan mutasi logistik.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800 space-y-6">
                            {recentActivity.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in pl-0 border-l-0">
                                    <div className="h-14 w-14 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 border border-indigo-500/10 flex items-center justify-center mb-4">
                                        <Activity className="h-6 w-6 text-indigo-500/50" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Semua Sunyi di Sini</p>
                                    <p className="text-xs text-slate-400 max-w-[280px] mt-1">Aktivitas inventaris dan transaksi baru akan muncul di timeline ini.</p>
                                </div>
                            ) : (
                                recentActivity.map((tx) => {
                                    const isIncoming = tx.type === 'IN'
                                    return (
                                        <div key={tx.id} className="relative group animate-fade-in">
                                            {/* Timeline Node Icon */}
                                            <div className={cn(
                                                "absolute -left-[35px] top-0 h-6 w-6 rounded-full flex items-center justify-center border shadow-xs transition-colors",
                                                isIncoming 
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20" 
                                                    : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20"
                                            )}>
                                                {isIncoming ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                            </div>
                                            
                                            {/* Content Block */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 border border-transparent hover:border-border/30 transition-all duration-200">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                            {isIncoming ? 'Barang Masuk / Ditambah' : 'Barang Dipinjam / Keluar'}
                                                        </span>
                                                        <Badge variant={isIncoming ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0">
                                                            {isIncoming ? "Masuk" : "Keluar"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        {tx.item.name} <span className="font-semibold text-slate-600 dark:text-slate-300">({tx.quantity} unit)</span>
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {format(new Date(tx.date), "PP p", { locale: id })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Items */}
                <Card className="lg:col-span-3 border-0 shadow-lg relative overflow-hidden bg-white/30 dark:bg-zinc-950/20 backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-rose-500/20" />
                    <CardHeader className="border-b border-border/40 dark:border-white/5 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                            Stok Hampir Habis
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400">Segera lakukan pengadaan untuk barang berikut.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {lowStockItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                                    <div className="h-14 w-14 rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500/70" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Semua Stok Aman</p>
                                    <p className="text-xs text-slate-400 max-w-[240px] mt-1">Luar biasa! Semua barang memiliki jumlah persediaan yang mencukupi.</p>
                                </div>
                            ) : (
                                lowStockItems.map((item) => {
                                    const percent = Math.min(100, Math.round((item.quantity / (item.minStock || 5)) * 100))
                                    return (
                                        <div key={item.id} className="p-3 border border-border/40 dark:border-white/5 bg-white/20 dark:bg-black/10 rounded-xl hover:shadow-xs transition-all duration-200 animate-fade-in">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.location.name}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{item.quantity}</span>
                                                    <span className="text-xs text-slate-400 font-mono block">Min: {item.minStock}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Visual Progress Bar */}
                                            <div className="mt-3">
                                                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
