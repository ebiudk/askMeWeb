import { User } from "@/domain/models/User";

export interface MemberViewModel {
  userId: string;
  name: string;
  role: string;
  isLocationShared: boolean;
  location: {
    worldId: string | null;
    worldName: string;
    instanceId: string | null;
    updatedAt: string;
    isOnline: boolean;
    isHidden: boolean;
  } | null;
}

export function createMemberViewModel(user: User, role: string, isLocationShared: boolean, currentUserId: string): MemberViewModel {
  const location = user.location;
  const isOwnLocation = user.id === currentUserId;
  const shouldShowLocation = isOwnLocation || (isLocationShared && !location?.isHidden);

  const isOnline = !!location && !location.isOffline;

  const locationData = shouldShowLocation && location && isOnline ? {
    worldId: location.worldId,
    worldName: location.isHidden ? "Private" : location.worldName || "Unknown World",
    instanceId: location.isHidden ? null : location.instanceId,
    updatedAt: location.updatedAt.toISOString(),
    isOnline: true,
    isHidden: location.isHidden,
  } : (location && !isOnline ? {
    worldId: null,
    worldName: "Offline",
    instanceId: null,
    updatedAt: location.updatedAt.toISOString(),
    isOnline: false,
    isHidden: false,
  } : null);

  return {
    userId: user.id,
    name: user.displayName,
    role,
    isLocationShared,
    location: locationData,
  };
}
