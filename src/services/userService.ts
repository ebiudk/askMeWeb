import { prisma } from "@/lib/prisma";
import { User } from "@/domain/models/User";
import { Location } from "@/domain/models/Location";

export async function getUserByApiKey(apiKey: string): Promise<User | null> {
  const dbUser = await prisma.user.findUnique({
    where: { api_key: apiKey },
    include: { location: true },
  });

  if (!dbUser) return null;

  return new User({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    displayName: dbUser.display_name,
    apiKey: dbUser.api_key,
    location: dbUser.location ? new Location({
      worldId: dbUser.location.world_id,
      worldName: dbUser.location.world_name,
      instanceId: dbUser.location.instance_id,
      isHidden: dbUser.location.is_hidden,
      updatedAt: dbUser.location.updated_at,
    }) : undefined,
  });
}

export async function updateUserLocation(userId: string, location: Location, displayName: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      display_name: displayName,
      location: {
        upsert: {
          create: {
            world_id: location.worldId,
            world_name: location.worldName,
            instance_id: location.instanceId,
            is_hidden: location.isHidden,
          },
          update: {
            world_id: location.worldId,
            world_name: location.worldName,
            instance_id: location.instanceId,
            is_hidden: location.isHidden,
          },
        },
      },
    },
  });
}
