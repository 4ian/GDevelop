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
import { displayBlackLoadingScreen } from '../Utils/BrowserExternalWindowUtils';
import { UserCancellationError } from '../LoginProvider/Utils';
let nextExternalEditorWindowId = 0;

const externalEditorIndexHtml: { ['piskel' | 'yarn' | 'jfxr']: string } = {
  piskel: 'external/piskel/piskel-index.html',
  yarn: 'external/yarn/yarn-index.html',
  jfxr: 'external/jfxr/jfxr-index.html',
};

const openAndWaitForExternalEditorWindow = async ({
  externalEditorWindow,
  externalEditorName,
  externalEditorInput,
  signal,
}: {|
  externalEditorWindow: any,
  externalEditorName: 'piskel' | 'yarn' | 'jfxr',
  externalEditorInput: ExternalEditorInput,
  signal: AbortSignal,
|}): Promise<?ExternalEditorOutput> => {
  if (signal.aborted) {
    return Promise.reject(new UserCancellationError(''));
  }
  return new Promise((resolve, reject) => {
    let externalEditorLoaded = false;
    let externalEditorClosed = false;
    let externalEditorOutput: ?ExternalEditorOutput = null;

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
      if (id === `external-editor-ready`) {
        console.info(`External editor "${externalEditorName}" ready.`);

        // Some browsers like Safari might not trigger the "load" event, but now we can
        // be sure the editor is loaded: the proof being that we received this message.
        // Mark the editor as loaded and re-attach a unload listener to be safe.
        externalEditorLoaded = true;
        externalEditorWindow.addEventListener('unload', () => {
          onExternalEditorWindowClosed();
        });

        // Now that the external editor is loaded and ready, we can ask it to open the resources.
        externalEditorWindow.postMessage(
          {
            id: 'open-external-editor-input',
            payload: externalEditorInput,
          },
          // Ensure only external editors hosted on the same server as the GDevelop editor
          // can receive the message:
          window.location.origin
        );
      } else if (id === `save-external-editor-output`) {
        console.info(
          `Received data from external editor "${externalEditorName}."`
        );
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
      console.info(`External editor "${externalEditorName}" closed.`);
      window.removeEventListener('message', onMessageEvent);
      resolve(externalEditorOutput);
    };

    signal.addEventListener('abort', () => {
      reject(new UserCancellationError(''));
      if (externalEditorClosed) return;
      externalEditorWindow.close();
      onExternalEditorWindowClosed();
    });

    externalEditorWindow.addEventListener('load', () => {
      console.info(`External editor "${externalEditorName}" loaded.`);
      externalEditorLoaded = true;

      externalEditorWindow.addEventListener('unload', () => {
        onExternalEditorWindowClosed();
      });
    });

    // Change the HTML file displayed by the window so that it starts loading
    // the editor.
    // The browser will load the editor HTML/CSS/JS, then will fire the `load` event
    // (though not on Safari), then the editor will send a `external-editor-ready` event
    // (on all browsers), after which we will then be ready to have it open the resources.
    // (see `open-external-editor-input`).
    externalEditorWindow.location = externalEditorIndexHtml[externalEditorName];

    // If the editor is not ready after 10 seconds and not closed, force it to be closed.
    // Something wrong is going on and we don't want to block the user.
    setTimeout(() => {
      if (externalEditorLoaded || externalEditorClosed) return;
      console.info(
        `External editor "${externalEditorName} not loaded after 10 seconds - closing its window."`
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
  externalEditorWindow,
  defaultName,
  metadataKey,
  resourceKind,
  options,
}: {|
  externalEditorName: 'piskel' | 'yarn' | 'jfxr',
  externalEditorWindow: any,
  defaultName: string,
  metadataKey: string,
  resourceKind: ResourceKind,
  options: EditWithExternalEditorOptions,
|}) => {
  const { project, resourceNames, resourceManagementProps, signal } = options;

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
    { externalEditorWindow, externalEditorName, externalEditorInput, signal }
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
 * Open a window showing a black "loading..." screen. It's important this is done
 * NOT in an asynchronous way but JUST after a click. Otherwise, browsers like Safari
 * will block the window opening.
 */
const immediatelyOpenLoadingWindowForExternalEditor = () => {
  const targetId = 'GDevelopExternalEditor' + nextExternalEditorWindowId++;
  const width = 800;
  const height = 600;
  const left = window.screenX + window.innerWidth / 2 - width / 2;
  const top = window.screenY + window.innerHeight / 2 - height / 2;

  const externalEditorWindow = window.open(
    'about:blank',
    targetId,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  if (!externalEditorWindow) {
    throw new Error(
      "Can't open the external editor because of browser restrictions."
    );
  }

  displayBlackLoadingScreen(externalEditorWindow);

  return externalEditorWindow;
};

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

      const externalEditorWindow = immediatelyOpenLoadingWindowForExternalEditor();
      return await editWithBrowserExternalEditor({
        options,
        externalEditorWindow,
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

      const externalEditorWindow = immediatelyOpenLoadingWindowForExternalEditor();
      return await editWithBrowserExternalEditor({
        options,
        externalEditorWindow,
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

      const externalEditorWindow = immediatelyOpenLoadingWindowForExternalEditor();
      return await editWithBrowserExternalEditor({
        options,
        externalEditorWindow,
        externalEditorName: 'yarn',
        defaultName: 'New dialogue tree',
        metadataKey: 'yarn',
        resourceKind: 'json',
      });
    },
  },
];

export default editors;
