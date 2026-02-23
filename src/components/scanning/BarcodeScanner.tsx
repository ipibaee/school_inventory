"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface BarcodeScannerProps {
    onScan: (barcode: string) => void
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
    const [open, setOpen] = useState(false)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        if (open) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        false
                    )

                    scanner.render(
                        (decodedText) => {
                            onScan(decodedText)
                            setOpen(false)
                            scanner.clear()
                        },
                        (error) => {
                            // console.warn(error)
                        }
                    )
                    scannerRef.current = scanner
                }
            }, 100)

            return () => clearTimeout(timer)
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
                scannerRef.current = null
            }
        }
    }, [open, onScan])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div id="reader" className="w-full max-w-sm overflow-hidden rounded-lg border bg-black" />
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        Point your camera at a barcode to scan.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
