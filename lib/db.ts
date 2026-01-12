import { v4 as uuidv4 } from "uuid"

// Types matching Prisma schema
export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  role: string
  isActive: boolean
  isBanned: boolean
  banReason: string | null
  discordId: string | null
  resellerId: string | null
  createdAt: Date
  lastLoginAt: Date | null
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user?: User
}

export interface License {
  id: string
  key: string
  type: string
  status: string
  expiresAt: Date | null
  maxDevices: number
  hwid: string | null
  userId: string | null
  resellerId: string | null
  createdById: string
  createdAt: Date
  activatedAt: Date | null
  user?: User | null
  reseller?: Reseller | null
  createdBy?: User
}

export interface Reseller {
  id: string
  userId: string
  walletBalance: number
  totalSales: number
  commission: number
  isActive: boolean
  createdAt: Date
  user?: User
}

export interface WalletTransaction {
  id: string
  resellerId: string
  amount: number
  type: string
  description: string
  createdAt: Date
  reseller?: Reseller
}

export interface Release {
  id: string
  version: string
  changelog: string
  downloadUrl: string
  isPublished: boolean
  isLatest: boolean
  createdById: string
  createdAt: Date
  createdBy?: User
}

export interface Download {
  id: string
  userId: string
  releaseId: string
  ipAddress: string | null
  createdAt: Date
  user?: User
  release?: Release
}

export interface Appeal {
  id: string
  submittedById: string
  targetUserId: string | null
  targetLicenseId: string | null
  type: string
  reason: string
  evidence: string | null
  status: string
  reviewedById: string | null
  reviewNotes: string | null
  createdAt: Date
  reviewedAt: Date | null
  submittedBy?: User
  targetUser?: User | null
  targetLicense?: License | null
  reviewedBy?: User | null
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  targetType: string | null
  targetId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: Date
  user?: User
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  user?: User
}

export interface KillSwitch {
  id: string
  isEnabled: boolean
  reason: string | null
  enabledById: string | null
  enabledAt: Date | null
  createdAt: Date
  enabledBy?: User | null
}

// In-memory data store with seeded data
const store = {
  users: new Map<string, User>(),
  sessions: new Map<string, Session>(),
  licenses: new Map<string, License>(),
  resellers: new Map<string, Reseller>(),
  walletTransactions: new Map<string, WalletTransaction>(),
  releases: new Map<string, Release>(),
  downloads: new Map<string, Download>(),
  appeals: new Map<string, Appeal>(),
  auditLogs: new Map<string, AuditLog>(),
  notifications: new Map<string, Notification>(),
  killSwitch: new Map<string, KillSwitch>(),
}

// Seed initial data
function seedData() {
  // Only seed if not already seeded
  if (store.users.size > 0) return

  // These match the hashPassword function in auth.ts
  const ownerHash = "a]fb8e3e5b5f5c5e5f5d5e5f5c5e5f5d5e5f5c5e5f5d5e5f5c5e5f5d5e" // placeholder - will be computed
  const adminHash = ownerHash
  const resellerHash = ownerHash
  const userHash = ownerHash

  // Create owner user (password: owner123)
  const ownerId = uuidv4()
  store.users.set(ownerId, {
    id: ownerId,
    email: "owner@nexusx.app",
    username: "owner",
    passwordHash: "OWNER123",
    role: "OWNER",
    isActive: true,
    isBanned: false,
    banReason: null,
    discordId: null,
    resellerId: null,
    createdAt: new Date(),
    lastLoginAt: null,
  })

  // Create admin user (password: admin123)
  const adminId = uuidv4()
  store.users.set(adminId, {
    id: adminId,
    email: "admin@nexusx.app",
    username: "admin",
    passwordHash: "ADMIN123",
    role: "ADMIN",
    isActive: true,
    isBanned: false,
    banReason: null,
    discordId: null,
    resellerId: null,
    createdAt: new Date(),
    lastLoginAt: null,
  })

  // Create reseller user (password: reseller123)
  const resellerUserId = uuidv4()
  store.users.set(resellerUserId, {
    id: resellerUserId,
    email: "reseller@nexusx.app",
    username: "reseller",
    passwordHash: "RESELLER123",
    role: "RESELLER",
    isActive: true,
    isBanned: false,
    banReason: null,
    discordId: null,
    resellerId: null,
    createdAt: new Date(),
    lastLoginAt: null,
  })

  // Create reseller profile
  const resellerId = uuidv4()
  store.resellers.set(resellerId, {
    id: resellerId,
    userId: resellerUserId,
    walletBalance: 100.0,
    totalSales: 25,
    commission: 15,
    isActive: true,
    createdAt: new Date(),
  })

  // Update reseller user with resellerId
  const resellerUser = store.users.get(resellerUserId)!
  resellerUser.resellerId = resellerId
  store.users.set(resellerUserId, resellerUser)

  // Create regular user (password: user123)
  const userId = uuidv4()
  store.users.set(userId, {
    id: userId,
    email: "user@nexusx.app",
    username: "testuser",
    passwordHash: "USER123",
    role: "USER",
    isActive: true,
    isBanned: false,
    banReason: null,
    discordId: null,
    resellerId: null,
    createdAt: new Date(),
    lastLoginAt: null,
  })

  // Create a sample release
  const releaseId = uuidv4()
  store.releases.set(releaseId, {
    id: releaseId,
    version: "1.0.0",
    changelog: "Initial release of NexusX Executor\n- Script execution engine\n- Game detection\n- Auto-inject feature",
    downloadUrl: "https://example.com/nexusx-1.0.0.zip",
    isPublished: true,
    isLatest: true,
    createdById: ownerId,
    createdAt: new Date(),
  })

  // Create sample licenses
  const license1Id = uuidv4()
  store.licenses.set(license1Id, {
    id: license1Id,
    key: "NXXX-DEMO-1234-5678",
    type: "LIFETIME",
    status: "ACTIVE",
    expiresAt: null,
    maxDevices: 1,
    hwid: null,
    userId: userId,
    resellerId: null,
    createdById: ownerId,
    createdAt: new Date(),
    activatedAt: new Date(),
  })

  // Create sample notification
  const notifId = uuidv4()
  store.notifications.set(notifId, {
    id: notifId,
    userId: userId,
    title: "Welcome to NexusX!",
    message: "Thank you for joining. Your account is now active.",
    type: "INFO",
    isRead: false,
    createdAt: new Date(),
  })

  // Initialize kill switch (disabled)
  const killSwitchId = uuidv4()
  store.killSwitch.set(killSwitchId, {
    id: killSwitchId,
    isEnabled: false,
    reason: null,
    enabledById: null,
    enabledAt: null,
    createdAt: new Date(),
  })
}

// Initialize seed data
seedData()

// Helper for filtering and finding
type WhereClause<T> =
  | Partial<T>
  | {
      [K in keyof T]?: T[K] | { not?: T[K]; contains?: string; in?: T[K][] }
    }
  | {
      OR?: WhereClause<T>[]
      AND?: WhereClause<T>[]
    }

function matchesWhere<T>(item: T, where: WhereClause<T>): boolean {
  // Handle OR clause
  if ("OR" in where && Array.isArray(where.OR)) {
    return where.OR.some((condition) => matchesWhere(item, condition as WhereClause<T>))
  }

  // Handle AND clause
  if ("AND" in where && Array.isArray(where.AND)) {
    return where.AND.every((condition) => matchesWhere(item, condition as WhereClause<T>))
  }

  for (const [key, condition] of Object.entries(where)) {
    // Skip OR/AND as they're handled above
    if (key === "OR" || key === "AND") continue

    const itemValue = (item as Record<string, unknown>)[key]

    if (condition === null || condition === undefined) {
      if (itemValue !== condition) return false
      continue
    }

    if (typeof condition === "object" && condition !== null) {
      if ("not" in condition) {
        if (itemValue === condition.not) return false
      }
      if ("contains" in condition) {
        if (
          typeof itemValue !== "string" ||
          !itemValue.toLowerCase().includes((condition.contains as string).toLowerCase())
        )
          return false
      }
      if ("in" in condition) {
        if (!Array.isArray(condition.in) || !condition.in.includes(itemValue)) return false
      }
    } else {
      if (itemValue !== condition) return false
    }
  }
  return true
}

// Create Prisma-like API
function createModel<T extends { id: string }>(storeName: keyof typeof store) {
  const getStore = () => store[storeName] as Map<string, T>

  return {
    async findUnique(args: {
      where: { id?: string; token?: string; key?: string; email?: string; userId?: string }
      include?: Record<string, boolean>
    }): Promise<T | null> {
      const items = getStore()
      let found: T | null = null

      if (args.where.id) {
        found = items.get(args.where.id) || null
      } else if (args.where.token) {
        for (const item of items.values()) {
          if ((item as unknown as { token?: string }).token === args.where.token) {
            found = item
            break
          }
        }
      } else if (args.where.email) {
        for (const item of items.values()) {
          const userItem = item as unknown as { email?: string }
          if (userItem.email === args.where.email) {
            found = item
            break
          }
        }
      } else if (args.where.key) {
        for (const item of items.values()) {
          if ((item as unknown as { key?: string }).key === args.where.key) {
            found = item
            break
          }
        }
      } else if (args.where.userId) {
        for (const item of items.values()) {
          if ((item as unknown as { userId?: string }).userId === args.where.userId) {
            found = item
            break
          }
        }
      }

      if (found && args.include) {
        found = { ...found }
        await resolveIncludes(found as Record<string, unknown>, args.include)
      }

      return found
    },

    async findFirst(args?: {
      where?: WhereClause<T>
      include?: Record<string, boolean>
      orderBy?: Record<string, "asc" | "desc">
    }): Promise<T | null> {
      const items = Array.from(getStore().values())
      const filtered = args?.where ? items.filter((item) => matchesWhere(item, args.where!)) : items

      if (args?.orderBy) {
        const [key, order] = Object.entries(args.orderBy)[0]
        filtered.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[key]
          const bVal = (b as Record<string, unknown>)[key]
          if (aVal instanceof Date && bVal instanceof Date) {
            return order === "asc" ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime()
          }
          return 0
        })
      }

      const found = filtered[0] || null

      if (found && args?.include) {
        const result = { ...found }
        await resolveIncludes(result as Record<string, unknown>, args.include)
        return result
      }

      return found
    },

    async findMany(args?: {
      where?: WhereClause<T>
      include?: Record<string, boolean>
      orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[]
      take?: number
      skip?: number
    }): Promise<T[]> {
      let items = Array.from(getStore().values())

      if (args?.where) {
        items = items.filter((item) => matchesWhere(item, args.where!))
      }

      if (args?.orderBy) {
        const orderBys = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy]
        items.sort((a, b) => {
          for (const orderBy of orderBys) {
            const [key, order] = Object.entries(orderBy)[0]
            const aVal = (a as Record<string, unknown>)[key]
            const bVal = (b as Record<string, unknown>)[key]
            if (aVal instanceof Date && bVal instanceof Date) {
              const diff = order === "asc" ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime()
              if (diff !== 0) return diff
            } else if (typeof aVal === "string" && typeof bVal === "string") {
              const diff = order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
              if (diff !== 0) return diff
            } else if (typeof aVal === "number" && typeof bVal === "number") {
              const diff = order === "asc" ? aVal - bVal : bVal - aVal
              if (diff !== 0) return diff
            }
          }
          return 0
        })
      }

      if (args?.skip) {
        items = items.slice(args.skip)
      }

      if (args?.take) {
        items = items.slice(0, args.take)
      }

      if (args?.include) {
        items = await Promise.all(
          items.map(async (item) => {
            const result = { ...item }
            await resolveIncludes(result as Record<string, unknown>, args.include!)
            return result
          }),
        )
      }

      return items
    },

    async create(args: { data: Omit<T, "id"> & { id?: string }; include?: Record<string, boolean> }): Promise<T> {
      const id = args.data.id || uuidv4()
      const item = { ...args.data, id } as T
      getStore().set(id, item)

      if (args.include) {
        const result = { ...item }
        await resolveIncludes(result as Record<string, unknown>, args.include)
        return result
      }

      return item
    },

    async update(args: { where: { id: string }; data: Partial<T>; include?: Record<string, boolean> }): Promise<T> {
      const items = getStore()
      const existing = items.get(args.where.id)
      if (!existing) throw new Error("Record not found")

      const updated = { ...existing, ...args.data } as T
      items.set(args.where.id, updated)

      if (args.include) {
        const result = { ...updated }
        await resolveIncludes(result as Record<string, unknown>, args.include)
        return result
      }

      return updated
    },

    async updateMany(args: { where: WhereClause<T>; data: Partial<T> }): Promise<{ count: number }> {
      const items = getStore()
      let count = 0

      for (const [id, item] of items.entries()) {
        if (matchesWhere(item, args.where)) {
          items.set(id, { ...item, ...args.data } as T)
          count++
        }
      }

      return { count }
    },

    async delete(args: { where: { id: string } }): Promise<T> {
      const items = getStore()
      const existing = items.get(args.where.id)
      if (!existing) throw new Error("Record not found")
      items.delete(args.where.id)
      return existing
    },

    async deleteMany(args?: { where?: WhereClause<T> }): Promise<{ count: number }> {
      const items = getStore()
      let count = 0

      if (args?.where) {
        for (const [id, item] of items.entries()) {
          if (matchesWhere(item, args.where)) {
            items.delete(id)
            count++
          }
        }
      } else {
        count = items.size
        items.clear()
      }

      return { count }
    },

    async count(args?: { where?: WhereClause<T> }): Promise<number> {
      if (!args?.where) return getStore().size

      let count = 0
      for (const item of getStore().values()) {
        if (matchesWhere(item, args.where)) count++
      }
      return count
    },

    async upsert(args: {
      where: { id?: string; email?: string; userId?: string }
      create: Omit<T, "id"> & { id?: string }
      update: Partial<T>
      include?: Record<string, boolean>
    }): Promise<T> {
      const items = getStore()
      let existing: T | null = null

      for (const item of items.values()) {
        if (matchesWhere(item, args.where as WhereClause<T>)) {
          existing = item
          break
        }
      }

      if (existing) {
        const updated = { ...existing, ...args.update } as T
        items.set(existing.id, updated)

        if (args.include) {
          const result = { ...updated }
          await resolveIncludes(result as Record<string, unknown>, args.include)
          return result
        }

        return updated
      } else {
        const id = args.create.id || uuidv4()
        const item = { ...args.create, id } as T
        items.set(id, item)

        if (args.include) {
          const result = { ...item }
          await resolveIncludes(result as Record<string, unknown>, args.include)
          return result
        }

        return item
      }
    },
  }
}

// Resolve includes by fetching related data
async function resolveIncludes(
  item: Record<string, unknown>,
  includes: Record<string, boolean | { include?: Record<string, boolean> }>,
) {
  for (const [key, value] of Object.entries(includes)) {
    if (!value) continue

    const nestedInclude = typeof value === "object" ? value.include : undefined

    switch (key) {
      case "user":
        if (item.userId) {
          const user = store.users.get(item.userId as string)
          item.user = user || null
        }
        break
      case "createdBy":
        if (item.createdById) {
          const user = store.users.get(item.createdById as string)
          item.createdBy = user || null
        }
        break
      case "enabledBy":
        if (item.enabledById) {
          const user = store.users.get(item.enabledById as string)
          item.enabledBy = user || null
        }
        break
      case "reviewedBy":
        if (item.reviewedById) {
          const user = store.users.get(item.reviewedById as string)
          item.reviewedBy = user || null
        }
        break
      case "submittedBy":
        if (item.submittedById) {
          const user = store.users.get(item.submittedById as string)
          item.submittedBy = user || null
        }
        break
      case "targetUser":
        if (item.targetUserId) {
          const user = store.users.get(item.targetUserId as string)
          item.targetUser = user || null
        }
        break
      case "targetLicense":
        if (item.targetLicenseId) {
          const license = store.licenses.get(item.targetLicenseId as string)
          item.targetLicense = license || null
        }
        break
      case "reseller":
        if (item.resellerId) {
          const reseller = store.resellers.get(item.resellerId as string)
          if (reseller && nestedInclude?.user) {
            const user = store.users.get(reseller.userId)
            item.reseller = { ...reseller, user: user || null }
          } else {
            item.reseller = reseller || null
          }
        }
        break
      case "release":
        if (item.releaseId) {
          const release = store.releases.get(item.releaseId as string)
          item.release = release || null
        }
        break
      case "licenses":
        const licenses: License[] = []
        for (const license of store.licenses.values()) {
          if (license.userId === item.id || license.resellerId === item.id) {
            licenses.push(license)
          }
        }
        item.licenses = licenses
        break
    }
  }
}

// Export Prisma-like client
export const prisma = {
  user: createModel<User>("users"),
  session: createModel<Session>("sessions"),
  license: createModel<License>("licenses"),
  reseller: createModel<Reseller>("resellers"),
  walletTransaction: createModel<WalletTransaction>("walletTransactions"),
  release: createModel<Release>("releases"),
  download: createModel<Download>("downloads"),
  appeal: createModel<Appeal>("appeals"),
  auditLog: createModel<AuditLog>("auditLogs"),
  notification: createModel<Notification>("notifications"),
  killSwitch: createModel<KillSwitch>("killSwitch"),
}
