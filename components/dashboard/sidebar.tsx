"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/auth"
import {
  LayoutDashboard,
  Key,
  Users,
  Package,
  Download,
  Settings,
  Wallet,
  ShieldAlert,
  FileText,
  Bell,
  LogOut,
  ChevronLeft,
  AlertTriangle,
  History,
  UserCog,
  Zap,
  Megaphone,
  Menu,
  X,
} from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/(auth)/actions"
import { toast } from "sonner"

interface SidebarProps {
  role: UserRole
  username: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
  badge?: string
  badgeColor?: string
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN", "RESELLER", "USER"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Resellers",
    href: "/dashboard/resellers",
    icon: <UserCog className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "License Keys",
    href: "/dashboard/keys",
    icon: <Key className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Releases",
    href: "/dashboard/releases",
    icon: <Package className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Appeals",
    href: "/dashboard/appeals",
    icon: <FileText className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Broadcast",
    href: "/dashboard/broadcast",
    icon: <Megaphone className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: <History className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Kill Switch",
    href: "/dashboard/kill-switch",
    icon: <ShieldAlert className="w-5 h-5" />,
    roles: ["OWNER"],
    badge: "Critical",
    badgeColor: "bg-destructive",
  },
  {
    label: "Wallet",
    href: "/dashboard/wallet",
    icon: <Wallet className="w-5 h-5" />,
    roles: ["RESELLER"],
  },
  {
    label: "My Keys",
    href: "/dashboard/my-keys",
    icon: <Key className="w-5 h-5" />,
    roles: ["RESELLER"],
  },
  {
    label: "Submit Appeal",
    href: "/dashboard/submit-appeal",
    icon: <AlertTriangle className="w-5 h-5" />,
    roles: ["RESELLER"],
  },
  {
    label: "My License",
    href: "/dashboard/license",
    icon: <Key className="w-5 h-5" />,
    roles: ["USER"],
  },
  {
    label: "Downloads",
    href: "/dashboard/downloads",
    icon: <Download className="w-5 h-5" />,
    roles: ["USER"],
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: <Bell className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN", "RESELLER", "USER"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["OWNER", "ADMIN", "RESELLER", "USER"],
  },
]

const roleColors: Record<UserRole, string> = {
  OWNER: "text-purple-400",
  ADMIN: "text-violet-400",
  RESELLER: "text-amber-400",
  USER: "text-blue-400",
}

const roleBgColors: Record<UserRole, string> = {
  OWNER: "bg-purple-500/10",
  ADMIN: "bg-violet-500/10",
  RESELLER: "bg-amber-500/10",
  USER: "bg-blue-500/10",
}

export function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredItems = navItems.filter((item) => item.roles.includes(role))

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      toast.success("Logged out successfully")
      router.replace("/login")
    })
  }

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden bg-card border border-border/60"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 h-full bg-card border-r border-border transition-all duration-200 transform",
          collapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72",
          "md:translate-x-0",
        )}
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="vision Logo" className="w-full h-full object-contain p-1" />
            </div>
            {!collapsed && <span className="text-xl font-bold text-foreground">vision</span>}
          </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground md:hidden"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="text-muted-foreground hover:text-foreground hidden md:inline-flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft className={cn("w-5 h-5 transition-transform duration-200", collapsed && "rotate-180")} />
              </Button>
            </div>
        </div>

        {/* User Info */}
        <div className={cn("p-4 border-b border-border", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", roleBgColors[role])}>
              <span className={cn("text-sm font-semibold", roleColors[role])}>{username.charAt(0).toUpperCase()}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{username}</p>
                <p className={cn("text-xs", roleColors[role])}>{role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 min-h-10",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  collapsed && "justify-center px-0",
                )}
              >
                <div className={cn("shrink-0 flex items-center justify-center", collapsed && "w-full")}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-full whitespace-nowrap",
                          item.badgeColor || "bg-primary/20 text-primary",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isPending}
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              collapsed ? "px-2" : "justify-start",
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">{isPending ? "Logging out..." : "Logout"}</span>}
          </Button>
        </div>
      </div>
      </aside>
    </>
  )
}
