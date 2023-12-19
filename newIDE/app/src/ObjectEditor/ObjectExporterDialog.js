// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { Line } from '../UI/Grid';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
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
import { extractFilenameFromProjectResourceUrl } from '../Utils/GDevelopServices/Project';
import {
  archiveFiles,
  type BlobFileDescriptor,
  type TextFileDescriptor,
} from '../Utils/BrowserArchiver';

const gd: libGDevelop = global.gd;

const excludedObjectType = [
  'BBText::BBText',
  'Lighting::LightObject',
  'PrimitiveDrawing::Drawer',
  'TextEntryObject::TextEntry',
  'TextInput::TextInputObject',
  'TextObject::Text',
  'Video::VideoObject',
];

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
        return {
          resource,
          url: resourceFile,
          filename: extractFilenameFromProjectResourceUrl(resourceFile),
        };
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
    const { resource } = item;
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

const zipAssets = async (
  project: gdProject,
  objects: Array<gdObject>,
  ensureDownloadResourcesAsBlobsIsDone: (
    options: DownloadResourcesAsBlobsOptionsWithoutProgress
  ) => Promise<void>
): Promise<Blob | null> => {
  const blobFiles: Array<BlobFileDescriptor> = [];
  const textFiles: Array<TextFileDescriptor> = [];

  try {
    await Promise.all(
      objects.map(async object => {
        const resourcesInUse = new gd.ResourcesInUseHelper(
          project.getResourcesManager()
        );
        object.getConfiguration().exposeResources(resourcesInUse);
        const objectResourceNames = resourcesInUse
          .getAllResources()
          .toJSArray()
          .filter(name => name.length > 0);
        resourcesInUse.delete();

        // Download resources to blobs, and update the project resources.
        const blobByResourceName: Map<string, Blob> = new Map();
        await ensureDownloadResourcesAsBlobsIsDone({
          project,
          resourceNames: objectResourceNames,
          onAddBlobFile: (resourceName: string, blob: Blob) => {
            blobByResourceName.set(resourceName, blob);
          },
        });

        const clonedObject = object.clone().get();
        const resourceFileRenamingMap = new gd.MapStringString();
        const serializedObject = serializeToObjectAsset(
          project,
          clonedObject,
          addSpacesToPascalCase(clonedObject.getName()),
          resourceFileRenamingMap
        );

        const resourcesManager = project.getResourcesManager();
        for (const [resourceName, blob] of blobByResourceName) {
          const resource = resourcesManager.getResource(resourceName);
          if (!resourceFileRenamingMap.has(resource.getFile())) {
            continue;
          }
          const resourceFile = resourceFileRenamingMap.get(resource.getFile());
          blobFiles.push({ filePath: resourceFile, blob });
        }
        resourceFileRenamingMap.delete();

        textFiles.push({
          text: JSON.stringify(serializedObject, null, 2),
          filePath: addSpacesToPascalCase(object.getName()) + '.asset.json',
        });
      })
    );

    // Archive the whole project.
    const zippedProjectBlob = await archiveFiles({
      textFiles,
      blobFiles,
      basePath: '',
      onProgress: (count: number, total: number) => {},
    });
    return zippedProjectBlob;
  } catch (rawError) {
    showErrorBox({
      message: 'Unable to save your project because of an internal error.',
      rawError,
      errorId: 'download-file-save-as-dialog-error',
    });
    return null;
  } finally {
    // TODO Should it be done?
    //clonedObject.delete();
  }
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
  const [
    zippedObjectAssetsBlob,
    setZippedObjectAssetsBlob,
  ] = React.useState<?Blob>(null);
  const [
    zippedSceneAssetsBlob,
    setZippedSceneAssetsBlob,
  ] = React.useState<?Blob>(null);
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
        setZippedObjectAssetsBlob(null);
        setZippedSceneAssetsBlob(null);

        const zippedObjectAssetsBlob = await zipAssets(
          project,
          [object],
          ensureDownloadResourcesAsBlobsIsDone
        );
        setZippedObjectAssetsBlob(zippedObjectAssetsBlob);

        const objects = mapFor(0, layout.getObjectsCount(), index =>
          layout.getObjectAt(index)
        ).filter(object => !excludedObjectType.includes(object.getType()));
        const zippedLayerAssetsBlob = await zipAssets(
          project,
          objects,
          ensureDownloadResourcesAsBlobsIsDone
        );
        setZippedSceneAssetsBlob(zippedLayerAssetsBlob);
      })();

      return () => {
        setZippedObjectAssetsBlob(null);
        setZippedSceneAssetsBlob(null);
      };
    },
    [project, ensureDownloadResourcesAsBlobsIsDone, object, layout]
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
          {zippedObjectAssetsBlob ? (
            <BlobDownloadUrlHolder blob={zippedObjectAssetsBlob}>
              {blobDownloadUrl => (
                <RaisedButton
                  icon={<Upload />}
                  primary
                  onClick={() =>
                    openBlobDownloadUrl(
                      blobDownloadUrl,
                      object.getName() + '.gdo'
                    )
                  }
                  label={<Trans>Export the object</Trans>}
                />
              )}
            </BlobDownloadUrlHolder>
          ) : (
            <PlaceholderLoader />
          )}
          {zippedSceneAssetsBlob ? (
            <BlobDownloadUrlHolder blob={zippedSceneAssetsBlob}>
              {blobDownloadUrl => (
                <RaisedButton
                  icon={<Upload />}
                  primary
                  onClick={() =>
                    openBlobDownloadUrl(
                      blobDownloadUrl,
                      layout.getName() + '.gdo'
                    )
                  }
                  label={<Trans>Export all scene objects</Trans>}
                />
              )}
            </BlobDownloadUrlHolder>
          ) : (
            <PlaceholderLoader />
          )}
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
      {renderProcessDialog()}
    </Dialog>
  );
};

export default ObjectExporterDialog;
