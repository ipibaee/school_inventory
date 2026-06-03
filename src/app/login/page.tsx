"use client"

import { useFormState, useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, School, KeyRound, Mail } from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { MouseParallaxBackground } from "@/components/ui/MouseParallaxBackground"

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button 
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 active:scale-97 text-sm rounded-xl cursor-pointer" 
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

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined)

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">
            {/* Smooth Mouse Parallax Glowing Background */}
            <MouseParallaxBackground />

            {/* Floating Top Right Theme Toggle */}
            <div className="absolute top-6 right-6 z-20 animate-fade-in">
                <ThemeToggle />
            </div>

            {/* Centered Glass Login Card */}
            <Card className="w-full max-w-md border-0 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in overflow-hidden p-2">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center border border-indigo-500/20 mb-4 animate-float shadow-inner">
                        <School className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        Inventaris SMK HKTI 2
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Sistem Manajemen Inventaris & Laboratorium
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <form action={dispatch} className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider pl-1">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@sekolah.sch.id"
                                    required
                                    className="pl-10 h-11 border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-black/20 focus:bg-white/60 dark:focus:bg-black/40 text-slate-800 dark:text-slate-100 transition-all rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider pl-1">
                                Password
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    placeholder="••••••••"
                                    required 
                                    className="pl-10 h-11 border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-black/20 focus:bg-white/60 dark:focus:bg-black/40 text-slate-800 dark:text-slate-100 transition-all rounded-xl"
                                />
                            </div>
                        </div>
                        
                        {errorMessage && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                                <p className="text-xs font-medium text-red-500">{errorMessage}</p>
                            </div>
                        )}
                        
                        <div className="pt-2">
                            <LoginButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
