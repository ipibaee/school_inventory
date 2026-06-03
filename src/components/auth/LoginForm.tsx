"use client"

import { useFormState, useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, School, KeyRound, Mail } from "lucide-react"

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button 
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-medium shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-97 text-sm rounded-xl cursor-pointer" 
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                </>
            ) : (
                "Sign in"
            )}
        </Button>
    )
}

interface LoginFormProps {
    settings: any
}

export function LoginForm({ settings }: LoginFormProps) {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined)

    return (
        <Card className="w-full max-w-md border border-white/20 bg-white/10 dark:bg-zinc-950/15 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in overflow-hidden p-2">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400" />
            <CardHeader className="text-center pt-8 pb-4">
                {/* Logo display using base64 or default icon */}
                <div className="mx-auto h-16 w-16 rounded-2xl bg-white/15 dark:bg-white/5 flex items-center justify-center border border-white/20 mb-4 animate-float shadow-lg relative overflow-hidden">
                    {settings?.logoUrl ? (
                        <img
                            src={settings.logoUrl}
                            alt="Logo"
                            className="w-12 h-12 object-contain"
                        />
                    ) : (
                        <School className="h-7 w-7 text-white" />
                    )}
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {settings?.schoolName || "Inventaris SMK HKTI 2"}
                </CardTitle>
                <CardDescription className="text-sm text-blue-100/70 mt-1">
                    Sistem Manajemen Inventaris & Laboratorium
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <form action={dispatch} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-blue-100/80 text-xs font-semibold uppercase tracking-wider pl-1">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-blue-100/60 pointer-events-none" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@smkhkti2.sch.id"
                                required
                                className="pl-10 h-11 border-white/15 bg-white/10 text-white placeholder:text-blue-100/40 focus:bg-white/20 transition-all rounded-xl focus:border-white/30 focus:ring-0"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-blue-100/80 text-xs font-semibold uppercase tracking-wider pl-1">
                            Password
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-blue-100/60 pointer-events-none" />
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder="••••••••"
                                required 
                                className="pl-10 h-11 border-white/15 bg-white/10 text-white placeholder:text-blue-100/40 focus:bg-white/20 transition-all rounded-xl focus:border-white/30 focus:ring-0"
                            />
                        </div>
                    </div>
                    
                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-center">
                            <p className="text-xs font-medium text-red-200">{errorMessage}</p>
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <LoginButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
