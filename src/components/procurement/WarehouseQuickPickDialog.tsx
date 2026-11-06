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
import { addItemFromWarehouse } from "@/actions/procurement"
import { toast } from "sonner"
import { Search, Package, Plus, Loader2 } from "lucide-react"

interface WarehouseQuickPickDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  procurementId: string
  warehouseItems: any[]
}

export function WarehouseQuickPickDialog({
  open,
  onOpenChange,
  procurementId,
  warehouseItems,
}: WarehouseQuickPickDialogProps) {
  const [search, setSearch] = useState("")
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const filtered = warehouseItems.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    (it.barcode && it.barcode.includes(search))
  )

  const handleSelect = async (itemId: string) => {
    setSelectedItemId(itemId)
  }

  const handleAdd = async () => {
    if (!selectedItemId) {
      toast.error("Pilih salah satu barang terlebih dahulu")
      return
    }
    if (quantity < 1) {
      toast.error("Jumlah minimal 1 unit")
      return
    }

    setLoading(true)
    const res = await addItemFromWarehouse({
      procurementId,
      itemId: selectedItemId,
      quantity,
    })
    setLoading(false)

    if (res.ok) {
      toast.success("Barang berhasil ditambahkan ke pengajuan")
      setSelectedItemId(null)
      setQuantity(1)
      onOpenChange(false)
    } else {
      toast.error(res.error || "Gagal menambahkan barang")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Pilih Barang dari Stok Gudang</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-ink" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama barang atau barcode gudang..."
              className="pl-9 text-xs"
            />
          </div>

          {/* List barang gudang */}
          <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-ink">
                Tidak ada barang gudang yang sesuai pencarian.
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedItemId === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand-soft/60 dark:bg-brand/10"
                        : "border-line bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-surface-2 grid place-items-center shrink-0">
                        <Package className="size-4 text-brand" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12.5px] font-bold text-ink truncate">
                          {item.name}
                        </span>
                        <span className="text-[10.5px] text-muted-ink truncate">
                          Stok saat ini: {item.quantity} · {item.category?.name || "Umum"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-muted-ink">
                        {item.barcode}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input jumlah */}
          {selectedItemId && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-line mt-1">
              <span className="text-[12px] font-semibold text-ink">
                Jumlah yang diajukan:
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center font-bold text-sm h-8"
                />
                <span className="text-xs text-muted-ink">Unit</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!selectedItemId || loading}
            onClick={handleAdd}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            <span>Tambahkan ke Pengajuan</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
