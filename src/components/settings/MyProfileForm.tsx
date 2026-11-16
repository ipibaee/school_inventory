"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getMyProfile, updateMyProfile } from "@/actions/users"
import { toast } from "sonner"
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    KeyRound,
} from "lucide-react"

export function MyProfileForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        setLoading(true)
        const profile = await getMyProfile()
        if (profile) {
            setUser(profile)
            setName(profile.name || "")
            setEmail(profile.email || "")
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error("Nama lengkap tidak boleh kosong")
            return
        }

        if (!email.trim()) {
            toast.error("Alamat email tidak boleh kosong")
            return
        }

        if (newPassword.trim()) {
            if (newPassword.trim().length < 6) {
                toast.error("Password baru minimal 6 karakter")
                return
            }
            if (newPassword !== confirmPassword) {
                toast.error("Konfirmasi password baru tidak cocok")
                return
            }
        }

        setSaving(true)
        const res = await updateMyProfile({
            name,
            email,
            currentPassword: currentPassword.trim() || undefined,
            newPassword: newPassword.trim() || undefined,
        })
        setSaving(false)

        if (res.success) {
            toast.success("Profil dan akun berhasil diperbarui! Email baru otomatis terdata di sistem admin.")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            loadProfile()
        } else {
            toast.error(res.error || "Gagal memperbarui profil")
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-line bg-surface p-6 flex items-center justify-center min-h-[180px]">
                <Loader2 className="size-5 animate-spin text-brand" />
            </div>
        )
    }

    const roleName =
        user?.role === "TEACHER"
            ? "Guru Pengawas / Pemeriksa"
            : user?.role === "ADMIN"
            ? "Administrator Sistem"
            : "Teknisi Inventaris"

    return (
        <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-line bg-surface-2/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
                        <User className="size-5" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-extrabold text-ink leading-tight">
                            Profil &amp; Keamanan Akun
                        </h3>
                        <span className="text-[11px] text-muted-ink">
                            Kelola alamat email dan kata sandi untuk login.
                        </span>
                    </div>
                </div>

                <Badge
                    variant={user?.role === "TEACHER" ? "mint" : "brand"}
                    className="text-[10px] uppercase font-bold shrink-0"
                >
                    <ShieldCheck className="size-3 mr-1" />
                    {roleName}
                </Badge>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4">
                {/* Nama & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="my-name" className="text-[10.5px] font-bold uppercase text-ink-soft">
                            Nama Lengkap
                        </Label>
                        <div className="relative flex items-center">
                            <User className="absolute left-3 size-4 text-muted-ink pointer-events-none" />
                            <Input
                                id="my-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama lengkap..."
                                required
                                className="pl-9 h-10 text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="my-email" className="text-[10.5px] font-bold uppercase text-ink-soft">
                            Alamat Email (Untuk Login)
                        </Label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 size-4 text-muted-ink pointer-events-none" />
                            <Input
                                id="my-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@sekolah.sch.id"
                                required
                                className="pl-9 h-10 text-xs font-mono"
                            />
                        </div>
                        <span className="text-[10px] text-muted-ink">
                            *Jika email diubah, data di manajemen pengguna admin otomatis ikut berubah.
                        </span>
                    </div>
                </div>

                {/* Seksi Ganti Password */}
                <div className="pt-3 border-t border-line flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                        <KeyRound className="size-4 text-brand" />
                        <span className="text-xs font-bold text-ink">Ganti Kata Sandi</span>
                        <span className="text-[10.5px] text-muted-ink font-normal">
                            (Kosongkan jika tidak ingin mengubah password)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Password Saat Ini */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="current-pass" className="text-[10px] font-bold uppercase text-muted-ink">
                                Password Saat Ini
                            </Label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 size-3.5 text-muted-ink pointer-events-none" />
                                <Input
                                    id="current-pass"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-8 pr-8 h-9 text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-2.5 text-muted-ink hover:text-ink transition-colors cursor-pointer"
                                >
                                    {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Baru */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="new-pass" className="text-[10px] font-bold uppercase text-muted-ink">
                                Password Baru
                            </Label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 size-3.5 text-muted-ink pointer-events-none" />
                                <Input
                                    id="new-pass"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="pl-8 pr-8 h-9 text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-2.5 text-muted-ink hover:text-ink transition-colors cursor-pointer"
                                >
                                    {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Konfirmasi Password Baru */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirm-pass" className="text-[10px] font-bold uppercase text-muted-ink">
                                Ulangi Password Baru
                            </Label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 size-3.5 text-muted-ink pointer-events-none" />
                                <Input
                                    id="confirm-pass"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    className="pl-8 h-9 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tombol Simpan */}
                <div className="pt-2 flex items-center justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={saving}
                        className="gap-2 text-xs font-bold px-5"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="size-3.5" />
                                <span>Simpan Perubahan Akun</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
