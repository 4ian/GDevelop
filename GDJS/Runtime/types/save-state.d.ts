declare type SceneSaveState = {
  sceneData: LayoutNetworkSyncData;
  objectDatas: { [objectId: integer]: ObjectNetworkSyncData };
};

declare type GameSaveState = {
  gameNetworkSyncData: GameNetworkSyncData;
  layoutNetworkSyncDatas: SceneSaveState[];
};
