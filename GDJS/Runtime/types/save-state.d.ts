declare type SceneSaveState = {
  sceneData: LayoutNetworkSyncData;
  objectDatas: { [objectId: integer]: ObjectNetworkSyncData };
  linkedObjectLinks?: Array<[string, string]>;
};

declare type GameSaveState = {
  gameNetworkSyncData: GameNetworkSyncData | null;
  layoutNetworkSyncDatas: SceneSaveState[];
};
