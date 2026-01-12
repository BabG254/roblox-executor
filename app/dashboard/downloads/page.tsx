import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getUserActiveLicense } from "@/lib/license"
import { getKillSwitchState } from "@/lib/kill-switch"
import { DownloadsPage } from "@/components/user/downloads-page"

export default async function Downloads() {
  const session = await requireAuth()

  const [license, killSwitch, releases, userDownloads] = await Promise.all([
    getUserActiveLicense(session.id),
    getKillSwitchState(),
    prisma.softwareRelease.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.download.findMany({
      where: { userId: session.id },
      orderBy: { downloadedAt: "desc" },
      take: 10,
      include: { release: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Downloads</h1>
        <p className="text-muted-foreground mt-1">Download the latest executor versions</p>
      </div>
      <DownloadsPage
        releases={releases}
        license={license}
        killSwitchEnabled={killSwitch?.isEnabled || false}
        userDownloads={userDownloads}
        userId={session.id}
      />
    </div>
  )
}
