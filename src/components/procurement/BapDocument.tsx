import React from "react"
import { QrBox } from "./QrBox"
import { formatDateId } from "@/lib/format"
import { GraduationCap } from "lucide-react"

interface BapDocumentProps {
  bap: any
  schoolSettings?: any
  qrSvg?: string
  verifyUrl?: string
  className?: string
}

export function BapDocument({
  bap,
  schoolSettings,
  qrSvg,
  verifyUrl,
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
      className={`bap-sheet sheet relative bg-white text-black font-sans leading-normal select-text ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 14mm",
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
      <div className="flex items-center gap-3 pb-1">
        <div className="w-[48px] h-[48px] rounded-[6px] border border-black/15 bg-[#F4F7FB] flex items-center justify-center shrink-0 overflow-hidden">
          {schoolSettings?.logoUrl ? (
            <img
              src={schoolSettings.logoUrl}
              alt="Logo Sekolah"
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <GraduationCap className="size-7 text-[#2B4EFF]" />
          )}
        </div>
        <div className="flex-1 text-center flex flex-col items-center">
          <span className="text-[7.5pt] font-bold tracking-wider uppercase text-black/80">
            PEMERINTAH PROVINSI JAWA TENGAH
          </span>
          <span className="text-[7pt] font-semibold tracking-wide uppercase text-black/70">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </span>
          <h1 className="text-[12pt] font-extrabold uppercase tracking-tight text-black mt-0.5">
            {schoolName}
          </h1>
          <span className="text-[6.2pt] text-black/70 leading-tight">
            {schoolAddress}
          </span>
          <span className="text-[6.2pt] text-black/60 leading-tight">
            Telp. {schoolPhone} · Website: {schoolWebsite} · Email: {schoolEmail}
          </span>
        </div>
        <div className="w-[48px] shrink-0" />
      </div>

      {/* Garis Ganda Kedinasan */}
      <div className="flex flex-col gap-[1px] mt-0.5 mb-2.5">
        <div className="h-[2px] bg-black w-full" />
        <div className="h-[0.5px] bg-black w-full" />
      </div>

      {/* ── JUDUL DOKUMEN ── */}
      <div className="text-center my-2">
        <h2 className="text-[10pt] font-extrabold uppercase tracking-[0.05em] text-black underline">
          BERITA ACARA PENERIMAAN BARANG (BAP)
        </h2>
        <p className="text-[8pt] font-mono text-black/80 mt-0.5">
          Nomor: {bap.bapNumber || "DRAFT / BELUM BERNOMOR"}
        </p>
      </div>

      {/* ── PARAGRAF PEMBUKA ── */}
      <div className="text-[8.5pt] leading-[1.5] text-black/90 text-justify mt-2 mb-2">
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
      <div className="my-1.5 border border-black">
        <table className="w-full border-collapse text-[7.5pt]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-black text-black font-bold uppercase text-[7pt]">
              <th className="py-1 px-1.5 text-center border-r border-black w-[8mm]">No</th>
              <th className="py-1 px-1.5 text-center border-r border-black w-[22mm]">Kode / Barcode</th>
              <th className="py-1 px-2 text-left border-r border-black">Nama Barang &amp; Spesifikasi Teknis</th>
              <th className="py-1 px-1.5 text-right border-r border-black w-[15mm]">Volume</th>
              <th className="py-1 px-1.5 text-center border-r border-black w-[13mm]">Satuan</th>
              <th className="py-1 px-1.5 text-center w-[18mm]">Kondisi</th>
            </tr>
          </thead>
          <tbody>
            {bap.items && bap.items.length > 0 ? (
              bap.items.map((it: any, idx: number) => (
                <tr key={it.id || idx} className="border-b border-black/80 break-inside-avoid">
                  <td className="py-1 px-1.5 text-center border-r border-black font-medium">{idx + 1}</td>
                  <td className="py-1 px-1.5 text-center border-r border-black font-mono text-[7pt]">
                    {it.barcode || it.item?.barcode || "-"}
                  </td>
                  <td className="py-1 px-2 border-r border-black">
                    <div className="font-bold text-[7.5pt] text-black">{it.name}</div>
                    {it.specification && (
                      <div className="text-[6.5pt] text-black/70 italic leading-tight">
                        {it.specification}
                      </div>
                    )}
                  </td>
                  <td className="py-1 px-1.5 text-right border-r border-black font-bold text-[7.5pt]">
                    {it.quantity}
                  </td>
                  <td className="py-1 px-1.5 text-center border-r border-black text-black/80">
                    {it.unit || "Unit"}
                  </td>
                  <td className="py-1 px-1.5 text-center">
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
            <tr className="bg-[#F8FAFC] font-bold border-t border-black text-[7.5pt] break-inside-avoid">
              <td colSpan={3} className="py-1 px-2 border-r border-black">
                <div className="text-center uppercase tracking-wider font-extrabold text-[7.5pt]">
                  Jumlah Keseluruhan
                </div>
                {unitSummaryText && Object.keys(unitSummaryMap).length > 1 && (
                  <div className="text-[6.5pt] font-normal text-black/70 text-center tracking-tight mt-0.5">
                    ({unitSummaryText})
                  </div>
                )}
              </td>
              <td className="py-1 px-1.5 text-right border-r border-black font-extrabold text-[8pt]">
                {totalQty}
              </td>
              <td className="py-1 px-1.5 text-center border-r border-black text-black/80 font-bold text-[7pt]">
                {Object.keys(unitSummaryMap).length === 1 ? Object.keys(unitSummaryMap)[0] : "Item"}
              </td>
              <td className="py-1 px-1.5 text-center font-bold text-[7.5pt] text-[#0EA47A]">
                Baik
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── KLAUSUL PENUTUP & TANDA TANGAN (SATU KESATUAN / AVOID BREAK) ── */}
      <div className="bap-signature-section mt-2.5 break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
        {/* Klausul Penutup */}
        <div className="text-[8pt] leading-[1.5] text-black/90 text-justify mb-3">
          <p className="mb-1">
            Barang-barang inventaris tersebut di atas telah diterima dalam keadaan lengkap, baru, dan berfungsi dengan baik
            sesuai spesifikasi teknis yang disyaratkan. Selanjutnya seluruh barang ini telah dicatatkan ke dalam Buku Induk
            Inventaris Sekolah oleh Penyimpan Barang.
          </p>
          <p>
            Demikian Berita Acara Penerimaan Barang ini dibuat dengan sebenarnya dan penuh tanggung jawab untuk
            dipergunakan sebagai bukti pertanggungjawaban pengelolaan Dana BOS dan administrasi inventaris sekolah.
          </p>
        </div>

        {/* Blok Tanda Tangan */}
        <div className="pt-1">
          <div className="grid grid-cols-2 gap-8 text-[8pt] text-black">
            {/* Pihak 1: Teknisi / Penyimpan Barang */}
            <div className="flex flex-col items-center text-center">
              <span className="font-semibold text-[7.5pt]">Penyimpan / Teknisi Barang</span>
              <div className="h-[18mm] flex items-center justify-center">
                {/* Ruang tanda tangan teknisi */}
              </div>
              <span className="font-bold text-[8pt] underline text-black">
                {bap.createdBy?.name || "Penyimpan Barang"}
              </span>
              <span className="text-[6.8pt] text-black/70">
                Pengelola Inventaris Sekolah
              </span>
            </div>

            {/* Pihak 2: Guru Pengawas Pemeriksa + QR Code */}
            <div className="flex flex-col items-center text-center">
              <span className="font-semibold text-[7.5pt]">Guru Pengawas / Pemeriksa</span>
              <div className="h-[18mm] flex items-center justify-center my-0.5">
                {qrSvg ? (
                  <a
                    href={verifyUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Klik untuk membuka verifikasi daring"
                    className="w-[17mm] h-[17mm] border border-black/60 p-[1mm] bg-white flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-[17mm] h-[17mm] border border-dashed border-black/40 flex items-center justify-center text-[5.5pt] text-black/40 text-center p-1">
                    QR Verifikasi
                  </div>
                )}
              </div>
              {verifyUrl ? (
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[5.5pt] font-mono text-black/80 tracking-tight hover:underline cursor-pointer block max-w-[50mm] truncate"
                  title={verifyUrl}
                >
                  Pindai / Kunjungi Link Verifikasi
                </a>
              ) : (
                <span className="text-[5.5pt] font-mono text-black/70 tracking-tight">
                  QR Verifikasi Sah Sistem HIKA
                </span>
              )}
              <span className="font-bold text-[8pt] underline text-black mt-0.5">
                {bap.verifiedBy?.name || bap.inspector?.name || "Guru Pengawas"}
              </span>
              <span className="text-[6.8pt] text-black/70">
                Tim Pemeriksa Hasil Belanja BOS
              </span>
            </div>
          </div>
        </div>

        {/* Dokumen Footer */}
        <div className="mt-4 pt-2 border-t border-black/15 flex flex-col items-center text-center text-[6.2pt] text-black/60 leading-tight gap-0.5">
          <span>
            Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Inventaris (HIKA) · {schoolName}
          </span>
          <span>
            Keaslian dokumen dapat diverifikasi daring dengan memindai QR Code di atas {verifyUrl ? `atau akses link: ${verifyUrl}` : `· Ref: ${bap.bapNumber || bap.id}`}
          </span>
        </div>
      </div>
    </div>
  )
}
