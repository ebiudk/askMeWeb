import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: groupId } = await params
  const { is_location_shared } = await req.json()

  if (typeof is_location_shared !== "boolean") {
    return NextResponse.json({ error: "is_location_shared must be a boolean" }, { status: 400 })
  }

  try {
    const membership = await prisma.membership.update({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: session.user.id,
        },
      },
      data: {
        is_location_shared,
      },
    })

    return NextResponse.json(membership)
  } catch (error) {
    console.error("Membership update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
