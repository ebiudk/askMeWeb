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
    const isClearing = !worldId || worldId === "";
    const isHidden = worldId === "private";

    return new Location({
      worldId: isClearing ? null : worldId,
      worldName: isClearing ? null : worldName,
      instanceId: isClearing ? null : instanceId,
      isHidden,
      updatedAt: new Date(),
    });
  }

  get isOffline(): boolean {
    return !this.worldId;
  }
}
