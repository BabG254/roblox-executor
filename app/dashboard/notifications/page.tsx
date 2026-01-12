import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NotificationsViewer } from "@/components/shared/notifications-viewer"

export default async function NotificationsPage() {
  const session = await requireAuth()

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ isGlobal: true }, { targetRole: session.role }, { targetRole: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">System announcements and updates</p>
      </div>
      <NotificationsViewer notifications={notifications} />
    </div>
  )
}
