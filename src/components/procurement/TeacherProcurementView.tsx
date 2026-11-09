"use client"

import React, { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardCheck,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { MONTH_NAMES_ID, formatDateId, formatDateTimeId, formatNumberId } from "@/lib/format"

interface TeacherProcurementViewProps {
  pending: any[]
  verified: any[]
  userName?: string
}

export function TeacherProcurementView({
  pending,
  verified,
  userName = "Guru Pengawas",
}: TeacherProcurementViewProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending")

  return (
    <div className="flex flex-col gap-4 lg:gap-5 pb-16">
      {/* Mobile AppBar */}
      <MobileAppBar
        title="Validasi BOS"
        subtitle="Pemeriksaan & Pengesahan BAP"
        showBrandMark={true}
      />

      {/* Desktop PageHeader */}
      <PageHeader
        title="Validasi Pengadaan Dana BOS"
        subtitle="Pemeriksaan fisik barang dan pengesahan Berita Acara Penerimaan (BAP) resmi sekolah."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-ink">Peran:</span>
            <Badge variant="mint" dot>
              Guru Pengawas
            </Badge>
          </div>
        }
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "pending"
              ? "bg-brand text-white shadow-xs"
              : "bg-surface text-muted-ink hover:text-ink border border-line"
          }`}
        >
          <Clock className="size-3.5" />
          <span>Menunggu Validasi</span>
          {pending.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "pending"
                  ? "bg-white text-brand"
                  : "bg-amber-soft text-amber"
              }`}
            >
              {pending.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verified")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "verified"
              ? "bg-brand text-white shadow-xs"
              : "bg-surface text-muted-ink hover:text-ink border border-line"
          }`}
        >
          <ShieldCheck className="size-3.5" />
          <span>Riwayat Disahkan ({verified.length})</span>
        </button>
      </div>

      {/* Tab Content: Menunggu Validasi */}
      {activeTab === "pending" && (
        <div className="flex flex-col gap-3.5">
          {pending.length === 0 ? (
            <div className="panel rounded-2xl border border-line p-10 flex flex-col items-center justify-center text-center gap-3 bg-surface">
              <div className="size-14 rounded-full bg-mint-soft text-mint grid place-items-center">
                <CheckCircle2 className="size-7 stroke-[2.2]" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  Tidak Ada Pengadaan Menunggu Validasi
                </h3>
                <p className="text-xs text-muted-ink leading-relaxed">
                  Semua pengajuan barang belanja BOS telah selesai diverifikasi. Anda akan melihat pengajuan baru di sini begitu diajukan oleh teknisi.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("verified")}
                className="text-xs mt-2"
              >
                Lihat Riwayat BAP yang Telah Disahkan
              </Button>
            </div>
          ) : (
            pending.map((p) => {
              const monthName = MONTH_NAMES_ID[p.periodMonth - 1] || p.periodMonth
              const totalItems = p.items?.length || p._count?.items || 0
              const totalUnits =
                p.totalUnits ||
                p.items?.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) ||
                0

              return (
                <div
                  key={p.id}
                  className="panel rounded-2xl border-2 border-brand/30 bg-surface p-4 sm:p-5 flex flex-col gap-4 shadow-sm"
                >
                  {/* Head */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-amber-soft text-amber grid place-items-center shrink-0">
                        <ClipboardCheck className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-ink">
                          Pengadaan BOS · {monthName} {p.periodYear}
                        </span>
                        <span className="font-mono text-[11px] text-muted-ink">
                          No. BAP: {p.bapNumber || "Belum Diterbitkan"}
                        </span>
                      </div>
                    </div>

                    <Badge variant="amber" dot className="self-start sm:self-auto text-xs py-0.5 px-2.5">
                      Menunggu Pemeriksaan Fisik
                    </Badge>
                  </div>

                  {/* Summary & Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-2 p-3.5 rounded-xl border border-line text-xs">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-muted-ink" />
                      <div>
                        <span className="text-[10px] text-muted-ink block">Jumlah Barang</span>
                        <strong className="text-ink text-xs font-semibold">
                          {totalItems} Jenis ({formatNumberId(totalUnits)} Unit)
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-ink" />
                      <div>
                        <span className="text-[10px] text-muted-ink block">Diajukan Oleh</span>
                        <strong className="text-ink text-xs font-semibold">
                          {p.createdBy?.name || "Teknisi Gudang"}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-ink" />
                      <div>
                        <span className="text-[10px] text-muted-ink block">Waktu Pengajuan</span>
                        <strong className="text-ink text-xs font-semibold">
                          {p.submittedAt ? formatDateId(p.submittedAt, "dd MMM yyyy · HH:mm") : "-"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Teknisi bila ada */}
                  {p.note && (
                    <div className="text-xs bg-brand-soft/50 p-3 rounded-xl border border-brand/20 text-ink">
                      <span className="font-bold text-[11px] text-brand-deep block mb-0.5">
                        Catatan Pengajuan Teknisi:
                      </span>
                      <p className="text-xs text-ink-soft italic">"{p.note}"</p>
                    </div>
                  )}

                  {/* Mini Preview Barang */}
                  {p.items && p.items.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">
                        Daftar Barang yang Perlu Diperiksa:
                      </span>
                      <div className="divide-y divide-line/60 border border-line rounded-xl overflow-hidden bg-surface">
                        {p.items.slice(0, 4).map((it: any) => (
                          <div
                            key={it.id}
                            className="px-3.5 py-2 flex items-center justify-between text-xs"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-semibold text-ink truncate">
                                {it.name}
                              </span>
                              {it.specification && (
                                <span className="text-[10.5px] text-muted-ink truncate">
                                  {it.specification}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-ink-soft shrink-0">
                              {it.quantity} {it.unit}
                            </span>
                          </div>
                        ))}
                        {p.items.length > 4 && (
                          <div className="px-3.5 py-1.5 text-[11px] text-muted-ink bg-surface-2 text-center font-medium">
                            +{p.items.length - 4} barang lainnya...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                    <Link href={`/procurement/${p.id}`} className="sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9">
                        <FileText className="size-3.5" />
                        <span>Pratinjau Dokumen BAP</span>
                      </Button>
                    </Link>

                    <Link href={`/procurement/${p.id}/check`} className="sm:w-auto">
                      <Button variant="primary" size="sm" className="w-full text-xs font-bold gap-1.5 h-9 px-4">
                        <ClipboardCheck className="size-4" />
                        <span>Mulai Pemeriksaan Fisik &amp; Sahkan</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab Content: Riwayat Disahkan */}
      {activeTab === "verified" && (
        <div className="flex flex-col gap-3">
          {verified.length === 0 ? (
            <div className="panel rounded-2xl border border-line p-8 text-center text-xs text-muted-ink">
              Belum ada riwayat dokumen BAP yang telah disahkan.
            </div>
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line bg-surface overflow-hidden">
              {verified.map((v) => {
                const monthName = MONTH_NAMES_ID[v.periodMonth - 1] || v.periodMonth
                return (
                  <div
                    key={v.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-mint-soft text-mint grid place-items-center shrink-0">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-xs sm:text-sm">
                            Pengadaan BOS · {monthName} {v.periodYear}
                          </span>
                          <Badge variant="mint" className="text-[9.5px] py-0 px-2">
                            Sah &amp; Masuk Gudang
                          </Badge>
                        </div>
                        <span className="font-mono text-[11px] text-ink-soft">
                          {v.bapNumber || "-"}
                        </span>
                        <span className="text-[10px] text-muted-ink">
                          Disahkan: {formatDateId(v.verifiedAt, "dd MMMM yyyy · HH:mm")} · Total:{" "}
                          {v.totalUnits || 0} Unit
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Link href={`/procurement/${v.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs h-8 gap-1.5">
                          <FileText className="size-3.5" />
                          <span>Lihat / Cetak BAP</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
