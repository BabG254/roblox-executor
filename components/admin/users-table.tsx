"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, MoreHorizontal, Shield, ShieldOff, LogOut, UserX, UserCheck, Users } from "lucide-react"
import { toast } from "sonner"
import type { UserRole } from "@/lib/auth"
import { toggleUserStatus, forceLogoutUserAction, updateUserRole } from "@/app/dashboard/users/actions"

interface User {
  id: string
  email: string
  username: string
  role: string
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date | null
  licenses: { id: string }[]
  reseller: { id: string } | null
}

interface UsersTableProps {
  users: User[]
  currentUserRole: UserRole
}

const roleColors: Record<string, string> = {
  OWNER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ADMIN: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  RESELLER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  USER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

export function UsersTable({ users, currentUserRole }: UsersTableProps) {
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<"toggle" | "logout" | "role" | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleAction() {
    if (!selectedUser || !actionType) return
    setIsLoading(true)

    try {
      if (actionType === "toggle") {
        await toggleUserStatus(selectedUser.id, !selectedUser.isActive)
        toast.success(`User ${selectedUser.isActive ? "deactivated" : "activated"} successfully`)
      } else if (actionType === "logout") {
        await forceLogoutUserAction(selectedUser.id)
        toast.success("User logged out successfully")
      } else if (actionType === "role" && selectedRole) {
        await updateUserRole(selectedUser.id, selectedRole)
        toast.success(`User role updated to ${selectedRole}`)
      }
    } catch {
      toast.error("Action failed")
    } finally {
      setIsLoading(false)
      setSelectedUser(null)
      setActionType(null)
      setSelectedRole("")
    }
  }

  return (
    <>
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">License</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Login</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={user.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {user.licenses.length > 0 ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Licensed
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType("toggle")
                            }}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType("logout")
                            }}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Force Logout
                          </DropdownMenuItem>
                          {currentUserRole === "OWNER" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setActionType("role")
                                }}
                              >
                                {user.role === "ADMIN" || user.role === "OWNER" ? (
                                  <>
                                    <ShieldOff className="w-4 h-4 mr-2" />
                                    Demote User
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Change Role
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <Dialog open={!!selectedUser && actionType === "toggle"} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>{selectedUser?.isActive ? "Deactivate User" : "Activate User"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedUser?.isActive ? "deactivate" : "activate"}{" "}
              <strong>{selectedUser?.username}</strong>?
              {selectedUser?.isActive &&
                " They will lose access to all features and their sessions will be terminated."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isActive ? "destructive" : "default"}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : selectedUser?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser && actionType === "logout"} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Force Logout User</DialogTitle>
            <DialogDescription>
              This will terminate all active sessions for <strong>{selectedUser?.username}</strong>. They will need to
              log in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={isLoading}>
              {isLoading ? "Processing..." : "Force Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser && actionType === "role"} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {["USER", "RESELLER", "ADMIN"].map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                onClick={() => setSelectedRole(role)}
                className="justify-start"
              >
                <Badge variant="outline" className={`mr-2 ${roleColors[role]}`}>
                  {role}
                </Badge>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={isLoading || !selectedRole}>
              {isLoading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
