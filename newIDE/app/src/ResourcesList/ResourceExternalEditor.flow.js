// @flow
import { type ResourceKind } from './ResourceSource';
import ResourcesLoader from '../ResourcesLoader';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type StorageProvider } from '../ProjectsStorage';

/**
 * These are the options passed to an external editor to edit one or more resources.
 */
export type ExternalEditorOpenOptions = {|
  project: gdProject,
  getStorageProvider: () => StorageProvider,
  resourcesLoader: typeof ResourcesLoader,
  singleFrame?: boolean, // If set to true, edition should be limited to a single frame
  resourceNames: Array<string>,
  onChangesSaved: (
    Array<{
      path?: ?string,
      name: string,
      originalIndex?: ?number,
      metadata?: ?Object,
      newAnimationName?: string,
    }>
  ) => void,
  extraOptions: {
    name?: string,
    isLooping?: boolean,
    fps?: number,
    externalEditorData?: any,
  },
|};

export type ResourceExternalEditor = {|
  name: string,
  createDisplayName: MessageDescriptor,
  editDisplayName: MessageDescriptor,
  kind: ResourceKind,
  edit: ExternalEditorOpenOptions => void,
|};
