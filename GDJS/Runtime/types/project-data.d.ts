/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Contains the data of a serialized exported project.
 */
declare interface ProjectData {
  firstLayout: string;
  gdVersion: GdVersionData;
  properties: ProjectPropertiesData;
  resources: ResourcesData;
  usedResources: ResourceReference[];
  objects: ObjectData[];
  variables: RootVariableData[];
  layouts: LayoutData[];
  externalLayouts: ExternalLayoutData[];
  eventsFunctionsExtensions: EventsFunctionsExtensionData[];
}

declare interface EventsFunctionsVariablesData {
  name: string;
  variables: RootVariableData[];
}

/** Object containing initial properties for all objects extending {@link gdjs.RuntimeObject}. */
declare type ObjectData = {
  /** The name of the object. During the game, objects can be queried by their name (see {@link gdjs.RuntimeScene.prototype.getObjects} for example). */
  name: string;
  /** The object type. */
  type: string;
  /** The list of default variables. */
  variables: Array<RootVariableData>;
  /** The list of default behaviors. */
  behaviors: Array<BehaviorData & any>;
  /** The list of effects. */
  effects: Array<EffectData>;
};

declare type GetNetworkSyncDataOptions = {
  playerNumber?: number;
  isHost?: boolean;
  syncObjectIdentifier?: boolean;
  syncAllVariables?: boolean;
  syncAllBehaviors?: boolean;
  syncSceneTimers?: boolean;
  syncOnceTriggers?: boolean;
  syncSounds?: boolean;
  syncTweens?: boolean;
  syncLayers?: boolean;
  syncAsyncTasks?: boolean;
  syncSceneAdditionalProps?: boolean;
};

declare type UpdateFromNetworkSyncDataOptions = {
  clearSceneStack?: boolean;
  clearInputs?: boolean;
  keepControl?: boolean;
  ignoreVariableOwnership?: boolean;
};

/** Object containing basic properties for all objects synchronizing over the network. */
declare type BasicObjectNetworkSyncData = {
  /** The position of the instance on the X axis. */
  x: number;
  /** The position of the instance on the Y axis. */
  y: number;
  /** The position of the instance on the Z axis. Defined only for 3D games */
  z?: number;
  /** The width of the instance */
  w: number;
  /** The height of the instance */
  h: number;
  /** Z order of the instance */
  zo: number;
  /** The angle of the instance. */
  a: number;
  /** If the instance is hidden */
  hid: boolean;
  /** The layer where the instance lives  */
  lay: string;
  /** All the instant forces */
  if: Array<ForceNetworkSyncData>;
  /** Permanent force on X */
  pfx: number;
  /** Permanent force on Y */
  pfy: number;
  /* name :*/
  n?: string;
  /** The network ID of the instance. */
  networkId?: string;
};

/**
 * Object containing properties, behaviors, variables, effects and timers
 * for all objects synchronizing over the network.
 **/
declare interface ObjectNetworkSyncData extends BasicObjectNetworkSyncData {
  /** The behaviors of the object */
  beh: {
    [behaviorName: string]: any;
  };
  /** The variables of the object */
  var?: VariableNetworkSyncData[];
  /** The effects of the object */
  eff?: {
    [effectName: string]: EffectNetworkSyncData;
  };
  /** The timers of the object */
  tim?: {
    [timerName: string]: TimerNetworkSyncData;
  };
  /** Tweens */
  tween?: TweenManagerNetworkSyncData;
}

declare type ForceNetworkSyncData = {
  x: float;
  y: float;
  a: float;
  l: float;
  m: number;
};

declare type TimerNetworkSyncData = {
  name: string;
  time: float;
  paused: boolean;
};

declare type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'structure'
  | 'array';

/** Data representation of a GDevelop variable */
declare type VariableData = Readonly<{
  /** The name of the variable. Leave blank for array children. */
  name?: string;
  /** The value of the variable. Leave blank for structures. */
  value?: string | float | boolean;
  /** The children of the structure. Leave blank if value is defined. */
  children?: VariableData[];
  /** The type of the variable. Defaults to number. */
  type?: VariableType;
}>;

/** A variable child of a container. Those always have a name. */
declare type RootVariableData = Omit<VariableData, 'name'> & { name: string };

declare type VariableNetworkSyncData = {
  name: string;
  value: string | float | boolean;
  children?: VariableNetworkSyncData[];
  type: VariableType;
  owner: number | null;
};

declare type LayerNetworkSyncData = {
  timeScale: float;
  defaultZOrder: integer;
  hidden: boolean;
  effects: {
    [effectName: string]: EffectNetworkSyncData;
  };
  followBaseLayerCamera: boolean;
  clearColor: Array<integer>;
  cameraX: float;
  cameraY: float;
  cameraZ: float;
  cameraRotation: float;
  cameraZoom: float;
};

/** Properties to set up a behavior. */
declare type BehaviorData = {
  /** The name of the behavior (for getting from an object (object.getBehavior) for example) */
  name: string;
  /** The behavior type. Used by GDJS to find the proper behavior to construct. */
  type: string;
};

declare type BehaviorNetworkSyncData = {
  act: boolean;
  props: any;
};

declare type SceneTweenType =
  | 'layoutValue'
  | 'layerValue'
  | 'variable'
  | 'cameraZoom'
  | 'cameraRotation'
  | 'cameraPosition'
  | 'colorEffectProperty'
  | 'numberEffectProperty';
declare type ObjectTweenType =
  | 'variable'
  | 'position'
  | 'positionX'
  | 'positionY'
  | 'positionZ'
  | 'width'
  | 'height'
  | 'depth'
  | 'angle'
  | 'rotationX'
  | 'rotationY'
  | 'scale'
  | 'scaleXY'
  | 'scaleX'
  | 'scaleY'
  | 'opacity'
  | 'characterSize'
  | 'numberEffectProperty'
  | 'colorEffectProperty'
  | 'objectColor'
  | 'objectColorHSL'
  | 'objectValue';

declare type TweenInformation = {
  type: SceneTweenType | ObjectTweenType;
  layerName?: string;
  variable?: Variable;
  effectName?: string;
  propertyName?: string;
  scaleFromCenterOfObject?: boolean;
  useHSLColorTransition?: boolean;
  destroyObjectWhenFinished?: boolean;
};

declare type TweenInformationNetworkSyncData = Omit<
  TweenInformation,
  'variable' // When synced, a variable is replaced by its path
> & { variablePath?: string[] };

declare type TweenInstanceNetworkSyncData<T> = {
  initialValue: T;
  targetedValue: T;
  elapsedTime: float;
  totalDuration: float;
  easingIdentifier: string;
  interpolationString: 'linear' | 'exponential';
  isPaused: boolean;
  tweenInformation: TweenInformationNetworkSyncData;
};

declare type TweenManagerNetworkSyncData = {
  tweens: Record<
    string,
    | TweenInstanceNetworkSyncData<float>
    | TweenInstanceNetworkSyncData<Array<float>>
  >;
};

declare interface GdVersionData {
  build: number;
  major: number;
  minor: number;
  revision: number;
}

declare interface InstanceContainerData {
  variables: RootVariableData[];
  instances: InstanceData[];
  objects: ObjectData[];
  layers: LayerData[];
}

declare interface LayoutData extends InstanceContainerData {
  r: number;
  v: number;
  b: number;
  mangledName: string;
  name: string;
  stopSoundsOnStartup: boolean;
  title: string;
  behaviorsSharedData: BehaviorSharedData[];
  usedResources: ResourceReference[];
  resourcesPreloading?: 'at-startup' | 'never' | 'inherit';
  resourcesUnloading?: 'at-scene-exit' | 'never' | 'inherit';
}

declare interface LayoutNetworkSyncData {
  id: string;
  var?: VariableNetworkSyncData[];
  extVar?: {
    [extensionName: string]: VariableNetworkSyncData[];
  };
  time?: TimeManagerSyncData;
  tween?: TweenManagerNetworkSyncData;
  once?: OnceTriggersSyncData;
  layers?: {
    [layerName: string]: LayerNetworkSyncData;
  };
  async?: AsyncTasksManagerNetworkSyncData;
  color?: integer;
}

declare interface SceneStackSceneNetworkSyncData {
  name: string;
  networkId: string;
}

declare type SceneStackNetworkSyncData = SceneStackSceneNetworkSyncData[];

declare type SoundSyncData = {
  loop: boolean;
  volume: float;
  rate: float;
  resourceName: string;
  seek: float;
};
declare type ChannelsSoundSyncData = Record<integer, SoundSyncData>;
declare type SoundManagerSyncData = {
  globalVolume: float;
  cachedSpatialPosition: Record<number, [number, number, number]>;
  freeSounds: SoundSyncData[];
  freeMusics: SoundSyncData[];
  musics: ChannelsSoundSyncData;
  sounds: ChannelsSoundSyncData;
};

declare interface GameNetworkSyncData {
  var?: VariableNetworkSyncData[];
  ss?: SceneStackNetworkSyncData;
  extVar?: {
    [extensionName: string]: VariableNetworkSyncData[];
  };
  sm?: SoundManagerSyncData;
}

declare interface EventsFunctionsExtensionData {
  name: string;
  eventsBasedObjects: EventsBasedObjectData[];
  globalVariables: RootVariableData[];
  sceneVariables: RootVariableData[];
}

declare interface SceneAndExtensionsData {
  sceneData: LayoutData;
  usedExtensionsWithVariablesData: EventsFunctionsExtensionData[];
}

declare interface EventsBasedObjectData
  extends EventsBasedObjectVariantData,
    InstanceContainerData {
  name: string;
  isInnerAreaFollowingParentSize: boolean;
  variants: Array<EventsBasedObjectVariantData>;
  /** Added at runtime to have the default variant with an empty name instead
   * of the events-based object name. */
  defaultVariant?: EventsBasedObjectVariantData;
}

declare interface EventsBasedObjectVariantData extends InstanceContainerData {
  name: string;
  // The flat representation of defaultSize.
  areaMinX: float;
  areaMinY: float;
  areaMinZ: float;
  areaMaxX: float;
  areaMaxY: float;
  areaMaxZ: float;
  /**
   * A value shared by every object instances.
   *
   * @see gdjs.CustomRuntimeObjectInstanceContainer._initialInnerArea
   **/
  _initialInnerArea: {
    min: [float, float, float];
    max: [float, float, float];
  } | null;
  instances: InstanceData[];
  objects: ObjectData[];
  layers: LayerData[];
}

declare interface BehaviorSharedData {
  name: string;
  type: string;
}

declare interface ExternalLayoutData {
  name: string;
  associatedLayout: string;
  instances: InstanceData[];
}

declare interface InstanceData {
  persistentUuid: string;

  layer: string;
  locked: boolean;
  name: string;

  x: number;
  y: number;
  z?: number;

  angle: number;
  rotationX?: number;
  rotationY?: number;

  zOrder: number;
  opacity?: number;

  flippedX?: boolean;
  flippedY?: boolean;
  flippedZ?: boolean;

  customSize: boolean;
  width: number;
  height: number;
  depth?: number;

  numberProperties: InstanceNumberProperty[];
  stringProperties: InstanceStringProperty[];
  initialVariables: RootVariableData[];
}

declare interface InstanceNumberProperty {
  name: string;
  value: number;
}
declare interface InstanceStringProperty {
  name: string;
  value: string;
}

declare interface LayerData {
  name: string;
  renderingType?: '' | '2d' | '3d' | '2d+3d';
  cameraType?: 'perspective' | 'orthographic';
  defaultCameraBehavior?: 'top-left-anchored-if-never-moved' | 'do-nothing';
  visibility: boolean;
  cameras: CameraData[];
  effects: EffectData[];
  ambientLightColorR: number;
  ambientLightColorG: number;
  ambientLightColorB: number;
  camera3DFieldOfView?: float;
  camera3DFarPlaneDistance?: float;
  camera3DNearPlaneDistance?: float;
  isLightingLayer: boolean;
  followBaseLayerCamera: boolean;
}

declare interface CameraData {
  defaultSize: boolean;
  defaultViewport: boolean;
  height: number;
  viewportBottom: number;
  viewportLeft: number;
  viewportRight: number;
  viewportTop: number;
  width: number;
}

declare interface EffectData {
  effectType: string;
  name: string;
  doubleParameters: {
    [name: string]: number;
  };
  stringParameters: {
    [name: string]: string;
  };
  booleanParameters: {
    [name: string]: boolean;
  };
}

declare interface EffectNetworkSyncData {
  ena: boolean;
  fc: {
    [name: string]: any;
  };
}

declare interface ProjectPropertiesData {
  adaptGameResolutionAtRuntime: boolean;
  folderProject: boolean;
  orientation: string;
  packageName: string;
  projectFile: string;
  scaleMode: 'linear' | 'nearest';
  pixelsRounding: boolean;
  antialiasingMode: 'none' | 'MSAA';
  antialisingEnabledOnMobile: boolean;
  sizeOnStartupMode: string;
  version: string;
  name: string;
  author: string;
  authorIds: string[];
  authorUsernames: string[];
  windowWidth: number;
  windowHeight: number;
  latestCompilationDirectory: string;
  maxFPS: number;
  minFPS: number;
  verticalSync: boolean;
  loadingScreen: LoadingScreenData;
  watermark: WatermarkData;
  currentPlatform: string;
  extensionProperties: Array<ExtensionProperty>;
  useDeprecatedZeroAsDefaultZOrder?: boolean;
  projectUuid?: string;
  sceneResourcesPreloading?: 'at-startup' | 'never';
  sceneResourcesUnloading?: 'at-scene-exit' | 'never';
}

declare interface ExtensionProperty {
  extension: string;
  property: string;
  value: string;
}

declare interface WatermarkData {
  showWatermark: boolean;
  placement:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom'
    | 'top';
}

declare interface LoadingScreenData {
  showGDevelopSplash: boolean;
  backgroundImageResourceName: string;
  backgroundColor: integer;
  backgroundFadeInDuration: float;
  minDuration: float;
  logoAndProgressFadeInDuration: float;
  logoAndProgressLogoFadeInDelay: float;
  showProgressBar: boolean;
  progressBarMinWidth: float;
  progressBarMaxWidth: float;
  progressBarWidthPercent: float;
  progressBarHeight: float;
  progressBarColor: integer;
}

declare interface ResourcesData {
  resources: ResourceData[];
}

declare interface ResourceData {
  file: string;
  kind: ResourceKind;
  metadata: string;
  name: string;
  smoothed?: boolean;
  userAdded: boolean;
  disablePreload?: boolean;
  preloadAsSound?: boolean;
  preloadAsMusic?: boolean;
  preloadInCache?: boolean;
}

declare interface ResourceReference {
  name: string;
}

declare type ResourceKind =
  | 'audio'
  | 'image'
  | 'font'
  | 'video'
  | 'json'
  | 'tilemap'
  | 'tileset'
  | 'bitmapFont'
  | 'model3D'
  | 'atlas'
  | 'spine'
  | 'fake-resource-kind-for-testing-only';
