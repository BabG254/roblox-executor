"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Package, Shield, AlertTriangle, Key, Star, Clock, FileText, CheckCircle2, Copy } from "lucide-react"
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
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive mb-1">Downloads Disabled</h3>
              <p className="text-sm text-destructive/80">
                The executor is currently disabled for maintenance. Please check back later.
              </p>
            </div>
          </div>
        </div>
      )}

      {!license && !killSwitchEnabled && (
        <div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-1">License Required</h3>
                <p className="text-sm text-amber-400/80">You need an active license to download the executor.</p>
              </div>
            </div>
            <Link href="/dashboard/license" className="flex-shrink-0">
              <Button
                className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50"
              >
                <Key className="w-4 h-4 mr-2" />
                Redeem Key
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Latest Release Featured */}
      {latestRelease && (
        <div className="rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-0" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-primary/30 text-primary border-primary/50 px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Latest Release
                  </Badge>
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {latestRelease.version}
                  </span>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-xl">{latestRelease.changelog}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {latestRelease.publishedAt
                      ? new Date(latestRelease.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </span>
                  {latestRelease.fileSize && (
                    <span className="text-muted-foreground">
                      {(latestRelease.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                  {canDownload && (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to download
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => handleDownload(latestRelease)}
                disabled={!canDownload || downloadingId === latestRelease.id}
                className="bg-primary hover:bg-primary/90 text-white font-medium shrink-0"
              >
                {downloadingId === latestRelease.id ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* All Versions */}
        <div className="rounded-2xl border border-border/50 bg-secondary/30 backdrop-blur p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">All Versions</h2>
              <p className="text-sm text-muted-foreground">Download previous versions</p>
            </div>
          </div>
          <div className="space-y-3">
            {releases.length > 0 ? (
              releases.map((release) => (
                <div
                  key={release.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-foreground">{release.version}</span>
                      {release.isLatest && (
                        <Badge className="bg-primary/20 text-primary text-xs border-primary/30">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : "Draft"}
                      {release.fileSize && ` • ${(release.fileSize / 1024 / 1024).toFixed(2)} MB`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(release)}
                    disabled={!canDownload || downloadingId === release.id}
                    className="ml-4 flex-shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                  >
                    {downloadingId === release.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Download</span>
                      </>
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No releases available</p>
              </div>
            )}
          </div>
        </div>

        {/* Download History */}
        <div className="rounded-2xl border border-border/50 bg-secondary/30 backdrop-blur p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Download History</h2>
              <p className="text-sm text-muted-foreground">Your recent downloads</p>
            </div>
          </div>
          <div className="space-y-3">
            {userDownloads.length > 0 ? (
              userDownloads.map((download) => (
                <div
                  key={download.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{download.release.version}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(download.downloadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(download.release.version)
                      toast.success("Version copied")
                    }}
                    className="flex-shrink-0 group-hover:bg-primary/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No download history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
