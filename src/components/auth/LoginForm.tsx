"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Loader2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    LifeBuoy,
    GraduationCap,
    Check,
} from "lucide-react"

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            className="w-full h-11 bg-brand text-white font-bold rounded-[10px] text-[13.5px] hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Memproses...</span>
                </>
            ) : (
                <>
                    <span>Masuk</span>
                    <ArrowRight className="size-[15px]" />
                </>
            )}
        </Button>
    )
}

interface LoginFormProps {
    settings: any
}

export function LoginForm({ settings }: LoginFormProps) {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    const schoolName = settings?.schoolName || "SMK HKTI 2"

    return (
        <div className="w-full max-w-[380px] flex flex-col gap-[22px]">
            {/* Mobile-only brand header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-2">
                <div className="size-[34px] rounded-[10px] bg-brand grid place-items-center shrink-0">
                    <GraduationCap className="size-[18px] text-white" />
                </div>
                <div className="flex flex-col gap-px">
                    <span className="text-[13.5px] font-extrabold text-ink leading-tight">
                        {schoolName}
                    </span>
                    <span className="text-[9.5px] text-muted-ink leading-tight">
                        HIKA Inventaris
                    </span>
                </div>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[1.4px] text-brand font-bold">
                    MASUK KE AKUN
                </span>
                <h2 className="text-[28px] font-extrabold tracking-[-0.8px] text-ink leading-tight">
                    Selamat datang kembali
                </h2>
                <p className="text-[13px] leading-[1.55] text-muted-ink">
                    Gunakan email sekolah untuk mengakses dashboard inventaris.
                </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="p-3 rounded-[10px] bg-rose-soft border border-rose/20 text-rose text-xs font-semibold">
                    {errorMessage}
                </div>
            )}

            {/* Form */}
            <form action={dispatch} className="flex flex-col gap-[18px]">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="label-caps">
                        EMAIL
                    </Label>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 size-4 text-muted-ink pointer-events-none" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@smkhkti2.sch.id"
                            required
                            className="pl-10 h-11 rounded-[10px]"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password" className="label-caps">
                        PASSWORD
                    </Label>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 size-4 text-muted-ink pointer-events-none" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            required
                            className="pl-10 pr-10 h-11 rounded-[10px]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 size-4 text-muted-ink hover:text-ink transition-colors cursor-pointer"
                            title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                </div>

                {/* Remember & Forgot Password */}
                <div className="flex items-center justify-between text-[11.5px] pt-1">
                    <label
                        className="flex items-center gap-2 text-ink-soft cursor-pointer select-none"
                        onClick={() => setRememberMe(!rememberMe)}
                    >
                        <div
                            className={`size-[15px] rounded-[4px] grid place-items-center transition-colors ${
                                rememberMe ? "bg-brand text-white" : "border border-line bg-surface"
                            }`}
                        >
                            {rememberMe && <Check className="size-3 stroke-[2.5]" />}
                        </div>
                        <span>Ingat perangkat ini</span>
                    </label>

                    <button
                        type="button"
                        onClick={() => alert("Silakan hubungi administrator sekolah untuk reset password.")}
                        className="font-bold text-brand hover:underline cursor-pointer"
                    >
                        Lupa password?
                    </button>
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <LoginButton />
                </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[10.5px] text-muted-ink uppercase">atau</span>
                <div className="flex-1 h-px bg-line" />
            </div>

            {/* Help */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-surface-2 border border-line text-ink-soft text-[11.5px] font-medium">
                <LifeBuoy className="size-3.5 text-muted-ink" />
                <span>Butuh bantuan? Hubungi admin TU</span>
            </div>

            {/* Mobile-only footer */}
            <div className="lg:hidden text-center text-[9.5px] text-muted-ink mt-4">
                © 2026 {schoolName} · Purwareja Klampok
            </div>
        </div>
    )
}
