import { notFound, redirect } from "next/navigation"
import { getProcurementDetail } from "@/lib/queries/procurement"
import { getCurrentUser } from "@/lib/guard"
import { ChecklistClient } from "@/components/procurement/ChecklistClient"
import { PageHeader } from "@/components/layout/PageHeader"
import { MobileAppBar } from "@/components/layout/MobileAppBar"

export const dynamic = "force-dynamic"

export default async function ProcurementCheckPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [procurement, user] = await Promise.all([
    getProcurementDetail(id),
    getCurrentUser(),
  ])

  if (!procurement) {
    notFound()
  }

  // Jika sudah VERIFIED, arahkan langsung ke halaman dokumen BAP
  if (procurement.status === "VERIFIED") {
    redirect(`/procurement/${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Desktop PageHeader ── */}
      <div className="hidden lg:block">
        <PageHeader
          title="Pemeriksaan Barang BOS"
          subtitle={`No. BAP: ${procurement.bapNumber || "Draft"} · Pemeriksaan Fisik Barang di Gudang`}
        />
      </div>

      {/* ── Mobile AppBar ── */}
      <div className="lg:hidden">
        <MobileAppBar
          title="Pemeriksaan Barang"
          subtitle={`BAP: ${procurement.bapNumber || "Draft"}`}
          back={`/procurement/${id}`}
        />
      </div>

      <ChecklistClient
        procurement={procurement}
        currentUserId={user?.id}
      />
    </div>
  )
}
