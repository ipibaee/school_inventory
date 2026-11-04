"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSchoolSettings, updateSchoolSettings } from "@/actions/settings"
import { logout } from "@/actions/auth"
import { toast } from "sonner"
import {
    Loader2, Check, Building2, GraduationCap,
    Sun, Moon, Monitor, LogOut, Upload
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { UserManagement } from "@/components/settings/UserManagement"

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-[10.5px] font-bold uppercase tracking-[0.4px] text-ink-soft mb-1.5">
            {children}
        </label>
    )
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const data = await getSchoolSettings()
        setSettings(data)
        if (data?.logoUrl) setLogoPreview(data.logoUrl)
        setLoading(false)
    }

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault()
        setSaving(true)
        const form = e?.currentTarget ?? formRef.current
        if (!form) { setSaving(false); return }
        const formData = new FormData(form)
        const result = await updateSchoolSettings(formData)
        if (result.success) {
            toast.success("Pengaturan berhasil disimpan")
            loadSettings()
        } else {
            toast.error(result.error || "Gagal menyimpan pengaturan")
        }
        setSaving(false)
    }

    const handleLogoChange = (file: File | null) => {
        if (!file) return
        if (file.size > 500 * 1024) {
            toast.error("Ukuran file maksimal 500 KB")
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setLogoPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleLogoChange(file)
    }

    const themeOptions = [
        { value: "light", label: "Terang", icon: Sun },
        { value: "dark", label: "Gelap", icon: Moon },
        { value: "system", label: "Ikuti sistem", icon: Monitor },
    ]

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
        )
    }

    const saveButton = (
        <Button
            variant="primary"
            onClick={() => {
                if (formRef.current) {
                    formRef.current.requestSubmit()
                }
            }}
            disabled={saving}
        >
            {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…</>
            ) : (
                <><Check className="h-4 w-4" /> Simpan Perubahan</>
            )}
        </Button>
    )

    return (
        <>
            {/* ── Desktop topbar ── */}
            <div className="hidden lg:block">
                <PageHeader
                    title="Pengaturan"
                    subtitle="Kelola informasi sekolah dan tampilan aplikasi."
                    actions={saveButton}
                />
            </div>

            {/* ── Mobile app bar ── */}
            <div className="lg:hidden">
                <MobileAppBar
                    title="Pengaturan"
                    subtitle="Identitas & tampilan"
                    back
                />
            </div>

            {/* ── Page body ── */}
            <form ref={formRef} onSubmit={handleSubmit}>
                {/* Desktop: 2-column layout */}
                <div className="flex gap-4 items-start px-4 lg:px-0 pb-24 lg:pb-0">

                    {/* ── LEFT: Identitas + User Management ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">

                        {/* Identitas Sekolah card */}
                        <div className="rounded-2xl border border-line bg-surface overflow-hidden flex flex-col">
                            {/* Head */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[14.5px] font-bold text-ink">Identitas Sekolah</span>
                                    <span className="text-[11px] text-muted-ink">Tampil pada kop laporan dan label barcode.</span>
                                </div>
                                <Building2 className="size-4 text-muted-ink shrink-0" />
                            </div>

                            {/* Fields */}
                            <div className="p-5 flex flex-col gap-3.5">
                                {/* Row 1: Nama + Telepon */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Nama Sekolah / Instansi</FieldLabel>
                                        <Input
                                            name="schoolName"
                                            defaultValue={settings?.schoolName ?? ""}
                                            placeholder="SMK HKTI 2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Nomor Telepon</FieldLabel>
                                        <Input
                                            name="phone"
                                            defaultValue={settings?.phone ?? ""}
                                            placeholder="(0286) 479141"
                                        />
                                    </div>
                                </div>

                                {/* Alamat full-width */}
                                <div>
                                    <FieldLabel>Alamat Lengkap</FieldLabel>
                                    <Input
                                        name="address"
                                        defaultValue={settings?.address ?? ""}
                                        placeholder="Jl. Raya Purwareja Klampok No. 82-B…"
                                    />
                                </div>

                                {/* Row 2: Email + Website */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Email</FieldLabel>
                                        <Input
                                            name="email"
                                            type="email"
                                            defaultValue={settings?.email ?? ""}
                                            placeholder="admin@sekolah.sch.id"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Website</FieldLabel>
                                        <Input
                                            name="website"
                                            defaultValue={settings?.website ?? ""}
                                            placeholder="smkhkti2.sch.id"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto flex items-center justify-between px-5 py-3 bg-surface-2 border-t border-line">
                                <span className="text-[10.5px] text-muted-ink">
                                    Informasi ditampilkan pada kop laporan & barcode.
                                </span>
                                <button
                                    type="button"
                                    className="text-[10.5px] font-bold text-muted-ink hover:text-ink transition-colors"
                                    onClick={() => setSettings(null)}
                                >
                                    Kembalikan default
                                </button>
                            </div>
                        </div>

                        {/* User Management */}
                        <div>
                            <UserManagement />
                        </div>
                    </div>

                    {/* ── RIGHT: Logo + Theme + Session ── */}
                    <div className="hidden lg:flex flex-col gap-4 w-[332px] shrink-0">

                        {/* Logo Sekolah */}
                        <div className="rounded-2xl border border-line bg-surface p-[18px] flex flex-col gap-3.5">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[14px] font-bold text-ink">Logo Sekolah</span>
                                <span className="text-[10.5px] leading-[1.45] text-muted-ink">PNG atau JPG, maksimal 500 KB, rasio 1:1.</span>
                            </div>

                            {/* Dropzone */}
                            <div
                                className={`rounded-xl border-[1.5px] ${isDragging ? "border-brand bg-brand/5" : "border-[#BFCEE0] dark:border-[#3A4A5E]"} bg-surface-2 flex flex-col items-center gap-2 py-5 cursor-pointer transition-colors`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <div className="size-14 rounded-[14px] overflow-hidden relative">
                                        <Image src={logoPreview} alt="Logo" fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="size-14 rounded-[14px] bg-brand flex items-center justify-center">
                                        <GraduationCap className="size-[26px] text-white" />
                                    </div>
                                )}
                                <span className="text-[10.5px] text-muted-ink text-center">Tarik gambar ke sini atau klik untuk memilih</span>
                                <span className="font-mono text-[9px] tracking-[0.8px] text-muted-ink">SVG · PNG · JPG</span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                name="logo"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
                            />

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Pilih File Logo
                            </Button>
                        </div>

                        {/* Tampilan Aplikasi */}
                        <div className="rounded-2xl border border-line bg-surface p-[18px] flex flex-col gap-3">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[14px] font-bold text-ink">Tampilan Aplikasi</span>
                                <span className="text-[10.5px] text-muted-ink">Pilih tema yang paling nyaman dipakai.</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {themeOptions.map(({ value, label, icon: Icon }) => {
                                    const active = theme === value
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setTheme(value)}
                                            className={`flex items-center gap-2.5 px-[11px] py-[10px] rounded-[10px] border transition-all text-left ${active
                                                ? "bg-brand-soft border-brand/35 dark:bg-brand/15"
                                                : "bg-surface border-line hover:bg-surface-2"
                                                }`}
                                        >
                                            <Icon className={`size-3.5 ${active ? "text-brand" : "text-muted-ink"}`} />
                                            <span className={`flex-1 text-[11.5px] font-bold ${active ? "text-brand-deep dark:text-[#8AB4F8]" : "text-ink-soft"}`}>
                                                {label}
                                            </span>
                                            {/* Radio */}
                                            <span className={`size-3.5 rounded-full flex items-center justify-center border ${active ? "bg-brand border-brand" : "bg-surface border-line"}`}>
                                                {active && <span className="size-[4.5px] rounded-full bg-white" />}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Sesi & Keamanan */}
                        <div className="rounded-2xl bg-navy p-[18px] flex flex-col gap-2.5">
                            <span className="text-[13px] font-bold text-white">Sesi &amp; Keamanan</span>
                            <span className="text-[10.5px] leading-[1.5] text-[#8296B4]">
                                Tidak ada perangkat lain yang masuk dengan akun ini.
                            </span>
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                className="mt-1 w-full"
                                onClick={() => logout()}
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Keluar dari semua perangkat
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile: right column sections stacked ── */}
                <div className="lg:hidden px-4 pb-6 flex flex-col gap-3 mt-3">
                    {/* Logo mobile */}
                    <div className="rounded-[14px] border border-line bg-surface flex items-center gap-2.5 p-3.5">
                        {logoPreview ? (
                            <div className="size-11 rounded-[11px] overflow-hidden relative shrink-0">
                                <Image src={logoPreview} alt="Logo" fill className="object-contain" />
                            </div>
                        ) : (
                            <div className="size-11 rounded-[11px] bg-brand flex items-center justify-center shrink-0">
                                <GraduationCap className="size-[21px] text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10.5px] font-bold text-ink">Logo Sekolah</p>
                            <p className="text-[8.5px] text-muted-ink">PNG atau JPG · maks 500 KB</p>
                        </div>
                        <button
                            type="button"
                            className="text-[9.5px] font-bold text-brand shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Ganti
                        </button>
                    </div>

                    {/* Theme mobile */}
                    <div className="rounded-[14px] border border-line bg-surface p-3.5 flex flex-col gap-1.5">
                        <span className="text-[11.5px] font-bold text-ink mb-1">Tampilan Aplikasi</span>
                        {themeOptions.map(({ value, label, icon: Icon }) => {
                            const active = theme === value
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTheme(value)}
                                    className={`flex items-center gap-2 px-[10px] py-2 rounded-[9px] border transition-all text-left ${active
                                        ? "bg-brand-soft border-brand/40"
                                        : "bg-surface-2 border-line"
                                        }`}
                                >
                                    <Icon className={`size-[13px] ${active ? "text-brand" : "text-muted-ink"}`} />
                                    <span className={`flex-1 text-[10px] font-semibold ${active ? "text-brand-deep dark:text-[#8AB4F8]" : "text-ink-soft"}`}>{label}</span>
                                    <span className={`size-[13px] rounded-full border flex items-center justify-center ${active ? "bg-brand border-brand" : "bg-surface border-line"}`}>
                                        {active && <span className="size-1 rounded-full bg-white" />}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Session mobile */}
                    <div className="rounded-[14px] bg-navy p-3.5 flex flex-col gap-2">
                        <span className="text-[11.5px] font-bold text-white">Sesi &amp; Keamanan</span>
                        <span className="text-[9.5px] leading-[1.5] text-[#8296B4]">
                            Tidak ada perangkat lain yang masuk dengan akun ini.
                        </span>
                        <Button type="button" variant="danger" size="sm" className="w-full mt-0.5" onClick={() => logout()}>
                            <LogOut className="h-3.5 w-3.5" /> Keluar dari semua perangkat
                        </Button>
                    </div>
                </div>

                {/* ── Mobile sticky footer save button ── */}
                <div className="fixed bottom-[62px] left-0 right-0 z-30 px-4 py-2.5 bg-surface border-t border-line lg:hidden">
                    <Button type="submit" variant="primary" className="w-full" disabled={saving}>
                        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…</> : <><Check className="h-4 w-4" /> Simpan Perubahan</>}
                    </Button>
                </div>
            </form>
        </>
    )
}
