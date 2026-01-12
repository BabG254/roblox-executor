import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppealSubmission } from "@/components/reseller/appeal-submission"

export default async function SubmitAppealPage() {
  const session = await requireAuth(["RESELLER"])

  if (session.role !== "RESELLER") {
    redirect("/dashboard")
  }

  // Get users the reseller has issued keys to
  const reseller = await prisma.reseller.findUnique({
    where: { userId: session.id },
    include: {
      issuedKeys: {
        where: { status: "REDEEMED" },
        include: {
          license: {
            include: { user: true },
          },
        },
      },
    },
  })

  const resellerUsers =
    reseller?.issuedKeys
      .filter((k) => k.license?.user)
      .map((k) => k.license!.user)
      .filter((user, index, self) => self.findIndex((u) => u.id === user.id) === index) || []

  // Get existing appeals
  const appeals = await prisma.appeal.findMany({
    where: { submitterId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      targetUser: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Submit Appeal</h1>
        <p className="text-muted-foreground mt-1">Request user termination for policy violations</p>
      </div>
      <AppealSubmission users={resellerUsers} appeals={appeals} />
    </div>
  )
}
