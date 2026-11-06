import { ProcurementForm } from "@/components/procurement/ProcurementForm"
import {
  getActiveDraftOrSubmitted,
  getAvailableInspectors,
  getWarehouseSuggestions,
} from "@/lib/queries/procurement"
import { getCategories } from "@/actions/inventory"
import { peekNextBapNumber } from "@/lib/bap-number"

export const dynamic = "force-dynamic"

export default async function ProcurementPage() {
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
