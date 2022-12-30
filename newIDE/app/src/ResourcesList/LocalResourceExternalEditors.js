// @flow
import {
  type ResourceExternalEditor,
  type ExternalEditorInput,
  type ExternalEditorOutput,
  type ExternalEditorBase64Resource,
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

/**
 * Ask Electron main process to open a window for the specified editor,
 * then wait for the editor to be closed and pass the results.
 */
const openAndWaitForExternalEditorWindow = async (
  editorName: 'piskel' | 'yarn' | 'jfxr',
  externalEditorInput: ExternalEditorInput
): Promise<ExternalEditorOutput> => {
  if (!ipcRenderer) throw new Error('Not supported.');
  return new Promise(resolve => {
    ipcRenderer.removeAllListeners(`${editorName}-closed`);
    ipcRenderer.on(`${editorName}-closed`, (event, externalEditorData) => {
      resolve(externalEditorData);
    });

    ipcRenderer.send(`${editorName}-load`, externalEditorInput);
  });
};

// TODO: quickly test this.
const downloadAndPrepareExternalEditorBase64Resources = async ({
  project,
  resourceNames,
}: {|
  project: gdProject,
  resourceNames: Array<string>,
|}) => {
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
|}): Promise<
  Array<{|
    name: string,
    blobUrl: string,
    originalIndex?: ?number,
  |}>
> => {
  const resourcesManager = project.getResourcesManager();
  const blobs = resources.map(
    ({ name, dataUrl, localFilePath, extension, originalIndex }) => {
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
        if (newResource) {
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
        } else {
          console.error(
            'Could not create a resource for kind: ' + resourceKind
          );
        }

        return {
          name,
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
          name,
          originalIndex,
          blobUrl,
        };
      }
    }
  );

  return blobs;
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
      sendExternalEditorOpened('piskel');
      const { project, resourceNames, resourceManagementProps } = options;

      const resources = await downloadAndPrepareExternalEditorBase64Resources({
        project,
        resourceNames,
      });
      const externalEditorInput: ExternalEditorInput = {
        // TODO: remove "extraOptions".
        singleFrame: options.singleFrame,
        // TODO: adapt to read metadata and merge.
        externalEditorData: options.extraOptions.externalEditorData,
        fps: options.extraOptions.fps,
        isLooping: options.extraOptions.isLooping,
        name: options.extraOptions.name || resourceNames[0] || 'New resource',
        resources,
      };
      const externalEditorOutput: ExternalEditorOutput = await openAndWaitForExternalEditorWindow(
        'piskel',
        externalEditorInput
      );
      const outputResources = await saveBlobUrlsFromExternalEditorBase64Resources(
        {
          baseNameForNewResources: externalEditorOutput.baseNameForNewResources,
          project,
          resources: externalEditorOutput.resources,
          resourceKind: 'image',
        }
      );
      try {
        await resourceManagementProps.onFetchNewlyAddedResources();
      } catch (error) {
        console.error(
          'An error happened while fetching the newly added resources:',
          error
        );
      }

      outputResources.forEach(({ blobUrl }) => {
        // Free the blob urls that were created just to allow the resources
        // to be "fetched" to their final destination by `onFetchNewlyAddedResources`.
        URL.revokeObjectURL(blobUrl);

        // TODO: put again/add metadata to the resources.
      });

      return {
        resources: outputResources.map(({ name, originalIndex }) => ({
          name,
          originalIndex,
        })),
        externalEditorData: externalEditorOutput.externalEditorData,
      };
    },
  },
  {
    name: 'Jfxr',
    createDisplayName: t`Create with Jfxr`,
    editDisplayName: t`Edit with Jfxr`,
    kind: 'audio',
    edit: async options => {
      sendExternalEditorOpened('jfxr');
      const { project, resourceNames, resourceManagementProps } = options;

      const resources = await downloadAndPrepareExternalEditorBase64Resources({
        project,
        resourceNames,
      });
      const externalEditorInput: ExternalEditorInput = {
        // TODO: remove "extraOptions".
        singleFrame: options.singleFrame,
        // TODO: adapt to read metadata and merge.
        externalEditorData: options.extraOptions.externalEditorData,
        fps: options.extraOptions.fps,
        isLooping: options.extraOptions.isLooping,
        name: options.extraOptions.name || resourceNames[0] || 'New resource',
        resources,
      };
      const externalEditorOutput = await openAndWaitForExternalEditorWindow(
        'jfxr',
        externalEditorInput
      );
      const outputResources = await saveBlobUrlsFromExternalEditorBase64Resources(
        {
          baseNameForNewResources: externalEditorOutput.baseNameForNewResources,
          project,
          resources: externalEditorOutput.resources,
          resourceKind: 'audio',
        }
      );
      try {
        await resourceManagementProps.onFetchNewlyAddedResources();
      } catch (error) {
        console.error(
          'An error happened while fetching the newly added resources:',
          error
        );
      }

      outputResources.forEach(({ blobUrl }) => {
        // Free the blob urls that were created just to allow the resources
        // to be "fetched" to their final destination by `onFetchNewlyAddedResources`.
        URL.revokeObjectURL(blobUrl);

        // TODO: put again/add metadata to the resources.
      });
      return {
        resources: outputResources.map(({ name, originalIndex }) => ({
          name,
          originalIndex,
        })),
        externalEditorData: externalEditorOutput.externalEditorData,
      };
    },
  },
  {
    name: 'Yarn',
    createDisplayName: t`Create with Yarn`,
    editDisplayName: t`Edit with Yarn`,
    kind: 'json',
    edit: async options => {
      sendExternalEditorOpened('yarn');
      const { project, resourceNames, resourceManagementProps } = options;

      const resources = await downloadAndPrepareExternalEditorBase64Resources({
        project,
        resourceNames,
      });
      const externalEditorInput: ExternalEditorInput = {
        // TODO: remove "extraOptions".
        singleFrame: options.singleFrame,
        // TODO: adapt to read metadata and merge.
        externalEditorData: options.extraOptions.externalEditorData,
        fps: options.extraOptions.fps,
        isLooping: options.extraOptions.isLooping,
        name: options.extraOptions.name || resourceNames[0] || 'New resource',
        resources,
      };
      const externalEditorOutput = await openAndWaitForExternalEditorWindow(
        'yarn',
        externalEditorInput
      );
      const outputResources = await saveBlobUrlsFromExternalEditorBase64Resources(
        {
          baseNameForNewResources: externalEditorOutput.baseNameForNewResources,
          project,
          resources: externalEditorOutput.resources,
          resourceKind: 'json',
        }
      );
      try {
        await resourceManagementProps.onFetchNewlyAddedResources();
      } catch (error) {
        console.error(
          'An error happened while fetching the newly added resources:',
          error
        );
      }

      outputResources.forEach(({ blobUrl }) => {
        // Free the blob urls that were created just to allow the resources
        // to be "fetched" to their final destination by `onFetchNewlyAddedResources`.
        URL.revokeObjectURL(blobUrl);

        // TODO: put again/add metadata to the resources.
      });
      return {
        resources: outputResources.map(({ name, originalIndex }) => ({
          name,
          originalIndex,
        })),
        externalEditorData: externalEditorOutput.externalEditorData,
      };
    },
  },
];

export default editors;
