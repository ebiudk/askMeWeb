export interface LocationData {
  worldId: string | null;
  worldName: string | null;
  instanceId: string | null;
  isHidden: boolean;
  updatedAt: Date;
}

export class Location {
  constructor(private readonly data: LocationData) {}

  get worldId() { return this.data.worldId; }
  get worldName() { return this.data.worldName; }
  get instanceId() { return this.data.instanceId; }
  get isHidden() { return this.data.isHidden; }
  get updatedAt() { return this.data.updatedAt; }

  static createFromVRChat(
    worldId: string | null,
    worldName: string | null,
    instanceId: string | null
  ): Location {
    const raw = worldId || "";
    const idNormalized = raw.trim().toLowerCase();
    // Treat empty, null or explicit "offline" as clearing (no location)
    const isClearing = idNormalized === "" || idNormalized === "offline";
    const isHidden = idNormalized === "private";

    return new Location({
      worldId: isClearing ? null : raw.trim(),
      worldName: isClearing ? null : (worldName || null),
      instanceId: isClearing ? null : (instanceId || null),
      isHidden,
      updatedAt: new Date(),
    });
  }

  get isOffline(): boolean {
    return !this.worldId;
  }
}
