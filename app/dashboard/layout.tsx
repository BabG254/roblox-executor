import type React from "react"
import { requireAuth } from "@/lib/auth"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={session.role} username={session.username} />
      <main className="min-h-screen md:pl-64 pt-20 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
