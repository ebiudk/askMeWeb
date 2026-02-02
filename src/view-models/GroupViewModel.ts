import { Group } from "@/domain/models/Group";
import { MemberViewModel, createMemberViewModel } from "./MemberViewModel";

export interface GroupViewModel {
  id: string;
  name: string;
  members: MemberViewModel[];
}

export function createGroupViewModel(group: Group, currentUserId: string): GroupViewModel {
  const members = group.memberships.map(m => createMemberViewModel(m.user, m.role, m.isLocationShared, currentUserId));

  // Sort members: admin -> co-admin -> member, then by name
  const rolePriority: { [key: string]: number } = {
    admin: 0,
    "co-admin": 1,
    member: 2,
  }

  members.sort((a, b) => {
    const priorityA = rolePriority[a.role] ?? 3
    const priorityB = rolePriority[b.role] ?? 3
    if (priorityA !== priorityB) return priorityA - priorityB
    return a.name.localeCompare(b.name)
  })

  return {
    id: group.id,
    name: group.name,
    members,
  };
}
