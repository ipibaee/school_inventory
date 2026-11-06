"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addNewItem } from "@/actions/procurement"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

interface AddNewItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  procurementId: string
  categories: any[]
}

const UNITS = ["Unit", "Roll", "Set", "Box", "Buah", "Lembar", "Pcs", "Rim"]

export function AddNewItemDialog({
  open,
  onOpenChange,
  procurementId,
  categories,
}: AddNewItemDialogProps) {
  const [name, setName] = useState("")
  const [specification, setSpecification] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("Unit")
  const [barcode, setBarcode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Nama barang wajib diisi")
      return
    }
    if (quantity < 1) {
      toast.error("Jumlah minimal 1")
      return
    }

    setLoading(true)
    const res = await addNewItem({
      procurementId,
      name: name.trim(),
      specification: specification.trim() || undefined,
      categoryName: categoryName.trim() || "Umum",
      quantity,
      unit,
      barcode: barcode.trim() || undefined,
    })
    setLoading(false)

    if (res.ok) {
      toast.success("Barang baru berhasil ditambahkan ke daftar belanjaan")
      setName("")
      setSpecification("")
      setCategoryName("")
      setQuantity(1)
      setBarcode("")
      onOpenChange(false)
    } else {
      toast.error(res.error || "Gagal menambahkan barang baru")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Tambah Barang Belanjaan Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
              Nama Barang *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kabel UTP Cat6 Belden"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
              Spesifikasi Teknis
            </label>
            <Input
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="Contoh: Roll 305 Meter · Original Belden"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                Kategori
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Contoh: Jaringan / Lab"
                list="category-suggestions"
                className="text-xs"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                Kode / Barcode (Opsional)
              </label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Auto jika kosong"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                Jumlah *
              </label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft mb-1 block">
                Satuan
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] border border-line bg-surface text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[10.5px] text-muted-ink mt-1">
            Barang baru ini akan otomatis tercatat ke dalam Katalog Master Inventaris saat BAP disahkan Guru Pengawas.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-line mt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              <span>Tambah Barang</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
