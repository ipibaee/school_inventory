import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { getBapByToken } from "@/lib/queries/procurement"
import { getSchoolSettings } from "@/actions/settings"
import { prisma } from "@/lib/prisma"
import { VerifyDocumentCard } from "@/components/procurement/VerifyDocumentCard"
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Verifikasi Berita Acara Penerimaan Barang (BAP) | HIKA Inventaris",
    description:
      "Halaman verifikasi keaslian Berita Acara Penerimaan Barang Dana BOS",
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const headerList = await headers()
  const [bap, schoolSettings] = await Promise.all([
    getBapByToken(token),
    getSchoolSettings(),
  ])

  // Record verification visit in background
  if (bap) {
    try {
      const forwarded = headerList.get("x-forwarded-for")
      const ip = forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")
      const userAgent = headerList.get("user-agent")

      await prisma.verificationVisit.create({
        data: {
          procurementId: bap.id,
          ip: ip || null,
          userAgent: userAgent || null,
        },
      })
    } catch (e) {
      // Non-blocking log
      console.warn("Failed to record verification visit:", e)
    }
  }

  const schoolName = schoolSettings?.schoolName || "SMK HKTI 2 Purwareja Klampok"
  const schoolLogo = schoolSettings?.logoUrl || null

  return (
    <main className="min-h-screen bg-app text-ink flex flex-col items-center justify-between p-4 sm:p-8">
      {/* Container Card */}
      <div className="w-full flex flex-col items-center justify-center flex-1 my-auto">
        {bap ? (
          <VerifyDocumentCard
            bap={bap}
            schoolName={schoolName}
            schoolLogo={schoolLogo}
          />
        ) : (
          <div className="w-full max-w-[420px] flex flex-col items-center text-center gap-5">
            {/* Brand Header */}
            <header className="flex items-center justify-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-sm font-extrabold text-ink leading-tight">
                  {schoolName}
                </h1>
                <p className="text-[10px] text-muted-ink">
                  Sistem Inventaris Sekolah Resmi (HIKA)
                </p>
              </div>
            </header>

            {/* Invalid State Card */}
            <div className="w-full rounded-2xl bg-surface border border-line shadow-sm p-6 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-soft border border-rose/25 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-rose" />
              </div>

              <div className="flex flex-col gap-1.5 text-center">
                <h2 className="text-sm sm:text-base font-extrabold text-ink">
                  DOKUMEN TIDAK DITEMUKAN
                </h2>
                <p className="text-xs text-muted-ink leading-relaxed">
                  Tautan atau QR code ini tidak valid, kadaluarsa, atau Berita
                  Acara belum resmi disahkan oleh pihak sekolah.
                </p>
              </div>

              <div className="w-full pt-2">
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-app hover:bg-surface-2 border border-line text-xs font-semibold text-ink-soft transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Beranda
                </Link>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-[9.5px] text-muted-ink text-center pt-2">
              © {new Date().getFullYear()} {schoolName} · HIKA Inventaris
            </footer>
          </div>
        )}
      </div>
    </main>
  )
}
