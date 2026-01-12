import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SettingsManager } from "@/components/shared/settings-manager"

export default async function SettingsPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>
      <SettingsManager user={user} />
    </div>
  )
}
