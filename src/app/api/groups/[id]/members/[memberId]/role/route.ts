import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: groupId, memberId } = await params
  const { role } = await req.json()

  if (!["admin", "co-admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  // Get current user's membership
  const myMembership = await prisma.membership.findUnique({
    where: {
      group_id_user_id: {
        group_id: groupId,
        user_id: session.user.id,
      },
    },
  })

  if (!myMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get target user's membership
  const targetMembership = await prisma.membership.findUnique({
    where: {
      group_id_user_id: {
        group_id: groupId,
        user_id: memberId,
      },
    },
  })

  if (!targetMembership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  // Permission checks
  const canManage = (myRole: string, targetRole: string) => {
    if (myRole === "admin") {
      // Admin can change anyone's role (except their own is usually handled by ownership, but let's allow it for now or check if it's the owner)
      return true
    }
    if (myRole === "co-admin") {
      // Co-admin can only change role of "member"
      // And they can only set it to "co-admin" or "member"
      return targetRole === "member" && (role === "co-admin" || role === "member")
    }
    return false
  }

  if (!canManage(myMembership.role, targetMembership.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  // If the target is the owner, even the admin shouldn't change their role easily via this API
  // But Group model has owner_id, let's check it.
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { owner_id: true },
  })

  if (memberId === group?.owner_id && role !== "admin") {
    return NextResponse.json({ error: "Cannot demote the owner" }, { status: 403 })
  }

  const updatedMembership = await prisma.membership.update({
    where: {
      id: targetMembership.id,
    },
    data: {
      role: role,
    },
  })

  return NextResponse.json(updatedMembership)
}
