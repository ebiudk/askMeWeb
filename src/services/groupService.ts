import { prisma } from "@/lib/prisma"
import { Group } from "@/domain/models/Group"
import { User } from "@/domain/models/User"
import { Location } from "@/domain/models/Location"

export async function getInviteInfo(token: string) {
  if (!token) return null

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
      return null
    }

    return inviteToken.group
  } catch (error) {
    console.error("Error fetching invite info:", error)
    return null
  }
}

export async function getGroupById(id: string): Promise<Group | null> {
  const dbGroup = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          user: {
            include: {
              location: true,
            },
          },
        },
      },
    },
  })

  if (!dbGroup) return null

  return new Group({
    id: dbGroup.id,
    name: dbGroup.name,
    ownerId: dbGroup.owner_id,
    memberships: dbGroup.memberships.map((m) => ({
      userId: m.user_id,
      role: m.role,
      isLocationShared: m.is_location_shared,
      user: new User({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        displayName: m.user.display_name,
        apiKey: m.user.api_key,
        location: m.user.location
          ? new Location({
              worldId: m.user.location.world_id,
              worldName: m.user.location.world_name,
              instanceId: m.user.location.instance_id,
              isHidden: m.user.location.is_hidden,
              updatedAt: m.user.location.updated_at,
            })
          : undefined,
      }),
    })),
  })
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const dbGroups = await prisma.group.findMany({
    where: {
      memberships: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      memberships: {
        include: {
          user: {
            include: {
              location: true,
            },
          },
        },
      },
    },
  })

  return dbGroups.map(
    (dbGroup) =>
      new Group({
        id: dbGroup.id,
        name: dbGroup.name,
        ownerId: dbGroup.owner_id,
        memberships: dbGroup.memberships.map((m) => ({
          userId: m.user_id,
          role: m.role,
          isLocationShared: m.is_location_shared,
          user: new User({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            displayName: m.user.display_name,
            apiKey: m.user.api_key,
            location: m.user.location
              ? new Location({
                  worldId: m.user.location.world_id,
                  worldName: m.user.location.world_name,
                  instanceId: m.user.location.instance_id,
                  isHidden: m.user.location.is_hidden,
                  updatedAt: m.user.location.updated_at,
                })
              : undefined,
          }),
        })),
      })
  )
}

export async function createGroup(name: string, ownerId: string) {
  return await prisma.group.create({
    data: {
      name,
      owner_id: ownerId,
      memberships: {
        create: {
          user_id: ownerId,
          role: "admin",
        },
      },
    },
  })
}

export async function updateGroup(id: string, name: string) {
  return await prisma.group.update({
    where: { id },
    data: { name },
  })
}

export async function deleteGroup(id: string) {
  return await prisma.group.delete({
    where: { id },
  })
}
