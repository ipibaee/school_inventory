import { getSchoolSettings } from "@/actions/settings"
import { LoginForm } from "@/components/auth/LoginForm"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export default async function LoginPage() {
    const settings = await getSchoolSettings()

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#004e92] via-[#0066d6] to-[#021b44] select-none">
            {/* Vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none z-0" />

            {/* Floating Top Right Theme Toggle */}
            <div className="absolute top-6 right-6 z-20 animate-fade-in">
                <ThemeToggle />
            </div>

            {/* Abstract 3D Shapes / Waves / Blobs (plek ketiplek from reference image) */}
            
            {/* Shape 1: Top Left Ring (Torus) */}
            <div className="absolute top-[8%] left-[28%] w-36 h-36 rounded-full border-[22px] border-sky-400/25 border-t-white/50 border-r-white/50 rotate-45 blur-[1px] filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)] animate-float pointer-events-none" />

            {/* Shape 2: Large Right Glossy 3D Wave Spiral */}
            <svg className="absolute right-[12%] top-[12%] w-[380px] h-[380px] opacity-70 blur-[1px] filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)] animate-float-reverse pointer-events-none z-0" viewBox="0 0 240 240" fill="none">
                <path d="M30,210 C100,210 70,30 140,30 C210,30 180,210 250,210" stroke="url(#glossyGrad1)" strokeWidth="24" strokeLinecap="round" />
                <defs>
                    <linearGradient id="glossyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.8" />
                        <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
                        <stop offset="55%" stopColor="#0077ff" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#001f4d" stopOpacity="0.7" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Shape 3: Left Bottom 3D Spiral Tube */}
            <svg className="absolute left-[8%] bottom-[8%] w-[300px] h-[300px] opacity-65 blur-[1px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)] animate-float pointer-events-none z-0" viewBox="0 0 200 200" fill="none">
                <path d="M20,20 C20,130 180,70 180,180" stroke="url(#glossyGrad2)" strokeWidth="20" strokeLinecap="round" />
                <defs>
                    <linearGradient id="glossyGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#002244" stopOpacity="0.8" />
                        <stop offset="40%" stopColor="#0099ff" stopOpacity="0.8" />
                        <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#33ccff" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Shape 4: Giant Bottom Right Torus */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border-[48px] border-sky-400/20 border-t-sky-300/40 border-l-sky-300/40 rotate-[35deg] blur-[2px] filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.3)] animate-float pointer-events-none" />

            {/* Shape 5: Center Left 3D Zigzag Wave */}
            <svg className="absolute left-[15%] top-[30%] w-[180px] h-[180px] opacity-75 blur-[0.5px] filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.15)] animate-float-reverse pointer-events-none" viewBox="0 0 100 100" fill="none">
                <path d="M10,20 L30,50 L50,20 L70,50 L90,20" stroke="url(#glossyGrad3)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="glossyGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#00aaff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#003366" stopOpacity="0.6" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Shape 6: Small floating double waves on right */}
            <div className="absolute right-[24%] bottom-[35%] w-14 h-7 rounded-full border-4 border-sky-300/40 border-b-transparent rotate-[20deg] blur-[0.5px] animate-float pointer-events-none" />
            <div className="absolute right-[25%] bottom-[32%] w-14 h-7 rounded-full border-4 border-sky-300/40 border-b-transparent rotate-[20deg] blur-[0.5px] animate-float pointer-events-none" />

            {/* LoginForm Client Form Component */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                <LoginForm settings={settings} />
            </div>
        </div>
    )
}
