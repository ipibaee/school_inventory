import { getSchoolSettings } from "@/actions/settings"
import { LoginForm } from "@/components/auth/LoginForm"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { GraduationCap } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
    let settings = null
    try {
        settings = await getSchoolSettings()
    } catch (e) {
        console.error("Failed to load school settings:", e)
    }
    const schoolName = settings?.schoolName || "SMK HKTI 2"

    return (
        <div className="min-h-screen w-full flex bg-surface relative overflow-hidden">
            {/* Theme Toggle Top Right */}
            <div className="absolute top-5 right-5 z-20">
                <ThemeToggle />
            </div>

            {/* Left Brand Panel (Desktop only: 660px, bg-navy) */}
            <div className="hidden lg:flex w-[660px] bg-navy text-white p-[52px] flex-col justify-between relative overflow-hidden shrink-0 select-none">
                {/* Subtle Glow at bottom */}
                <div
                    className="absolute -bottom-20 -left-20 w-[620px] h-[360px] rounded-full pointer-events-none opacity-40"
                    style={{
                        background: "radial-gradient(circle, #2B4EFF 0%, rgba(43, 78, 255, 0) 70%)",
                    }}
                />

                {/* Brand */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="size-10 rounded-[12px] bg-brand grid place-items-center shrink-0">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="size-6 object-contain" />
                        ) : (
                            <GraduationCap className="size-[21px] text-white" />
                        )}
                    </div>
                    <div className="flex flex-col gap-px">
                        <span className="text-[15px] font-extrabold text-white tracking-[-0.2px] leading-tight">
                            {schoolName}
                        </span>
                        <span className="text-[11px] text-[#8296B4] font-medium leading-tight">
                            HIKA Inventaris
                        </span>
                    </div>
                </div>

                {/* Copy & Stats */}
                <div className="flex flex-col gap-[18px] relative z-10 max-w-[500px]">
                    <span className="font-mono text-[10.5px] uppercase tracking-[1.4px] text-[#7FA6FF] font-semibold">
                        SISTEM MANAJEMEN INVENTARIS & LABORATORIUM
                    </span>
                    <h1 className="text-[42px] font-extrabold leading-[1.12] tracking-[-1.4px] text-white">
                        Satu sumber data untuk seluruh perangkat sekolah.
                    </h1>
                    <p className="text-[14px] leading-[1.65] text-[#A6B7D0] max-w-[460px]">
                        Catat barang masuk, keluar, dan peminjaman laboratorium. Stok selalu akurat tanpa rekap manual.
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex flex-col gap-[3px] py-[13px] px-4 rounded-[12px] bg-white/[0.06] border border-white/10 min-w-[100px]">
                            <span className="text-[20px] font-extrabold text-white leading-none">40</span>
                            <span className="text-[10.5px] text-[#8296B4]">Jenis barang</span>
                        </div>
                        <div className="flex flex-col gap-[3px] py-[13px] px-4 rounded-[12px] bg-white/[0.06] border border-white/10 min-w-[100px]">
                            <span className="text-[20px] font-extrabold text-white leading-none">9</span>
                            <span className="text-[10.5px] text-[#8296B4]">Ruang & lab</span>
                        </div>
                        <div className="flex flex-col gap-[3px] py-[13px] px-4 rounded-[12px] bg-white/[0.06] border border-white/10 min-w-[100px]">
                            <span className="text-[20px] font-extrabold text-white leading-none">128</span>
                            <span className="text-[10.5px] text-[#8296B4]">Transaksi</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-[10.5px] text-[#6C82A3] relative z-10">
                    © 2026 {schoolName} · Purwareja Klampok
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-[52px_48px] overflow-y-auto">
                <LoginForm settings={settings} />
            </div>
        </div>
    )
}
