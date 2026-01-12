import { prisma } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export function generateLicenseKey(): string {
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(uuidv4().substring(0, 4).toUpperCase())
  }
  return segments.join("-")
}

export async function createLicenseKeys(count: number, duration: number, price: number, createdById: string) {
  const keys = []
  for (let i = 0; i < count; i++) {
    const key = await prisma.licenseKey.create({
      data: {
        key: generateLicenseKey(),
        duration,
        price,
        createdById,
      },
    })
    keys.push(key)
  }
  return keys
}

export async function redeemLicenseKey(userId: string, keyString: string) {
  const licenseKey = await prisma.licenseKey.findUnique({
    where: { key: keyString },
  })

  if (!licenseKey) {
    throw new Error("Invalid license key")
  }

  if (licenseKey.status !== "AVAILABLE" && licenseKey.status !== "ASSIGNED") {
    throw new Error("License key has already been redeemed or is revoked")
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + licenseKey.duration)

  const license = await prisma.$transaction(async (tx) => {
    await tx.licenseKey.update({
      where: { id: licenseKey.id },
      data: { status: "REDEEMED" },
    })

    return tx.license.create({
      data: {
        userId,
        licenseKeyId: licenseKey.id,
        expiresAt,
      },
    })
  })

  return license
}

export async function checkLicenseValid(userId: string): Promise<boolean> {
  const license = await prisma.license.findFirst({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
  })

  // Check kill switch
  const killSwitch = await prisma.killSwitch.findFirst()
  if (killSwitch?.isEnabled) {
    return false
  }

  return !!license
}

export async function getUserActiveLicense(userId: string) {
  return prisma.license.findFirst({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      licenseKey: true,
    },
  })
}
