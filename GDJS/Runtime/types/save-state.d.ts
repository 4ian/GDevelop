declare type SceneSaveState = {
  sceneData: LayoutNetworkSyncData;
  objectDatas: { [objectId: integer]: ObjectNetworkSyncData };
  linkedObjectLinks?: Array<{ a: string; b: string }>;
};

declare type GameSaveState = {
  gameNetworkSyncData: GameNetworkSyncData | null;
  layoutNetworkSyncDatas: SceneSaveState[];
};
