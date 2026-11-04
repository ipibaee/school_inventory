"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockReport } from "@/components/reports/StockReport"
import { BorrowingReport } from "@/components/reports/BorrowingReport"
import { IncomingItemsReport } from "@/components/reports/IncomingItemsReport"
import { WarehouseReport } from "@/components/reports/WarehouseReport"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<string>("stock")

    const handlePrint = () => {
        window.print()
    }

    const reportTabs = [
        { id: "stock", label: "Laporan Stok" },
        { id: "borrowing", label: "Riwayat Peminjam" },
        { id: "warehouse", label: "Riwayat Gudang" },
        { id: "incoming", label: "Barang Masuk" },
    ]

    return (
        <div className="flex flex-col gap-4 lg:gap-[18px]">
            {/* Mobile App Bar */}
            <MobileAppBar
                title="Laporan"
                subtitle="Rekap data inventaris"
                back="/dashboard"
                actions={
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="size-[30px] rounded-[9px] bg-surface border border-line grid place-items-center text-ink-soft print:hidden"
                        title="Cetak"
                    >
                        <Printer className="size-3.5" />
                    </button>
                }
            />

            {/* Desktop PageHeader */}
            <PageHeader
                title="Laporan"
                subtitle="Rekap stok, peminjaman, dan mutasi gudang siap cetak."
                actions={
                    <Button variant="primary" onClick={handlePrint} className="gap-2 print:hidden">
                        <Printer className="size-4" />
                        <span>Cetak Laporan</span>
                    </Button>
                }
            />

            {/* Mobile Filter Chips */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 print:hidden">
                {reportTabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            activeTab === tab.id
                                ? "bg-brand text-white"
                                : "bg-surface border border-line text-ink-soft"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Desktop Underline Tabs */}
            <div className="hidden lg:flex border-b border-line gap-6 print:hidden">
                {reportTabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-[13.5px] font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                                isActive
                                    ? "border-brand text-brand"
                                    : "border-transparent text-muted-ink hover:text-ink"
                            }`}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Reports Content */}
            <div className="w-full">
                {activeTab === "stock" && <StockReport />}
                {activeTab === "borrowing" && <BorrowingReport />}
                {activeTab === "warehouse" && <WarehouseReport />}
                {activeTab === "incoming" && <IncomingItemsReport />}
            </div>
        </div>
    )
}
