// @flow
import {
  type ResourceExternalEditor,
  type ExternalEditorInput,
  type ExternalEditorOutput,
  type ExternalEditorBase64Resource,
  type EditWithExternalEditorOptions,
  saveBlobUrlsFromExternalEditorBase64Resources,
  freeBlobsAndUpdateMetadata,
  patchExternalEditorMetadataWithResourcesNamesIfNecessary,
  readMetadata,
} from './ResourceExternalEditor';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';
import { isBlobURL, isURL } from './ResourceUtils';
import { type ResourceKind } from './ResourceSource';
import {
  convertBlobToDataURL,
  downloadUrlsToBlobs,
  type ItemResult,
} from '../Utils/BlobDownloader';
import { showWarningBox } from '../UI/Messages/MessageBox';
let nextExternalEditorWindowId = 0;

const externalEditorIndexHtml: { ['piskel' | 'yarn' | 'jfxr']: string } = {
  piskel: 'external/piskel/piskel-index.html',
  yarn: 'external/yarn/yarn-index.html',
  jfxr: 'external/jfxr/jfxr-index.html',
};

const openAndWaitForExternalEditorWindow = async (
  editorName: 'piskel' | 'yarn' | 'jfxr',
  externalEditorInput: ExternalEditorInput
): Promise<?ExternalEditorOutput> => {
  const targetId = 'GDevelopExternalEditor' + nextExternalEditorWindowId++;
  const width = 800;
  const height = 600;
  const left = window.screenX + window.innerWidth / 2 - width / 2;
  const top = window.screenY + window.innerHeight / 2 - height / 2;

  return new Promise(resolve => {
    let externalEditorLoaded = false;
    let externalEditorClosed = false;
    let externalEditorOutput: ?ExternalEditorOutput = null;
    const externalEditorWindow = window.open(
      externalEditorIndexHtml[editorName],
      targetId,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!externalEditorWindow) {
      // If the window can't be opened, at least avoid a crash.
      resolve(null);
      return;
    }

    const onMessageEvent = (event: MessageEvent) => {
      if (event.source !== externalEditorWindow) {
        return;
      }

      if (!event.data || typeof event.data !== 'object') {
        console.warn(
          'Ignoring malformed message data from the external editor window.'
        );
        return;
      }

      const { id, payload } = event.data;
      if (id === `external-editor-ready`)
        externalEditorWindow.postMessage(
          {
            id: 'open-external-editor-input',
            payload: externalEditorInput,
          },
          // Ensure only external editors hosted on the same server as the GDevelop editor
          // can receive the message:
          window.location.origin
        );
      else if (id === `save-external-editor-output`) {
        console.info(`Received data from external editor "${editorName}."`);
        // $FlowFixMe - assuming the typing is good.
        externalEditorOutput = payload;
      } else if (event.data.id === 'close') {
        externalEditorWindow.close();
        onExternalEditorWindowClosed();
      }
    };
    window.addEventListener('message', onMessageEvent);

    const onExternalEditorWindowClosed = () => {
      if (externalEditorClosed) {
        // Somehow this editor was already closed.
        return;
      }
      externalEditorClosed = true;
      console.info(`External editor "${editorName}" closed.`);
      window.removeEventListener('message', onMessageEvent);
      resolve(externalEditorOutput);
    };

    externalEditorWindow.addEventListener('load', () => {
      console.info(`External editor "${editorName}" loaded.`);
      externalEditorLoaded = true;

      externalEditorWindow.addEventListener('unload', () => {
        onExternalEditorWindowClosed();
      });
    });

    setTimeout(() => {
      if (externalEditorLoaded || externalEditorClosed) return;
      console.info(
        `External editor "${editorName} not loaded after 10 seconds - closing its window."`
      );

      // The external editor is not loaded after 10 seconds, abort.
      externalEditorWindow.close();
      onExternalEditorWindowClosed();
    }, 10000);
  });
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

  const urlsToDownload: Array<ResourceToDownload> = [];
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
      console.error('Unsupported local file for a resource - ignoring it.');
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
const editWithBrowserExternalEditor = async ({
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

const cloudProjectWarning = t`You need to save this project as a cloud project to install this asset. Please save your project and try again.`;

/**
 * This is the list of editors that can be used to edit resources
 * when running in a browser.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    createDisplayName: t`Create with Piskel`,
    editDisplayName: t`Edit with Piskel`,
    kind: 'image',
    edit: async options => {
      if (options.getStorageProvider().internalName !== 'Cloud') {
        const { i18n } = options;
        showWarningBox(i18n._(cloudProjectWarning), {
          delayToNextTick: true,
        });
        return null;
      }

      return await editWithBrowserExternalEditor({
        options,
        externalEditorName: 'piskel',
        defaultName: 'New image',
        metadataKey: 'pskl',
        resourceKind: 'image',
      });
    },
  },
  {
    name: 'jfxr-app',
    createDisplayName: t`Create with Jfxr`,
    editDisplayName: t`Edit with Jfxr`,
    kind: 'audio',
    edit: async options => {
      if (options.getStorageProvider().internalName !== 'Cloud') {
        const { i18n } = options;
        showWarningBox(i18n._(cloudProjectWarning), {
          delayToNextTick: true,
        });
        return null;
      }

      return await editWithBrowserExternalEditor({
        options,
        externalEditorName: 'jfxr',
        defaultName: 'New sound effect',
        metadataKey: 'jfxr',
        resourceKind: 'audio',
      });
    },
  },
  {
    name: 'yarn-app',
    createDisplayName: t`Create with Yarn`,
    editDisplayName: t`Edit with Yarn`,
    kind: 'json',
    edit: async options => {
      if (options.getStorageProvider().internalName !== 'Cloud') {
        const { i18n } = options;
        showWarningBox(i18n._(cloudProjectWarning), {
          delayToNextTick: true,
        });
        return null;
      }

      return await editWithBrowserExternalEditor({
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
