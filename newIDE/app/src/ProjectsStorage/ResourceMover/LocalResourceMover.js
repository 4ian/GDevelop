// @flow
import {
  type MoveAllProjectResourcesOptions,
  type MoveAllProjectResourcesResult,
  type MoveAllProjectResourcesFunction,
} from './index';
import LocalFileStorageProvider from '../LocalFileStorageProvider';
import UrlStorageProvider from '../UrlStorageProvider';
import localFileSystem from '../../Export/LocalExporters/LocalFileSystem';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
const path = optionalRequire('path');

const gd: libGDevelop = global.gd;

const movers: {
  [string]: MoveAllProjectResourcesFunction,
} = {
  [`${LocalFileStorageProvider.internalName}=>${
    LocalFileStorageProvider.internalName
  }`]: ({ project, newFileMetadata }: MoveAllProjectResourcesOptions) => {
    // TODO: Ideally, errors while copying resources should be reported.
    // TODO: Report progress.
    const projectPath = path.dirname(newFileMetadata.fileIdentifier);
    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
    gd.ProjectResourcesCopier.copyAllResourcesTo(
      project,
      fileSystem,
      projectPath,
      true, // Update the project with the new resource paths
      false, // Don't move absolute files
      true // Keep relative files folders structure.
    );
    return {
      erroredResources: [],
    };
  },
  [`${UrlStorageProvider.internalName}=>${
    LocalFileStorageProvider.internalName
  }`]: (options: MoveAllProjectResourcesOptions) => {
    // TODO: Currently unused.
    // Download resources. Check if this ResourceFetcher can be moved here.
    return {
      erroredResources: [],
    };
  },
};

const LocalResourceMover = {
  moveAllProjectResources: async (
    options: MoveAllProjectResourcesOptions
  ): Promise<MoveAllProjectResourcesResult> => {
    const { oldStorageProvider, newStorageProvider } = options;
    const mover =
      movers[
        `${oldStorageProvider.internalName}=>${newStorageProvider.internalName}`
      ];
    if (!mover)
      throw new Error(
        `Can't find a ResourceMover for ${oldStorageProvider.internalName} to ${
          newStorageProvider.internalName
        }.`
      );

    return mover(options);
  },
};

export default LocalResourceMover;
