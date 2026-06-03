import { getItems, getCategories, getLocations } from "@/actions/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ItemForm } from "@/components/inventory/ItemForm";
import { InventoryActions } from "@/components/inventory/InventoryActions";
import { ScanDialog } from "@/components/inventory/ScanDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseManager } from "@/components/inventory/WarehouseManager";
import { MoveItemDialog } from "@/components/inventory/MoveItemDialog";

export default async function InventoryPage() {
    const items = await getItems();
    const categories = await getCategories();
    const locations = await getLocations();

    // Aggregate items by barcode for "Semua Barang" view
    const aggregatedItems = items.reduce((acc: any[], item) => {
        const existingIndex = acc.findIndex(i => i.barcode === item.barcode);
        if (existingIndex > -1) {
            // Clone to avoid mutating original
            const existing = { ...acc[existingIndex] };
            existing.quantity += item.quantity;
            acc[existingIndex] = existing;
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Inventaris</h2>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <MoveItemDialog locations={locations} />
                    <ScanDialog categories={categories} locations={locations} />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Barang
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Tambah Barang Baru</DialogTitle>
                            </DialogHeader>
                            <ItemForm categories={categories} locations={locations} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Daftar Barang</TabsTrigger>
                    <TabsTrigger value="warehouse">Gudang (Masuk/Keluar)</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <Tabs defaultValue="all" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <TabsList className="flex overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0 md:flex-wrap justify-start gap-1.5 bg-transparent border-0 p-0 max-w-full w-[calc(100%+2rem)] md:w-full">
                                <TabsTrigger
                                    value="all"
                                    className="shrink-0 data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl border border-border/50 dark:border-white/5 bg-white/40 dark:bg-black/25 text-slate-700 dark:text-slate-300 shadow-xs px-4 py-2 cursor-pointer"
                                >
                                    Semua Barang
                                </TabsTrigger>
                                {locations.map(loc => (
                                    <TabsTrigger
                                        key={loc.id}
                                        value={loc.id}
                                        className="shrink-0 data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl border border-border/50 dark:border-white/5 bg-white/40 dark:bg-black/25 text-slate-700 dark:text-slate-300 shadow-xs px-4 py-2 cursor-pointer"
                                    >
                                        {loc.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <TabsContent value="all">
                            <Card>
                                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b border-border/40 dark:border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <CardTitle>Semua Barang</CardTitle>
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Cari barang..." className="pl-9 h-10 w-full" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6">
                                    {/* Desktop View */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nama</TableHead>
                                                    <TableHead>Spesifikasi</TableHead>
                                                    <TableHead>Barcode</TableHead>
                                                    <TableHead>Kategori</TableHead>
                                                    <TableHead>Stok</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {aggregatedItems.map((item) => (
                                                    <TableRow key={item.barcode}>
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell className="max-w-[200px] truncate" title={(item as any).specification || ""}>{(item as any).specification || "-"}</TableCell>
                                                        <TableCell>{item.barcode}</TableCell>
                                                        <TableCell>{item.category.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{item.quantity}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.quantity <= item.minStock ? (
                                                                <Badge variant="destructive">Stok Rendah</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Tersedia</Badge>
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
                                                ))}
                                                {aggregatedItems.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                            Tidak ada barang. Tambahkan barang pertama Anda!
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card List View */}
                                    <div className="md:hidden space-y-4">
                                        {aggregatedItems.map((item) => (
                                            <Card key={item.barcode} className="p-4 border border-border/60 bg-white/20 dark:bg-black/15 backdrop-blur-md relative overflow-hidden">
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0 pr-2">
                                                        <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{item.name}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Specs: {item.specification || "-"}</p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <InventoryActions
                                                            item={item}
                                                            categories={categories}
                                                            locations={locations}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/30 dark:border-white/5">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Barcode</span>
                                                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{item.barcode}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Kategori</span>
                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate block">{item.category.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Stok Total</span>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.quantity} unit</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Status</span>
                                                        {item.quantity <= item.minStock ? (
                                                            <Badge variant="destructive" className="h-5 px-1.5 text-[9px] font-semibold">Stok Rendah</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-semibold">Tersedia</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        {aggregatedItems.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                Tidak ada barang. Tambahkan barang pertama Anda!
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {locations.map(loc => (
                            <TabsContent key={loc.id} value={loc.id}>
                                <Card>
                                    <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b border-border/40 dark:border-white/5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <CardTitle>Barang di {loc.name}</CardTitle>
                                            <MoveItemDialog locations={locations} defaultSourceLocationId={loc.id} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-6">
                                        {/* Desktop View */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Nama</TableHead>
                                                        <TableHead>Spesifikasi</TableHead>
                                                        <TableHead>Barcode</TableHead>
                                                        <TableHead>Kategori</TableHead>
                                                        <TableHead>Stok</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.filter(i => i.locationId === loc.id).map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">{item.name}</TableCell>
                                                            <TableCell className="max-w-[200px] truncate" title={(item as any).specification || ""}>{(item as any).specification || "-"}</TableCell>
                                                            <TableCell>{item.barcode}</TableCell>
                                                            <TableCell>{item.category.name}</TableCell>
                                                            <TableCell>{item.quantity}</TableCell>
                                                            <TableCell>
                                                                {item.quantity <= item.minStock ? (
                                                                    <Badge variant="destructive">Stok Rendah</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary">Tersedia</Badge>
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
                                                    ))}
                                                    {items.filter(i => i.locationId === loc.id).length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                                Tidak ada barang di lokasi ini.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card List View */}
                                        <div className="md:hidden space-y-4">
                                            {items.filter(i => i.locationId === loc.id).map((item) => (
                                                <Card key={item.id} className="p-4 border border-border/60 bg-white/20 dark:bg-black/15 backdrop-blur-md relative overflow-hidden">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 pr-2">
                                                            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{item.name}</h3>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Specs: {item.specification || "-"}</p>
                                                        </div>
                                                        <div className="shrink-0">
                                                            <InventoryActions
                                                                item={item}
                                                                categories={categories}
                                                                locations={locations}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/30 dark:border-white/5">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Barcode</span>
                                                            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{item.barcode}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Kategori</span>
                                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate block">{item.category.name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Stok</span>
                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.quantity} unit</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Status</span>
                                                            {item.quantity <= item.minStock ? (
                                                                <Badge variant="destructive" className="h-5 px-1.5 text-[9px] font-semibold">Stok Rendah</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-semibold">Tersedia</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                            {items.filter(i => i.locationId === loc.id).length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    Tidak ada barang di lokasi ini.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </TabsContent>

                <TabsContent value="warehouse">
                    <WarehouseManager locations={locations} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
