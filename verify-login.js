const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@school.id'
    const password = 'admin123'

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.error('User not found!')
        process.exit(1)
    }

    console.log('User found:', user.email, user.role)

    const match = await bcrypt.compare(password, user.password)
    if (match) {
        console.log('Password match: SUCCESS')
    } else {
        console.error('Password match: FAILED')
        // Try to update password to be sure if it fails
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
