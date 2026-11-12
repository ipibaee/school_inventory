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
import { createItem, updateItem, createCategory } from "@/actions/inventory"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"

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
    const [localCategories, setLocalCategories] = useState(categories)
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [savingCategory, setSavingCategory] = useState(false)

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

    async function handleSaveCategory() {
        if (!newCategoryName.trim()) return
        setSavingCategory(true)
        const res = await createCategory(newCategoryName.trim())
        setSavingCategory(false)
        if (res.success && res.data) {
            const created = res.data
            setLocalCategories(prev => {
                if (prev.some(c => c.id === created.id)) return prev
                return [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
            })
            form.setValue("categoryId", created.id)
            setNewCategoryName("")
            setIsAddingCategory(false)
        } else {
            alert(res.error || "Gagal membuat kategori")
        }
    }

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
                                <div className="flex items-center justify-between">
                                    <FormLabel>Kategori</FormLabel>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory((v) => !v)}
                                        className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                        <Plus className="size-3" />
                                        <span>{isAddingCategory ? "Pilih list" : "+ Baru"}</span>
                                    </button>
                                </div>
                                {isAddingCategory ? (
                                    <div className="flex items-center gap-1.5 p-1 rounded-md border border-brand/30 bg-surface-2">
                                        <Input
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Nama kategori baru..."
                                            className="h-8 text-xs flex-1"
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
                                            className="h-8 px-2.5 text-xs bg-brand text-white font-bold"
                                        >
                                            {savingCategory ? <Loader2 className="size-3 animate-spin" /> : "Simpan"}
                                        </Button>
                                    </div>
                                ) : (
                                    <Select
                                        onValueChange={(val) => {
                                            if (val === "__new__") {
                                                setIsAddingCategory(true)
                                            } else {
                                                field.onChange(val)
                                            }
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {localCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
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
