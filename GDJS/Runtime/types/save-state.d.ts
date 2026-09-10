declare type SceneSaveState = {
  sceneData: LayoutNetworkSyncData;
  objectDatas: { [objectId: integer]: ObjectNetworkSyncData };
};

declare type GameSaveState = {
  gameNetworkSyncData: GameNetworkSyncData | null;
  layoutNetworkSyncDatas: SceneSaveState[];
};

declare type SaveStateMetadata = {
  name: string;
  /** Timestamp (ms since epoch) of the first time the save was created. 0 if unknown (legacy saves). */
  savedAt: number;
  /** Timestamp (ms since epoch) of the last time the save was written. 0 if unknown (legacy saves). */
  updatedAt: number;
};

/**
 * The versioned envelope actually stored in device storage. Wraps a
 * `GameSaveState` with metadata. Saves created before this format existed are
 * stored as a raw `GameSaveState` (no `formatVersion`) and are still readable.
 */
declare type StoredSave = {
  formatVersion: number;
  metadata: SaveStateMetadata;
  gameSaveState: GameSaveState;
};
