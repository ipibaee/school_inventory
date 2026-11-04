"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BorrowForm } from "@/components/borrow/BorrowForm"
import { ReturnForm } from "@/components/borrow/ReturnForm"
import { ActiveLoans } from "@/components/borrow/ActiveLoans"

export default function BorrowPage() {
    const [activeTab, setActiveTab] = useState<string>("borrow")
    const [refreshKey, setRefreshKey] = useState(0)

    const triggerRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-[18px]">
            {/* Mobile App Bar */}
            <MobileAppBar
                title="Peminjaman"
                subtitle="Catat & pantau peminjaman"
                back="/dashboard"
            />

            {/* Desktop PageHeader with Segmented Tabs */}
            <PageHeader
                title="Peminjaman & Pengembalian"
                subtitle="Catat peminjaman alat laboratorium dan pantau pengembaliannya."
                actions={
                    <div className="inline-flex items-center gap-1 p-1 bg-surface border border-line rounded-[11px]">
                        <button
                            type="button"
                            onClick={() => setActiveTab("borrow")}
                            className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                                activeTab === "borrow"
                                    ? "bg-brand text-white"
                                    : "text-ink-soft hover:bg-surface-2"
                            }`}
                        >
                            Pinjam Barang
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("return")}
                            className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                                activeTab === "return"
                                    ? "bg-brand text-white"
                                    : "text-ink-soft hover:bg-surface-2"
                            }`}
                        >
                            Kembalikan Barang
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("active")}
                            className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                                activeTab === "active"
                                    ? "bg-brand text-white"
                                    : "text-ink-soft hover:bg-surface-2"
                            }`}
                        >
                            Daftar Aktif
                        </button>
                    </div>
                }
            />

            {/* Mobile Tabs */}
            <div className="lg:hidden flex gap-1 p-1 bg-surface border border-line rounded-[11px]">
                <button
                    type="button"
                    onClick={() => setActiveTab("borrow")}
                    className={`flex-1 py-1.5 rounded-[8px] text-xs font-bold text-center transition-colors cursor-pointer ${
                        activeTab === "borrow"
                            ? "bg-brand text-white"
                            : "text-ink-soft hover:bg-surface-2"
                    }`}
                >
                    Pinjam
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("return")}
                    className={`flex-1 py-1.5 rounded-[8px] text-xs font-bold text-center transition-colors cursor-pointer ${
                        activeTab === "return"
                            ? "bg-brand text-white"
                            : "text-ink-soft hover:bg-surface-2"
                    }`}
                >
                    Kembalikan
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("active")}
                    className={`flex-1 py-1.5 rounded-[8px] text-xs font-bold text-center transition-colors cursor-pointer ${
                        activeTab === "active"
                            ? "bg-brand text-white"
                            : "text-ink-soft hover:bg-surface-2"
                    }`}
                >
                    Aktif
                </button>
            </div>

            {/* Content Area */}
            {activeTab === "borrow" && (
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <BorrowForm onSuccess={triggerRefresh} />
                    </div>
                    <div className="w-full lg:w-[340px] shrink-0">
                        <ActiveLoans key={refreshKey} onUpdated={triggerRefresh} />
                    </div>
                </div>
            )}

            {activeTab === "return" && (
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <ReturnForm onSuccess={triggerRefresh} />
                    </div>
                    <div className="w-full lg:w-[340px] shrink-0">
                        <ActiveLoans key={refreshKey} onUpdated={triggerRefresh} />
                    </div>
                </div>
            )}

            {activeTab === "active" && (
                <div className="w-full">
                    <ActiveLoans key={refreshKey} onUpdated={triggerRefresh} />
                </div>
            )}
        </div>
    )
}
