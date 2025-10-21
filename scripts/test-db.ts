// test-db.ts (or scripts/test-db.ts)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function main() {
  try {
    console.log('🔄 Testing database connection...\n')
    
    // Test 1: Basic connection
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('✅ Database connected successfully!')
    console.log('📅 Current database time:', result)
    
    // Test 2: Check if tables exist
    console.log('\n🔄 Checking tables...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📊 Tables in database:', tables)
    
    console.log('\n✨ All tests passed!')
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error details:', error)
    process.exit(1)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
    console.log('\n👋 Disconnected from database')
  })