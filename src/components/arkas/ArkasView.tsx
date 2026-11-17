"use client"

import { useState } from "react"
import {
    FileText,
    Plus,
    Search,
    Calendar,
    Eye,
    Edit3,
    Trash2,
    Image as ImageIcon,
    Download,
    CheckCircle2,
    ShieldAlert,
    AlertCircle,
    Info,
    Layers,
} from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatDateId } from "@/lib/format"
import { ArkasSubmissionItem, deleteArkasSubmission } from "@/actions/arkas"
import { ArkasLightboxModal } from "./ArkasLightboxModal"
import { ArkasUploadModal } from "./ArkasUploadModal"

interface ArkasViewProps {
    submissions: ArkasSubmissionItem[]
    currentUser: {
        id: string
        name: string
        role: string
    } | null
}

export function ArkasView({ submissions: initialSubmissions, currentUser }: ArkasViewProps) {
    const isTeacher = currentUser?.role === "TEACHER"
    const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "TECHNICIAN"

    const [submissions, setSubmissions] = useState(initialSubmissions)
    const [search, setSearch] = useState("")
    const [selectedYear, setSelectedYear] = useState<string>("ALL")

    // State Lightbox Modal
    const [lightboxItem, setLightboxItem] = useState<ArkasSubmissionItem | null>(null)
    const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0)

    // State Upload / Edit Modal
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ArkasSubmissionItem | null>(null)

    // State Hapus
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Ekstrak daftar tahun unik untuk opsi filter
    const uniqueYears = Array.from(new Set(submissions.map((s) => s.year))).sort((a, b) => b - a)

    // Filter daftar submission
    const filteredSubmissions = submissions.filter((item) => {
        const matchYear = selectedYear === "ALL" || item.year.toString() === selectedYear
        const query = search.toLowerCase()
        const matchSearch =
            !search ||
            item.title.toLowerCase().includes(query) ||
            (item.period && item.period.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query))

        return matchYear && matchSearch
    })

    const handleDelete = async (item: ArkasSubmissionItem) => {
        if (!confirm(`Hapus dokumen "${item.title}" beserta seluruh fotonya?`)) {
            return
        }

        setDeletingId(item.id)
        try {
            const res = await deleteArkasSubmission(item.id)
            if (res.success) {
                setSubmissions((prev) => prev.filter((s) => s.id !== item.id))
            } else {
                alert(res.error || "Gagal menghapus dokumen.")
            }
        } catch {
            alert("Terjadi kesalahan saat menghapus data.")
        } finally {
            setDeletingId(null)
        }
    }

    const openLightbox = (item: ArkasSubmissionItem, index = 0) => {
        setLightboxItem(item)
        setLightboxInitialIndex(index)
    }

    return (
        <div className="flex flex-col gap-4 pb-16">
            {/* ── Desktop Topbar ── */}
            <div className="hidden lg:block">
                <PageHeader
                    title="Pengajuan ARKAS"
                    subtitle="Foto Dokumen Asli Pengajuan ARKAS sebagai Acuan Pemeriksaan Fisik Barang BOS."
                    actions={
                        canManage ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setEditingItem(null)
                                    setUploadModalOpen(true)
                                }}
                                className="gap-2 text-xs"
                            >
                                <Plus className="size-4" />
                                <span>Unggah Pengajuan ARKAS</span>
                            </Button>
                        ) : undefined
                    }
                />
            </div>

            {/* ── Mobile App Bar ── */}
            <div className="lg:hidden">
                <MobileAppBar
                    title="Pengajuan ARKAS"
                    subtitle={isTeacher ? "Acuan Pengesahan BOS" : "Foto Dokumen Asli"}
                    actions={
                        canManage ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setEditingItem(null)
                                    setUploadModalOpen(true)
                                }}
                                className="gap-1.5 text-xs h-8 px-2.5"
                            >
                                <Plus className="size-3.5" />
                                <span>Unggah</span>
                            </Button>
                        ) : undefined
                    }
                />
            </div>

            {/* ── Banner Keterangan Peran ── */}
            {isTeacher ? (
                <div className="rounded-2xl border border-blue-500/25 bg-blue-500/5 dark:bg-blue-950/20 p-4 flex items-start gap-3 text-xs leading-relaxed">
                    <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-ink">Dokumen Acuan Guru Pengawas / Penguji Fisik:</span>
                        <span className="text-muted-ink">
                            Foto lembar dokumen di bawah ini merupakan foto asli berkas Pengajuan ARKAS sekolah.
                            Gunakan sebagai pedoman spesifikasi teknis dan rincian barang saat melakukan verifikasi fisik barang belanja BOS.
                            Klik pada foto dokumen untuk memperbesar atau mengunduh salinan resolusi tinggi.
                        </span>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-line bg-surface-2/60 p-4 flex items-start justify-between gap-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                        <div className="size-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                            <Layers className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-ink">Manajemen Dokumen Pengajuan ARKAS Asli</span>
                            <span className="text-muted-ink">
                                Anda dapat mengunggah dan mengedit foto berkas fisik pengajuan ARKAS.
                                Guru Pengawas hanya memiliki akses melihat foto untuk keperluan verifikasi belanja BOS.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Filter & Search Toolbar ── */}
            <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="size-4 text-muted-ink absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul pengajuan, tahap, atau catatan..."
                        className="pl-9 text-xs h-9"
                    />
                </div>

                {/* Filter Tahun */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-ink uppercase shrink-0">
                        Tahun:
                    </span>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="h-9 text-xs rounded-xl border border-line bg-surface px-3 py-1 font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                        <option value="ALL">Semua Tahun</option>
                        {uniqueYears.map((y) => (
                            <option key={y} value={y.toString()}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Grid Dokumen ARKAS ── */}
            {filteredSubmissions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-surface p-12 flex flex-col items-center justify-center text-center gap-3">
                    <div className="size-14 rounded-2xl bg-surface-2 flex items-center justify-center text-muted-ink">
                        <ImageIcon className="size-7" />
                    </div>
                    <div className="flex flex-col gap-1 max-w-sm">
                        <span className="font-bold text-ink text-sm">Belum Ada Dokumen Pengajuan ARKAS</span>
                        <span className="text-xs text-muted-ink">
                            {canManage
                                ? "Unggah foto dokumen fisik ARKAS agar dapat menjadi acuan validasi oleh Guru Pengawas."
                                : "Belum ada foto dokumen pengajuan ARKAS yang diunggah oleh pihak admin/teknisi."}
                        </span>
                    </div>
                    {canManage && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setEditingItem(null)
                                setUploadModalOpen(true)
                            }}
                            className="mt-2 gap-1.5 text-xs"
                        >
                            <Plus className="size-4" />
                            <span>Unggah Dokumen Pertama</span>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubmissions.map((item) => {
                        const totalSheets = item.images.length
                        const firstImage = item.images[0]

                        return (
                            <div
                                key={item.id}
                                className="group rounded-2xl border border-line bg-surface overflow-hidden flex flex-col shadow-xs hover:border-brand/40 transition-all hover:shadow-md"
                            >
                                {/* ── Cover Image Preview ── */}
                                <div
                                    className="relative aspect-16/10 bg-navy/10 overflow-hidden cursor-pointer"
                                    onClick={() => openLightbox(item, 0)}
                                >
                                    {firstImage ? (
                                        <img
                                            src={firstImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-ink">
                                            <ImageIcon className="size-8" />
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                                    {/* Badge Jumlah Lembar Foto */}
                                    <div className="absolute top-2.5 right-2.5">
                                        <Badge className="bg-black/75 hover:bg-black/90 text-white border-white/20 text-[10px] gap-1 font-bold backdrop-blur-xs">
                                            <ImageIcon className="size-3" />
                                            <span>{totalSheets} Lembar Foto</span>
                                        </Badge>
                                    </div>

                                    {/* Badge Tahun & Tahap */}
                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                        <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                            Tahun {item.year}
                                        </span>
                                        {item.period && (
                                            <span className="bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
                                                {item.period}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tombol Cepat Buka Lightbox di Tengah saat Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="px-3 py-1.5 rounded-full bg-brand text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                                            <Eye className="size-3.5" />
                                            <span>Lihat Lembar Dokumen</span>
                                        </span>
                                    </div>

                                    {/* Tanggal Upload */}
                                    <div className="absolute bottom-2 left-2.5 text-[10px] text-white/80 font-medium">
                                        Diunggah: {formatDateId(item.createdAt)}
                                    </div>
                                </div>

                                {/* ── Card Body ── */}
                                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <h3
                                            onClick={() => openLightbox(item, 0)}
                                            className="font-bold text-sm text-ink hover:text-brand cursor-pointer transition-colors line-clamp-2"
                                        >
                                            {item.title}
                                        </h3>

                                        {item.description ? (
                                            <p className="text-[11px] text-muted-ink line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-muted-ink/60 italic">
                                                Tidak ada catatan tambahan.
                                            </p>
                                        )}
                                    </div>

                                    {/* ── Card Footer Actions ── */}
                                    <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => openLightbox(item, 0)}
                                            className="gap-1.5 text-xs flex-1 h-8"
                                        >
                                            <Eye className="size-3.5" />
                                            <span>Buka ({totalSheets} Lembar)</span>
                                        </Button>

                                        {/* Actions untuk Admin / Teknisi */}
                                        {canManage && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingItem(item)
                                                        setUploadModalOpen(true)
                                                    }}
                                                    title="Edit Dokumen & Foto"
                                                    className="h-8 px-2.5 text-xs text-ink hover:text-brand"
                                                >
                                                    <Edit3 className="size-3.5" />
                                                </Button>

                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={deletingId === item.id}
                                                    onClick={() => handleDelete(item)}
                                                    title="Hapus Dokumen"
                                                    className="h-8 px-2.5 text-xs text-red-600 hover:bg-red-500/10 hover:border-red-500/30"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Modal Lightbox Viewer ── */}
            {lightboxItem && (
                <ArkasLightboxModal
                    item={lightboxItem}
                    initialIndex={lightboxInitialIndex}
                    onClose={() => setLightboxItem(null)}
                />
            )}

            {/* ── Modal Upload / Edit ── */}
            {uploadModalOpen && (
                <ArkasUploadModal
                    isOpen={uploadModalOpen}
                    initialData={editingItem}
                    onClose={() => {
                        setUploadModalOpen(false)
                        setEditingItem(null)
                    }}
                    onSuccess={() => {
                        window.location.reload()
                    }}
                />
            )}
        </div>
    )
}
