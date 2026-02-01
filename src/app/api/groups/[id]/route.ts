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
        include: {
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
  const isMember = group.memberships.some((m: any) => m.user_id === session.user!.id)
  if (!isMember) {
    // Only return limited info for non-members (for invite screen)
    return NextResponse.json({ 
      group: {
        id: group.id,
        name: group.name,
        invite_code: group.invite_code
      }
    })
  }

  return NextResponse.json({ group })
}
