"use client"

import React, { useEffect, useState } from "react"
import { getSchoolSettings } from "@/actions/settings"
import { formatDateId } from "@/lib/format"
import { GraduationCap } from "lucide-react"

export interface SummaryMetric {
  label: string
  value: string | number
}

export interface ReportColumn {
  header: string
  align?: "left" | "center" | "right"
  width?: string
}

interface ReportA4SheetProps {
  title: string
  subtitle?: string
  period?: string
  metrics?: SummaryMetric[]
  columns: ReportColumn[]
  children: React.ReactNode
  totalLabel?: string
  totalValue?: string | number
  notes?: string
  makerRole?: string
  makerName?: string
  checkerRole?: string
  checkerName?: string
}

export function ReportA4Sheet({
  title,
  subtitle,
  period,
  metrics = [],
  columns,
  children,
  totalLabel = "Total Keseluruhan",
  totalValue,
  notes,
  makerRole = "Pengelola Inventaris / Admin TU",
  makerName = "Admin TU Sekolah",
  checkerRole = "Guru Pengawas / Pemeriksa",
  checkerName = "Guru Pengawas",
}: ReportA4SheetProps) {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    getSchoolSettings().then(setSettings)
  }, [])

  const schoolName = settings?.schoolName || "SMK HKTI 2 PURWAREJA KLAMPOK"
  const schoolAddress =
    settings?.address ||
    "Jl. Raya Purwareja Klampok No. 82-B, Klampok, Banjarnegara, Jawa Tengah 53474"
  const schoolPhone = settings?.phone || "(0286) 479141"
  const schoolEmail = settings?.email || "admin@smkhkti2.sch.id"
  const schoolWebsite = settings?.website || "smkhkti2.sch.id"

  const currentDateStr = formatDateId(new Date(), "dd MMMM yyyy")

  return (
    <div
      className="report-a4-sheet sheet relative bg-white text-black font-sans leading-normal overflow-hidden select-text"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 16mm",
        boxSizing: "border-box",
        color: "#0B1B2E",
        margin: "0 auto",
      }}
    >
      {/* ── KOP SURAT RESMI ── */}
      <div className="flex items-center gap-3.5 pb-2">
        <div className="w-[54px] h-[54px] rounded-[8px] border border-black/15 bg-[#F4F7FB] flex items-center justify-center shrink-0 overflow-hidden">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo Sekolah"
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <GraduationCap className="size-8 text-[#2B4EFF]" />
          )}
        </div>
        <div className="flex-1 text-center flex flex-col items-center">
          <span className="text-[8pt] font-bold tracking-wider uppercase text-black/80">
            PEMERINTAH PROVINSI JAWA TENGAH
          </span>
          <span className="text-[7.5pt] font-semibold tracking-wide uppercase text-black/70">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </span>
          <h1 className="text-[13pt] font-extrabold uppercase tracking-tight text-black mt-0.5">
            {schoolName}
          </h1>
          <span className="text-[6.5pt] text-black/70 leading-tight">
            {schoolAddress}
          </span>
          <span className="text-[6.5pt] text-black/60 leading-tight">
            Telp. {schoolPhone} · Website: {schoolWebsite} · Email: {schoolEmail}
          </span>
        </div>
      </div>

      {/* ── GARIS GANDA KOP ── */}
      <div className="relative mb-3">
        <div className="border-t-[2.5px] border-black" />
        <div className="border-t-[0.75px] border-black mt-[1.5px]" />
      </div>

      {/* ── JUDUL LAPORAN ── */}
      <div className="text-center my-2.5">
        <h2 className="text-[11pt] font-extrabold tracking-wide uppercase text-black">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[7.5pt] text-black/70 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
        {period && (
          <p className="text-[7.5pt] text-black/80 font-semibold mt-0.5">
            Periode: {period}
          </p>
        )}
      </div>

      {/* ── STRIP RINGKASAN 3 SEL ── */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 border border-black/80 rounded-[4px] overflow-hidden mb-3.5 bg-[#FAFCFE]">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 flex flex-col items-center justify-center text-center ${
                idx < metrics.length - 1 ? "border-r border-black/80" : ""
              }`}
            >
              <span className="text-[6.5pt] font-bold uppercase tracking-wider text-black/60">
                {m.label}
              </span>
              <span className="text-[11pt] font-extrabold font-mono text-black mt-0.5">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── TABEL DATA ── */}
      <div className="mb-2">
        <table className="w-full text-left border-collapse border border-black text-[7.5pt]">
          <thead>
            <tr className="bg-[#F4F7FB] border-b border-black">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className={`py-1.5 px-2 font-bold uppercase tracking-wider text-black/90 border-r last:border-r-0 border-black ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/80">
            {children}
            {totalValue !== undefined && (
              <tr className="bg-[#F4F7FB] border-t-2 border-black font-bold">
                <td
                  colSpan={columns.length - 1}
                  className="py-1.5 px-2 text-left border-r border-black"
                >
                  {totalLabel}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-[8pt]">
                  {totalValue}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── CATATAN KECIL ── */}
      {notes && (
        <p className="text-[6.5pt] text-black/60 italic mb-4">
          Catatan: {notes}
        </p>
      )}

      {/* ── TANGGAL DAN TANDA TANGAN (2 KOLOM: ADMIN TU & GURU PENGAWAS) ── */}
      <div className="mt-6 pt-2">
        <div className="text-right text-[7.5pt] text-black mb-3">
          Purwareja Klampok, {currentDateStr}
        </div>

        <div className="grid grid-cols-2 gap-12 px-10 text-[8pt] text-black">
          {/* Kiri: Dibuat oleh Admin TU */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[7.5pt] text-black/80">Dibuat oleh,</span>
            <span className="font-semibold text-[8pt]">{makerRole}</span>
            <div className="h-[20mm]" />
            <span className="font-bold text-[8.5pt] underline text-black">
              {makerName}
            </span>
            <span className="text-[6.5pt] text-black/70">
              Pengelola Inventaris Sekolah
            </span>
          </div>

          {/* Kanan: Diperiksa oleh Guru Pengawas */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[7.5pt] text-black/80">Diperiksa oleh,</span>
            <span className="font-semibold text-[8pt]">{checkerRole}</span>
            <div className="h-[20mm]" />
            <span className="font-bold text-[8.5pt] underline text-black">
              {checkerName}
            </span>
            <span className="text-[6.5pt] text-black/70">
              Guru Pengawas / Pemeriksa
            </span>
          </div>
        </div>
      </div>

      {/* ── FOOTER DOKUMEN ── */}
      <div className="mt-auto pt-6 border-t border-black/15 flex items-center justify-between text-[6.5pt] text-black/60">
        <span>
          Dicetak melalui Sistem Informasi Inventaris (HIKA) · {schoolName}
        </span>
        <span>Halaman 1 dari 1</span>
      </div>
    </div>
  )
}
