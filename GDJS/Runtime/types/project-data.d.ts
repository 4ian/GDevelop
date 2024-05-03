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

/** Properties to set up a behavior. */
declare type BehaviorData = {
  /** The name of the behavior (for getting from an object (object.getBehavior) for example) */
  name: string;
  /** The behavior type. Used by GDJS to find the proper behavior to construct. */
  type: string;
};

declare interface GdVersionData {
  build: number;
  major: number;
  minor: number;
  revision: number;
}

declare interface LayoutData {
  r: number;
  v: number;
  b: number;
  mangledName: string;
  name: string;
  stopSoundsOnStartup: boolean;
  title: string;
  variables: RootVariableData[];
  instances: InstanceData[];
  objects: ObjectData[];
  layers: LayerData[];
  behaviorsSharedData: BehaviorSharedData[];
  usedResources: ResourceReference[];
}

declare interface EventsFunctionsExtensionData {
  name: string;
  eventsBasedObjects: EventsBasedObjectData[];
}

declare interface EventsBasedObjectData {
  name: string;
  objects: Array<ObjectData & any>;
}

declare interface BehaviorSharedData {
  name: string;
  type: string;
}

declare interface ExternalLayoutData {
  name: string;
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
  useExternalSourceFiles: boolean;
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
  alwaysLoaded?: boolean;
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
  | 'spine';
