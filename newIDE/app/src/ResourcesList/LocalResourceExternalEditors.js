// @flow
import {
  type ResourceExternalEditor,
  type ExternalEditorInput,
  type ExternalEditorOutput,
  type ExternalEditorBase64Resource,
  type EditWithExternalEditorOptions,
  readMetadata,
  saveBlobUrlsFromExternalEditorBase64Resources,
  freeBlobsAndUpdateMetadata,
  patchExternalEditorMetadataWithResourcesNamesIfNecessary,
} from './ResourceExternalEditor';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';
import optionalRequire from '../Utils/OptionalRequire';
import { isBlobURL, isURL } from './ResourceUtils';
import {
  convertBlobToDataURL,
  downloadUrlsToBlobs,
  type ItemResult,
} from '../Utils/BlobDownloader';
import { type ResourceKind } from './ResourceSource';

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
): Promise<?ExternalEditorOutput> => {
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
  const externalEditorOutput: ?ExternalEditorOutput = await openAndWaitForExternalEditorWindow(
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
