"use server"

import { requireAuth } from "@/lib/auth"
import { enableKillSwitch, disableKillSwitch } from "@/lib/kill-switch"
import { revalidatePath } from "next/cache"

export async function toggleKillSwitchAction(enable: boolean, reason?: string) {
  const session = await requireAuth(["OWNER"])

  if (enable) {
    await enableKillSwitch(session.id, reason)
  } else {
    await disableKillSwitch(session.id)
  }

  revalidatePath("/dashboard/kill-switch")
  revalidatePath("/dashboard")
}
