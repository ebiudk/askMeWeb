import { prisma } from "@/lib/prisma"
import { getInviteInfo } from "@/services/groupService"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Invite token is required" }, { status: 400 })
  }

  try {
    const group = await getInviteInfo(token)

    if (!group) {
      return NextResponse.json({ error: "Invalid or expired invite token" }, { status: 404 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error("Invite info fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
