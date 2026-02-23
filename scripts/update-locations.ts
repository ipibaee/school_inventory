
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_LOCATIONS = [
    "Gudang",
    "R. Maintenance",
    "Lab. Software1",
    "Lab. Software2",
    "Lab. Simdig1",
    "Lab. Simdig2",
    "Lab. Simdig3",
    "Lab. Grafis",
    "Lab. Lan",
    "Lab. Wan",
    "Lab. Hardware"
]

async function main() {
    console.log('Start updating locations...')

    // 1. Ensure "Gudang" exists first as a fallback
    let gudang = await prisma.location.findUnique({ where: { name: "Gudang" } })
    if (!gudang) {
        gudang = await prisma.location.create({ data: { name: "Gudang", description: "Main Warehouse" } })
        console.log('Created fallback location: Gudang')
    }

    // 2. Create or update all new locations
    for (const locName of NEW_LOCATIONS) {
        const exists = await prisma.location.findUnique({ where: { name: locName } })
        if (!exists) {
            await prisma.location.create({ data: { name: locName } })
            console.log(`Created location: ${locName}`)
        }
    }

    // 3. Find locations to delete (those not in NEW_LOCATIONS)
    const allLocations = await prisma.location.findMany()
    const locationsToDelete = allLocations.filter(l => !NEW_LOCATIONS.includes(l.name))

    for (const loc of locationsToDelete) {
        console.log(`Processing deletion for: ${loc.name}`)

        // Move items to Gudang
        const itemsCount = await prisma.item.count({ where: { locationId: loc.id } })
        if (itemsCount > 0) {
            console.log(`  Moving ${itemsCount} items from ${loc.name} to Gudang`)
            await prisma.item.updateMany({
                where: { locationId: loc.id },
                data: { locationId: gudang.id }
            })
        }

        // Delete the location
        await prisma.location.delete({ where: { id: loc.id } })
        console.log(`  Deleted location: ${loc.name}`)
    }

    console.log('Location update complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
