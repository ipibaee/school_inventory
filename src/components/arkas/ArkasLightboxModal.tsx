"use client"

import { useState, useEffect, useCallback } from "react"
import {
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    Maximize2,
    Minimize2,
    Calendar,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDateId } from "@/lib/format"
import { ArkasSubmissionItem } from "@/actions/arkas"

interface ArkasLightboxModalProps {
    item: ArkasSubmissionItem | null
    initialIndex?: number
    onClose: () => void
}

export function ArkasLightboxModal({
    item,
    initialIndex = 0,
    onClose,
}: ArkasLightboxModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        setCurrentIndex(initialIndex)
        setZoom(1)
        setRotation(0)
    }, [initialIndex, item])

    const images = item?.images || []
    const total = images.length
    const currentImageUrl = images[currentIndex] || ""

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            } else if (e.key === "ArrowLeft") {
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
                setZoom(1)
                setRotation(0)
            } else if (e.key === "ArrowRight") {
                setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
                setZoom(1)
                setRotation(0)
            }
        },
        [onClose, total]
    )

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    if (!item || total === 0) return null

    const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.25))
    const handleZoomOut = () => setZoom((z) => Math.max(0.75, z - 0.25))
    const handleReset = () => {
        setZoom(1)
        setRotation(0)
    }
    const handleRotate = () => setRotation((r) => (r + 90) % 360)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {})
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {})
                setIsFullscreen(false)
            }
        }
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = currentImageUrl
        const origName = item.fileNames?.[currentIndex] || `ARKAS_${item.year}_lembar_${currentIndex + 1}.jpg`
        link.download = origName
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col select-none text-white animate-in fade-in duration-200">
            {/* ── Top Bar ── */}
            <div className="h-16 px-4 sm:px-6 bg-black/60 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white truncate max-w-[280px] sm:max-w-md">
                            {item.title}
                        </span>
                        <Badge variant="outline" className="text-white border-white/20 text-[10px] hidden sm:inline-flex">
                            {item.year} {item.period ? `· ${item.period}` : ""}
                        </Badge>
                    </div>
                    <span className="text-[11px] text-white/60 truncate">
                        Lembar {currentIndex + 1} dari {total} · {formatDateId(item.createdAt)}
                    </span>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        title="Perbesar"
                        className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                    >
                        <ZoomIn className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        title="Perkecil"
                        className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                    >
                        <ZoomOut className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleRotate}
                        title="Putar 90°"
                        className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                    >
                        <RotateCw className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        title="Unduh Foto Dokumen Asli"
                        className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                    >
                        <Download className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        title="Layar Penuh"
                        className="p-2 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors hidden sm:block"
                    >
                        {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                    </button>
                    <div className="w-[1px] h-6 bg-white/20 mx-1" />
                    <button
                        type="button"
                        onClick={onClose}
                        title="Tutup (Esc)"
                        className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {/* ── Main Image Canvas ── */}
            <div className="relative flex-1 overflow-hidden flex items-center justify-center p-4">
                {/* Prev Button */}
                {total > 1 && (
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
                            handleReset()
                        }}
                        className="absolute left-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 transition-all shadow-lg"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                )}

                {/* The Image */}
                <div
                    className="max-w-full max-h-full flex items-center justify-center transition-transform duration-150 cursor-grab active:cursor-grabbing"
                    style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                    onClick={zoom === 1 ? handleZoomIn : handleReset}
                >
                    <img
                        src={currentImageUrl}
                        alt={`${item.title} - Lembar ${currentIndex + 1}`}
                        className="max-w-full max-h-[calc(100vh-180px)] object-contain rounded shadow-2xl pointer-events-auto"
                        draggable={false}
                    />
                </div>

                {/* Next Button */}
                {total > 1 && (
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
                            handleReset()
                        }}
                        className="absolute right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 transition-all shadow-lg"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                )}
            </div>

            {/* ── Bottom Bar / Thumbnail Strip ── */}
            <div className="h-20 bg-black/70 border-t border-white/10 px-4 flex items-center justify-between gap-4 shrink-0">
                {/* Catatan / Keterangan Dokumen */}
                <div className="text-xs text-white/70 max-w-sm hidden md:block truncate">
                    {item.description ? (
                        <span>
                            <strong className="text-white">Keterangan:</strong> {item.description}
                        </span>
                    ) : (
                        <span className="italic text-white/40">Acuan pengesahan fisik barang BOS</span>
                    )}
                </div>

                {/* Thumbnails */}
                {total > 1 ? (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full mx-auto md:mx-0">
                        {images.map((imgUrl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    setCurrentIndex(idx)
                                    handleReset()
                                }}
                                className={`relative size-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                    idx === currentIndex
                                        ? "border-brand scale-105 shadow-md shadow-brand/40 ring-2 ring-brand/50"
                                        : "border-white/20 opacity-60 hover:opacity-100"
                                }`}
                            >
                                <img
                                    src={imgUrl}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-mono px-1 text-white">
                                    {idx + 1}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-white/60 mx-auto md:mx-0">
                        1 Lembar Dokumen Pengajuan
                    </div>
                )}

                {/* Zoom indicator & reset */}
                <div className="text-xs text-white/60 hidden sm:flex items-center gap-2">
                    <span>Skala: {Math.round(zoom * 100)}%</span>
                    {zoom !== 1 && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-brand hover:underline text-[11px]"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
