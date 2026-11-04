"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, X, ScanLine, Keyboard } from "lucide-react"

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
    const [open, setOpen] = useState(false)
    const [caption, setCaption] = useState<string | null>(null)
    const [lastCode, setLastCode] = useState<string | null>(null)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "hika-reader",
                        { fps: 10, qrbox: { width: 240, height: 180 }, aspectRatio: 1.333 },
                        false
                    )
                    scanner.render(
                        (decodedText) => {
                            setLastCode(decodedText)
                            setCaption(`Barcode terdeteksi: ${decodedText}`)
                        },
                        () => { /* ignore frame errors */ }
                    )
                    scannerRef.current = scanner
                }
            }, 100)
            return () => clearTimeout(timer)
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => { })
                scannerRef.current = null
            }
            setCaption(null)
            setLastCode(null)
        }
    }, [open])

    const handleUse = () => {
        if (lastCode) {
            onScan(lastCode)
            setOpen(false)
        }
    }

    const handleClose = () => setOpen(false)

    return (
        <>
            {/* Trigger button */}
            <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setOpen(true)}
                title="Scan dengan kamera"
            >
                <Camera className="h-4 w-4" />
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(11,27,46,0.60)" }}
                >
                    {/* Dialog */}
                    <div className="w-[min(512px,calc(100vw-32px))] rounded-[18px] border border-line bg-surface shadow-dialog flex flex-col gap-3.5 p-[22px]">

                        {/* Head */}
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-[10px] bg-brand-soft flex items-center justify-center shrink-0">
                                <Camera className="size-[18px] text-brand" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-bold text-ink">Scan dengan Kamera</p>
                                <p className="text-[11px] text-muted-ink">Arahkan kamera ke barcode barang.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="size-7 rounded-[8px] bg-surface-2 flex items-center justify-center hover:bg-surface-2/80 transition-colors shrink-0"
                            >
                                <X className="size-3.5 text-muted-ink" />
                            </button>
                        </div>

                        {/* Viewfinder */}
                        <div
                            className="relative rounded-[14px] overflow-hidden border border-line flex items-center justify-center"
                            style={{
                                height: 286,
                                background: "linear-gradient(to bottom, #101B2E, #050912)",
                            }}
                        >
                            {/* html5-qrcode renders here */}
                            <div id="hika-reader" className="w-full h-full [&_video]:rounded-[14px] [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

                            {/* Animated scan line */}
                            <div
                                className="absolute left-4 right-4 h-[2px] bg-[#8AB4F8] rounded-full pointer-events-none animate-scan-line"
                                style={{ boxShadow: "0 0 12px 3px #8AB4F8" }}
                            />

                            {/* Corner marks */}
                            <svg className="absolute top-3 left-3 pointer-events-none" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M0 26L0 0L26 0" stroke="#8AB4F8" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <svg className="absolute top-3 right-3 pointer-events-none" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M26 0L0 0L0 26" stroke="#8AB4F8" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <svg className="absolute bottom-3 left-3 pointer-events-none" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M0 0L0 26L26 26" stroke="#8AB4F8" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <svg className="absolute bottom-3 right-3 pointer-events-none" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M26 26L26 0L0 0" stroke="#8AB4F8" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>

                        {/* Caption */}
                        <div className="flex items-start gap-2">
                            <ScanLine className="size-[13px] text-mint shrink-0 mt-0.5" />
                            <p className="text-[10.5px] leading-[1.45] text-ink-soft">
                                {caption ?? "Arahkan kamera ke barcode barang inventaris."}
                            </p>
                        </div>

                        {/* Controls row */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[9px] border border-line bg-surface-2 hover:bg-surface transition-colors"
                            >
                                <Keyboard className="size-[13px] text-muted-ink" />
                                <span className="text-[10.5px] font-semibold text-ink-soft">Ketik manual</span>
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5">
                            <Button
                                type="button"
                                variant="primary"
                                className="flex-shrink-0"
                                onClick={handleUse}
                                disabled={!lastCode}
                            >
                                <Camera className="h-4 w-4" />
                                Gunakan Hasil
                            </Button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 flex items-center justify-center py-[11px] rounded-[10px] border border-line bg-surface hover:bg-surface-2 transition-colors"
                            >
                                <span className="text-[13px] font-bold text-ink-soft">Batal</span>
                            </button>
                        </div>

                        {/* Footer hint */}
                        <p className="text-[10px] leading-[1.45] text-muted-ink">
                            Tidak ada kamera? Tutup dialog lalu tembakkan alat scanner pada kolom pencarian.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
