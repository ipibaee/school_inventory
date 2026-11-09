import { notFound, redirect } from "next/navigation"
import { getProcurementDetail } from "@/lib/queries/procurement"
import { getSchoolSettings } from "@/actions/settings"
import { getCurrentUser } from "@/lib/guard"
import { BapBarcodeBatchPrinter } from "@/components/procurement/BapBarcodeBatchPrinter"

export const dynamic = "force-dynamic"

export default async function ProcurementBarcodePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [procurement, schoolSettings, currentUser] = await Promise.all([
    getProcurementDetail(id),
    getSchoolSettings(),
    getCurrentUser(),
  ])

  // Validasi Guard: Guru Pengawas hanya berhak cetak surat BAP fisik, bukan barcode
  if (!currentUser || currentUser.role === "TEACHER") {
    redirect(`/procurement/${id}`)
  }

  if (!procurement) {
    notFound()
  }

  // Jika pengadaan belum diverifikasi, arahkan kembali ke BAP
  if (procurement.status !== "VERIFIED") {
    redirect(`/procurement/${id}`)
  }

  return (
    <BapBarcodeBatchPrinter
      procurement={procurement}
      schoolSettings={schoolSettings}
    />
  )
}
