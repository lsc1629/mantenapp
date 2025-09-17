import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('lsc16291978@0319', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'donluissalascortes@gmail.com' },
    update: {},
    create: {
      email: 'donluissalascortes@gmail.com',
      name: 'Luis Salas Cortes',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  })

  console.log('✅ Usuario administrador creado:', user.email)

  console.log('🎉 Seed completado exitosamente!')
  console.log('\n📋 Datos creados:')
  console.log(`   👤 Usuario: ${user.email}`)
  console.log(`   🌐 Clientes: 0 (sin datos de prueba)`)
  console.log(`   🚨 Alertas: 0 (sin datos de prueba)`)
  console.log(`   📊 Datos de sitio: 0 (sin datos de prueba)`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
