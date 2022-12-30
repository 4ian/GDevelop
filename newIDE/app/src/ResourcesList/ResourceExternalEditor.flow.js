// @flow
import {
  type ResourceKind,
  type ResourceManagementProps,
} from './ResourceSource';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type StorageProvider } from '../ProjectsStorage';

/**
 * Representation of a resource to be edited by an external editor.
 */
export type ExternalEditorBase64Resource = {|
  /**
   * Name of the resource in the project. If not specified, it means a new resource
   * must be created.
   */
  name?: ?string,

  /**
   * The base64 encoded "data:" Url. Could maybe be replaced by Blobs in the future.
   */
  dataUrl: string,

  /**
   * The local file path, if applicable. Useful so that the editor replaces an existing file
   * (on the desktop app), rather than creating a new one.
   */
  localFilePath?: ?string,

  /**
   * The extension of the file, if a file must be created for this resource.
   */
  extension?: ?string,

  /**
   * Original index of this resource in the animation, useful to reorder the animation if changed
   * in the external editor (for example, frames re-ordered in Piskel).
   */
  originalIndex?: ?number,
|};

/**
 * The input sent to an external editor.
 */
export type ExternalEditorInput = {|
  resources: Array<ExternalEditorBase64Resource>,
  singleFrame: ?boolean,
  name?: string,
  isLooping?: boolean,
  fps?: number,
  externalEditorData?: any,
|};

/**
 * The output of an external editor.
 */
export type ExternalEditorOutput = {|
  resources: Array<ExternalEditorBase64Resource>,
  externalEditorData?: ?any,
  baseNameForNewResources: string,
|};

export type EditWithExternalEditorReturn = {|
  externalEditorData?: ?any,
  resources: Array<{|
    name: string,
    originalIndex?: ?number,
  |}>,
|};

/**
 * These are the options passed to an external editor to edit one or more resources.
 */
export type EditWithExternalEditorOptions = {|
  project: gdProject,
  getStorageProvider: () => StorageProvider,
  resourceManagementProps: ResourceManagementProps,
  // TODO: rename
  singleFrame?: boolean, // If set to true, edition should be limited to a single frame
  resourceNames: Array<string>,
  extraOptions: {
    name?: string, //Check what this is used for. Is this "animationName?"
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
  edit: EditWithExternalEditorOptions => Promise<EditWithExternalEditorReturn>,
|};
