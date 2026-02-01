import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Check if user is an admin or owner of the group
  const membership = await prisma.membership.findUnique({
    where: {
      group_id_user_id: {
        group_id: id,
        user_id: session.user.id,
      },
    },
  })

  if (!membership || membership.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const token = nanoid(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const inviteToken = await prisma.inviteToken.create({
      data: {
        token,
        group_id: id,
        expires,
      },
    })

    return NextResponse.json({ token: inviteToken.token, expires: inviteToken.expires })
  } catch (error) {
    console.error("Invite token generation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
