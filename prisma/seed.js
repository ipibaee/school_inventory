const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Create Locations
    const locations = [
        { name: "Gudang", description: "Gudang Utama" },
        { name: "R. Maintenance", description: "Ruang Maintenance" },
        { name: "Lab. Software1", description: "Laboratorium Software 1" },
        { name: "Lab. Software2", description: "Laboratorium Software 2" },
        { name: "Lab. Simdig1", description: "Laboratorium Simulasi Digital 1" },
        { name: "Lab. Simdig2", description: "Laboratorium Simulasi Digital 2" },
        { name: "Lab. Grafis", description: "Laboratorium Grafis" },
        { name: "Lab. Lan", description: "Laboratorium LAN" },
        { name: "Lab. Wan", description: "Laboratorium WAN" },
        { name: "Lab. Hardware", description: "Laboratorium Hardware" },
    ]

    for (const loc of locations) {
        await prisma.location.upsert({
            where: { name: loc.name },
            update: {},
            create: loc,
        })
    }

    // Create Categories
    const categories = [
        { name: 'Elektronik' },
        { name: 'Furniture' },
        { name: 'Buku' },
        { name: 'Alat Tulis' },
        { name: 'Alat Peraga' },
    ]

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        })
    }

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: { email: 'admin@school.id' },
        update: {},
        create: {
            name: 'Admin Sekolah',
            email: 'admin@school.id',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    // Create Custom Admin User for SMK HKTI 2
    const customHashedPassword = await bcrypt.hash('admin1234', 10)
    await prisma.user.upsert({
        where: { email: 'admin@smkhkti2.sch.id' },
        update: {
            password: customHashedPassword,
        },
        create: {
            name: 'Admin SMK HKTI 2',
            email: 'admin@smkhkti2.sch.id',
            password: customHashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('Seed data created successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
