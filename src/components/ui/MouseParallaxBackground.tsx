"use client"

import { useEffect, useRef } from "react"

export function MouseParallaxBackground() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const x = (clientX - window.innerWidth / 2) / 35 // Sensitivity
            const y = (clientY - window.innerHeight / 2) / 35
            
            container.style.setProperty("--mouse-x", `${x}px`)
            container.style.setProperty("--mouse-y", `${y}px`)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    return (
        <div 
            ref={containerRef} 
            className="absolute inset-0 overflow-hidden -z-10 bg-slate-50 dark:bg-[#0c0f1d] transition-colors duration-500"
            style={{
                "--mouse-x": "0px",
                "--mouse-y": "0px",
            } as React.CSSProperties}
        >
            {/* Ambient liquid blobs */}
            <div 
                className="absolute w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] rounded-full bg-blue-500/20 dark:bg-blue-600/12 blur-[100px] -top-20 -left-20 animate-float"
                style={{
                    transform: "translate3d(calc(var(--mouse-x) * 0.7), calc(var(--mouse-y) * 0.7), 0)",
                    transition: "transform 0.1s ease-out"
                }}
            />
            <div 
                className="absolute w-[45vw] h-[45vw] min-w-[350px] min-h-[350px] rounded-full bg-cyan-500/10 dark:bg-cyan-600/5 blur-[110px] -bottom-32 -right-32 animate-float-reverse"
                style={{
                    transform: "translate3d(calc(var(--mouse-x) * -0.5), calc(var(--mouse-y) * -0.5), 0)",
                    transition: "transform 0.1s ease-out"
                }}
            />
            <div 
                className="absolute w-[35vw] h-[35vw] min-w-[280px] min-h-[280px] rounded-full bg-sky-400/10 dark:bg-blue-600/5 blur-[90px] top-1/3 left-1/2 animate-float"
                style={{
                    transform: "translate3d(calc(var(--mouse-x) * 0.3 - 50%), calc(var(--mouse-y) * 0.3 - 50%), 0)",
                    transition: "transform 0.1s ease-out"
                }}
            />
        </div>
    )
}
