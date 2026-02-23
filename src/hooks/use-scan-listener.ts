"use client"

import { useEffect, useRef } from "react"

export function useScanListener(onScan: (barcode: string) => void) {
    const buffer = useRef<string>("")
    const lastKeyTime = useRef<number>(0)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now()

            // If time between keys is too long, reset buffer (manual typing)
            if (currentTime - lastKeyTime.current > 100) {
                buffer.current = ""
            }

            lastKeyTime.current = currentTime

            if (e.key === "Enter") {
                if (buffer.current.length > 2) { // Minimum length check
                    onScan(buffer.current)
                    buffer.current = ""
                }
            } else if (e.key.length === 1) { // Printable characters
                buffer.current += e.key
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onScan])
}
