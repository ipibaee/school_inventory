"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate, loginWithGoogle } from "@/actions/auth"
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
    AlertCircle,
    Shield,
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
                    <span>Masuk dengan Email</span>
                    <ArrowRight className="size-[15px]" />
                </>
            )}
        </Button>
    )
}

function GoogleLoginButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-surface hover:bg-surface-2 border border-line text-ink font-bold rounded-[10px] text-[13px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
        >
            {pending ? (
                <>
                    <Loader2 className="size-4 animate-spin text-brand" />
                    <span>Menghubungkan ke Google...</span>
                </>
            ) : (
                <>
                    <svg className="size-[18px] shrink-0" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    <span>Masuk dengan Google</span>
                </>
            )}
        </button>
    )
}

interface LoginFormProps {
    settings: any
    initialError?: string
}

export function LoginForm({ settings, initialError }: LoginFormProps) {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)
    const [googleError, setGoogleError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    const schoolName = settings?.schoolName || "SMK HKTI 2"

    // Terjemahkan error dari NextAuth URL query parameters
    let displayError = errorMessage || googleError
    if (!displayError && initialError) {
        if (initialError === "AccessDenied") {
            displayError = "Akses Ditolak: Email Google ini belum terdaftar di sistem. Hanya akun email yang telah didaftarkan oleh Administrator yang diizinkan masuk."
        } else if (initialError === "OAuthSignin" || initialError === "OAuthCallbackError") {
            displayError = "Gagal menghubungkan ke akun Google. Silakan coba kembali."
        } else if (initialError === "Configuration") {
            displayError = "Konfigurasi Google Login (Client ID & Secret) di file .env server belum terpasang."
        } else {
            displayError = "Terjadi kesalahan saat proses autentikasi."
        }
    }

    const handleGoogleAction = async () => {
        setGoogleError(null)
        try {
            const res = await loginWithGoogle()
            if (res?.error) {
                setGoogleError(res.error)
            }
        } catch (err: any) {
            // NEXT_REDIRECT dilempar oleh server action untuk redirect ke Google
            if (err?.message?.includes("NEXT_REDIRECT")) {
                throw err
            }
            setGoogleError("Terjadi kesalahan saat memulai login dengan Google.")
        }
    }

    return (
        <div className="w-full max-w-[380px] flex flex-col gap-[20px]">
            {/* Mobile-only brand header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-1">
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
            <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[1.4px] text-brand font-bold">
                    MASUK KE AKUN
                </span>
                <h2 className="text-[26px] font-extrabold tracking-[-0.8px] text-ink leading-tight">
                    Selamat datang kembali
                </h2>
                <p className="text-[12.5px] leading-[1.5] text-muted-ink">
                    Gunakan email terdaftar atau akun Google resmi untuk mengakses sistem.
                </p>
            </div>

            {/* Error Message */}
            {displayError && (
                <div className="p-3.5 rounded-[12px] bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{displayError}</span>
                </div>
            )}

            {/* ── Tombol Google Login ── */}
            <form action={handleGoogleAction} className="flex flex-col gap-2">
                <GoogleLoginButton />
                <div className="flex items-center gap-1.5 text-[10.5px] text-muted-ink px-1">
                    <Shield className="size-3 text-brand shrink-0" />
                    <span>Hanya akun Google yang terdaftar di admin yang dapat masuk.</span>
                </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-0.5">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[10px] text-muted-ink uppercase font-bold tracking-wider">
                    atau dengan email & sandi
                </span>
                <div className="flex-1 h-px bg-line" />
            </div>

            {/* Form Email & Password */}
            <form action={dispatch} className="flex flex-col gap-3.5">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="label-caps">
                        EMAIL TERDAFTAR
                    </Label>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 size-4 text-muted-ink pointer-events-none" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@sekolah.sch.id"
                            required
                            className="pl-10 h-11 rounded-[10px] text-xs"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password" className="label-caps">
                        KATA SANDI
                    </Label>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 size-4 text-muted-ink pointer-events-none" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            required
                            className="pl-10 pr-10 h-11 rounded-[10px] text-xs"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 size-4 text-muted-ink hover:text-ink transition-colors cursor-pointer"
                            title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                </div>

                {/* Remember & Forgot Password */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
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
                        onClick={() => alert("Silakan hubungi administrator sekolah untuk reset kata sandi.")}
                        className="font-bold text-brand hover:underline cursor-pointer"
                    >
                        Lupa sandi?
                    </button>
                </div>

                {/* Submit */}
                <div className="pt-1.5">
                    <LoginButton />
                </div>
            </form>

            {/* Help */}
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-surface-2 border border-line text-ink-soft text-[11px] font-medium mt-1">
                <LifeBuoy className="size-3.5 text-muted-ink" />
                <span>Belum terdaftar? Hubungi Administrator / TU</span>
            </div>

            {/* Mobile-only footer */}
            <div className="lg:hidden text-center text-[9.5px] text-muted-ink mt-2">
                © 2026 {schoolName} · Purwareja Klampok
            </div>
        </div>
    )
}
