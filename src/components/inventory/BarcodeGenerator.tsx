"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { searchItems, createItemWithBarcode, generateUniqueBarcode } from "@/actions/barcode"
import { getCategories, getLocations, createCategory } from "@/actions/inventory"
import { getSchoolSettings } from "@/actions/settings"
import { toast } from "sonner"
import Barcode from "react-barcode"
import { Printer, Search, Plus, RefreshCw, Loader2, ArrowLeft } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Badge } from "@/components/ui/badge"

export function BarcodeGenerator() {
    const [activeTab, setActiveTab] = useState("existing")

    // Printer Settings
    const [labelWidth, setLabelWidth] = useState(33) // mm
    const [labelHeight, setLabelHeight] = useState(15) // mm
    const [layoutMode, setLayoutMode] = useState<"single" | "double">("double")
    const [gapSize, setGapSize] = useState(2) // mm
    const [barcodeScale, setBarcodeScale] = useState(1) // Scale factor

    // Label Content Settings
    const [entryYear, setEntryYear] = useState(new Date().getFullYear().toString())
    const [entryMonth, setEntryMonth] = useState(
        (new Date().getMonth() + 1).toString().padStart(2, "0")
    )
    const [startNumber, setStartNumber] = useState(1)
    const [endNumber, setEndNumber] = useState(1)

    const printRef = useRef<HTMLDivElement>(null)

    // Existing Item State
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [searching, setSearching] = useState(false)

    // New Item State
    const [newItemName, setNewItemName] = useState("")
    const [newItemSpecification, setNewItemSpecification] = useState("")
    const [newItemCategory, setNewItemCategory] = useState("")
    const [newItemLocation, setNewItemLocation] = useState("")
    const [generatedBarcode, setGeneratedBarcode] = useState("")
    const [categories, setCategories] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])
    const [creating, setCreating] = useState(false)
    const [settings, setSettings] = useState<any>(null)

    // Category Creation State
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [savingCategory, setSavingCategory] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const [cats, locs, sets] = await Promise.all([
                getCategories(),
                getLocations(),
                getSchoolSettings(),
            ])
            setCategories(cats)
            setLocations(locs)
            setSettings(sets)

            const gudang = locs.find((l: any) => l.name === "Gudang")
            if (gudang) {
                setNewItemLocation(gudang.id)
            } else if (locs.length > 0) {
                setNewItemLocation(locs[0].id)
            }
        }
        fetchData()
    }, [])

    const handleSearch = async () => {
        if (!searchQuery) return
        setSearching(true)
        const results = await searchItems(searchQuery)
        setSearchResults(results)
        setSearching(false)
    }

    const handleGenerateBarcode = async () => {
        const code = await generateUniqueBarcode()
        setGeneratedBarcode(code)
    }

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) return
        setSavingCategory(true)
        const res = await createCategory(newCategoryName.trim())
        setSavingCategory(false)
        if (res.success && res.data) {
            const created = res.data
            setCategories((prev) => {
                if (prev.some((c) => c.id === created.id)) return prev
                return [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
            })
            setNewItemCategory(created.id)
            setNewCategoryName("")
            setIsAddingCategory(false)
            toast.success(`Kategori "${created.name}" berhasil ditambahkan`)
        } else {
            toast.error(res.error || "Gagal menambahkan kategori")
        }
    }

    const handleCreateAndPrint = async () => {
        const targetLocation =
            newItemLocation ||
            locations.find((l: any) => l.name === "Gudang")?.id ||
            locations[0]?.id

        if (!newItemName.trim() || !newItemCategory || !targetLocation || !generatedBarcode.trim()) {
            toast.error("Mohon lengkapi semua data")
            return
        }

        setCreating(true)
        const result = await createItemWithBarcode({
            name: newItemName.trim(),
            categoryId: newItemCategory,
            locationId: targetLocation,
            barcode: generatedBarcode.trim(),
            specification: newItemSpecification.trim(),
        })
        setCreating(false)

        if (result.success) {
            toast.success("Barang berhasil dibuat")
            setSelectedItem(result.item)
            handlePrint()
            setNewItemName("")
            setNewItemSpecification("")
            setNewItemCategory("")
            setNewItemLocation(targetLocation)
            setGeneratedBarcode("")
        } else {
            toast.error(result.error || "Gagal membuat barang")
        }
    }

    const totalItemsCount = Math.max(0, endNumber - startNumber + 1)
    const totalPageWidth =
        layoutMode === "double" ? labelWidth * 2 + gapSize : labelWidth

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        pageStyle: `
            @page {
                size: ${totalPageWidth}mm ${labelHeight}mm;
                margin: 0 !important;
            }
            @media print {
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `,
    })

    const getRangeNumbers = () => {
        const numbers = []
        for (let i = startNumber; i <= endNumber; i++) {
            numbers.push(i)
        }
        return numbers
    }

    const getPrintChunks = () => {
        const numbers = getRangeNumbers()
        if (layoutMode === "single") {
            return numbers.map((num) => [num])
        } else {
            const chunks = []
            for (let i = 0; i < numbers.length; i += 2) {
                chunks.push(numbers.slice(i, i + 2))
            }
            return chunks
        }
    }

    const formatLabelText = (number: number) => {
        const numStr = number.toString().padStart(2, "0")
        return `BOS/${entryYear}/${entryMonth}/HKTI2/TKJ/${numStr}`
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-[18px]">
            {/* Mobile App Bar */}
            <MobileAppBar
                title="Cetak Barcode"
                subtitle={`Label ${labelWidth} × ${labelHeight} mm`}
                back="/inventory"
                actions={
                    selectedItem && (
                        <button
                            type="button"
                            onClick={() => handlePrint()}
                            className="size-[32px] rounded-[9px] bg-brand text-white grid place-items-center"
                            title="Cetak"
                        >
                            <Printer className="size-4" />
                        </button>
                    )
                }
            />

            {/* Desktop PageHeader */}
            <PageHeader
                title="Cetak Barcode"
                subtitle="Kelola dan cetak label barcode untuk inventaris sekolah."
                actions={
                    selectedItem && (
                        <Button
                            variant="primary"
                            onClick={() => handlePrint()}
                            className="gap-2"
                        >
                            <Printer className="size-4" />
                            <span>Cetak {totalItemsCount} Label</span>
                        </Button>
                    )
                }
            />

            {/* Main 2 Column Grid */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* Left: Pengaturan Printer Card */}
                <div className="panel w-full lg:w-[326px] rounded-2xl flex flex-col shrink-0 overflow-hidden">
                    <div className="p-4 lg:p-[18px_20px] border-b border-line bg-surface">
                        <h3 className="text-[14.5px] font-bold text-ink">
                            Pengaturan Printer
                        </h3>
                        <p className="text-[11px] text-muted-ink mt-0.5">
                            Satuan dalam milimeter (mm)
                        </p>
                    </div>

                    <div className="p-4 lg:p-[18px_20px] flex flex-col gap-3.5">
                        {/* Width & Height */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">LEBAR LABEL</Label>
                                <div className="relative flex items-center">
                                    <Input
                                        type="number"
                                        value={labelWidth}
                                        onChange={(e) => setLabelWidth(Number(e.target.value))}
                                        className="pr-8 font-mono text-xs font-bold"
                                    />
                                    <span className="absolute right-2.5 text-[10px] text-muted-ink pointer-events-none">
                                        mm
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">TINGGI LABEL</Label>
                                <div className="relative flex items-center">
                                    <Input
                                        type="number"
                                        value={labelHeight}
                                        onChange={(e) => setLabelHeight(Number(e.target.value))}
                                        className="pr-8 font-mono text-xs font-bold"
                                    />
                                    <span className="absolute right-2.5 text-[10px] text-muted-ink pointer-events-none">
                                        mm
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mode & Gap */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">MODE</Label>
                                <Select
                                    value={layoutMode}
                                    onValueChange={(v: "single" | "double") => setLayoutMode(v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">1 Kolom</SelectItem>
                                        <SelectItem value="double">2 Kolom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">JARAK (GAP)</Label>
                                <div className="relative flex items-center">
                                    <Input
                                        type="number"
                                        value={gapSize}
                                        onChange={(e) => setGapSize(Number(e.target.value))}
                                        disabled={layoutMode !== "double"}
                                        className="pr-8 font-mono text-xs font-bold"
                                    />
                                    <span className="absolute right-2.5 text-[10px] text-muted-ink pointer-events-none">
                                        mm
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Scale */}
                        <div className="flex flex-col gap-1">
                            <Label className="label-caps">SKALA BARCODE</Label>
                            <Input
                                type="number"
                                min={0.5}
                                max={1.0}
                                step={0.1}
                                value={barcodeScale}
                                onChange={(e) => setBarcodeScale(Number(e.target.value))}
                                className="font-mono text-xs font-bold"
                            />
                        </div>

                        {/* Month & Year */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">TAHUN</Label>
                                <Input
                                    value={entryYear}
                                    onChange={(e) => setEntryYear(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">BULAN</Label>
                                <Input
                                    value={entryMonth}
                                    onChange={(e) => setEntryMonth(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>

                        {/* Number Range */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">NOMOR AWAL</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={startNumber}
                                    onChange={(e) => setStartNumber(Number(e.target.value))}
                                    className="font-mono text-xs font-bold"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label className="label-caps">NOMOR AKHIR</Label>
                                <Input
                                    type="number"
                                    min={startNumber}
                                    value={endNumber}
                                    onChange={(e) => setEndNumber(Number(e.target.value))}
                                    className="font-mono text-xs font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Pratinjau & Pilihan Barang */}
                <div className="panel flex-1 w-full rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 lg:p-[18px_22px] border-b border-line bg-surface flex items-center justify-between">
                        <div>
                            <h3 className="text-[15.5px] font-bold text-ink">
                                Pratinjau & Pilihan Barang
                            </h3>
                            <p className="text-xs text-muted-ink mt-0.5">
                                Pilih barang yang terdaftar atau buat barang baru untuk cetak label.
                            </p>
                        </div>
                        {selectedItem && (
                            <Badge variant="mint" dot>
                                {totalItemsCount} Label Siap Cetak
                            </Badge>
                        )}
                    </div>

                    <div className="p-4 lg:p-[22px] flex flex-col gap-5">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList variant="segmented">
                                <TabsTrigger value="existing">Pilih Barang yang Ada</TabsTrigger>
                                <TabsTrigger value="new">Buat Barang Baru</TabsTrigger>
                            </TabsList>

                            {/* Existing Item Tab */}
                            <TabsContent value="existing" className="mt-4 flex flex-col gap-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-3 size-4 text-muted-ink pointer-events-none" />
                                        <Input
                                            placeholder="Cari nama barang atau barcode..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    handleSearch()
                                                }
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={handleSearch}
                                        disabled={searching || !searchQuery}
                                    >
                                        {searching ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <span>Cari</span>
                                        )}
                                    </Button>
                                </div>

                                {searchResults.length > 0 && !selectedItem && (
                                    <div className="flex flex-col gap-1.5 border border-line rounded-[12px] p-2 max-h-[180px] overflow-y-auto">
                                        {searchResults.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedItem(item)
                                                    setSearchResults([])
                                                }}
                                                className="text-left p-2 rounded-[8px] hover:bg-surface-2 transition-colors flex items-center justify-between"
                                            >
                                                <div>
                                                    <span className="text-xs font-bold text-ink block">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-ink">
                                                        {item.category?.name} · {item.barcode}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-brand font-bold">
                                                    Pilih
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {selectedItem && (
                                    <div className="p-3.5 rounded-[12px] bg-brand-soft border border-brand/20 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[13.5px] font-bold text-ink">
                                                {selectedItem.name}
                                            </span>
                                            <span className="text-xs text-muted-ink">
                                                Barcode: {selectedItem.barcode} · Kategori:{" "}
                                                {selectedItem.category?.name}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedItem(null)}
                                            className="text-xs text-muted-ink hover:text-ink"
                                        >
                                            Ganti Barang
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* New Item Tab */}
                            <TabsContent value="new" className="mt-4 flex flex-col gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <Label className="label-caps">NAMA BARANG</Label>
                                        <Input
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder="Contoh: Monitor 24 inch"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="label-caps">SPESIFIKASI</Label>
                                        <Input
                                            value={newItemSpecification}
                                            onChange={(e) => setNewItemSpecification(e.target.value)}
                                            placeholder="Contoh: Lenovo IPS 75Hz"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="label-caps">KATEGORI</Label>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingCategory((v) => !v)}
                                                className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
                                            >
                                                <Plus className="size-3" />
                                                <span>{isAddingCategory ? "Pilih dari daftar" : "+ Kategori Baru"}</span>
                                            </button>
                                        </div>

                                        {isAddingCategory ? (
                                            <div className="flex items-center gap-2 p-1.5 rounded-[10px] bg-surface-2 border border-brand/30">
                                                <Input
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    placeholder="Nama kategori baru..."
                                                    className="h-9 text-xs flex-1 bg-surface"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleSaveCategory()
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleSaveCategory}
                                                    disabled={savingCategory || !newCategoryName.trim()}
                                                    className="h-9 px-3 text-xs bg-brand text-white font-bold"
                                                >
                                                    {savingCategory ? <Loader2 className="size-3 animate-spin" /> : "Simpan"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsAddingCategory(false)
                                                        setNewCategoryName("")
                                                    }}
                                                    className="h-9 px-2 text-xs text-muted-ink"
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        ) : (
                                            <Select
                                                value={newItemCategory}
                                                onValueChange={(val) => {
                                                    if (val === "__new__") {
                                                        setIsAddingCategory(true)
                                                    } else {
                                                        setNewItemCategory(val)
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem
                                                        value="__new__"
                                                        className="text-brand font-bold border-t border-line mt-1 cursor-pointer"
                                                    >
                                                        + Tambah Kategori Baru...
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label className="label-caps">BARCODE</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={generatedBarcode}
                                                onChange={(e) => setGeneratedBarcode(e.target.value)}
                                                placeholder="5 digit barcode..."
                                                className="font-mono text-xs flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleGenerateBarcode}
                                                className="px-3"
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleCreateAndPrint}
                                    disabled={creating}
                                    className="mt-2"
                                >
                                    {creating && <Loader2 className="size-4 animate-spin mr-1.5" />}
                                    <span>Simpan & Masukkan ke Pratinjau</span>
                                </Button>
                            </TabsContent>
                        </Tabs>

                        {/* Preview Area */}
                        {selectedItem ? (
                            <div className="flex flex-col gap-3">
                                <Label className="label-caps">PRATINJAU KERTAS LABEL</Label>
                                <div className="p-4 rounded-[12px] bg-[#EEF3F9] dark:bg-[#303134] border border-line flex flex-col items-center justify-center overflow-x-auto">
                                    {/* Visible Preview (Single Row) */}
                                    <div
                                        className="border border-dashed border-line bg-surface rounded-[6px] p-2 flex items-center justify-center shrink-0 shadow-sm"
                                        style={{
                                            gap: layoutMode === "double" ? `${gapSize * 3.78}px` : "0",
                                        }}
                                    >
                                        {[
                                            startNumber,
                                            layoutMode === "double" ? startNumber + 1 : null,
                                        ]
                                            .filter(Boolean)
                                            .map((num, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex flex-col items-center justify-between p-1 bg-white text-black border border-gray-200 rounded-[4px] overflow-hidden"
                                                    style={{
                                                        width: `${labelWidth * 3.78}px`,
                                                        height: `${labelHeight * 3.78}px`,
                                                    }}
                                                >
                                                    <div className="text-[6.5px] font-bold text-center leading-tight whitespace-nowrap w-full overflow-hidden text-black">
                                                        {formatLabelText(num as number)}
                                                    </div>

                                                    <div className="flex items-center justify-between w-full flex-1 gap-1 px-1">
                                                        {settings?.logoUrl && (
                                                            <div className="w-[20%] flex items-center justify-center">
                                                                <img
                                                                    src={settings.logoUrl}
                                                                    alt="Logo"
                                                                    className="max-w-full max-h-[22px] object-contain"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                                                            <Barcode
                                                                value={selectedItem.barcode}
                                                                width={1}
                                                                height={22}
                                                                fontSize={0}
                                                                margin={0}
                                                                displayValue={false}
                                                            />
                                                            <div className="text-[6px] font-bold text-center leading-tight mt-0.5 whitespace-nowrap w-full overflow-hidden text-black">
                                                                {selectedItem.name.substring(0, 16)} |{" "}
                                                                {selectedItem.barcode}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Hidden Print Content for react-to-print */}
                                <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
                                    <div ref={printRef}>
                                        {getPrintChunks().map((chunk, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: `${totalPageWidth}mm`,
                                                    height: `${labelHeight}mm`,
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    flexWrap: "nowrap",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: layoutMode === "double" ? `${gapSize}mm` : "0",
                                                    backgroundColor: "white",
                                                    pageBreakAfter: "always",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {chunk.map((num, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            width: `${labelWidth}mm`,
                                                            height: `${labelHeight}mm`,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            padding: "0.5mm",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                transform: `scale(${barcodeScale})`,
                                                                transformOrigin: "center",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                width: "100%",
                                                                height: "100%",
                                                                justifyContent: "space-between",
                                                                padding: "0.5mm",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: "5pt",
                                                                    fontWeight: "bold",
                                                                    textAlign: "center",
                                                                    lineHeight: "1",
                                                                    whiteSpace: "nowrap",
                                                                    width: "100%",
                                                                    overflow: "hidden",
                                                                    marginBottom: "0.5mm",
                                                                    color: "#000",
                                                                }}
                                                            >
                                                                {formatLabelText(num)}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    justifyContent: "space-between",
                                                                    width: "100%",
                                                                    flex: 1,
                                                                    gap: "1mm",
                                                                }}
                                                            >
                                                                {settings?.logoUrl && (
                                                                    <div
                                                                        style={{
                                                                            width: "20%",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={settings.logoUrl}
                                                                            style={{
                                                                                maxWidth: "100%",
                                                                                maxHeight: "8mm",
                                                                                objectFit: "contain",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div
                                                                    style={{
                                                                        flex: 1,
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        overflow: "hidden",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            flex: 1,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            width: "100%",
                                                                        }}
                                                                    >
                                                                        <Barcode
                                                                            value={selectedItem.barcode}
                                                                            width={1}
                                                                            height={20}
                                                                            fontSize={0}
                                                                            margin={0}
                                                                            displayValue={false}
                                                                        />
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            fontSize: "4.5pt",
                                                                            fontWeight: "bold",
                                                                            textAlign: "center",
                                                                            lineHeight: "1",
                                                                            whiteSpace: "nowrap",
                                                                            maxWidth: "100%",
                                                                            overflow: "hidden",
                                                                            marginTop: "0.2mm",
                                                                            color: "#000",
                                                                        }}
                                                                    >
                                                                        {selectedItem.name.substring(0, 15)} |{" "}
                                                                        {selectedItem.barcode}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        variant="primary"
                                        onClick={() => handlePrint()}
                                        className="w-full sm:w-auto gap-2"
                                    >
                                        <Printer className="size-4" />
                                        <span>Cetak Sekarang ({totalItemsCount} Label)</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-muted-ink border border-dashed border-line rounded-[12px] bg-surface-2/40">
                                Pilih barang terlebih dahulu untuk menampilkan pratinjau label.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
