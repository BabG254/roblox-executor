"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
              <p>By accessing and using vision, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Use License</h3>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on vision for personal, non-commercial transitory viewing only.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Disclaimer</h3>
              <p>The materials on vision are provided on an 'as is' basis. vision makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Limitations</h3>
              <p>In no event shall vision or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on vision.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Accuracy of Materials</h3>
              <p>The materials appearing on vision could include technical, typographical, or photographic errors. vision does not warrant that any of the materials on vision are accurate, complete, or current.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Links</h3>
              <p>vision has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by vision of the site. Use of any such linked website is at the user's own risk.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Modifications</h3>
              <p>vision may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Governing Law</h3>
              <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which vision operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            </section>
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
            I Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
