"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { BapDocument } from "./BapDocument"

interface BapPrintButtonProps {
  bap: any
  schoolSettings?: any
  qrSvg?: string
  verifyUrl?: string
  label?: string
  className?: string
  variant?: "primary" | "secondary" | "outline"
}

export function BapPrintButton({
  bap,
  schoolSettings,
  qrSvg,
  verifyUrl,
  label = "Cetak Dokumen BAP",
  className = "",
  variant = "primary",
}: BapPrintButtonProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `BAP-BOS-${bap?.bapNumber ? bap.bapNumber.replace(/\//g, "-") : "DRAFT"}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      @media print {
        html, body {
          background: #FFFFFF !important;
          color: #000000 !important;
          margin: 0mm !important;
          padding: 0mm !important;
          width: 210mm !important;
        }
        .no-print, header, nav, aside {
          display: none !important;
        }
        .bap-sheet {
          width: 210mm !important;
          max-width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 auto !important;
          padding: 12mm 14mm !important;
          box-sizing: border-box !important;
          box-shadow: none !important;
          border: none !important;
          overflow: visible !important;
        }
        table {
          width: 100% !important;
          table-layout: fixed !important;
          page-break-inside: auto;
        }
        thead {
          display: table-header-group !important;
        }
        tfoot {
          display: table-footer-group !important;
        }
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .bap-signature-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  })

  return (
    <>
      <Button
        variant={variant as any}
        onClick={() => handlePrint()}
        className={`gap-2 ${className}`}
      >
        <Printer className="size-4" />
        <span>{label}</span>
      </Button>

      {/* Hidden container specifically for react-to-print */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <BapDocument
            bap={bap}
            schoolSettings={schoolSettings}
            qrSvg={qrSvg}
            verifyUrl={verifyUrl}
          />
        </div>
      </div>
    </>
  )
}
