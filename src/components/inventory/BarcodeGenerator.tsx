"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { searchItems, createItemWithBarcode, generateUniqueBarcode } from "@/actions/barcode"
import { getCategories, getLocations } from "@/actions/inventory"
import { getSchoolSettings } from "@/actions/settings"
import { toast } from "sonner"
import Barcode from "react-barcode"
import { Printer, Search, Plus, RefreshCw } from "lucide-react"
import { useReactToPrint } from "react-to-print"

export function BarcodeGenerator() {
    const [activeTab, setActiveTab] = useState("existing")

    // Printer Settings
    const [labelWidth, setLabelWidth] = useState(33) // mm
    const [labelHeight, setLabelHeight] = useState(15) // mm
    const [layoutMode, setLayoutMode] = useState<"single" | "double">("double")
    const [gapSize, setGapSize] = useState(2) // mm
    const [barcodeScale, setBarcodeScale] = useState(1) // Scale factor (0.1 - 1.0)

    // Label Content Settings
    const [entryYear, setEntryYear] = useState(new Date().getFullYear().toString())
    const [entryMonth, setEntryMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'))
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

    useEffect(() => {
        const fetchData = async () => {
            const [cats, locs, sets] = await Promise.all([getCategories(), getLocations(), getSchoolSettings()])
            setCategories(cats)
            setLocations(locs)
            setSettings(sets)

            // Auto-select Gudang
            const gudang = locs.find((l: any) => l.name === "Gudang")
            if (gudang) {
                setNewItemLocation(gudang.id)
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

    const handleCreateAndPrint = async () => {
        if (!newItemName || !newItemCategory || !newItemLocation || !generatedBarcode) {
            toast.error("Mohon lengkapi semua data")
            return
        }

        setCreating(true)
        const result = await createItemWithBarcode({
            name: newItemName,
            categoryId: newItemCategory,
            locationId: newItemLocation,
            barcode: generatedBarcode,
            specification: newItemSpecification,
        })
        setCreating(false)

        if (result.success) {
            toast.success("Barang berhasil dibuat")
            setSelectedItem(result.item)
            // Switch to print view (conceptually, or just print immediately)
            handlePrint()
            // Reset form
            setNewItemName("")
            setNewItemSpecification("")
            setNewItemCategory("")
            setNewItemLocation("")
            setGeneratedBarcode("")
        } else {
            toast.error(result.error || "Gagal membuat barang")
        }
    }

    // Calculate total items based on range
    const totalItemsCount = Math.max(0, endNumber - startNumber + 1)

    // Calculate total page width based on layout
    const totalPageWidth = layoutMode === "double"
        ? (labelWidth * 2) + gapSize
        : labelWidth

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

    // Generate array of numbers for the range
    const getRangeNumbers = () => {
        const numbers = []
        for (let i = startNumber; i <= endNumber; i++) {
            numbers.push(i)
        }
        return numbers
    }

    // Helper to chunk array for double column printing
    const getPrintChunks = () => {
        const numbers = getRangeNumbers()
        if (layoutMode === "single") {
            return numbers.map(num => [num]) // Array of single items
        } else {
            const chunks = []
            for (let i = 0; i < numbers.length; i += 2) {
                chunks.push(numbers.slice(i, i + 2))
            }
            return chunks
        }
    }

    const formatLabelText = (number: number) => {
        const numStr = number.toString().padStart(2, '0')
        // Format: BOS/Tahun/Bulan/HKTI2/TKJ/Nomor
        return `BOS/${entryYear}/${entryMonth}/HKTI2/TKJ/${numStr}`
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cetak Barcode</h2>
                    <p className="text-muted-foreground">
                        Kelola dan cetak label barcode untuk inventaris sekolah.
                    </p>
                </div>
                <Card className="w-[400px]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pengaturan Printer (mm)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Lebar Label</Label>
                                    <Input
                                        type="number"
                                        value={labelWidth}
                                        onChange={(e) => setLabelWidth(Number(e.target.value))}
                                        className="h-8 w-20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tinggi Label</Label>
                                    <Input
                                        type="number"
                                        value={labelHeight}
                                        onChange={(e) => setLabelHeight(Number(e.target.value))}
                                        className="h-8 w-20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Mode</Label>
                                    <Select value={layoutMode} onValueChange={(v: "single" | "double") => setLayoutMode(v)}>
                                        <SelectTrigger className="h-8 w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">1 Kolom</SelectItem>
                                            <SelectItem value="double">2 Kolom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {layoutMode === "double" && (
                                    <div className="space-y-1">
                                        <Label className="text-xs">Jarak (Gap)</Label>
                                        <Input
                                            type="number"
                                            value={gapSize}
                                            onChange={(e) => setGapSize(Number(e.target.value))}
                                            className="h-8 w-20"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <Label className="text-xs">Skala Barcode</Label>
                                    <Input
                                        type="number"
                                        min={0.5}
                                        max={1.0}
                                        step={0.1}
                                        value={barcodeScale}
                                        onChange={(e) => setBarcodeScale(Number(e.target.value))}
                                        className="h-8 w-24"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <div className="space-y-1">
                                    <Label className="text-xs">Tahun</Label>
                                    <Input
                                        value={entryYear}
                                        onChange={(e) => setEntryYear(e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Bulan</Label>
                                    <Input
                                        value={entryMonth}
                                        onChange={(e) => setEntryMonth(e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="existing" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="existing">Cetak Barang Lama</TabsTrigger>
                    <TabsTrigger value="new">Buat Barang Baru</TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cari Barang</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Cari nama atau barcode..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <Button onClick={handleSearch} disabled={searching}>
                                    <Search className="h-4 w-4 mr-2" />
                                    {searching ? "Mencari..." : "Cari"}
                                </Button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="grid gap-2">
                                    {searchResults.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-muted-foreground">{item.barcode}</div>
                                            </div>
                                            <Button variant="outline" size="sm">Pilih</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="new" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Buat Barang Baru (Stok 0)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Barang</Label>
                                    <Input
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder="Contoh: Laptop Asus X441"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Spesifikasi</Label>
                                    <Input
                                        value={newItemSpecification}
                                        onChange={(e) => setNewItemSpecification(e.target.value)}
                                        placeholder="Contoh: RAM 8GB, SSD 256GB, Core i5"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lokasi</Label>
                                        <Input value="Gudang" disabled readOnly />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Barcode</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={generatedBarcode}
                                            readOnly
                                            placeholder="Klik tombol generate..."
                                        />
                                        <Button variant="outline" onClick={handleGenerateBarcode}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCreateAndPrint}
                                    disabled={creating || !generatedBarcode}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {creating ? "Menyimpan..." : "Simpan & Cetak"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Preview & Print Area */}
            {selectedItem && (
                <Card className="mt-8 border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>Preview Label</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div
                            className="border border-dashed border-gray-300 flex items-center justify-center bg-white"
                            style={{
                                width: `${totalPageWidth * 3.78}px`, // Approx px conversion
                                height: `${labelHeight * 3.78}px`,
                            }}
                        >
                            {/* Hidden Print Content - kept in DOM for react-to-print */}
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
                                                justifyContent: layoutMode === "double" ? "center" : "center",
                                                gap: layoutMode === "double" ? `${gapSize}mm` : "0",
                                                backgroundColor: "white",
                                                pageBreakAfter: "always",
                                                overflow: "hidden"
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
                                                    <div style={{
                                                        transform: `scale(${barcodeScale})`,
                                                        transformOrigin: "center",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        width: "100%",
                                                        height: "100%",
                                                        justifyContent: "space-between",
                                                        padding: "0.5mm"
                                                    }}>
                                                        {/* Top Line - Full Width */}
                                                        <div style={{
                                                            fontSize: "5pt",
                                                            fontWeight: "bold",
                                                            textAlign: "center",
                                                            lineHeight: "1",
                                                            whiteSpace: "nowrap",
                                                            width: "100%",
                                                            overflow: "hidden",
                                                            marginBottom: "0.5mm"
                                                        }}>
                                                            {formatLabelText(num)}
                                                        </div>

                                                        {/* Middle Section: Logo + Barcode */}
                                                        <div style={{
                                                            display: "flex",
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            width: "100%",
                                                            flex: 1,
                                                            gap: "1mm"
                                                        }}>
                                                            {/* Logo */}
                                                            {settings?.logoUrl && (
                                                                <div style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                    <img
                                                                        src={settings.logoUrl}
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "8mm",
                                                                            objectFit: "contain"
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Barcode & Bottom Text */}
                                                            <div style={{
                                                                flex: 1,
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                overflow: "hidden"
                                                            }}>
                                                                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                                                    <Barcode
                                                                        value={selectedItem.barcode}
                                                                        width={1}
                                                                        height={20}
                                                                        fontSize={0}
                                                                        margin={0}
                                                                        displayValue={false}
                                                                    />
                                                                </div>

                                                                <div style={{
                                                                    fontSize: "4.5pt",
                                                                    fontWeight: "bold",
                                                                    textAlign: "center",
                                                                    lineHeight: "1",
                                                                    whiteSpace: "nowrap",
                                                                    maxWidth: "100%",
                                                                    overflow: "hidden",
                                                                    marginTop: "0.2mm"
                                                                }}>
                                                                    {selectedItem.name.substring(0, 15)} | {selectedItem.barcode}
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

                            {/* Visible Preview (Single Row) */}
                            <div className="flex items-center justify-center w-full h-full overflow-hidden" style={{ gap: layoutMode === "double" ? `${gapSize * 3.78}px` : 0 }}>
                                {[startNumber, layoutMode === "double" ? startNumber + 1 : null].filter(Boolean).map((num, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-center p-1 w-full h-full overflow-hidden border border-gray-100">
                                        <div style={{
                                            transform: `scale(${barcodeScale})`,
                                            transformOrigin: "center",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width: "100%",
                                            height: "100%",
                                            justifyContent: "space-between",
                                            padding: "2px"
                                        }}>
                                            {/* Top Line - Full Width */}
                                            <div className="text-[7px] font-bold text-center leading-tight mb-1 whitespace-nowrap w-full overflow-hidden">
                                                {formatLabelText(num as number)}
                                            </div>

                                            {/* Middle Section */}
                                            <div style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                width: "100%",
                                                flex: 1,
                                                gap: "2px"
                                            }}>
                                                {/* Logo Preview */}
                                                {settings?.logoUrl && (
                                                    <div className="w-[20%] flex items-center justify-center">
                                                        <img
                                                            src={settings.logoUrl}
                                                            className="max-w-full max-h-[25px] object-contain"
                                                        />
                                                    </div>
                                                )}

                                                <div style={{
                                                    flex: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    overflow: "hidden"
                                                }}>
                                                    <div className="flex items-center justify-center w-full">
                                                        <Barcode
                                                            value={selectedItem.barcode}
                                                            width={1}
                                                            height={25}
                                                            fontSize={0}
                                                            margin={0}
                                                            displayValue={false}
                                                        />
                                                    </div>
                                                    <div className="text-[6px] font-bold text-center leading-tight mt-1 whitespace-nowrap w-full overflow-hidden">
                                                        {selectedItem.name.substring(0, 15)} | {selectedItem.barcode}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                <div className="flex flex-col gap-1">
                                    <Label>Nomor Awal</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={startNumber}
                                        onChange={(e) => setStartNumber(Number(e.target.value))}
                                        className="w-24"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>Nomor Akhir</Label>
                                    <Input
                                        type="number"
                                        min={startNumber}
                                        value={endNumber}
                                        onChange={(e) => setEndNumber(Number(e.target.value))}
                                        className="w-24"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 justify-end h-full pt-6">
                                    <div className="text-sm font-medium">
                                        Total: {totalItemsCount} Label
                                    </div>
                                </div>
                            </div>

                            <Button size="lg" onClick={handlePrint} className="w-full max-w-sm">
                                <Printer className="h-5 w-5 mr-2" />
                                <Printer className="h-5 w-5 mr-2" />
                                Cetak {totalItemsCount} Label Sekarang
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
