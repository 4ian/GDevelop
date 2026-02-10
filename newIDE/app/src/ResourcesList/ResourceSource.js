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
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Audio`,
    fileExtensions: ['aac', 'wav', 'mp3', 'ogg'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.AudioResource(),
  },
  {
    kind: 'image',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Image`,
    fileExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.ImageResource(),
  },
  {
    kind: 'font',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Font`,
    fileExtensions: ['ttf', 'otf'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.FontResource(),
  },
  {
    kind: 'video',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Video`,
    fileExtensions: ['mp4', 'webm'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.VideoResource(),
  },
  {
    kind: 'json',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Json`,
    fileExtensions: ['json'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => {
      return new gd.JsonResource();
    },
  },
  {
    kind: 'tilemap',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Tile Map`,
    fileExtensions: ['json', 'ldtk', 'tmj'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.TilemapResource(),
  },
  {
    kind: 'tileset',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Tile Set`,
    fileExtensions: ['json', 'tsj'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.TilesetResource(),
  },
  {
    kind: 'bitmapFont',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Bitmap Font`,
    fileExtensions: ['fnt', 'xml'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.BitmapFontResource(),
  },
  {
    kind: 'model3D',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`3D model`,
    fileExtensions: ['glb'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.Model3DResource(),
  },
  {
    kind: 'atlas',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Atlas`,
    fileExtensions: ['atlas'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => new gd.AtlasResource(),
  },
  {
    kind: 'spine',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`Spine Json`,
    fileExtensions: ['json'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => {
      return new gd.SpineResource();
    },
  },
  {
    kind: 'javascript',
    // $FlowFixMe[signature-verification-failure]
    displayName: t`JavaScript file`,
    fileExtensions: ['js'],
    // $FlowFixMe[signature-verification-failure]
    createNewResource: () => {
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
