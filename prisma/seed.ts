import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation des données...')

  // Créer l'admin par défaut
  const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123')

  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@portfolio.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
      password: hashedPassword
    }
  })
  console.log('✅ Admin créé:', admin.email)

  console.log('🎉 Données initiales créées avec succès!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })