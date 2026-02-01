import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { invite_code } = await req.json()
    if (!invite_code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { invite_code },
    })

    if (!group) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

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
