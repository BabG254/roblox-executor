import { NextRequest, NextResponse } from "next/server"
import { getDownloadLink, recordDownload } from "@/lib/downloads"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const { code } = params
  const session = await getSession()
  const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    // Get the download link
    const result = await getDownloadLink(code)

    if (result.error) {
      // Handle service unavailable (migration not run yet)
      if (result.status === 503) {
        return NextResponse.json(
          { error: "Download service is temporarily unavailable. Please contact support." },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 404 }
      )
    }

    const { downloadLink } = result
    
    if (!downloadLink) {
      return NextResponse.json(
        { error: "Invalid download link" },
        { status: 404 }
      )
    }

    // If user is authenticated, record the download
    if (session) {
      try {
        // Get the user's license for this release
        const { prisma } = await import("@/lib/db")
        const license = await prisma.licenseKey.findFirst({
          where: {
            userId: session.id,
            status: "REDEEMED",
          },
        })

        if (license) {
          await recordDownload(code, session.id, license.id, ipAddress).catch(err => {
            console.error("Error recording download:", err)
            // Continue with download even if tracking fails
          })
          
          // Log the download
          const { logAudit } = await import("@/lib/audit")
          await logAudit(
            "DOWNLOAD",
            "SoftwareRelease",
            downloadLink.releaseId,
            `Downloaded via link: ${code}`,
            session.id,
            undefined,
            ipAddress
          ).catch(err => {
            console.error("Error logging audit:", err)
            // Continue with download even if audit fails
          })
        }
      } catch (error) {
        console.error("Error processing user session:", error)
        // Continue with download even if user tracking fails
      }
    }

    // Return the actual download URL (redirect or proxy)
    return NextResponse.redirect(downloadLink.downloadUrl, {
      status: 302,
      headers: {
        "Content-Disposition": `attachment; filename="vision-${downloadLink.release.version}.zip"`,
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Failed to process download. Please try again or contact support." },
      { status: 500 }
    )
  }
}
