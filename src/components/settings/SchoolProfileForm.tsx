"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getSchoolSettings, updateSchoolSettings } from "@/actions/settings"
import { toast } from "sonner"
import { School, Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function SchoolProfileForm() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        schoolName: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        logoUrl: "",
    })

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getSchoolSettings()
            if (settings) {
                setFormData({
                    schoolName: settings.schoolName || "",
                    address: settings.address || "",
                    phone: settings.phone || "",
                    email: settings.email || "",
                    website: settings.website || "",
                    logoUrl: settings.logoUrl || "",
                })
            }
        }
        fetchSettings()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const data = new FormData()
        data.append("schoolName", formData.schoolName)
        data.append("address", formData.address)
        data.append("phone", formData.phone)
        data.append("email", formData.email)
        data.append("website", formData.website)

        const result = await updateSchoolSettings(data)
        setLoading(false)

        if (result.success) {
            toast.success("Pengaturan berhasil diperbarui")
        } else {
            toast.error("Gagal memperbarui pengaturan")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" /> Profil Sekolah
                </CardTitle>
                <CardDescription>
                    Kelola informasi sekolah Anda. Ini akan ditampilkan pada kop laporan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama Sekolah</label>
                            <Input
                                name="schoolName"
                                value={formData.schoolName}
                                onChange={handleChange}
                                placeholder="Contoh: SMA Negeri 1 Jakarta"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nomor Telepon</label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Contoh: (021) 1234567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@sekolah.sch.id"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <Input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="www.sekolah.sch.id"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Alamat</label>
                            <Textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Alamat lengkap sekolah..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
