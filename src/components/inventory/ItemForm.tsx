"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createItem, updateItem } from "@/actions/inventory"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    barcode: z.string().min(3, "Barcode wajib diisi"),
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    locationId: z.string().min(1, "Lokasi wajib dipilih"),
    quantity: z.coerce.number().min(0),
    minStock: z.coerce.number().min(0),
    specification: z.string().optional(),
})

interface ItemFormProps {
    categories: { id: string; name: string }[]
    locations: { id: string; name: string }[]
    initialData?: {
        id: string
        name: string
        barcode: string
        categoryId: string
        locationId: string
        quantity: number
        minStock: number
        specification?: string | null
    } | null
    onSuccess?: () => void
    defaultBarcode?: string
    forcedLocationId?: string
    defaults?: {
        name?: string
        categoryId?: string
        specification?: string
        minStock?: number
    }
}

export function ItemForm({ categories, locations, initialData, onSuccess, defaultBarcode, forcedLocationId, defaults }: ItemFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || defaults?.name || "",
            barcode: initialData?.barcode || defaultBarcode || "",
            categoryId: initialData?.categoryId || defaults?.categoryId || "",
            locationId: forcedLocationId || initialData?.locationId || "",
            quantity: initialData?.quantity ?? 0,
            minStock: initialData?.minStock ?? defaults?.minStock ?? 5,
            specification: initialData?.specification || defaults?.specification || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        let result

        if (initialData) {
            result = await updateItem(initialData.id, values)
        } else {
            result = await createItem(values)
        }

        setLoading(false)

        if (result.success) {
            form.reset()
            router.refresh()
            onSuccess?.()
        } else {
            alert("Gagal menyimpan barang")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Barang</FormLabel>
                            <FormControl>
                                <Input placeholder="Contoh: Proyektor Epson X500" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="specification"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Spesifikasi</FormLabel>
                            <FormControl>
                                <Input placeholder="Contoh: RAM 8GB, SSD 256GB" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Barcode</FormLabel>
                            <FormControl>
                                <Input placeholder="Scan atau ketik barcode" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="locationId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lokasi</FormLabel>
                                {forcedLocationId ? (
                                    <Input
                                        value={locations.find(l => l.id === forcedLocationId)?.name || "Gudang"}
                                        disabled
                                        readOnly
                                    />
                                ) : (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih lokasi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stok Min</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value as number} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Barang"}
                </Button>
            </form>
        </Form>
    )
}
