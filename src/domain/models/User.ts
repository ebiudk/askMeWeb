import { Location } from "./Location";

export interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  displayName: string | null;
  apiKey: string | null;
  location?: Location;
}

export class User {
  constructor(private readonly data: UserData) {}

  get id() { return this.data.id; }
  get displayName() { return this.data.displayName || this.data.name || "Unknown User"; }
  get apiKey() { return this.data.apiKey; }
  get location() { return this.data.location; }

  updateLocation(location: Location): User {
    return new User({
      ...this.data,
      location,
    });
  }
}
