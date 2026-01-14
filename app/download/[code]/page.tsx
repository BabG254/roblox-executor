"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Download, AlertCircle, CheckCircle } from "lucide-react"

export default function DownloadPage() {
  const params = useParams()
  const code = params.code as string
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")

  useEffect(() => {
    if (!code) return

    const fetchDownload = async () => {
      try {
        const response = await fetch(`/api/download/${code}`)

        if (!response.ok) {
          if (response.status === 404) {
            setMessage("Download link not found")
          } else if (response.status === 410) {
            setMessage("Download link has expired")
          } else {
            setMessage("Failed to process download")
          }
          setStatus("error")
          return
        }

        // Get the redirect URL
        const finalUrl = response.url
        setDownloadUrl(finalUrl)
        setStatus("success")
        setMessage("Your download is starting...")

        // Auto-redirect after a short delay
        setTimeout(() => {
          window.location.href = finalUrl
        }, 2000)
      } catch (error) {
        console.error("Download error:", error)
        setMessage("An error occurred while processing your download")
        setStatus("error")
      }
    }

    fetchDownload()
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary/50 via-secondary/30 to-secondary/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-secondary/60 to-secondary/40 backdrop-blur-xl shadow-2xl p-8 space-y-6 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Preparing Download</h1>
                <p className="text-muted-foreground">Please wait while we prepare your file...</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Download Starting</h1>
                <p className="text-muted-foreground mb-4">{message}</p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Click here if download doesn't start
                  </a>
                )}
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Download Error</h1>
                <p className="text-muted-foreground mb-4">{message}</p>
                <a
                  href="/downloads"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all"
                >
                  Back to Downloads
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
