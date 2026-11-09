import { ProcurementForm } from "@/components/procurement/ProcurementForm"
import { TeacherProcurementView } from "@/components/procurement/TeacherProcurementView"
import {
  getActiveDraftOrSubmitted,
  getAvailableInspectors,
  getWarehouseSuggestions,
  getTeacherValidations,
} from "@/lib/queries/procurement"
import { getCategories } from "@/actions/inventory"
import { peekNextBapNumber } from "@/lib/bap-number"
import { getCurrentUser } from "@/lib/guard"

export const dynamic = "force-dynamic"

export default async function ProcurementPage() {
  const currentUser = await getCurrentUser()

  // Guru Pengawas: Tampilkan antarmuka khusus validasi tanpa form teknisi
  if (currentUser?.role === "TEACHER") {
    const validations = await getTeacherValidations(currentUser.id)
    return (
      <TeacherProcurementView
        pending={validations.pending}
        verified={validations.verified}
        userName={currentUser.name}
      />
    )
  }

  // Admin & Teknisi: Antarmuka pengajuan dan penyusunan belanja BOS
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [
    initialProcurement,
    inspectors,
    warehouseSuggestions,
    categories,
    previewBapNumber,
  ] = await Promise.all([
    getActiveDraftOrSubmitted(currentYear, currentMonth),
    getAvailableInspectors(),
    getWarehouseSuggestions({ limit: 12 }),
    getCategories(),
    peekNextBapNumber(currentYear, currentMonth),
  ])

  return (
    <ProcurementForm
      initialProcurement={initialProcurement}
      inspectors={inspectors}
      warehouseSuggestions={warehouseSuggestions}
      categories={categories}
      previewBapNumber={previewBapNumber}
      currentYear={currentYear}
      currentMonth={currentMonth}
    />
  )
}
