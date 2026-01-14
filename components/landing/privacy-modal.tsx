"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Information We Collect</h3>
              <p>We collect information you provide directly to us, such as when you create an account, including your name, email address, and password.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. How We Use Your Information</h3>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional and promotional communications, and comply with legal obligations.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Information Sharing</h3>
              <p>We do not share, sell, or rent your personal information to third parties without your consent, except as required by law or as necessary to provide our services.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Your Rights</h3>
              <p>You have the right to access, update, or delete your personal information. You can do this by accessing your account settings or contacting us directly.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Cookies</h3>
              <p>We use cookies to enhance your experience on our platform. You can control cookie settings through your browser preferences.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Changes to Privacy Policy</h3>
              <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the date at the top of this policy.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Contact Us</h3>
              <p>If you have any questions about our Privacy Policy, please contact us at privacy@vision.app</p>
            </section>
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
