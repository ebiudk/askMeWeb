import { User } from "./User";

export interface MembershipData {
  userId: string;
  role: string;
  isLocationShared: boolean;
  user: User;
}

export interface GroupData {
  id: string;
  name: string;
  ownerId: string;
  memberships: MembershipData[];
}

export class Group {
  constructor(private readonly data: GroupData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get memberships() { return this.data.memberships; }
  get ownerId() { return this.data.ownerId; }

  isMember(userId: string): boolean {
    return this.data.memberships.some(m => m.userId === userId);
  }

  isAdmin(userId: string): boolean {
    return this.data.memberships.some(m => m.userId === userId && m.role === "admin");
  }
}
