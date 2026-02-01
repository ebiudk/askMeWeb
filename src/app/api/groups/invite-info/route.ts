import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Invite token is required" }, { status: 400 })
  }

  try {
    const inviteToken = await prisma.inviteToken.findUnique({
      where: { token },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!inviteToken || inviteToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired invite token" }, { status: 404 })
    }

    return NextResponse.json({ group: inviteToken.group })
  } catch (error) {
    console.error("Invite info fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
