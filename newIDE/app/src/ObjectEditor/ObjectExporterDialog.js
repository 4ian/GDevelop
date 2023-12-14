// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import assignIn from 'lodash/assignIn';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { Column, Line } from '../UI/Grid';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Window from '../Utils/Window';
import { mapFor } from '../Utils/MapFor';
import Upload from '../UI/CustomSvgIcons/Upload';

import {
  BlobDownloadUrlHolder,
  openBlobDownloadUrl,
} from '../Utils/BlobDownloadUrlHolder';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { serializeToObjectAsset } from '../Utils/Serializer';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { downloadUrlsToBlobs, type ItemResult } from '../Utils/BlobDownloader';
import { useGenericRetryableProcessWithProgress } from '../Utils/UseGenericRetryableProcessWithProgress';
import { checkIfIsGDevelopCloudBucketUrl } from '../Utils/CrossOrigin';
import { extractFilenameFromProjectResourceUrl } from '../Utils/GDevelopServices/Project';
import {
  archiveFiles,
  type BlobFileDescriptor,
  type TextFileDescriptor,
} from '../Utils/BrowserArchiver';
import path from 'path-browserify';

const gd: libGDevelop = global.gd;

// For some reason, `path.posix` is undefined when packaged
// with webpack, so we're using `path` directly. As it's for the web-app,
// it should always be the posix version. In tests on Windows,
// it's necessary to use path.posix.
// Search for "pathPosix" in the codebase for other places where this is used.
const pathPosix = path.posix || path;

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

type DownloadResourcesAsBlobsOptionsWithoutProgress = {
  project: gdProject,
  resourceNames: Array<string>,
  onAddBlobFile: (resourceName: string, blob: Blob) => void,
};

type DownloadResourcesAsBlobsOptions = {
  ...DownloadResourcesAsBlobsOptionsWithoutProgress,
  onProgress: (count: number, total: number) => void,
};

export const downloadResourcesAsBlobs = async ({
  project,
  resourceNames,
  onAddBlobFile,
  onProgress,
}: DownloadResourcesAsBlobsOptions) => {
  const result = {
    erroredResources: [],
  };

  type ResourceToFetch = {|
    resource: gdResource,
    url: string,
    filename: string,
  |};

  const resourcesManager = project.getResourcesManager();
  const resourcesToFetchAndUpload = resourceNames
    .map(
      (resourceName: string): ?ResourceToFetch => {
        const resource = resourcesManager.getResource(resourceName);
        const resourceFile = resource.getFile();

        if (isURL(resourceFile)) {
          return {
            resource,
            url: resourceFile,
            filename: extractFilenameFromProjectResourceUrl(resourceFile),
          };
        } else {
          // Local resource: unsupported.
          result.erroredResources.push({
            resourceName: resource.getName(),
            error: new Error(
              'Unsupported relative file when downloading a copy.'
            ),
          });
          return null;
        }
      }
    )
    .filter(Boolean);

  // Download all the project resources as blob (much like what is done during an export).
  const downloadedBlobsAndResources: Array<
    ItemResult<ResourceToFetch>
  > = await downloadUrlsToBlobs({
    urlContainers: resourcesToFetchAndUpload,
    onProgress: (count, total) => {
      onProgress(count, total * 2);
    },
  });

  downloadedBlobsAndResources.forEach(({ item, error, blob }) => {
    const { resource, filename } = item;
    if (error || !blob) {
      result.erroredResources.push({
        resourceName: resource.getName(),
        error: error || new Error('Unknown error during download.'),
      });
      return;
    }
    onAddBlobFile(resource.getName(), blob);
  });

  return result;
};

const addSpacesToPascalCase = (pascalCaseName: string): string => {
  let name = pascalCaseName
    .replace(/([A-Z]+|\d+)/g, ' $1')
    .replace(/_(\w)/g, (match, $1) => ' ' + $1.toUpperCase())
    .replace(/_/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  name = name.charAt(0) === ' ' ? name.substring(1) : name;
  return name;
};

const exportObjectAsset = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  customObject: gdObject
) => {
  await exportObjectsAssets(
    eventsFunctionsExtensionsState,
    project,
    [customObject],
    customObject.getName()
  );
};

const exportLayoutObjectAssets = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  layout: gdLayout
) => {
  await exportObjectsAssets(
    eventsFunctionsExtensionsState,
    project,
    mapFor(0, layout.getObjectsCount(), i => layout.getObjectAt(i)),
    layout.getName()
  );
};

const exportObjectsAssets = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  objects: gdObject[],
  defaultName: string
) => {
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
  if (!eventsFunctionsExtensionWriter) {
    // This won't happen in practice because this view can't be reached from the web-app.
    throw new Error(
      "The object can't be exported because it's not supported by the web-app."
    );
  }
  const pathOrUrl = await eventsFunctionsExtensionWriter.chooseObjectAssetFile(
    defaultName
  );

  if (!pathOrUrl) return;

  await eventsFunctionsExtensionWriter.writeObjectsAssets(
    project,
    objects,
    pathOrUrl
  );
};

const openGitHubIssue = () => {
  Window.openExternalURL(
    'https://github.com/4ian/GDevelop/issues/new?assignees=&labels=%F0%9F%93%A6+Asset+Store+submission&template=--asset-store-submission.md&title='
  );
};

type Props = {|
  project: gdProject,
  layout: gdLayout,
  object: gdObject,
  onClose: () => void,
|};

const ObjectExporterDialog = ({ project, layout, object, onClose }: Props) => {
  const [zippedProjectBlob, setZippedProjectBlob] = React.useState<?Blob>(null);
  const {
    ensureProcessIsDone: ensureDownloadResourcesAsBlobsIsDone,
    renderProcessDialog,
  } = useGenericRetryableProcessWithProgress<DownloadResourcesAsBlobsOptionsWithoutProgress>(
    {
      onDoProcess: React.useCallback(
        (options, onProgress) =>
          downloadResourcesAsBlobs({ ...options, onProgress }),
        []
      ),
    }
  );
  React.useEffect(
    () => {
      (async () => {
        setZippedProjectBlob(null);
        // Make a copy of the project, as it will be updated.
        const clonedObject = object.clone().get();
        try {
          const resourcesInUse = new gd.ResourcesInUseHelper(
            project.getResourcesManager()
          );
          object.getConfiguration().exposeResources(resourcesInUse);
          const objectResourceNames = resourcesInUse
            .getAllImages()
            .toNewVectorString()
            .toJSArray();
          resourcesInUse.delete();

          // Download resources to blobs, and update the project resources.
          const blobFiles: Array<BlobFileDescriptor> = [];
          const blobByResourceName: Map<string, Blob> = new Map();
          const textFiles: Array<TextFileDescriptor> = [];
          await ensureDownloadResourcesAsBlobsIsDone({
            project,
            resourceNames: objectResourceNames,
            onAddBlobFile: (resourceName: string, blob: Blob) => {
              blobByResourceName.set(resourceName, blob);
            },
          });

          const resourceFileRenamingMap = new gd.MapStringString();
          gd.ObjectAssetSerializer.renameObjectResourceFiles(
            project,
            clonedObject,
            '',
            addSpacesToPascalCase(clonedObject.getName()),
            resourceFileRenamingMap
          );

          const resourcesManager = project.getResourcesManager();
          for (const [resourceName, blob] of blobByResourceName) {
            const resource = resourcesManager.getResource(resourceName);
            if (!resourceFileRenamingMap.has(resource.getFile())) {
              continue;
            }
            const resourceFile = resourceFileRenamingMap.get(
              resource.getFile()
            );
            blobFiles.push({ filePath: resourceFile, blob });
          }
          resourceFileRenamingMap.delete();

          // Serialize the project.
          const serializedObject = serializeToObjectAsset(
            project,
            clonedObject
          );
          // Resource names are changed by copyObjectResourcesTo so they don't
          // match any project resource.
          serializedObject.objectAssets.forEach(asset =>
            asset.resources.forEach(resource => {
              resource.file = resource.name;
            })
          );
          textFiles.push({
            text: JSON.stringify(serializedObject, null, 2),
            filePath: addSpacesToPascalCase(object.getName()) + '.asset.json',
          });

          // Archive the whole project.
          const zippedProjectBlob = await archiveFiles({
            textFiles,
            blobFiles,
            basePath: '/',
            onProgress: (count: number, total: number) => {},
          });
          setZippedProjectBlob(zippedProjectBlob);
        } catch (rawError) {
          showErrorBox({
            message:
              'Unable to save your project because of an internal error.',
            rawError,
            errorId: 'download-file-save-as-dialog-error',
          });
          return;
        } finally {
          // TODO Should it be done?
          //clonedObject.delete();
        }
      })();
      return () => setZippedProjectBlob(null);
    },
    [project, ensureDownloadResourcesAsBlobsIsDone, object]
  );

  return (
    <Dialog
      title={<Trans>Export {object.getName()}</Trans>}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/community/contribute-to-the-assets-store"
        />,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          keyboardFocused={true}
          onClick={onClose}
          key="close"
        />,
      ]}
      open
      onRequestClose={onClose}
      maxWidth="sm"
    >
      <ColumnStackLayout expand>
        <Line>
          <Text>
            <Trans>
              You can export the object to a file to submit it to the asset
              store.
            </Trans>
          </Text>
        </Line>
        <Line>
          <Text size="block-title">
            <Trans>1. Export the assets</Trans>
          </Text>
        </Line>
        <ResponsiveLineStackLayout>
          {zippedProjectBlob ? (
            <BlobDownloadUrlHolder blob={zippedProjectBlob}>
              {blobDownloadUrl => (
                <RaisedButton
                  icon={<Upload />}
                  primary
                  onClick={() =>
                    openBlobDownloadUrl(blobDownloadUrl, 'gdevelop-game.gdo')
                  }
                  label={<Trans>Export the object</Trans>}
                />
              )}
            </BlobDownloadUrlHolder>
          ) : (
            <PlaceholderLoader />
          )}
          <FlatButton
            label={<Trans>Export all scene objects</Trans>}
            onClick={
              () => {}
              // exportLayoutObjectAssets(
              //   eventsFunctionsExtensionsState,
              //   project,
              //   layout
              // )
            }
          />
        </ResponsiveLineStackLayout>
        <Line>
          <Text size="block-title">
            <Trans>2. Submit the assets</Trans>
          </Text>
        </Line>
        <Line>
          <FlatButton
            label={<Trans>Submit objects to the community</Trans>}
            onClick={openGitHubIssue}
          />
        </Line>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ObjectExporterDialog;
