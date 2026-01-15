import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export type UserRole = "OWNER" | "ADMIN" | "RESELLER" | "USER"

export interface SessionUser {
  id: string
  email: string
  username: string
  role: UserRole
}

const SESSION_COOKIE_NAME = "session_token"
const SESSION_DURATION_DAYS = 7

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return token
}

export async function getSessionFromToken(token: string): Promise<{ userId: string; user: SessionUser } | null> {
  if (!token) return null
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  if (!session.user.isActive) return null

  return {
    userId: session.user.id,
    user: {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      role: session.user.role as UserRole,
    },
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  if (!session.user.isActive) return null

  return {
    id: session.user.id,
    email: session.user.email,
    username: session.user.username,
    role: session.user.role as UserRole,
  }
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/dashboard")
  }

  return session
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function forceLogoutUser(userId: string) {
  await prisma.session.deleteMany({ where: { userId } })
}

export function canManageUsers(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export function canManageResellers(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export function canManageLicenses(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export function canManageReleases(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export function canAccessKillSwitch(role: UserRole): boolean {
  return role === "OWNER"
}
