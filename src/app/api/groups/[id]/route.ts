import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        select: {
          id: true,
          role: true,
          user_id: true,
          is_location_shared: true,
          user: {
            select: {
              id: true,
              display_name: true,
              location: {
                select: {
                  world_id: true,
                  world_name: true,
                  instance_id: true,
                  is_hidden: true,
                  updated_at: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 })
  }

  // Check if user is a member
  const currentUserId = session.user!.id
  const isMember = group.memberships.some((m) => m.user_id === currentUserId)
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Filter location data based on is_location_shared and is_hidden
  const sanitizedGroup = {
    ...group,
    memberships: group.memberships.map((m) => {
      const isOwnLocation = m.user_id === currentUserId
      const shouldShowLocation = isOwnLocation || (m.is_location_shared && !m.user.location?.is_hidden)

      return {
        ...m,
        user: {
          ...m.user,
          location: shouldShowLocation ? m.user.location : null,
        },
      }
    }),
  }

  return NextResponse.json({ group: sanitizedGroup })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { name } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  // Check if user is an admin
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
    const group = await prisma.group.update({
      where: { id },
      data: { name },
    })
    return NextResponse.json(group)
  } catch (error) {
    console.error("Group update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Only owner can delete group
  const group = await prisma.group.findUnique({
    where: { id },
    select: { owner_id: true },
  })

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 })
  }

  if (group.owner_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await prisma.group.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Group deletion error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
