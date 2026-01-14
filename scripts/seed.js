import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    console.log("🌱 Starting database seeding...")
    console.log("📊 Database URL:", process.env.DATABASE_URL?.substring(0, 20) + '...')
    console.log("🔌 Testing database connection...")
    
    await prisma.$connect()
    console.log("✅ Database connected successfully!")

    // Use consistent password for all seeded accounts
    const seededPassword = "Admin123!"
    const hashedPassword = await bcrypt.hash(seededPassword, 10)
    
    console.log("Creating users with hashed password (length:", hashedPassword.length, ")")

    // Create owner user
    const owner = await prisma.user.upsert({
      where: { email: "owner@nexusx.com" },
      update: {
        passwordHash: hashedPassword,
        isActive: true,
        role: "OWNER",
      },
      create: {
        email: "owner@nexusx.com",
        username: "owner",
        passwordHash: hashedPassword,
        role: "OWNER",
        isActive: true,
      },
    })

    console.log("✓ Owner user created:", owner.email, owner.role)

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: "admin@nexusx.com" },
      update: {
        passwordHash: hashedPassword,
        isActive: true,
        role: "ADMIN",
      },
      create: {
        email: "admin@nexusx.com",
        username: "admin",
        passwordHash: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    })

    console.log("✓ Admin user created:", admin.email, admin.role)
    
    // Verify users were created
    const users = await prisma.user.findMany({
      select: { email: true, role: true, isActive: true },
    })
    console.log("✓ Total users in database:", users.length)
    users.forEach(u => console.log("  -", u.email, u.role, "active:", u.isActive))
    
    // Create license keys for resellers to purchase
    console.log("📄 Creating license keys...")
    
    const keyConfigs = [
      // Windows Keys
      { duration: 30, price: 9.99, productType: "WINDOWS", count: 50 },
      { duration: 60, price: 18.99, productType: "WINDOWS", count: 30 },
      { duration: 90, price: 26.99, productType: "WINDOWS", count: 20 },
      // macOS Keys  
      { duration: 30, price: 12.99, productType: "MACOS", count: 30 },
      { duration: 60, price: 22.99, productType: "MACOS", count: 20 },
      { duration: 90, price: 32.99, productType: "MACOS", count: 15 },
      // Android Keys
      { duration: 30, price: 7.99, productType: "ANDROID", count: 40 },
      { duration: 60, price: 14.99, productType: "ANDROID", count: 25 },
      { duration: 90, price: 21.99, productType: "ANDROID", count: 20 },
    ]
    
    for (const config of keyConfigs) {
      const keysToCreate = []
      for (let i = 0; i < config.count; i++) {
        const keyValue = `${config.productType.substr(0,3)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        keysToCreate.push({
          key: keyValue,
          duration: config.duration,
          price: config.price,
          productType: config.productType,
          status: "AVAILABLE",
        })
      }
      
      await prisma.licenseKey.createMany({
        data: keysToCreate,
        skipDuplicates: true,
      })
      
      console.log(`✓ Created ${config.count} ${config.productType} keys (${config.duration}d - $${config.price})`)
    }
    
    const totalKeys = await prisma.licenseKey.count({ where: { status: "AVAILABLE" } })
    console.log(`✓ Total available keys: ${totalKeys}`)
    
    console.log("✓ Seeding completed successfully!")
  } catch (error) {
    console.error("❌ Seeding error:", error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("✓ Database connection closed")
  })
  .catch(async (e) => {
    console.error("❌ Fatal error:", e.message)
    await prisma.$disconnect()
    process.exit(1)
  })
