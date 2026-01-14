"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, Zap, Shield, Lock, Users } from "lucide-react"

interface DemoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vision Platform Demo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Demo Video Placeholder */}
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/30 aspect-video flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 text-primary fill-primary" />
              </div>
              <p className="text-muted-foreground">Dashboard Overview Video</p>
              <p className="text-xs text-muted-foreground">Click to play (demo)</p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Lightning Fast Performance</h4>
                  <p className="text-xs text-muted-foreground">Execute commands and manage your projects with blazing fast speed</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Enterprise Security</h4>
                  <p className="text-xs text-muted-foreground">Bank-level encryption protects all your data at all times</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Advanced Licensing</h4>
                  <p className="text-xs text-muted-foreground">Flexible license management for personal and team use</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Team Collaboration</h4>
                  <p className="text-xs text-muted-foreground">Work together seamlessly with built-in collaboration features</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <p className="text-muted-foreground"><span className="text-foreground font-medium">Dashboard</span>: Monitor your executor status and analytics in real-time</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <p className="text-muted-foreground"><span className="text-foreground font-medium">Downloads</span>: Access all versions with one-click downloads</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <p className="text-muted-foreground"><span className="text-foreground font-medium">Licenses</span>: Manage your keys and licenses effortlessly</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <p className="text-muted-foreground"><span className="text-foreground font-medium">Admin Tools</span>: Complete control with advanced management features</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Start Free Trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
