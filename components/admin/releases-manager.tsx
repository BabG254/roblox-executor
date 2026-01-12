"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Package, Plus, Download, Globe, Eye, EyeOff, Star } from "lucide-react"
import { toast } from "sonner"
import { createReleaseAction, togglePublishAction, setLatestAction } from "@/app/dashboard/releases/actions"

interface Release {
  id: string
  version: string
  changelog: string
  downloadUrl: string
  fileSize: number | null
  isPublished: boolean
  isLatest: boolean
  createdAt: Date
  publishedAt: Date | null
  _count: { downloads: number }
}

interface ReleasesManagerProps {
  releases: Release[]
}

export function ReleasesManager({ releases }: ReleasesManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  async function handleCreateRelease(formData: FormData) {
    setIsCreating(true)
    try {
      const result = await createReleaseAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Release created successfully")
        setCreateDialogOpen(false)
      }
    } catch {
      toast.error("Failed to create release")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleTogglePublish(releaseId: string, isPublished: boolean) {
    try {
      await togglePublishAction(releaseId, !isPublished)
      toast.success(`Release ${isPublished ? "unpublished" : "published"}`)
    } catch {
      toast.error("Failed to update release")
    }
  }

  async function handleSetLatest(releaseId: string) {
    try {
      await setLatestAction(releaseId)
      toast.success("Latest release updated")
    } catch {
      toast.error("Failed to set as latest")
    }
  }

  const latestRelease = releases.find((r) => r.isLatest)
  const totalDownloads = releases.reduce((acc, r) => acc + r._count.downloads, 0)

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Releases</p>
            <p className="text-2xl font-bold text-foreground">{releases.length}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Latest Version</p>
            <p className="text-2xl font-bold text-primary">{latestRelease?.version || "None"}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Downloads</p>
            <p className="text-2xl font-bold text-green-400">{totalDownloads}</p>
          </CardContent>
        </Card>
      </div>

      {/* Releases List */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              All Releases
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Release
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border/50">
                <DialogHeader>
                  <DialogTitle>Create New Release</DialogTitle>
                  <DialogDescription>Upload a new executor version.</DialogDescription>
                </DialogHeader>
                <form action={handleCreateRelease}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        name="version"
                        placeholder="v1.0.0"
                        required
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="changelog">Changelog</Label>
                      <Textarea
                        id="changelog"
                        name="changelog"
                        placeholder="What's new in this release..."
                        required
                        className="bg-secondary/50 border-border/50 min-h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downloadUrl">Download URL</Label>
                      <Input
                        id="downloadUrl"
                        name="downloadUrl"
                        placeholder="https://..."
                        required
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fileSize">File Size (bytes)</Label>
                      <Input
                        id="fileSize"
                        name="fileSize"
                        type="number"
                        placeholder="Optional"
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Release"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {releases.map((release) => (
              <div
                key={release.id}
                className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-foreground">{release.version}</span>
                      {release.isLatest && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Star className="w-3 h-3 mr-1" />
                          Latest
                        </Badge>
                      )}
                      {release.isPublished ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                          <Globe className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{release.changelog}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {release._count.downloads} downloads
                      </span>
                      <span>Created {new Date(release.createdAt).toLocaleDateString()}</span>
                      {release.fileSize && <span>{(release.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(release.id, release.isPublished)}
                    >
                      {release.isPublished ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    {!release.isLatest && release.isPublished && (
                      <Button variant="secondary" size="sm" onClick={() => handleSetLatest(release.id)}>
                        <Star className="w-4 h-4 mr-1" />
                        Set Latest
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {releases.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No releases yet. Create your first release!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
