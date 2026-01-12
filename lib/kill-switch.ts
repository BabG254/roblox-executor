import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"

export async function getKillSwitchState() {
  let killSwitch = await prisma.killSwitch.findFirst()

  if (!killSwitch) {
    killSwitch = await prisma.killSwitch.create({
      data: {
        isEnabled: false,
      },
    })
  }

  return killSwitch
}

export async function enableKillSwitch(enabledById: string, reason?: string) {
  const killSwitch = await prisma.killSwitch.updateMany({
    data: {
      isEnabled: true,
      enabledAt: new Date(),
      enabledById,
      reason,
    },
  })

  await logAudit("KILL_SWITCH_ENABLED", "SYSTEM", undefined, reason, enabledById)

  return killSwitch
}

export async function disableKillSwitch(disabledById: string) {
  const killSwitch = await prisma.killSwitch.updateMany({
    data: {
      isEnabled: false,
      enabledAt: null,
      enabledById: null,
      reason: null,
    },
  })

  await logAudit("KILL_SWITCH_DISABLED", "SYSTEM", undefined, undefined, disabledById)

  return killSwitch
}

export async function isKillSwitchActive(): Promise<{ isEnabled: boolean; reason: string | null }> {
  const killSwitch = await getKillSwitchState()
  return {
    isEnabled: killSwitch.isEnabled,
    reason: killSwitch.reason,
  }
}
