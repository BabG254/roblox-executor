import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getKillSwitchState } from "@/lib/kill-switch"
import { KillSwitchControl } from "@/components/admin/kill-switch-control"

export default async function KillSwitchPage() {
  const session = await requireAuth(["OWNER"])

  if (session.role !== "OWNER") {
    redirect("/dashboard")
  }

  const killSwitch = await getKillSwitchState()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Kill Switch</h1>
        <p className="text-muted-foreground mt-1">Emergency control to disable all executors globally</p>
      </div>
      <KillSwitchControl killSwitch={killSwitch} />
    </div>
  )
}
