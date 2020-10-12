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
export interface ProjectData {
  firstLayout: string;
  gdVersion: GdVersionData;
  properties: ProjectPropertiesData;
  resources: ResourcesData;
  objects: ObjectData[];
  variables: any[];
  layouts: LayoutData[];
  externalLayouts: ExternalLayoutData[];
}

export interface GdVersionData {
  build: number;
  major: number;
  minor: number;
  revision: number;
}

export interface LayoutData {
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

export interface BehaviorSharedData {
  name: string;
  type: string;
}

export interface ExternalLayoutData {
  name: string;
  instances: InstanceData[];
}

export interface InstanceData {
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

export interface InstanceNumberProperty {
  name: string;
  value: number;
}
export interface InstanceStringProperty {
  name: string;
  value: number;
}

export interface LayerData {
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

export interface CameraData {
  defaultSize: boolean;
  defaultViewport: boolean;
  height: number;
  viewportBottom: number;
  viewportLeft: number;
  viewportRight: number;
  viewportTop: number;
  width: number;
}

export interface EffectData {
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

export interface ProjectPropertiesData {
  adMobAppId: string;
  adaptGameResolutionAtRuntime: boolean;
  folderProject: boolean;
  linuxExecutableFilename: string;
  macExecutableFilename: string;
  orientation: string;
  packageName: string;
  projectFile: string;
  scaleMode: string;
  sizeOnStartupMode: string;
  useExternalSourceFiles: boolean;
  version: string;
  winExecutableFilename: string;
  winExecutableIconFile: string;
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
}

export interface ExtensionProperty {
  extension: string;
  property: string;
  value: string;
}

export interface LoadingScreenData {
  showGDevelopSplash: boolean;
}

export interface ResourcesData {
  resources: ResourceData[];
}

export interface ResourceData {
  alwaysLoaded?: boolean;
  file: string;
  kind: ResourceKind;
  metadata: string;
  name: string;
  smoothed?: boolean;
  userAdded: boolean;
  disablePreload?: boolean;
}

export enum ResourceKind {
  Audio = 'audio',
  Image = 'image',
  Font = 'font',
  Video = 'video',
  Json = 'json',
}
