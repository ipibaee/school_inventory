import React from "react"
import { QrBox } from "./QrBox"
import { formatDateId } from "@/lib/format"
import { GraduationCap } from "lucide-react"

interface BapDocumentProps {
  bap: any
  schoolSettings?: any
  qrSvg?: string
  className?: string
}

export function BapDocument({
  bap,
  schoolSettings,
  qrSvg,
  className = "",
}: BapDocumentProps) {
  const isVerified = bap.status === "VERIFIED"
  const isSubmitted = bap.status === "SUBMITTED"

  const schoolName = schoolSettings?.schoolName || "SMK HKTI 2 PURWAREJA KLAMPOK"
  const schoolAddress =
    schoolSettings?.address ||
    "Jl. Raya Purwareja Klampok No. 82-B, Klampok, Banjarnegara, Jawa Tengah 53474"
  const schoolPhone = schoolSettings?.phone || "(0286) 479141"
  const schoolEmail = schoolSettings?.email || "admin@smkhkti2.sch.id"
  const schoolWebsite = schoolSettings?.website || "smkhkti2.sch.id"

  const verificationDate = bap.verifiedAt || bap.submittedAt || bap.createdAt || new Date()
  const verificationDateStr = formatDateId(verificationDate, "EEEE, dd MMMM yyyy")

  const totalQty =
    bap.totalUnits ||
    bap.items?.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0) ||
    0

  // Kelompokkan ringkasan satuan (misal: 10 Roll · 8 Unit)
  const unitSummaryMap: Record<string, number> = {}
  bap.items?.forEach((it: any) => {
    const u = it.unit || "Unit"
    unitSummaryMap[u] = (unitSummaryMap[u] || 0) + (it.quantity || 0)
  })
  const unitSummaryText = Object.entries(unitSummaryMap)
    .map(([unit, qty]) => `${qty} ${unit}`)
    .join(" · ")

  return (
    <div
      className={`bap-sheet sheet relative bg-white text-black font-sans leading-normal overflow-hidden select-text ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 16mm",
        boxSizing: "border-box",
        color: "#0B1B2E",
      }}
    >
      {/* Watermark untuk status non-VERIFIED */}
      {!isVerified && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
          <div
            className="text-[44pt] font-black text-black/[0.05] border-[3px] border-black/[0.07] px-8 py-4 rounded-xl uppercase tracking-widest text-center"
            style={{ transform: "rotate(-24deg)" }}
          >
            {isSubmitted ? "MENUNGGU PENGESAHAN" : "DRAFT BAP"}
          </div>
        </div>
      )}

      {/* ── KOP SURAT RESMI ── */}
      <div className="flex items-center gap-3.5 pb-2">
        <div className="w-[56px] h-[56px] rounded-[8px] border border-black/15 bg-[#F4F7FB] flex items-center justify-center shrink-0 overflow-hidden">
          {schoolSettings?.logoUrl ? (
            <img
              src={schoolSettings.logoUrl}
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
        <div className="w-[56px] shrink-0" />
      </div>

      {/* Garis Ganda Kedinasan */}
      <div className="flex flex-col gap-[1.5px] mt-1 mb-4">
        <div className="h-[2px] bg-black w-full" />
        <div className="h-[0.5px] bg-black w-full" />
      </div>

      {/* ── JUDUL DOKUMEN ── */}
      <div className="text-center my-3">
        <h2 className="text-[10.5pt] font-extrabold uppercase tracking-[0.05em] text-black underline">
          BERITA ACARA PENERIMAAN BARANG (BAP)
        </h2>
        <p className="text-[8.5pt] font-mono text-black/80 mt-1">
          Nomor: {bap.bapNumber || "DRAFT / BELUM BERNOMOR"}
        </p>
      </div>

      {/* ── PARAGRAF PEMBUKA ── */}
      <div className="text-[9pt] leading-[1.6] text-black/90 text-justify mt-3.5 mb-3">
        Pada hari ini, <strong className="font-bold">{verificationDateStr}</strong>, bertempat di{" "}
        <strong className="font-bold">{schoolName}</strong>, telah dilaksanakan pemeriksaan fisik dan serah terima
        penerimaan barang hasil belanja{" "}
        <strong className="font-bold">
          {bap.source === "BOSP"
            ? "Bantuan Operasional Satuan Pendidikan (BOSP)"
            : "Bantuan Operasional Sekolah (BOS) Reguler"}
        </strong>{" "}
        Tahun Anggaran {bap.periodYear || new Date().getFullYear()} oleh Penyimpan Barang bersama Guru Pengawas
        Pemeriksa, dengan rincian barang sebagai berikut:
      </div>

      {/* ── TABEL RINCIAN BARANG ── */}
      <div className="my-2 border border-black overflow-hidden">
        <table className="w-full border-collapse text-[8pt]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-black text-black font-bold uppercase text-[7pt]">
              <th className="py-1.5 px-2 text-center border-r border-black w-[9mm]">No</th>
              <th className="py-1.5 px-2 text-center border-r border-black w-[24mm]">Kode / Barcode</th>
              <th className="py-1.5 px-2 text-left border-r border-black">Nama Barang &amp; Spesifikasi Teknis</th>
              <th className="py-1.5 px-2 text-right border-r border-black w-[15mm]">Volume</th>
              <th className="py-1.5 px-2 text-center border-r border-black w-[13mm]">Satuan</th>
              <th className="py-1.5 px-2 text-center w-[18mm]">Kondisi</th>
            </tr>
          </thead>
          <tbody>
            {bap.items && bap.items.length > 0 ? (
              bap.items.map((it: any, idx: number) => (
                <tr key={it.id || idx} className="border-b border-black/80 break-inside-avoid">
                  <td className="py-1.5 px-2 text-center border-r border-black font-medium">{idx + 1}</td>
                  <td className="py-1.5 px-2 text-center border-r border-black font-mono text-[7.5pt]">
                    {it.barcode || it.item?.barcode || "-"}
                  </td>
                  <td className="py-1.5 px-2 border-r border-black">
                    <div className="font-bold text-[8pt] text-black">{it.name}</div>
                    {it.specification && (
                      <div className="text-[6.8pt] text-black/70 italic leading-tight">
                        {it.specification}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-black font-bold text-[8pt]">
                    {it.quantity}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-black text-black/80">
                    {it.unit || "Unit"}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="font-semibold text-[7pt] text-[#0EA47A]">
                      {it.condition === "BAIK" ? "Baik" : it.condition || "Baik"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-black/60 italic">
                  Belum ada barang belanjaan yang dimasukkan.
                </td>
              </tr>
            )}

            {/* Total Summary Row */}
            <tr className="bg-[#F8FAFC] font-bold border-t border-black text-[7.5pt]">
              <td colSpan={3} className="py-1.5 px-2 text-center border-r border-black uppercase tracking-wider">
                Jumlah Keseluruhan
              </td>
              <td className="py-1.5 px-2 text-right border-r border-black font-extrabold text-[8.5pt]">
                {totalQty}
              </td>
              <td className="py-1.5 px-2 text-center border-r border-black text-black/70">
                Unit
              </td>
              <td className="py-1.5 px-2 text-right text-[6.5pt] text-black/70 font-normal">
                {unitSummaryText || `${totalQty} Unit`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── KLAUSUL PENUTUP ── */}
      <div className="text-[8.5pt] leading-[1.6] text-black/90 text-justify mt-3.5 mb-4">
        <p className="mb-1.5">
          Barang-barang inventaris tersebut di atas telah diterima dalam keadaan lengkap, baru, dan berfungsi dengan baik
          sesuai spesifikasi teknis yang disyaratkan. Selanjutnya seluruh barang ini telah dicatatkan ke dalam Buku Induk
          Inventaris Sekolah oleh Penyimpan Barang.
        </p>
        <p>
          Demikian Berita Acara Penerimaan Barang ini dibuat dengan sebenarnya dan penuh tanggung jawab untuk
          dipergunakan sebagai bukti pertanggungjawaban pengelolaan Dana BOS dan administrasi inventaris sekolah.
        </p>
      </div>

      {/* ── BLOK TANDA TANGAN ── */}
      <div className="mt-6 pt-2">
        <div className="grid grid-cols-2 gap-8 text-[8pt] text-black">
          {/* Pihak 1: Teknisi / Penyimpan Barang */}
          <div className="flex flex-col items-center text-center">
            <span className="font-semibold">Penyimpan / Teknisi Barang</span>
            <div className="h-[22mm] flex items-center justify-center">
              {/* Ruang tanda tangan teknisi */}
            </div>
            <span className="font-bold text-[8.5pt] underline text-black">
              {bap.createdBy?.name || "Penyimpan Barang"}
            </span>
            <span className="text-[7pt] text-black/70">
              Pengelola Inventaris Sekolah
            </span>
          </div>

          {/* Pihak 2: Guru Pengawas Pemeriksa + QR Code */}
          <div className="flex flex-col items-center text-center">
            <span className="font-semibold">Guru Pengawas / Pemeriksa</span>
            <div className="h-[22mm] flex items-center justify-center my-0.5">
              {qrSvg ? (
                <div
                  className="w-[19mm] h-[19mm] border border-black/60 p-[1mm] bg-white flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-[19mm] h-[19mm] border border-dashed border-black/40 flex items-center justify-center text-[6pt] text-black/40 text-center p-1">
                  QR Verifikasi
                </div>
              )}
            </div>
            <span className="text-[6pt] font-mono text-black/70 tracking-tight">
              QR Verifikasi Sah Sistem HIKA
            </span>
            <span className="font-bold text-[8.5pt] underline text-black mt-0.5">
              {bap.verifiedBy?.name || bap.inspector?.name || "Guru Pengawas"}
            </span>
            <span className="text-[7pt] text-black/70">
              Tim Pemeriksa Hasil Belanja BOS
            </span>
          </div>
        </div>

        {/* Mengetahui: Kepala Sekolah */}
        <div className="flex flex-col items-center text-center mt-5 text-[8pt]">
          <span className="text-black/80">Mengetahui,</span>
          <span className="font-bold text-black">Kepala Sekolah</span>
          <div className="h-[14mm]" />
          <span className="font-bold text-[8.5pt] underline text-black">
            Drs. H. Sutarjo, M.Pd.
          </span>
          <span className="text-[7pt] text-black/70">
            NIP. 19720408 199803 1 004
          </span>
        </div>
      </div>

      {/* ── DOKUMEN FOOTER ── */}
      <div className="mt-auto pt-6 border-t border-black/15 flex flex-col items-center text-center text-[6.5pt] text-black/60 leading-tight gap-0.5">
        <span>
          Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Inventaris (HIKA) · {schoolName}
        </span>
        <span>
          Keaslian dokumen dapat diverifikasi secara daring dengan memindai QR Code di atas · Ref: {bap.bapNumber || bap.id}
        </span>
      </div>
    </div>
  )
}
