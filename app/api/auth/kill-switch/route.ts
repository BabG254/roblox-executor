import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const killSwitch = await prisma.killSwitch.findFirst()

    if (!killSwitch) {
      return NextResponse.json({
        enabled: false,
        message: "",
      })
    }

    return NextResponse.json({
      enabled: killSwitch.enabled,
      message: killSwitch.message || "",
    })
  } catch (error) {
    console.error("Kill switch error:", error)
    return NextResponse.json({
      enabled: false,
      message: "",
    })
  }
}
