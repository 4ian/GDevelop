declare type SceneSaveState = {
  sceneData: LayoutNetworkSyncData;
  objectDatas: { [objectName: string]: ObjectNetworkSyncData[] };
};

declare type GameSaveState = {
  gameNetworkSyncData: GameNetworkSyncData;
  layoutNetworkSyncDatas: SceneSaveState[];
};
