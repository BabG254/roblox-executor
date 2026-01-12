"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Package, Shield, AlertTriangle, Key, Star, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import { recordDownloadAction } from "@/app/dashboard/downloads/actions"
import Link from "next/link"

interface Release {
  id: string
  version: string
  changelog: string
  downloadUrl: string
  fileSize: number | null
  isLatest: boolean
  createdAt: Date
  publishedAt: Date | null
}

interface License {
  id: string
  expiresAt: Date
}

interface UserDownload {
  id: string
  downloadedAt: Date
  release: { version: string }
}

interface DownloadsPageProps {
  releases: Release[]
  license: License | null
  killSwitchEnabled: boolean
  userDownloads: UserDownload[]
  userId: string
}

export function DownloadsPage({ releases, license, killSwitchEnabled, userDownloads, userId }: DownloadsPageProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const canDownload = license && !killSwitchEnabled

  async function handleDownload(release: Release) {
    if (!canDownload || !license) {
      toast.error("You need an active license to download")
      return
    }

    setDownloadingId(release.id)
    try {
      await recordDownloadAction(release.id, license.id, userId)
      // In a real app, this would trigger the actual download
      window.open(release.downloadUrl, "_blank")
      toast.success(`Downloading ${release.version}`)
    } catch {
      toast.error("Failed to initiate download")
    } finally {
      setDownloadingId(null)
    }
  }

  const latestRelease = releases.find((r) => r.isLatest)

  return (
    <>
      {/* Status Alerts */}
      {killSwitchEnabled && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive">Downloads Disabled</h3>
              <p className="text-sm text-destructive/80">
                The executor is currently disabled for maintenance. Please check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!license && !killSwitchEnabled && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-400">License Required</h3>
                <p className="text-sm text-amber-400/80">You need an active license to download the executor.</p>
              </div>
            </div>
            <Link href="/dashboard/license">
              <Button
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent"
              >
                <Key className="w-4 h-4 mr-2" />
                Redeem Key
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Latest Release Featured */}
      {latestRelease && (
        <Card className="glass border-primary/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Star className="w-3 h-3 mr-1" />
                    Latest Release
                  </Badge>
                  <span className="text-2xl font-bold text-foreground">{latestRelease.version}</span>
                </div>
                <p className="text-muted-foreground mb-4 line-clamp-2">{latestRelease.changelog}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {latestRelease.publishedAt
                      ? new Date(latestRelease.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </span>
                  {latestRelease.fileSize && <span>{(latestRelease.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => handleDownload(latestRelease)}
                disabled={!canDownload || downloadingId === latestRelease.id}
                className="shrink-0"
              >
                {downloadingId === latestRelease.id ? (
                  "Downloading..."
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* All Versions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              All Versions
            </CardTitle>
            <CardDescription>Download previous versions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {releases.length > 0 ? (
                releases.map((release) => (
                  <div
                    key={release.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{release.version}</span>
                        {release.isLatest && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : "Draft"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(release)}
                      disabled={!canDownload || downloadingId === release.id}
                    >
                      {downloadingId === release.id ? (
                        "..."
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No releases available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Download History */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Download History
            </CardTitle>
            <CardDescription>Your recent downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userDownloads.length > 0 ? (
                userDownloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{download.release.version}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(download.downloadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No download history</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
