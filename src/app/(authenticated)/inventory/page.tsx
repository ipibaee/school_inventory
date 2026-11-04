import { getItems, getCategories, getLocations } from "@/actions/inventory"
import { InventoryPageClient } from "@/components/inventory/InventoryPageClient"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
    const items = await getItems()
    const categories = await getCategories()
    const locations = await getLocations()

    return (
        <InventoryPageClient
            items={items}
            categories={categories}
            locations={locations}
        />
    )
}
