// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { t } from '@lingui/macro';
import {
  type StorageProvider,
  type FileMetadata,
  type ResourcesActionsMenuBuilder,
} from '../ProjectsStorage';
import {
  type ResourceV2,
  type Resource,
} from '../Utils/GDevelopServices/Asset';
import { type ResourceExternalEditor } from './ResourceExternalEditor';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';

const gd: libGDevelop = global.gd;

// These are all the kind of resources that can be found in
// Core/GDCore/Project/ResourcesContainer.h
export type ResourceKind =
  | 'image'
  | 'audio'
  | 'font'
  | 'video'
  | 'json'
  | 'tilemap'
  | 'tileset'
  | 'bitmapFont'
  | 'model3D'
  | 'atlas'
  | 'spine'
  | 'javascript';

export const resourcesKindSupportedByResourceStore = ['audio', 'font'];

export const allResourceKindsAndMetadata = [
  {
    kind: 'audio',
    displayName: (t`Audio`: any),
    fileExtensions: ['aac', 'wav', 'mp3', 'ogg'],
    createNewResource: (): gdAudioResource => new gd.AudioResource(),
  },
  {
    kind: 'image',
    displayName: (t`Image`: any),
    fileExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    createNewResource: (): gdImageResource => new gd.ImageResource(),
  },
  {
    kind: 'font',
    displayName: (t`Font`: any),
    fileExtensions: ['ttf', 'otf'],
    createNewResource: (): gdFontResource => new gd.FontResource(),
  },
  {
    kind: 'video',
    displayName: (t`Video`: any),
    fileExtensions: ['mp4', 'webm'],
    createNewResource: (): gdVideoResource => new gd.VideoResource(),
  },
  {
    kind: 'json',
    displayName: (t`Json`: any),
    fileExtensions: ['json'],
    createNewResource: (): gdJsonResource => {
      return new gd.JsonResource();
    },
  },
  {
    kind: 'tilemap',
    displayName: (t`Tile Map`: any),
    fileExtensions: ['json', 'ldtk', 'tmj'],
    createNewResource: (): gdTilemapResource => new gd.TilemapResource(),
  },
  {
    kind: 'tileset',
    displayName: (t`Tile Set`: any),
    fileExtensions: ['json', 'tsj'],
    createNewResource: (): gdTilesetResource => new gd.TilesetResource(),
  },
  {
    kind: 'bitmapFont',
    displayName: (t`Bitmap Font`: any),
    fileExtensions: ['fnt', 'xml'],
    createNewResource: (): gdBitmapFontResource => new gd.BitmapFontResource(),
  },
  {
    kind: 'model3D',
    displayName: (t`3D model`: any),
    fileExtensions: ['glb'],
    createNewResource: (): gdModel3DResource => new gd.Model3DResource(),
  },
  {
    kind: 'atlas',
    displayName: (t`Atlas`: any),
    fileExtensions: ['atlas'],
    createNewResource: (): gdAtlasResource => new gd.AtlasResource(),
  },
  {
    kind: 'spine',
    displayName: (t`Spine Json`: any),
    fileExtensions: ['json'],
    createNewResource: (): gdSpineResource => {
      return new gd.SpineResource();
    },
  },
  {
    kind: 'javascript',
    displayName: (t`JavaScript file`: any),
    fileExtensions: ['js'],
    createNewResource: (): gdJavaScriptResource => {
      return new gd.JavaScriptResource();
    },
  },
];

const constructors = {};
for (const { kind, createNewResource } of allResourceKindsAndMetadata) {
  // $FlowFixMe[prop-missing]
  constructors[kind] = createNewResource;
}

export function createNewResource(kind: string): ?gdResource {
  // $FlowFixMe[invalid-computed-prop]
  return constructors[kind] ? constructors[kind]() : null;
}

export type ChooseResourceOptions = {|
  initialSourceName: string,
  multiSelection: boolean,
  resourceKind: ResourceKind,
|};

export type ResourceImportationBehavior = 'import' | 'relative' | 'ask';

export type ChooseResourceProps = {|
  i18n: I18nType,
  project: gdProject,
  fileMetadata: ?FileMetadata,
  getStorageProvider: () => StorageProvider,
  getLastUsedPath: (project: gdProject, kind: ResourceKind) => string,
  setLastUsedPath: (
    project: gdProject,
    kind: ResourceKind,
    path: string
  ) => void,
  options: ChooseResourceOptions,
  automaticallyOpenIfPossible?: boolean,
  resourcesImporationBehavior: ResourceImportationBehavior,
|};

export type ResourceSourceComponentProps = {|
  ...ChooseResourceProps,
  onChooseResources: ({|
    selectedResources: Array<gdResource>,
    selectedSourceName: string,
  |}) => void,
  selectedResourceIndex?: ?number,
  onSelectResource?: (?number) => void,
  selectedResources?: ?Array<gdResource>,
  onResourcesSelected?: (Array<gdResource>) => void,
|};

export type ResourceSourceComponentPrimaryActionProps = {|
  resource: ?(ResourceV2 | Resource),
  selectedResources: ?Array<gdResource>,
  onChooseResources: ({|
    selectedResources: Array<gdResource>,
    selectedSourceName: string,
  |}) => void,
|};

export type ResourceSource = {|
  name: string,
  displayName: MessageDescriptor,
  displayTab: 'standalone' | 'import' | 'import-advanced',
  onlyForStorageProvider?: ?string,
  kind: ResourceKind,
  selectResourcesHeadless?: ?(
    ChooseResourceProps
  ) => Promise<Array<gdResource>>,
  renderComponent: ResourceSourceComponentProps => React.Node,
  renderPrimaryAction?: ResourceSourceComponentPrimaryActionProps => React.Node,
  shouldCreateResource: boolean,
  shouldGuessAnimationsFromName: boolean,
  hideInResourceEditor?: boolean,
|};

export type ChooseResourceFunction = (
  options: ChooseResourceOptions
) => Promise<{|
  selectedResources: Array<gdResource>,
  selectedSourceName: string,
|}>;

export type ResourceManagementProps = {|
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onChooseResource: ChooseResourceFunction,
  getStorageProvider: () => StorageProvider,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
  getStorageProviderResourceOperations: () => ?ResourcesActionsMenuBuilder,
  canInstallPrivateAsset: () => boolean,
  onNewResourcesAdded: () => void,
  onResourceUsageChanged: () => void,
|};

export type ResourceStoreChooserProps = {|
  options: ChooseResourceOptions,
  selectedResourceIndex?: ?number,
  onSelectResource?: (?number) => void,
  onChooseResources?: (resources: Array<gdResource>) => void,
  createNewResource?: () => gdResource,
|};
