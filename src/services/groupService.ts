import { prisma } from "@/lib/prisma"

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
