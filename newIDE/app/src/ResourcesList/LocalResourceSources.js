// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ChooseResourceOptions,
  type ChooseResourceProps,
  type ResourceSourceComponentProps,
  type ResourceSource,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import { ResourceStore } from '../AssetStore/ResourceStore';
import { isPathInProjectFolder, copyAllToProjectFolder } from './ResourceUtils';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import {
  copyEmbeddedToProjectFolder,
  mapEmbeddedFiles,
} from './EmbeddedResourceSources';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { FileToCloudProjectResourceUploader } from './FileToCloudProjectResourceUploader';
import type { EmbeddedResourceResult } from './EmbeddedResourceSources';

const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;
const path = optionalRequire('path');

type ResourceStoreChooserProps = {
  options: ChooseResourceOptions,
  onChooseResources: (resources: Array<gdResource>) => void,
  createNewResource: () => gdResource,
};

const ResourceStoreChooser = ({
  options,
  onChooseResources,
  createNewResource,
}: ResourceStoreChooserProps) => {
  return (
    <ResourceStore
      onChoose={resource => {
        const chosenResourceUrl = resource.url;
        const newResource = createNewResource();
        newResource.setFile(chosenResourceUrl);
        newResource.setName(path.basename(chosenResourceUrl));
        newResource.setOrigin('gdevelop-asset-store', chosenResourceUrl);

        onChooseResources([newResource]);
      }}
      resourceKind={options.resourceKind}
    />
  );
};

const localResourceSources: Array<ResourceSource> = [
  // Have the local resource sources first, so they are used by default/shown first when
  // the project is saved locally.
  ...allResourceKindsAndMetadata.map(
    ({
      kind,
      displayName,
      fileExtensions,
      createNewResource,
      listEmbeddedFiles,
    }) => {
      const selectLocalFileResources = async ({
        i18n,
        getLastUsedPath,
        setLastUsedPath,
        project,
        options,
      }: ChooseResourceProps) => {
        if (!dialog)
          throw new Error('Electron dialog not supported in this environment.');

        const properties = ['openFile'];
        if (options.multiSelection) properties.push('multiSelections');

        const projectPath = path.dirname(project.getProjectFile());
        const latestPath = getLastUsedPath(project, kind) || projectPath;

        const browserWindow = remote.getCurrentWindow();
        let { filePaths } = await dialog.showOpenDialog(browserWindow, {
          title: i18n._(t`Choose a file`),
          properties,
          filters: [
            { name: i18n._(t`Supported files`), extensions: fileExtensions },
          ],
          defaultPath: latestPath,
        });
        if (!filePaths || !filePaths.length) return [];

        const lastUsedPath = path.parse(filePaths[0]).dir;
        setLastUsedPath(project, kind, lastUsedPath);

        let outside = filePaths.some(
          path => !isPathInProjectFolder(project, path)
        );

        const embeddedFiles = new Map<string, EmbeddedResourceResult>();
        if (listEmbeddedFiles) {
          for (const filePath of filePaths) {
            const result = await listEmbeddedFiles(project, filePath);

            if (result) {
              embeddedFiles.set(filePath, result);

              outside = outside || result.outside;
            }
          }
        }
        const hasEmbeddedFiles = embeddedFiles.size > 0;

        const newToOldFilePaths = new Map<string, string>();

        if (outside) {
          const answer = Window.showConfirmDialog(
            i18n._(
              t`This/these file(s) are outside the project folder. Would you like to make a copy of them in your project folder first (recommended)?`
            )
          );

          if (answer) {
            filePaths = await copyAllToProjectFolder(
              project,
              filePaths,
              newToOldFilePaths
            );

            if (hasEmbeddedFiles) {
              await copyEmbeddedToProjectFolder(project, embeddedFiles);
            }
          }

          if (hasEmbeddedFiles) {
            mapEmbeddedFiles(project, embeddedFiles);
          }
        }

        return filePaths.map(filePath => {
          const newResource = createNewResource();
          newResource.setFile(path.relative(projectPath, filePath));
          newResource.setName(path.relative(projectPath, filePath));

          if (hasEmbeddedFiles) {
            let mapping;

            if (newToOldFilePaths.has(filePath)) {
              const oldFilePath = newToOldFilePaths.get(filePath);
              if (oldFilePath) {
                const embeddedFile = embeddedFiles.get(oldFilePath);

                if (embeddedFile) {
                  mapping = embeddedFile.mapping;
                }
              }
            } else {
              const embeddedFile = embeddedFiles.get(filePath);

              if (embeddedFile) {
                mapping = embeddedFile.mapping;
              }
            }

            if (mapping) {
              newResource.setMetadata(
                JSON.stringify({
                  embeddedResourcesMapping: mapping,
                })
              );
            }
          }

          return newResource;
        });
      };

      return {
        name: 'local-file-opener-' + kind,
        displayName: t`Choose a file`,
        displayTab: 'import',
        onlyForStorageProvider: 'LocalFile',
        kind,
        selectResourcesHeadless: selectLocalFileResources,
        renderComponent: (props: ResourceSourceComponentProps) => (
          <Line justifyContent="center">
            <RaisedButton
              primary
              label={
                props.options.multiSelection ? (
                  <Trans>Choose one or more files</Trans>
                ) : (
                  <Trans>Choose a file</Trans>
                )
              }
              onClick={async () => {
                const resources = await selectLocalFileResources({
                  i18n: props.i18n,
                  project: props.project,
                  fileMetadata: props.fileMetadata,
                  getStorageProvider: props.getStorageProvider,
                  getLastUsedPath: props.getLastUsedPath,
                  setLastUsedPath: props.setLastUsedPath,
                  options: props.options,
                });

                props.onChooseResources(resources);
              }}
            />
          </Line>
        ),
      };
    }
  ),
  // Have the "asset store" source before the "file(s) from your device" source,
  // for cloud projects, so that the asset store is opened by default when clicking
  // on a button without opening a menu showing all sources.
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => ({
    name: `resource-store-${kind}`,
    displayName: t`Choose from asset store`,
    displayTab: 'standalone',
    kind,
    renderComponent: (props: ResourceSourceComponentProps) => (
      <ResourceStoreChooser
        createNewResource={createNewResource}
        onChooseResources={props.onChooseResources}
        options={props.options}
        key={`resource-store-${kind}`}
      />
    ),
  })),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => ({
    name: `upload-${kind}`,
    displayName: t`File(s) from your device`,
    displayTab: 'import',
    onlyForStorageProvider: 'Cloud',
    kind,
    renderComponent: (props: ResourceSourceComponentProps) => (
      <FileToCloudProjectResourceUploader
        createNewResource={createNewResource}
        onChooseResources={props.onChooseResources}
        options={props.options}
        fileMetadata={props.fileMetadata}
        getStorageProvider={props.getStorageProvider}
        key={`url-chooser-${kind}`}
      />
    ),
  })),
];

export default localResourceSources;
