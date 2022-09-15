// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';

const gd: libGDevelop = global.gd;

// These are all the kind of resources that can be found in
// Core/GDCore/Project/ResourcesManager.h
export type ResourceKind =
  | 'image'
  | 'audio'
  | 'font'
  | 'video'
  | 'json'
  | 'bitmapFont';

export const allResourceKindsAndMetadata = [
  {
    kind: 'audio',
    displayName: t`Audio`,
    fileExtensions: ['aac', 'wav', 'mp3', 'ogg'],
    createNewResource: () => new gd.AudioResource(),
  },
  {
    kind: 'image',
    displayName: t`Image`,
    fileExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    createNewResource: () => new gd.ImageResource(),
  },
  {
    kind: 'font',
    displayName: t`Font`,
    fileExtensions: ['ttf', 'otf'],
    createNewResource: () => new gd.FontResource(),
  },
  {
    kind: 'video',
    displayName: t`Video`,
    fileExtensions: ['mp4', 'webm'],
    createNewResource: () => new gd.VideoResource(),
  },
  {
    kind: 'json',
    displayName: t`Json`,
    fileExtensions: ['json'],
    createNewResource: () => new gd.JsonResource(),
  },
  {
    kind: 'bitmapFont',
    displayName: t`Bitmap Font`,
    fileExtensions: ['fnt', 'xml'],
    createNewResource: () => new gd.BitmapFontResource(),
  },
];

export type ChooseResourceOptions = {|
  initialSourceName: string,
  multiSelection: boolean,
  resourceKind: ResourceKind,
|};

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
|};

export type ResourceSourceComponentProps = {|
  ...ChooseResourceProps,
  onChooseResources: (Array<gdResource>) => void,
|};

export type ResourceSource = {
  name: string,
  displayName: MessageDescriptor,
  displayTab: 'standalone' | 'import' | 'import-advanced',
  kind: ResourceKind,
  selectResourcesHeadless?: ?(
    ChooseResourceProps
  ) => Promise<Array<gdResource>>,
  renderComponent: ResourceSourceComponentProps => React.Node,
};

export type ChooseResourceFunction = (
  options: ChooseResourceOptions
) => Promise<Array<gdResource>>;

export type ResourceManagementProps = {|
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onChooseResource: ChooseResourceFunction,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
|};
