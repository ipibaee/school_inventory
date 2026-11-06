import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
    Boxes,
    TriangleAlert,
    Clock,
    ShoppingCart,
    Search,
    Bell,
    Plus,
    PackagePlus,
    CheckCircle2,
    ArrowRight,
    ClipboardList,
    FileText,
    UserCheck,
} from "lucide-react"

import { getDashboardStats, getRecentActivity, getLowStockItems } from "@/actions/dashboard"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MONTH_NAMES_ID, formatDateId } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()
    const lowStockItems = await getLowStockItems()

    const monthName = MONTH_NAMES_ID[stats.currentMonth - 1] || "Bulan Ini"
    const monthShort = formatDateId(new Date(), "MMM yyyy")

    const kpis = [
        {
            label: "Total Barang",
            value: stats.totalItems,
            caption: "Di semua laboratorium & ruang",
            mobileCaption: "Semua lab & ruang",
            icon: Boxes,
            chipBg: "bg-brand-soft",
            iconColor: "text-brand",
        },
        {
            label: "Stok Rendah",
            value: stats.lowStockItems,
            caption: "Barang perlu segera diisi",
            mobileCaption: "Perlu pengisian",
            icon: TriangleAlert,
            chipBg: "bg-rose-soft",
            iconColor: "text-rose",
        },
        {
            label: "Peminjaman Aktif",
            value: stats.activeLoans,
            caption: "Masih dipinjam pengguna",
            mobileCaption: "Sedang dipakai",
            icon: Clock,
            chipBg: "bg-amber-soft",
            iconColor: "text-amber",
        },
        {
            label: "Pengadaan BOS",
            mobileLabel: "Belanja BOS",
            value: stats.bosUnits,
            caption: `Unit masuk · ${monthShort}`,
            mobileCaption: `Unit masuk · ${monthShort}`,
            icon: ShoppingCart,
            chipBg: "bg-mint-soft",
            iconColor: "text-mint",
        },
    ]

    return (
        <div className="flex flex-col gap-4 lg:gap-[20px]">
            {/* Mobile App Bar */}
            <MobileAppBar
                title="Dasbor"
                subtitle="Status stok & aktivitas"
                showBrandMark={true}
            />

            {/* Desktop PageHeader */}
            <PageHeader
                title="Dasbor Inventaris"
                subtitle="Status stok barang dan ringkasan aktivitas sekolah terkini."
                actions={
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex items-center w-[236px]">
                            <Search className="absolute left-3.5 size-4 text-muted-ink pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari barang atau barcode..."
                                className="h-10 w-full rounded-[10px] border border-line bg-surface pl-10 pr-3.5 text-[13px] text-ink placeholder:text-muted-ink transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                            />
                        </div>
                        <ThemeToggle />
                        <button
                            type="button"
                            className="size-[38px] rounded-[10px] bg-surface border border-line grid place-items-center text-muted-ink hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                            title="Notifikasi"
                        >
                            <Bell className="size-4" />
                        </button>
                        <Button asChild variant="primary" className="gap-2">
                            <Link href="/inventory">
                                <Plus className="size-4" />
                                <span>Tambah Barang</span>
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards: Desktop 4 columns, Mobile 2 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3.5">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                        <div
                            key={kpi.label}
                            className="panel rounded-[14px] lg:rounded-2xl p-3.5 lg:p-[20px] flex flex-col justify-between gap-1.5 lg:gap-[16px]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] lg:text-[13px] font-semibold text-muted-ink lg:text-ink-soft">
                                    <span className="lg:hidden">{kpi.mobileLabel || kpi.label}</span>
                                    <span className="hidden lg:inline">{kpi.label}</span>
                                </span>
                                <span
                                    className={cn(
                                        "grid place-items-center rounded-[7px] lg:rounded-[10px]",
                                        "size-[22px] lg:size-[34px]",
                                        kpi.chipBg
                                    )}
                                >
                                    <Icon className={cn("size-[11px] lg:size-[17px]", kpi.iconColor)} />
                                </span>
                            </div>
                            <div className="text-[23px] lg:text-[34px] font-extrabold tracking-[-0.8px] lg:tracking-[-1.2px] text-ink leading-tight tabular-nums">
                                {kpi.value}
                            </div>
                            <p className="text-[9px] lg:text-xs text-muted-ink leading-[1.35] lg:leading-[1.4]">
                                <span className="lg:hidden">{kpi.mobileCaption}</span>
                                <span className="hidden lg:inline">{kpi.caption}</span>
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* ── BOS Strip: Full Width Card between KPIs and Body ── */}
            {stats.currentBap ? (
                <div className="panel rounded-[14px] lg:rounded-2xl p-3 lg:p-[14px_18px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5 border border-line">
                    <Link
                        href={`/procurement/${stats.currentBap.id}`}
                        className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90 transition-opacity"
                    >
                        <div className="size-[32px] lg:size-[38px] rounded-[10px] bg-mint-soft text-mint grid place-items-center shrink-0">
                            <ClipboardList className="size-4 lg:size-[18px]" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs lg:text-[13px] font-bold text-ink">
                                    Pengadaan BOS · {monthName} {stats.currentYear}
                                </span>
                                {stats.currentBap.status === "VERIFIED" ? (
                                    <Badge variant="mint" className="text-[9px] lg:text-[10px] py-0 px-2">
                                        Sah &amp; Lengkap
                                    </Badge>
                                ) : stats.currentBap.status === "SUBMITTED" ? (
                                    <Badge variant="amber" className="text-[9px] lg:text-[10px] py-0 px-2">
                                        Menunggu Guru
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-[9px] lg:text-[10px] py-0 px-2">
                                        Draft
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] lg:text-[11px] text-muted-ink flex-wrap">
                                {stats.currentBap.bapNumber && (
                                    <span className="font-mono text-ink-soft font-semibold">
                                        {stats.currentBap.bapNumber}
                                    </span>
                                )}
                                <span>
                                    {stats.currentBap._count?.items || 0} jenis · {stats.currentBap.totalUnits || 0} unit
                                </span>
                                {stats.currentBap.inspector?.name && (
                                    <>
                                        <span className="text-line">•</span>
                                        <span className="flex items-center gap-1 text-ink-soft">
                                            <UserCheck className="size-3 text-muted-ink" />
                                            {stats.currentBap.inspector.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <Button asChild variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
                            <Link href={`/procurement/${stats.currentBap.id}`}>
                                <FileText className="size-3.5" />
                                <span>Lihat BAP</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="panel rounded-[14px] lg:rounded-2xl p-3 lg:p-[14px_18px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5 border border-line">
                    <div className="flex items-center gap-3">
                        <div className="size-[32px] lg:size-[38px] rounded-[10px] bg-brand-soft text-brand grid place-items-center shrink-0">
                            <ClipboardList className="size-4 lg:size-[18px]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs lg:text-[13px] font-bold text-ink">
                                Pengadaan BOS · {monthName} {stats.currentYear}
                            </span>
                            <span className="text-[10px] lg:text-[11px] text-muted-ink">
                                Belum ada pengajuan belanja BOS bulan ini.
                            </span>
                        </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="gap-1.5 text-xs h-8 shrink-0 self-end sm:self-auto">
                        <Link href="/procurement">
                            <Plus className="size-3.5" />
                            <span>Buat Pengadaan</span>
                        </Link>
                    </Button>
                </div>
            )}

            {/* Body Section: Aktivitas Terbaru (left) + Stok Hampir Habis (right) */}
            <div className="flex flex-col lg:flex-row gap-3.5 lg:gap-4 items-start">
                {/* Aktivitas Terbaru */}
                <div className="panel w-full lg:flex-1 rounded-[14px] lg:rounded-2xl flex flex-col">
                    <div className="flex items-center justify-between p-3.5 lg:p-[20px] border-b border-line">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-[12.5px] lg:text-[15.5px] font-bold text-ink">
                                Aktivitas Terbaru
                            </h2>
                            <p className="text-[9.5px] lg:text-xs text-muted-ink hidden sm:block">
                                Timeline pencatatan barang dan mutasi logistik.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] lg:text-[10px] tracking-wider text-mint font-bold px-2 py-0.5 rounded-full bg-mint-soft">
                                LIVE
                            </span>
                            <Link
                                href="/reports"
                                className="text-[9.5px] lg:text-xs font-bold text-brand hover:underline"
                            >
                                Lihat semua
                            </Link>
                        </div>
                    </div>

                    <div className="p-3.5 lg:p-[20px] flex flex-col gap-3 lg:gap-3.5">
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-sm font-semibold text-ink">Belum ada aktivitas</p>
                                <p className="text-xs text-muted-ink mt-1">
                                    Transaksi dan pergerakan barang akan tercatat otomatis di sini.
                                </p>
                            </div>
                        ) : (
                            recentActivity.slice(0, 5).map((tx) => {
                                const isIncoming = tx.type === "IN"
                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 lg:gap-3.5 py-1"
                                    >
                                        <div
                                            className={cn(
                                                "size-[26px] lg:size-8 rounded-[8px] lg:rounded-[9px] grid place-items-center shrink-0",
                                                isIncoming
                                                    ? "bg-mint-soft text-mint"
                                                    : "bg-rose-soft text-rose"
                                            )}
                                        >
                                            {isIncoming ? (
                                                <PackagePlus className="size-3 lg:size-4" />
                                            ) : (
                                                <ShoppingCart className="size-3 lg:size-4" />
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] lg:text-[13.5px] font-bold text-ink truncate">
                                                    {isIncoming ? "Barang Masuk / Ditambah" : "Barang Dipinjam / Keluar"}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-[8.5px] lg:text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0",
                                                        isIncoming
                                                            ? "bg-mint-soft text-mint"
                                                            : "bg-rose-soft text-rose"
                                                    )}
                                                >
                                                    {isIncoming ? "masuk" : "keluar"}
                                                </span>
                                            </div>
                                            <span className="text-[9.5px] lg:text-[11.5px] text-muted-ink truncate">
                                                {tx.item.name} · {tx.quantity} unit
                                            </span>
                                        </div>

                                        <span className="font-mono text-[9px] lg:text-[10.5px] text-muted-ink shrink-0">
                                            {format(new Date(tx.date), "d MMM · HH.mm", { locale: id })}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="mt-auto px-3.5 lg:px-[20px] py-3 border-t border-line bg-surface-2 rounded-b-[14px] lg:rounded-b-2xl flex items-center justify-between text-[10.5px] lg:text-xs text-muted-ink">
                        <span>Menampilkan {Math.min(recentActivity.length, 5)} aktivitas terbaru</span>
                        <Link
                            href="/reports"
                            className="font-bold text-brand hover:underline inline-flex items-center gap-1"
                        >
                            <span>Laporan mutasi lengkap</span>
                            <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </div>

                {/* Stok Hampir Habis (3 items per spec) */}
                <div className="panel w-full lg:w-[322px] rounded-[14px] lg:rounded-2xl flex flex-col shrink-0">
                    <div className="flex items-center justify-between p-3.5 lg:p-[20px] border-b border-line">
                        <div className="flex items-center gap-2">
                            <span className="size-7 rounded-[8px] bg-rose-soft grid place-items-center text-rose shrink-0">
                                <TriangleAlert className="size-3.5" />
                            </span>
                            <div className="flex flex-col">
                                <h2 className="text-[12.5px] lg:text-[15.5px] font-bold text-ink">
                                    Stok Hampir Habis
                                </h2>
                                <p className="text-[9.5px] lg:text-xs text-muted-ink">
                                    Perlu segera pengadaan
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-rose px-2 py-0.5 rounded-full bg-rose-soft">
                            {lowStockItems.length}
                        </span>
                    </div>

                    <div className="p-3.5 lg:p-[20px] flex flex-col gap-3">
                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="size-10 rounded-full bg-mint-soft text-mint grid place-items-center mb-2">
                                    <CheckCircle2 className="size-5" />
                                </div>
                                <p className="text-xs font-bold text-ink">Semua Stok Aman</p>
                                <p className="text-[10.5px] text-muted-ink mt-0.5">
                                    Persediaan semua unit mencukupi.
                                </p>
                            </div>
                        ) : (
                            lowStockItems.slice(0, 3).map((item) => {
                                const percent = Math.min(
                                    100,
                                    Math.round((item.quantity / (item.minStock || 5)) * 100)
                                )
                                return (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded-[10px] bg-surface-2 border border-line flex flex-col gap-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-ink truncate">
                                                    {item.name}
                                                </span>
                                                <span className="text-[10px] text-muted-ink truncate">
                                                    {item.location.name}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-extrabold text-rose font-mono">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-[9.5px] text-muted-ink font-mono block">
                                                    /{item.minStock}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-line">
                                            <div
                                                className="bg-rose h-full rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="mt-auto px-3.5 lg:px-[20px] py-3 border-t border-line bg-surface-2 rounded-b-[14px] lg:rounded-b-2xl">
                        <Link
                            href="/procurement"
                            className="text-xs font-bold text-brand hover:underline flex items-center justify-between"
                        >
                            <span>Buat Daftar Pengadaan</span>
                            <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
