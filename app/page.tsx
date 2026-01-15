import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getSession()
  
  if (session) {
    redirect("/dashboard")
  }

  // Redirect to login for now - landing page coming soon
  redirect("/login")
}
