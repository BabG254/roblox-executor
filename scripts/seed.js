import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create owner user
  const ownerPassword = await bcrypt.hash("ChangeMe123!", 10)
  
  const owner = await prisma.user.upsert({
    where: { email: "owner@nexusx.com" },
    update: {},
    create: {
      email: "owner@nexusx.com",
      username: "owner",
      passwordHash: ownerPassword,
      role: "OWNER",
      isActive: true,
    },
  })

  console.log("Owner user created/updated:", owner.email)

  // Create a test admin
  const adminPassword = await bcrypt.hash("Admin123!", 10)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexusx.com" },
    update: {},
    create: {
      email: "admin@nexusx.com",
      username: "admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  })

  console.log("Admin user created/updated:", admin.email)

  console.log("Seeding completed!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
