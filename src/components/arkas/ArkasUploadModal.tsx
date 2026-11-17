"use client"

import { useState, useRef, useEffect } from "react"
import {
    X,
    UploadCloud,
    Image as ImageIcon,
    Trash2,
    Plus,
    Loader2,
    Calendar,
    FileText,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    createArkasSubmission,
    updateArkasSubmission,
    ArkasSubmissionItem,
} from "@/actions/arkas"

interface ArkasUploadModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: ArkasSubmissionItem | null
    onSuccess?: () => void
}

export function ArkasUploadModal({
    isOpen,
    onClose,
    initialData,
    onSuccess,
}: ArkasUploadModalProps) {
    const isEdit = !!initialData

    const [title, setTitle] = useState("")
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [period, setPeriod] = useState("")
    const [description, setDescription] = useState("")

    // File baru yang dipilih pengguna
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    // Gambar lama (khusus edit mode) yang tetap dipertahankan
    const [keptImages, setKeptImages] = useState<string[]>([])

    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title)
            setYear(initialData.year)
            setPeriod(initialData.period || "")
            setDescription(initialData.description || "")
            setKeptImages(initialData.images || [])
            setSelectedFiles([])
            setPreviewUrls([])
        } else {
            setTitle("")
            setYear(new Date().getFullYear())
            setPeriod("Tahap 1")
            setDescription("")
            setKeptImages([])
            setSelectedFiles([])
            setPreviewUrls([])
        }
        setErrorMsg(null)
    }, [initialData, isOpen])

    // Bersihkan URL preview lokal saat modal ditutup / unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach((u) => URL.revokeObjectURL(u))
        }
    }, [previewUrls])

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const filesArray = Array.from(e.target.files)

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        const validFiles: File[] = []
        const newPreviews: string[] = []

        for (const file of filesArray) {
            if (!validTypes.includes(file.type)) {
                setErrorMsg(`File ${file.name} bukan gambar format JPG/PNG/WEBP.`)
                continue
            }
            if (file.size > 10 * 1024 * 1024) {
                setErrorMsg(`File ${file.name} melebihi batas 10 MB.`)
                continue
            }
            validFiles.push(file)
            newPreviews.push(URL.createObjectURL(file))
        }

        setSelectedFiles((prev) => [...prev, ...validFiles])
        setPreviewUrls((prev) => [...prev, ...newPreviews])
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeSelectedFile = (idx: number) => {
        URL.revokeObjectURL(previewUrls[idx])
        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
        setPreviewUrls((prev) => prev.filter((_, i) => i !== idx))
    }

    const removeKeptImage = (urlToRemove: string) => {
        setKeptImages((prev) => prev.filter((url) => url !== urlToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg(null)

        if (!title.trim()) {
            setErrorMsg("Judul pengajuan ARKAS wajib diisi.")
            return
        }

        if (isEdit) {
            if (keptImages.length === 0 && selectedFiles.length === 0) {
                setErrorMsg("Wajib menyertakan minimal 1 lembar foto pengajuan ARKAS.")
                return
            }

            setLoading(true)
            try {
                const formData = new FormData()
                formData.append("title", title)
                formData.append("year", year.toString())
                formData.append("period", period)
                formData.append("description", description)
                formData.append("keptImages", JSON.stringify(keptImages))

                selectedFiles.forEach((file) => {
                    formData.append("newFiles", file)
                })

                const res = await updateArkasSubmission(initialData.id, formData)
                if (!res.success) {
                    setErrorMsg(res.error || "Gagal memperbarui pengajuan ARKAS.")
                } else {
                    onSuccess?.()
                    onClose()
                }
            } catch (err: any) {
                setErrorMsg(err?.message || "Terjadi kesalahan saat memproses data.")
            } finally {
                setLoading(false)
            }
        } else {
            if (selectedFiles.length === 0) {
                setErrorMsg("Pilih minimal 1 file foto pengajuan ARKAS untuk diunggah.")
                return
            }

            setLoading(true)
            try {
                const formData = new FormData()
                formData.append("title", title)
                formData.append("year", year.toString())
                formData.append("period", period)
                formData.append("description", description)

                selectedFiles.forEach((file) => {
                    formData.append("files", file)
                })

                const res = await createArkasSubmission(formData)
                if (!res.success) {
                    setErrorMsg(res.error || "Gagal mengunggah pengajuan ARKAS.")
                } else {
                    onSuccess?.()
                    onClose()
                }
            } catch (err: any) {
                setErrorMsg(err?.message || "Terjadi kesalahan saat mengunggah foto.")
            } finally {
                setLoading(false)
            }
        }
    }

    const totalPhotos = (isEdit ? keptImages.length : 0) + selectedFiles.length

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-surface border border-line rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* ── Modal Header ── */}
                <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface-2">
                    <div className="flex flex-col">
                        <span className="font-bold text-ink text-base">
                            {isEdit ? "Edit Dokumen Pengajuan ARKAS" : "Unggah Foto Pengajuan ARKAS Asli"}
                        </span>
                        <span className="text-[11.5px] text-muted-ink">
                            Dokumen asli yang menjadi acuan penguji/guru saat verifikasi fisik barang BOS.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-muted-ink hover:text-ink hover:bg-surface transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* ── Modal Body ── */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                            {errorMsg}
                        </div>
                    )}

                    {/* Judul Pengajuan */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-ink">
                            Judul Pengajuan ARKAS <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: ARKAS Pengadaan Alat Praktik TKJ 2026"
                            className="text-xs"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Row: Tahun & Periode / Tahap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-ink">Tahun Anggaran</label>
                            <Input
                                type="number"
                                min={2020}
                                max={2099}
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                                className="text-xs font-mono font-bold"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-ink">Periode / Tahap</label>
                            <Input
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                placeholder="Contoh: Tahap 1 / Semester Genap"
                                className="text-xs"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Keterangan / Catatan Acuan Penguji */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-ink">
                            Catatan Acuan Penguji <span className="text-muted-ink font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Tuliskan petunjuk atau catatan acuan khusus bagi Guru Pengawas..."
                            disabled={loading}
                            className="w-full text-xs rounded-xl border border-line bg-surface p-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    {/* Area Upload Foto */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-ink">
                                Foto Lembar Dokumen ARKAS ({totalPhotos} Foto)
                            </label>
                            <span className="text-[10.5px] text-muted-ink">Maks 10 MB per foto (JPG/PNG/WEBP)</span>
                        </div>

                        {/* File Picker Trigger */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-line hover:border-brand/70 rounded-2xl p-5 bg-surface-2/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                        >
                            <div className="size-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-105 transition-transform">
                                <UploadCloud className="size-5" />
                            </div>
                            <span className="text-xs font-bold text-ink text-center">
                                Klik untuk memilih foto atau seret foto ke sini
                            </span>
                            <span className="text-[10px] text-muted-ink text-center">
                                Bisa memilih lebih dari 1 foto sekaligus (untuk dokumen yang memiliki beberapa lembar)
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/jpg"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={loading}
                            />
                        </div>

                        {/* Daftar Pratinjau Foto */}
                        {totalPhotos > 0 && (
                            <div className="flex flex-col gap-2 pt-2">
                                <span className="text-[11px] font-bold text-muted-ink uppercase">
                                    Lembar Dokumen yang Akan Disimpan:
                                </span>

                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                    {/* Foto Lama (Edit mode) */}
                                    {isEdit &&
                                        keptImages.map((imgUrl, idx) => (
                                            <div
                                                key={`kept-${idx}`}
                                                className="group relative aspect-3/4 rounded-xl overflow-hidden border border-line bg-surface shadow-xs"
                                            >
                                                <img
                                                    src={imgUrl}
                                                    alt={`Halaman ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                                                    Hal {idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeKeptImage(imgUrl)}
                                                    title="Hapus foto ini"
                                                    disabled={loading}
                                                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/90 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        ))}

                                    {/* Foto Baru yang Baru Dipilih */}
                                    {previewUrls.map((previewUrl, idx) => (
                                        <div
                                            key={`new-${idx}`}
                                            className="group relative aspect-3/4 rounded-xl overflow-hidden border-2 border-brand/40 bg-surface shadow-xs"
                                        >
                                            <img
                                                src={previewUrl}
                                                alt={`Baru ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <span className="absolute top-1.5 left-1.5 bg-brand text-white text-[9px] font-bold px-1 rounded">
                                                Baru
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeSelectedFile(idx)}
                                                title="Batal unggah foto ini"
                                                disabled={loading}
                                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/90 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Modal Footer ── */}
                    <div className="pt-3 border-t border-line flex items-center justify-end gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={loading}
                            className="gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Mengunggah...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="size-3.5" />
                                    <span>{isEdit ? "Simpan Perubahan" : "Unggah Dokumen"}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
