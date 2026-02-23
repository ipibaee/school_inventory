"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getPrinterSettings, updatePrinterSettings } from "@/actions/printer-settings"
import { toast } from "sonner"
import { Printer, Save } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function PrinterSettingsForm() {
    const [loading, setLoading] = useState(false)
    const [paperSize, setPaperSize] = useState("58mm")

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getPrinterSettings()
            if (settings) {
                setPaperSize(settings.paperSize)
            }
        }
        fetchSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const result = await updatePrinterSettings({ paperSize })
        setLoading(false)

        if (result.success) {
            toast.success("Pengaturan printer berhasil diperbarui")
        } else {
            toast.error("Gagal memperbarui pengaturan printer")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5" /> Konfigurasi Printer
                </CardTitle>
                <CardDescription>
                    Konfigurasi pengaturan printer thermal untuk label barcode dan struk.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paperSize">Ukuran Kertas</Label>
                            <Select value={paperSize} onValueChange={setPaperSize}>
                                <SelectTrigger id="paperSize">
                                    <SelectValue placeholder="Pilih ukuran kertas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="58mm">58mm (Thermal Standar)</SelectItem>
                                    <SelectItem value="80mm">80mm (Thermal Lebar)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Pilih lebar kertas printer thermal Anda. Ini mempengaruhi bagaimana barcode dan struk dibuat.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Simpan Konfigurasi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
