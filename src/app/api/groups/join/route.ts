import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: "Invite token is required" }, { status: 400 })
    }

    const inviteToken = await prisma.inviteToken.findUnique({
      where: { token },
      include: { group: true },
    })

    if (!inviteToken || inviteToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired invite token" }, { status: 404 })
    }

    const group = inviteToken.group

    const membership = await prisma.membership.upsert({
      where: {
        group_id_user_id: {
          group_id: group.id,
          user_id: session.user!.id,
        },
      },
      update: {}, // Already a member, do nothing
      create: {
        group_id: group.id,
        user_id: session.user!.id,
        role: "member",
      },
    })

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error("Group join error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
