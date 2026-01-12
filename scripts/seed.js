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
