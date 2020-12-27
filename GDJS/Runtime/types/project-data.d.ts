/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

// ⚠️ While this file is a TypeScript type definitions file, it's used only
// for describing a serialized exported project. The game engine itself is still typed
// using JSDoc style annotations (see https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#supported-jsdoc).

// ℹ️ See this doc about supported JavaScript features and type checking in the
// game engine: https://github.com/4ian/GDevelop/blob/master/newIDE/docs/Supported-JavaScript-features-and-coding-style.md

/**
 * Contains the data of a serialized exported project.
 */
declare interface ProjectData {
  firstLayout: string;
  gdVersion: GdVersionData;
  properties: ProjectPropertiesData;
  resources: ResourcesData;
  objects: ObjectData[];
  variables: any[];
  layouts: LayoutData[];
  externalLayouts: ExternalLayoutData[];
}

/** Object containing initial properties for all objects extending {@link gdjs.RuntimeObject}. */
declare type ObjectData = {
  /** The name of the object. During the game, objects can be queried by their name (see {@link gdjs.RuntimeScene.prototype.getObjects} for example). */
  name: string;
  /** The object type. */
  type: string;
  /** The list of default variables. */
  variables: Array<VariableData>;
  /** The list of default behaviors. */
  behaviors: Array<BehaviorData>;
};

/** Data representation of a GDevelop variable */
declare type VariableData = {
  /** The name of the variable. Used if a child variable. */
  name: string;
  /** The value of the variable, either string or number. Leave blank for structures. */
  value?: string;
  /** The children of the structure. Leave blank if value is defined. */
  children?: Array<VariableData>;
};

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
  variables: VariableData[];
  instances: InstanceData[];
  objects: ObjectData[];
  layers: LayerData[];
  behaviorsSharedData: BehaviorSharedData[];
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
  angle: number;
  customSize: boolean;
  height: number;
  layer: string;
  locked: boolean;
  name: string;
  width: number;
  x: number;
  y: number;
  zOrder: number;
  numberProperties: InstanceNumberProperty[];
  stringProperties: InstanceStringProperty[];
  initialVariables: VariableData[];
}

declare interface InstanceNumberProperty {
  name: string;
  value: number;
}
declare interface InstanceStringProperty {
  name: string;
  value: number;
}

declare interface LayerData {
  name: string;
  visibility: boolean;
  cameras: CameraData[];
  effects: EffectData[];
  ambientLightColorR: number;
  ambientLightColorG: number;
  ambientLightColorB: number;
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
  scaleMode: string;
  sizeOnStartupMode: string;
  useExternalSourceFiles: boolean;
  version: string;
  name: string;
  author: string;
  windowWidth: number;
  windowHeight: number;
  latestCompilationDirectory: string;
  maxFPS: number;
  minFPS: number;
  verticalSync: boolean;
  loadingScreen: LoadingScreenData;
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

declare interface LoadingScreenData {
  showGDevelopSplash: boolean;
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
}

declare enum ResourceKind {
  Audio = 'audio',
  Image = 'image',
  Font = 'font',
  Video = 'video',
  Json = 'json',
}
