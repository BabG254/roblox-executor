import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getUserActiveLicense } from "@/lib/license"
import { LicenseManager } from "@/components/user/license-manager"

export default async function LicensePage() {
  const session = await requireAuth(["USER", "RESELLER", "ADMIN", "OWNER"])

  const license = await getUserActiveLicense(session.id)

  const allLicenses = await prisma.license.findMany({
    where: { userId: session.id },
    orderBy: { activatedAt: "desc" },
    include: { licenseKey: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My License</h1>
        <p className="text-muted-foreground mt-1">Manage your license and redeem keys</p>
      </div>
      <LicenseManager activeLicense={license} allLicenses={allLicenses} />
    </div>
  )
}
