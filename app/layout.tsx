import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "vision Dashboard",
  description: "Premium Roblox Executor Management Platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a12",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "oklch(0.13 0.01 260)",
              border: "1px solid oklch(0.22 0.01 260)",
              color: "oklch(0.95 0 0)",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
