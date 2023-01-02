// @flow
import {
  type ResourceExternalEditor,
  type ExternalEditorInput,
  type ExternalEditorOutput,
  type ExternalEditorBase64Resource,
  type EditWithExternalEditorOptions,
} from './ResourceExternalEditor.flow';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';
import optionalRequire from '../Utils/OptionalRequire';
import { isBlobURL, isURL, updateResourceJsonMetadata } from './ResourceUtils';
import {
  convertBlobToDataURL,
  convertDataURLtoBlob,
  downloadUrlsToBlobs,
  type ItemResult,
} from '../Utils/BlobDownloader';
import { createNewResource, type ResourceKind } from './ResourceSource';
import newNameGenerator from '../Utils/NewNameGenerator';
const path = optionalRequire('path');
const fs = optionalRequire('fs');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type ResourceWithTemporaryBlobUrl = {|
  resource: gdResource,
  blobUrl: string,
  originalIndex?: ?number,
|};

/**
 * Ask Electron main process to open a window for the specified editor,
 * then wait for the editor to be closed and pass the results.
 */
const openAndWaitForExternalEditorWindow = async (
  editorName: 'piskel' | 'yarn' | 'jfxr',
  externalEditorInput: ExternalEditorInput
): Promise<ExternalEditorOutput> => {
  if (!ipcRenderer) throw new Error('Not supported.');

  const externalEditorOutput = await ipcRenderer.invoke(
    `${editorName}-load`,
    externalEditorInput
  );
  return externalEditorOutput;
};

/**
 * Download (or read locally) resources and prepare them to be edited
 * by an external editor.
 */
export const downloadAndPrepareExternalEditorBase64Resources = async ({
  project,
  resourceNames,
}: {|
  project: gdProject,
  resourceNames: Array<string>,
|}): Promise<Array<ExternalEditorBase64Resource>> => {
  type ResourceToDownload = {|
    resourceName: string,
    url: string,
  |};

  type ResourceToReadLocally = {|
    resourceName: string,
    localFilePath: string,
  |};

  const projectPath = path.dirname(project.getProjectFile());
  const urlsToDownload: Array<ResourceToDownload> = [];
  const filesToRead: Array<ResourceToReadLocally> = [];
  const resourcesManager = project.getResourcesManager();
  resourceNames.forEach(resourceName => {
    if (!resourcesManager.hasResource(resourceName)) return;

    const resource = resourcesManager.getResource(resourceName);
    const url = resource.getFile();
    if (isURL(url)) {
      if (isBlobURL(url)) {
        console.error('Unsupported blob URL for a resource - ignoring it.');
      } else {
        urlsToDownload.push({
          url,
          resourceName,
        });
      }
    } else {
      // This resource is a local file.
      filesToRead.push({
        localFilePath: url,
        resourceName,
      });
    }
  });

  const downloadedBlobs: Array<
    ItemResult<ResourceToDownload>
  > = await downloadUrlsToBlobs({
    urlContainers: urlsToDownload,
    onProgress: (count, total) => {},
  });

  const resourcesToDataUrl = new Map<
    string,
    {|
      dataUrl: string,
      localFilePath?: string,
    |}
  >();
  await Promise.all(
    downloadedBlobs.map(async ({ error, blob, item }) => {
      if (blob) {
        try {
          resourcesToDataUrl.set(item.resourceName, {
            dataUrl: await convertBlobToDataURL(blob),
          });
        } catch (error) {
          console.error(
            `Unable to read data from resource "${
              item.resourceName
            }" - ignoring it.`,
            error
          );
        }
      }
    })
  );
  await Promise.all(
    filesToRead.map(async ({ localFilePath, resourceName }) => {
      try {
        const content = await fs.promises.readFile(
          path.resolve(projectPath, localFilePath)
        );

        resourcesToDataUrl.set(resourceName, {
          localFilePath,
          dataUrl: 'data:text/plain;base64,' + content.toString('base64'),
        });
      } catch (error) {
        console.error(
          `Unable to read local file "${localFilePath}" - ignoring it.`,
          error
        );
      }
    })
  );

  return resourceNames.map(resourceName => {
    const resourceData = resourcesToDataUrl.get(resourceName);
    if (!resourceData)
      return {
        name: resourceName,
        dataUrl: '',
      };

    const { localFilePath, dataUrl } = resourceData;
    return {
      name: resourceName,
      dataUrl,
      localFilePath,
    };
  });
};

/**
 * Store the given resources, sent by an external editors, into the resources
 * of the game (existing or new ones), with blob URLs - which should then be uploaded/stored
 * locally.
 */
const saveBlobUrlsFromExternalEditorBase64Resources = async ({
  project,
  baseNameForNewResources,
  resources,
  resourceKind,
}: {|
  project: gdProject,
  baseNameForNewResources: string,
  resources: Array<ExternalEditorBase64Resource>,
  resourceKind: ResourceKind,
|}): Promise<Array<ResourceWithTemporaryBlobUrl>> => {
  const resourcesManager = project.getResourcesManager();
  const blobs: Array<ResourceWithTemporaryBlobUrl> = resources
    .map(({ name, dataUrl, localFilePath, extension, originalIndex }) => {
      // Convert the data url to a blob URL.
      const blob = convertDataURLtoBlob(dataUrl);
      const blobUrl = blob ? URL.createObjectURL(blob) : '';

      if (!name || !resourcesManager.hasResource(name)) {
        // Insert a new resource.
        // Store the blob url, as well as indication
        // about which extension (for a new file) or filename to use (to overwrite existing file).
        const name = newNameGenerator(baseNameForNewResources, name =>
          resourcesManager.hasResource(name)
        );
        console.info('Creating new resource ' + name + '...');

        const newResource = createNewResource(resourceKind);
        if (!newResource) {
          console.error(
            'Could not create a resource for kind: ' + resourceKind
          );
          return null;
        }
        newResource.setName(name);
        newResource.setFile(blobUrl);
        newResource.setMetadata(
          JSON.stringify({
            localFilePath,
            extension,
          })
        );
        resourcesManager.addResource(newResource);
        newResource.delete();

        return {
          resource: resourcesManager.getResource(name),
          originalIndex,
          blobUrl,
        };
      } else {
        console.info('Updating resource ' + name + '.');

        // Get the resource and store the blob url, as well as indication
        // about which extension (for a new file) or filename to use (to overwrite existing file).
        const resource = resourcesManager.getResource(name);
        resource.setFile(blobUrl);
        updateResourceJsonMetadata(resource, {
          localFilePath,
          extension,
        });

        return {
          resource,
          originalIndex,
          blobUrl,
        };
      }
    })
    .filter(Boolean);

  return blobs;
};

/**
 * Free the blob URLs from each resource (to do once these blob URLs have been properly
 * uploaded/stored locally) and update the resources with the given metadata, if any.
 */
const freeBlobsAndUpdateMetadata = ({
  modifiedResources,
  metadataKey,
  metadata,
}: {|
  modifiedResources: Array<ResourceWithTemporaryBlobUrl>,
  metadataKey: string,
  metadata: ?any,
|}) => {
  modifiedResources.forEach(({ resource, blobUrl }) => {
    // Free the blob urls that were created just to allow the resources
    // to be "fetched" to their final destination by `onFetchNewlyAddedResources`.
    // If we don't revoke these blob urls, they will stay in memory forever, despite
    // being used only temporarily as a temporary storage before they are uploaded somewhere
    // (Cloud) or written to the disk (LocalFile).
    URL.revokeObjectURL(blobUrl);

    // Update the modified resources with the metadata of the editor.
    if (metadata) {
      updateResourceJsonMetadata(resource, {
        [metadataKey]: metadata,
      });
    }
  });
};

/**
 * If the editor is storing the names of the resources (Piskel),
 * save them now. It will be useful for the editor,
 * to restore the resources in the proper order.
 */
const patchExternalEditorMetadataWithResourcesNamesIfNecessary = (
  modifiedResourceNames: Array<string>,
  metadata: ?any
) => {
  if (
    metadata &&
    typeof metadata === 'object' &&
    Array.isArray(metadata.resourceNames)
  ) {
    metadata.resourceNames = modifiedResourceNames;
  }
};

const readMetadata = (metadataKey: string, metadata: ?any): ?any => {
  if (!metadata) return null;

  try {
    const parsedMetadata = JSON.parse(metadata);
    if (parsedMetadata && typeof parsedMetadata === 'object') {
      if (parsedMetadata[metadataKey]) return parsedMetadata[metadataKey];
    }
  } catch (error) {
    console.warn('Malformed metadata for a resource - ignoring it.', error);
  }

  return null;
};

/**
 * Edit one or more resources with the specified external editor.
 */
const editWithLocalExternalEditor = async ({
  externalEditorName,
  defaultName,
  metadataKey,
  resourceKind,
  options,
}: {|
  externalEditorName: 'piskel' | 'yarn' | 'jfxr',
  defaultName: string,
  metadataKey: string,
  resourceKind: ResourceKind,
  options: EditWithExternalEditorOptions,
|}) => {
  const { project, resourceNames, resourceManagementProps } = options;

  // Fetch all edited resources as base64 encoded "data urls" (`data:...`).
  const resources = await downloadAndPrepareExternalEditorBase64Resources({
    project,
    resourceNames,
  });

  // Open the external editor, passing the resources with the data urls.
  const externalEditorInput: ExternalEditorInput = {
    singleFrame: options.extraOptions.singleFrame,
    externalEditorData: readMetadata(
      metadataKey,
      options.extraOptions.existingMetadata
    ),
    fps: options.extraOptions.fps,
    isLooping: options.extraOptions.isLooping,
    name: options.extraOptions.name || resourceNames[0] || defaultName,
    resources,
  };
  sendExternalEditorOpened(externalEditorName);
  const externalEditorOutput: ExternalEditorOutput = await openAndWaitForExternalEditorWindow(
    externalEditorName,
    externalEditorInput
  );
  if (!externalEditorOutput) return null; // Changes cancelled.

  // Save the edited files back to the GDevelop resources, as "blob urls" (blob:...)
  // which can then uploaded or saved locally.
  const modifiedResources = await saveBlobUrlsFromExternalEditorBase64Resources(
    {
      baseNameForNewResources: externalEditorOutput.baseNameForNewResources,
      project,
      resources: externalEditorOutput.resources,
      resourceKind,
    }
  );

  // Ask the project to persist the resources ("blob urls" will be either uploaded
  // or saved locally).
  try {
    await resourceManagementProps.onFetchNewlyAddedResources();
  } catch (error) {
    console.error(
      'An error happened while fetching the newly added resources:',
      error
    );
  }

  // Free the "blob urls" so that blobs don't stay in memory! They are only temporarily
  // useful while waiting for an upload/local file save.
  freeBlobsAndUpdateMetadata({
    modifiedResources,
    metadataKey,
    metadata: options.extraOptions.singleFrame
      ? externalEditorOutput.externalEditorData
      : null,
  });

  // Some editors (Piskel) need to have resource names persisted.
  patchExternalEditorMetadataWithResourcesNamesIfNecessary(
    modifiedResources.map(({ resource }) => resource.getName()),
    externalEditorOutput.externalEditorData
  );

  return {
    resources: modifiedResources.map(({ resource, originalIndex }) => ({
      name: resource.getName(),
      originalIndex,
    })),
    newName: externalEditorOutput.baseNameForNewResources,
    newMetadata: { [metadataKey]: externalEditorOutput.externalEditorData },
  };
};

/**
 * This is the list of editors that can be used to edit resources
 * on Electron runtime.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    createDisplayName: t`Create with Piskel`,
    editDisplayName: t`Edit with Piskel`,
    kind: 'image',
    edit: async options => {
      return await editWithLocalExternalEditor({
        options,
        externalEditorName: 'piskel',
        defaultName: 'New image',
        metadataKey: 'pskl',
        resourceKind: 'image',
      });
    },
  },
  {
    name: 'Jfxr',
    createDisplayName: t`Create with Jfxr`,
    editDisplayName: t`Edit with Jfxr`,
    kind: 'audio',
    edit: async options => {
      return await editWithLocalExternalEditor({
        options,
        externalEditorName: 'jfxr',
        defaultName: 'New sound effect',
        metadataKey: 'jfxr',
        resourceKind: 'audio',
      });
    },
  },
  {
    name: 'Yarn',
    createDisplayName: t`Create with Yarn`,
    editDisplayName: t`Edit with Yarn`,
    kind: 'json',
    edit: async options => {
      return await editWithLocalExternalEditor({
        options,
        externalEditorName: 'yarn',
        defaultName: 'New dialogue tree',
        metadataKey: 'yarn',
        resourceKind: 'json',
      });
    },
  },
];

export default editors;
