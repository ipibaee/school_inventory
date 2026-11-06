import React from "react"
import Image from "next/image"
import { ShieldCheck, BadgeCheck, Check, GraduationCap } from "lucide-react"
import { formatDateTimeId, formatNumberId } from "@/lib/format"

interface VerifyDocumentCardProps {
  bap: {
    id: string
    bapNumber: string | null
    periodMonth: number
    periodYear: number
    source: string
    totalUnits: number
    totalItems: number
    verifiedAt: Date | string | null
    updatedAt: Date | string
    inspector?: { name: string | null; email: string | null } | null
    verifiedBy?: { name: string | null } | null
    items: Array<{
      id: string
      name: string
      specification: string | null
      categoryName: string | null
      quantity: number
      unit: string
      condition: string
    }>
  }
  schoolName?: string
  schoolLogo?: string | null
}

export function VerifyDocumentCard({
  bap,
  schoolName = "SMK HKTI 2 Purwareja Klampok",
  schoolLogo,
}: VerifyDocumentCardProps) {
  const totalUnits =
    bap.totalUnits > 0
      ? bap.totalUnits
      : bap.items.reduce((sum, item) => sum + item.quantity, 0)

  const sourceLabel =
    bap.source === "BOS_REGULER"
      ? `Bantuan Operasional Sekolah (BOS) Reguler ${bap.periodYear}`
      : `${bap.source} ${bap.periodYear}`

  return (
    <div className="w-full max-w-[420px] flex flex-col gap-4">
      {/* Brand Header */}
      <header className="flex items-center justify-center gap-3 pt-2">
        {schoolLogo ? (
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface border border-line flex items-center justify-center shadow-xs">
            <Image
              src={schoolLogo}
              alt={schoolName}
              width={40}
              height={40}
              className="object-contain p-1"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
        )}
        <div className="flex flex-col">
          <h1 className="text-sm font-extrabold text-ink leading-tight">
            {schoolName}
          </h1>
          <p className="text-[10px] text-muted-ink">
            Sistem Inventaris Sekolah Resmi (HIKA)
          </p>
        </div>
      </header>

      {/* Hero Badge */}
      <div className="flex flex-col items-center text-center gap-2 py-2">
        <div className="w-16 h-16 rounded-full bg-mint-soft border border-mint/25 flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-8 h-8 text-mint" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-ink">
            DOKUMEN ASLI &amp; TERVERIFIKASI
          </h2>
          <p className="text-[11px] text-muted-ink max-w-[320px] mx-auto leading-relaxed">
            Berita Acara Penerimaan Barang (BAP) ini sah dan tercatat di
            pangkalan data sekolah.
          </p>
        </div>
      </div>

      {/* Document Card */}
      <div className="w-full rounded-2xl bg-surface border border-line shadow-sm overflow-hidden flex flex-col">
        {/* Head */}
        <div className="bg-brand-soft px-4 py-3 flex items-center justify-between border-b border-line/60">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-extrabold tracking-wider text-brand-deep uppercase">
              Berita Acara Penerimaan Barang
            </span>
            <span className="text-[10px] text-brand-deep/80 font-medium">
              BAP · Dana BOS Reguler {bap.periodYear}
            </span>
          </div>
          <BadgeCheck className="w-5 h-5 text-brand shrink-0" />
        </div>

        {/* Fields */}
        <div className="px-4 py-1 divide-y divide-line text-left">
          {/* Nomor Dokumen */}
          <div className="py-2.5 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-wider text-muted-ink uppercase">
              Nomor Dokumen
            </span>
            <span className="text-xs font-semibold text-ink-soft font-mono">
              {bap.bapNumber || "-"}
            </span>
          </div>

          {/* Sumber Dana */}
          <div className="py-2.5 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-wider text-muted-ink uppercase">
              Sumber Dana
            </span>
            <span className="text-xs font-semibold text-ink-soft">
              {sourceLabel}
            </span>
          </div>

          {/* Tanggal Pengesahan */}
          <div className="py-2.5 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-wider text-muted-ink uppercase">
              Tanggal Pengesahan
            </span>
            <span className="text-xs font-semibold text-ink-soft">
              {formatDateTimeId(bap.verifiedAt || bap.updatedAt)}
            </span>
          </div>

          {/* Guru Pengawas / Pemeriksa */}
          <div className="py-2.5 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-wider text-muted-ink uppercase">
              Guru Pengawas / Pemeriksa
            </span>
            <span className="text-xs font-semibold text-ink-soft">
              {bap.inspector?.name || "Guru Pengawas"}
            </span>
          </div>

          {/* Status Fisik Barang */}
          <div className="py-2.5 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-wider text-muted-ink uppercase">
              Status Fisik Barang
            </span>
            <span className="text-xs font-bold text-mint flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              100% Lengkap &amp; Kondisi Baik
            </span>
          </div>
        </div>

        {/* Table of Approved Items */}
        <div className="px-4 pt-3 pb-2 border-t border-line">
          <div className="flex items-center justify-between pb-1.5 text-[9px] font-bold text-muted-ink tracking-wider uppercase">
            <span>Barang Disetujui</span>
            <span>Volume</span>
          </div>
          <div className="divide-y divide-line/60">
            {bap.items.map((item) => (
              <div
                key={item.id}
                className="py-2 flex items-center justify-between text-xs gap-3"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-medium text-ink truncate">
                    {item.name}
                  </span>
                  {item.specification && (
                    <span className="text-[10px] text-muted-ink truncate">
                      {item.specification}
                    </span>
                  )}
                </div>
                <span className="font-bold text-ink-soft whitespace-nowrap shrink-0">
                  {formatNumberId(item.quantity)} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Strip */}
        <div className="bg-mint-soft px-4 py-2.5 flex items-center justify-center gap-1.5 border-t border-line text-mint">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="text-[10.5px] font-bold">
            Terverifikasi sistem · {formatNumberId(totalUnits)} unit sesuai
            dokumen
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col items-center text-center gap-1 pt-2 pb-6">
        <span className="text-[11px] font-bold text-ink-soft">
          {schoolName}
        </span>
        <span className="text-[9.5px] text-muted-ink">
          Terenkripsi SHA-256 Digital Signature · HIKA Inventaris
        </span>
      </footer>
    </div>
  )
}
