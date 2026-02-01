import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const group = await prisma.group.create({
      data: {
        name,
        owner_id: session.user!.id,
        memberships: {
          create: {
            user_id: session.user!.id,
            role: "admin",
          },
        },
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("Group creation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const groups = await prisma.group.findMany({
    where: {
      memberships: {
        some: {
          user_id: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: { memberships: true },
      },
    },
  })

  return NextResponse.json(groups)
}
