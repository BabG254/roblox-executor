import { prisma } from "@/lib/db"

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_FORCE_LOGOUT"
  | "LICENSE_KEY_CREATED"
  | "LICENSE_KEY_ASSIGNED"
  | "LICENSE_KEY_REVOKED"
  | "LICENSE_ACTIVATED"
  | "LICENSE_DEACTIVATED"
  | "RELEASE_CREATED"
  | "RELEASE_PUBLISHED"
  | "RELEASE_ROLLBACK"
  | "DOWNLOAD_INITIATED"
  | "KILL_SWITCH_ENABLED"
  | "KILL_SWITCH_DISABLED"
  | "APPEAL_CREATED"
  | "APPEAL_RESOLVED"
  | "WALLET_DEPOSIT"
  | "WALLET_PURCHASE"
  | "RESELLER_CREATED"
  | "RESELLER_REVOKED"

export async function logAudit(
  action: AuditAction,
  entityType: string,
  entityId?: string,
  details?: string,
  performedById?: string,
  userId?: string,
  ipAddress?: string,
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      details,
      performedById,
      userId,
      ipAddress,
    },
  })
}
