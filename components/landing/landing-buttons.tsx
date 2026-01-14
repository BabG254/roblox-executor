"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemoModal } from "./demo-modal"
import { TermsModal } from "./terms-modal"
import { PrivacyModal } from "./privacy-modal"

export function LandingButtons() {
  const [demoOpen, setDemoOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <>
      <Button size="lg" variant="outline" onClick={() => setDemoOpen(true)} className="text-base">
        View Demo
      </Button>
      
      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      
      {/* Export state setters for footer use */}
      <div style={{ display: 'none' }} data-terms-open={termsOpen} data-privacy-open={privacyOpen} />
    </>
  )
}

export function FooterLinks() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setTermsOpen(true)}
        className="text-primary hover:underline"
      >
        Terms of Service
      </button>
      <button
        onClick={() => setPrivacyOpen(true)}
        className="text-primary hover:underline"
      >
        Privacy Policy
      </button>
      
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  )
}
