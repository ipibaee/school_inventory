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
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventaris</h2>
                <div className="flex gap-2">
                    <MoveItemDialog locations={locations} />
                    <ScanDialog categories={categories} locations={locations} />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
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
                            <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                                >
                                    Semua Barang
                                </TabsTrigger>
                                {locations.map(loc => (
                                    <TabsTrigger
                                        key={loc.id}
                                        value={loc.id}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                                    >
                                        {loc.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <TabsContent value="all">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Semua Barang</CardTitle>
                                        <div className="relative w-64">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Cari barang..." className="pl-8" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {locations.map(loc => (
                            <TabsContent key={loc.id} value={loc.id}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Barang di {loc.name}</CardTitle>
                                            <MoveItemDialog locations={locations} defaultSourceLocationId={loc.id} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
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
