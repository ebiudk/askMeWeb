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
    if (memberId === session.user.id) {
      return false // Cannot change own role
    }

    if (myRole === "admin") {
      // Admin can change anyone's role
      return true
    }
    if (myRole === "co-admin") {
      // Co-admin can manage members (promote to co-admin or demote from co-admin)
      // They cannot change an admin's role, and cannot promote someone to admin
      return targetRole !== "admin" && role !== "admin"
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: groupId, memberId } = await params

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

  // Permission checks for removal
  const canRemove = (myRole: string, targetRole: string) => {
    if (memberId === session.user.id) {
      return true // Users can always leave the group themselves
    }

    if (myRole === "admin") {
      // Admin can remove anyone except perhaps they should use a different flow to transfer ownership or delete group
      // But for simple removal, let's allow it unless it's themselves (already handled)
      return true
    }
    if (myRole === "co-admin") {
      // Co-admin can only remove members
      return targetRole === "member"
    }
    return false
  }

  if (!canRemove(myMembership.role, targetMembership.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  // Cannot remove the owner
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { owner_id: true },
  })

  if (memberId === group?.owner_id) {
    return NextResponse.json({ error: "Cannot remove the group owner" }, { status: 403 })
  }

  await prisma.membership.delete({
    where: {
      id: targetMembership.id,
    },
  })

  return NextResponse.json({ success: true })
}
