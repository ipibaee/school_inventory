"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSchoolSettings, updateSchoolSettings } from "@/actions/settings"
import { toast } from "sonner"
import { Loader2, Save, Upload } from "lucide-react"
import Image from "next/image"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const data = await getSchoolSettings()
        setSettings(data)
        if (data?.logoUrl) {
            setLogoPreview(data.logoUrl)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)

        const formData = new FormData(e.currentTarget)
        const result = await updateSchoolSettings(formData)

        if (result.success) {
            toast.success("Pengaturan berhasil disimpan")
            loadSettings() // Reload to get new logo URL if changed
        } else {
            toast.error(result.error)
        }
        setSaving(false)
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
                <p className="text-muted-foreground">
                    Kelola informasi sekolah dan tampilan aplikasi.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Identitas Sekolah</CardTitle>
                    <CardDescription>
                        Informasi ini akan ditampilkan pada kop laporan dan label barcode.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">Nama Sekolah / Instansi</Label>
                                <Input
                                    id="schoolName"
                                    name="schoolName"
                                    defaultValue={settings?.schoolName}
                                    placeholder="Contoh: SMK Negeri 1..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={settings?.phone}
                                    placeholder="021-xxxxxxx"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={settings?.address}
                                    placeholder="Jl. Raya..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={settings?.email}
                                    placeholder="admin@sekolah.sch.id"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    defaultValue={settings?.website}
                                    placeholder="www.sekolah.sch.id"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <Label>Logo Sekolah</Label>
                            <div className="flex items-center gap-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 w-32 flex items-center justify-center bg-gray-50 relative overflow-hidden">
                                    {logoPreview ? (
                                        <Image
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-400 text-center">Belum ada logo</span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="w-full max-w-xs"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Format: PNG, JPG. Maksimal 2MB. Disarankan rasio 1:1.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
