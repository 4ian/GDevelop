// @flow
import {
  type MoveAllProjectResourcesOptions,
  type MoveAllProjectResourcesResult,
  type MoveAllProjectResourcesFunction,
} from './index';
import LocalFileStorageProvider from '../LocalFileStorageProvider';
import { moveUrlResourcesToLocalFiles } from '../LocalFileStorageProvider/LocalFileResourceMover';
import UrlStorageProvider from '../UrlStorageProvider';
import CloudStorageProvider from '../CloudStorageProvider';
import LocalFileSystem from '../../Export/LocalExporters/LocalFileSystem';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
import { moveAllCloudProjectResourcesToCloudProject } from '../CloudStorageProvider/CloudResourceMover';
import { checkIfIsGDevelopCloudBucketUrl } from '../../Utils/CrossOrigin';
import {
  getCredentialsForCloudProject,
  uploadProjectResourceFiles,
  type UploadedProjectResourceFiles,
} from '../../Utils/GDevelopServices/Project';
import { processByChunk } from '../../Utils/ProcessByChunk';
const path = optionalRequire('path');
const fs = optionalRequire('fs');

const gd: libGDevelop = global.gd;

const moveNothing = async () => {
  return {
    erroredResources: [],
  };
};

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

const isBlobURL = (filename: string) => {
  return filename.startsWith('blob:');
};

const readLocalFileToArrayBuffer = async (filePath: string): Promise<ArrayBuffer> => {
  const buffer: Buffer = await new Promise((resolve, reject) => {
    fs.readFile(filePath, function(err, buffer) {
      if (err) {
        reject(err);
        return;
      }

      resolve(buffer);
    });
  });

  // See https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer:
  // The slice and offset stuff is required because small Buffers (less than 4 kB by default, half the pool size)
  // can be views on a shared ArrayBuffer. Without slicing, you can end up with an ArrayBuffer containing data from another Buffer.
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);;
  return arrayBuffer;
}

type ResourceAndFile = {|
  resource: gdResource,
  file: File,
|};

export const moveAllLocalResourcesToCloudResources = async ({
  project,
  authenticatedUser,
  oldFileMetadata,
  newFileMetadata,
  oldStorageProvider,
  oldStorageProviderOperations,
  newStorageProvider,
  newStorageProviderOperations,
  onProgress,
}: MoveAllProjectResourcesOptions): Promise<MoveAllProjectResourcesResult> => {
  const result: MoveAllProjectResourcesResult = {
    erroredResources: [],
  };

  const newCloudProjectId = newFileMetadata.fileIdentifier;

  const resourcesManager = project.getResourcesManager();

  /**
   * Find the local resources that must be
   * uploaded into the new project.
   */
  const getResourcesToUpload = (project: gdProject): Array<gdResource> => {
    const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
    return allResourceNames
      .map(
        (resourceName: string): ?gdResource => {
          const resource = resourcesManager.getResource(resourceName);
          const resourceFile = resource.getFile();

          if (isURL(resourceFile)) {
            if (checkIfIsGDevelopCloudBucketUrl(resourceFile)) {
              // URL from a cloud project: this is unlikely and would not work
              // (as the project is a local project). Still, ignore this.
              return null;
            } else if (isBlobURL(resourceFile)) {
              result.erroredResources.push({
                resourceName: resource.getName(),
                error: new Error('Unsupported blob URL.'),
              });
              return null;
            } else {
              // Public URL resource: nothing to do.
              return null;
            }
          } else {
            // Local resource to be downloaded.
            return resource;
          }
        }
      )
      .filter(Boolean);
  };

  const allResourcesToUpload = getResourcesToUpload(project);

  const projectPath = path.dirname(oldFileMetadata.fileIdentifier);

  // Read all files as Files.
  await processByChunk(allResourcesToUpload, {
    transformItem: async (resource): Promise<ResourceAndFile | null> => {
      const resourceAbsolutePath = path.resolve(
        projectPath,
        resource.getFile()
      );

      try {
        const arrayBuffer = await readLocalFileToArrayBuffer(resourceAbsolutePath);
        return {
          resource,
          file: new File([arrayBuffer], path.basename(resourceAbsolutePath), {
            type: 'image/png', // TODO: read extension and get mime type from it.
          }),
        };
      } catch (error) {
        result.erroredResources.push({
          resourceName: resource.getName(),
          error: new Error(
            `Unable to open the file (${resourceAbsolutePath}).`
          ),
        });
        return null;
      }
    },
    isChunkTooBig: (resourceAndFilesChunk: Array<ResourceAndFile | null>) => {
      if (resourceAndFilesChunk.length > 20) return true;

      const allBufferSize = resourceAndFilesChunk
        .filter(Boolean)
        .reduce((size, { file }) => size + file.size, 0);

      // Stop a chunk when more than 150MB are read to be uploaded. This is
      // to avoid loading all resources in memory at once. This don't give an exact
      // guarantee on the upper bound (a single file could be more than 150MB), but
      // this limits the risks of running out of memory.
      return allBufferSize > 150 * 1000 * 1000;
    },
    processChunk: async (
      resourceAndFilesChunk: Array<ResourceAndFile | null>
    ) => {
      const resourceAndFilesToUpload: ResourceAndFile[] = resourceAndFilesChunk.filter(
        Boolean
      );

      // Upload the files just read, for the new project.
      await getCredentialsForCloudProject(authenticatedUser, newCloudProjectId);
      const uploadedProjectResourceFiles: UploadedProjectResourceFiles = await uploadProjectResourceFiles(
        authenticatedUser,
        newCloudProjectId,
        resourceAndFilesToUpload.map(({ file }) => file),
        (count, total) => {
          onProgress(total + count, total * 2);
        }
      );

      // Update resources with the newly created URLs.
      uploadedProjectResourceFiles.forEach(({ url, error }, index) => {
        const resource = resourceAndFilesToUpload[index].resource;
        if (error || !url) {
          result.erroredResources.push({
            resourceName: resource.getName(),
            error: error || new Error('Unknown error during upload.'),
          });
          return;
        }

        resource.setFile(url);
      });
    },
  });

  return result;
};

const movers: {
  [string]: MoveAllProjectResourcesFunction,
} = {
  [`${LocalFileStorageProvider.internalName}=>${
    LocalFileStorageProvider.internalName
  }`]: async ({ project, newFileMetadata }: MoveAllProjectResourcesOptions) => {
    // TODO: Ideally, errors while copying resources should be reported.
    // TODO: Report progress.
    const projectPath = path.dirname(newFileMetadata.fileIdentifier);
    const fileSystem = assignIn(
      new gd.AbstractFileSystemJS(),
      new LocalFileSystem()
    );
    gd.ProjectResourcesCopier.copyAllResourcesTo(
      project,
      // $FlowFixMe - fileSystem is a gdAbstractFileSystem, despite the assignIn.
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
  // When saving a Cloud project locally, all resources are downloaded (including
  // the ones on GDevelop Cloud).
  [`${CloudStorageProvider.internalName}=>${
    LocalFileStorageProvider.internalName
  }`]: ({ project, newFileMetadata, onProgress }) =>
    moveUrlResourcesToLocalFiles({
      project,
      fileMetadata: newFileMetadata,
      onProgress,
    }),
  // On the desktop app, try to download all URLs into local files, put
  // next to the project file (in a "assets" directory). This is helpful
  // to continue working on a game started on the web-app (using public URLs
  // for resources).
  [`${UrlStorageProvider.internalName}=>${
    LocalFileStorageProvider.internalName
  }`]: ({ project, newFileMetadata, onProgress }) =>
    moveUrlResourcesToLocalFiles({
      project,
      fileMetadata: newFileMetadata,
      onProgress,
    }),

  // Moving to GDevelop "Cloud" storage:

  //TODO
  [`${LocalFileStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveAllLocalResourcesToCloudResources,
  // From a Cloud project to another, resources need to be copied
  // (unless they are public URLs).
  [`${CloudStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveAllCloudProjectResourcesToCloudProject,
  // Nothing to move around when going from a project on a public URL
  // to a cloud project (we could offer an option one day though to download
  // and upload the URL resources on GDevelop Cloud).
  [`${UrlStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveNothing,
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
