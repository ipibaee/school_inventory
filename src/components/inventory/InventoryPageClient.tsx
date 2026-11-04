"use client"

import { useState, useMemo } from "react"
import {
    Plus,
    Search,
    SlidersHorizontal,
    Package,
    ArrowRightLeft,
    ScanBarcode,
    Sliders,
} from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemForm } from "@/components/inventory/ItemForm"
import { InventoryActions } from "@/components/inventory/InventoryActions"
import { ScanDialog } from "@/components/inventory/ScanDialog"
import { MoveItemDialog } from "@/components/inventory/MoveItemDialog"
import { WarehouseManager } from "@/components/inventory/WarehouseManager"
import { cn } from "@/lib/utils"

interface InventoryPageClientProps {
    items: any[]
    categories: any[]
    locations: any[]
}

export function InventoryPageClient({
    items,
    categories,
    locations,
}: InventoryPageClientProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<"list" | "warehouse">("list")
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Location count map
    const locationCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        for (const item of items) {
            counts[item.locationId] = (counts[item.locationId] || 0) + item.quantity
        }
        return counts
    }, [items])

    // Filtered items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesLocation =
                selectedLocation === "all" || item.locationId === selectedLocation
            const matchesSearch =
                !searchQuery ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.specification &&
                    item.specification.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.category.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesLocation && matchesSearch
        })
    }, [items, selectedLocation, searchQuery])

    const totalQuantity = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0)
    }, [items])

    return (
        <div className="flex flex-col gap-4 lg:gap-[18px]">
            {/* Mobile App Bar */}
            <MobileAppBar
                title="Inventaris"
                subtitle={`${items.length} jenis · ${locations.length} lokasi`}
                actions={
                    <div className="flex items-center gap-1.5">
                        <ScanDialog
                            categories={categories}
                            locations={locations}
                            trigger={
                                <button
                                    type="button"
                                    className="size-[30px] rounded-[9px] bg-surface border border-line grid place-items-center text-ink-soft"
                                    title="Scan Barcode"
                                >
                                    <ScanBarcode className="size-3.5" />
                                </button>
                            }
                        />
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="size-[30px] rounded-[9px] bg-brand text-white grid place-items-center"
                                    title="Tambah Barang"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[560px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Barang Baru</DialogTitle>
                                </DialogHeader>
                                <ItemForm
                                    categories={categories}
                                    locations={locations}
                                    onSuccess={() => setIsAddOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            {/* Desktop PageHeader */}
            <PageHeader
                title="Inventaris"
                subtitle={`${items.length} jenis barang tersebar di ${locations.length} ruang dan laboratorium.`}
                actions={
                    <div className="flex items-center gap-2">
                        <MoveItemDialog locations={locations} />
                        <ScanDialog categories={categories} locations={locations} />
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button variant="primary" className="gap-2">
                                    <Plus className="size-4" />
                                    <span>Tambah Barang</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[560px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Barang Baru</DialogTitle>
                                </DialogHeader>
                                <ItemForm
                                    categories={categories}
                                    locations={locations}
                                    onSuccess={() => setIsAddOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            {/* Main Tabs (Daftar Barang vs Logistik Gudang) */}
            <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "list" | "warehouse")}
            >
                <div className="flex items-center justify-between">
                    <TabsList variant="segmented">
                        <TabsTrigger value="list">Daftar Barang</TabsTrigger>
                        <TabsTrigger value="warehouse">Gudang (Masuk/Keluar)</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="warehouse" className="mt-4">
                    <WarehouseManager locations={locations} />
                </TabsContent>

                <TabsContent value="list" className="mt-4 flex flex-col gap-4">
                    {/* Location Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
                        <button
                            type="button"
                            onClick={() => setSelectedLocation("all")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0",
                                selectedLocation === "all"
                                    ? "bg-brand text-white"
                                    : "bg-surface border border-line text-ink-soft hover:bg-surface-2"
                            )}
                        >
                            <span>Semua Barang</span>
                            <span
                                className={cn(
                                    "font-mono text-[10px] tabular-nums",
                                    selectedLocation === "all" ? "text-white/80" : "text-muted-ink"
                                )}
                            >
                                {items.length}
                            </span>
                        </button>

                        {locations.map((loc) => {
                            const isSelected = selectedLocation === loc.id
                            const count = locationCounts[loc.id] || 0
                            return (
                                <button
                                    key={loc.id}
                                    type="button"
                                    onClick={() => setSelectedLocation(loc.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0",
                                        isSelected
                                            ? "bg-brand text-white"
                                            : "bg-surface border border-line text-ink-soft hover:bg-surface-2"
                                    )}
                                >
                                    <span>{loc.name}</span>
                                    <span
                                        className={cn(
                                            "font-mono text-[10px] tabular-nums",
                                            isSelected ? "text-white/80" : "text-muted-ink"
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Search row on mobile */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 size-4 text-muted-ink pointer-events-none" />
                            <Input
                                placeholder="Cari barang atau barcode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-xs rounded-[10px]"
                            />
                        </div>
                    </div>

                    {/* Desktop Table Card */}
                    <div className="panel hidden lg:flex flex-col rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-[22px] py-4 border-b border-line bg-surface">
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-[15.5px] font-bold text-ink">Daftar Barang</h3>
                                <Badge variant="secondary" className="font-mono text-[11px]">
                                    {filteredItems.length} item
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="relative w-[240px]">
                                    <Search className="absolute left-3 size-4 text-muted-ink pointer-events-none top-3" />
                                    <Input
                                        placeholder="Cari barang atau barcode..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-[13px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>BARANG</TableHead>
                                    <TableHead>BARCODE</TableHead>
                                    <TableHead>KATEGORI</TableHead>
                                    <TableHead>LOKASI</TableHead>
                                    <TableHead className="text-right">STOK</TableHead>
                                    <TableHead>STATUS</TableHead>
                                    <TableHead className="text-right">AKSI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-12 text-muted-ink"
                                        >
                                            Tidak ada barang ditemukan untuk filter ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => {
                                        const isLow = item.quantity <= (item.minStock || 5) && item.quantity > 0
                                        const isZero = item.quantity === 0
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-[9px] bg-brand-soft grid place-items-center text-brand shrink-0">
                                                            <Package className="size-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-[13px] text-ink leading-tight">
                                                                {item.name}
                                                            </span>
                                                            <span className="text-[11px] text-muted-ink truncate leading-tight">
                                                                {item.specification || "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs text-ink-soft">
                                                        {item.barcode}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-ink-soft">
                                                        {item.category?.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-ink-soft">
                                                        {item.location?.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-[13px] font-bold tabular-nums">
                                                    <span className={cn(isZero || isLow ? "text-rose" : "text-ink")}>
                                                        {item.quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {isZero ? (
                                                        <Badge variant="rose" dot>
                                                            Habis
                                                        </Badge>
                                                    ) : isLow ? (
                                                        <Badge variant="rose" dot>
                                                            Stok Rendah
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="mint" dot>
                                                            Tersedia
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <InventoryActions
                                                        item={item}
                                                        categories={categories}
                                                        locations={locations}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>

                        <div className="px-5 py-3 border-t border-line bg-surface-2 text-xs text-muted-ink flex items-center justify-between">
                            <span>
                                Menampilkan {filteredItems.length} dari {items.length} total barang
                            </span>
                            <span className="font-mono">
                                Total Unit: {totalQuantity} unit
                            </span>
                        </div>
                    </div>

                    {/* Mobile Card List */}
                    <div className="lg:hidden flex flex-col gap-2.5 pb-20">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-ink panel rounded-xl">
                                Tidak ada barang ditemukan.
                            </div>
                        ) : (
                            filteredItems.map((item) => {
                                const isLow = item.quantity <= (item.minStock || 5) && item.quantity > 0
                                const isZero = item.quantity === 0
                                return (
                                    <div
                                        key={item.id}
                                        className="panel-sm p-3 flex items-center gap-3 bg-surface"
                                    >
                                        <div className="size-[34px] rounded-[9px] bg-brand-soft grid place-items-center text-brand shrink-0">
                                            <Package className="size-4" />
                                        </div>

                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-[12px] font-bold text-ink truncate leading-tight">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] text-muted-ink truncate leading-tight mt-0.5">
                                                {item.specification || item.category?.name} · {item.barcode}
                                            </span>
                                            <span className="text-[9.5px] text-brand truncate mt-0.5 font-medium">
                                                {item.location?.name}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span
                                                className={cn(
                                                    "text-[13px] font-extrabold font-mono tabular-nums",
                                                    isZero || isLow ? "text-rose" : "text-ink"
                                                )}
                                            >
                                                {item.quantity}
                                            </span>
                                            {isZero ? (
                                                <Badge variant="rose" className="text-[9px] px-1.5 py-0">
                                                    Habis
                                                </Badge>
                                            ) : isLow ? (
                                                <Badge variant="rose" className="text-[9px] px-1.5 py-0">
                                                    Menipis
                                                </Badge>
                                            ) : (
                                                <Badge variant="mint" className="text-[9px] px-1.5 py-0">
                                                    Tersedia
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="shrink-0">
                                            <InventoryActions
                                                item={item}
                                                categories={categories}
                                                locations={locations}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
