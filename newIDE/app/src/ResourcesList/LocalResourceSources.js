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
  copyAllEmbeddedResourcesToProjectFolder,
  embeddedResourcesParsers,
  createAndMapEmbeddedResources,
  type EmbeddedResources,
  type MappedResources,
} from './LocalEmbeddedResourceSources';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { FileToCloudProjectResourceUploader } from './FileToCloudProjectResourceUploader';

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
    ({ kind, displayName, fileExtensions, createNewResource }) => {
      const selectLocalFileResources = async ({
        i18n,
        getLastUsedPath,
        setLastUsedPath,
        project,
        options,
        resourcesImporationBehavior,
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

        let hasFilesOutsideProjectFolder = filePaths.some(
          path => !isPathInProjectFolder(project, path)
        );

        // Some resources, like tilemaps, can have references to other files.
        // We parse these files, optionally copy them, then create a mapping from the previous file name
        // as written inside the tilemap to the name of the resource that is representing this file.
        const filesWithEmbeddedResources = new Map<string, EmbeddedResources>();
        const parseEmbeddedResources = embeddedResourcesParsers[kind];
        const recursivelyParseEmbeddedResources = async (
          initialEmbeddedResources: EmbeddedResources
        ) => {
          for (const initialEmbeddedResource of initialEmbeddedResources.embeddedResources.values()) {
            const embeddedResourseParser =
              embeddedResourcesParsers[initialEmbeddedResource.resourceKind];

            if (!embeddedResourseParser) continue;

            const { fullPath } = initialEmbeddedResource;
            const newDependentResources = await embeddedResourseParser(
              project,
              fullPath
            );

            if (newDependentResources) {
              filesWithEmbeddedResources.set(fullPath, newDependentResources);

              await recursivelyParseEmbeddedResources(newDependentResources);
            }
          }
        };
        if (parseEmbeddedResources) {
          for (const filePath of filePaths) {
            const embeddedResources = await parseEmbeddedResources(
              project,
              filePath
            );

            if (embeddedResources) {
              await recursivelyParseEmbeddedResources(embeddedResources);

              filesWithEmbeddedResources.set(filePath, embeddedResources);

              if (embeddedResources.hasAnyEmbeddedResourceOutsideProjectFolder)
                hasFilesOutsideProjectFolder = true;
            }
          }
        }

        // Check if files should be copied in the project folder.
        const newToOldFilePaths = new Map<string, string>();
        let filesWithMappedResources = new Map<string, MappedResources>();
        if (hasFilesOutsideProjectFolder) {
          let answer: boolean;

          if (resourcesImporationBehavior === 'relative') {
            answer = false;
          } else if (resourcesImporationBehavior === 'import') {
            answer = true;
          } else {
            answer = Window.showConfirmDialog(
              i18n._(
                t`This/these file(s) are outside the project folder. Would you like to make a copy of them in your project folder first (recommended)?`
              )
            );
          }

          if (answer) {
            filePaths = await copyAllToProjectFolder(
              project,
              filePaths,
              newToOldFilePaths
            );

            await copyAllEmbeddedResourcesToProjectFolder(
              project,
              filesWithEmbeddedResources
            );
          }
        }

        // In case of resources embedded inside others,
        // create a mapping from the file name
        // as written inside the resource (e.g: the tilemap)
        // to the name of the resource that was created to
        // represent this file.
        filesWithMappedResources = createAndMapEmbeddedResources(
          project,
          filesWithEmbeddedResources
        );

        return filePaths.map(filePath => {
          const newResource = createNewResource();
          newResource.setFile(path.relative(projectPath, filePath));
          newResource.setName(path.relative(projectPath, filePath));

          const filePathWithMapping = newToOldFilePaths.has(filePath)
            ? newToOldFilePaths.get(filePath)
            : filePath;
          if (filePathWithMapping) {
            const mappedResources = filesWithMappedResources.get(
              filePathWithMapping
            );

            if (mappedResources && mappedResources.mapping) {
              newResource.setMetadata(
                JSON.stringify({
                  embeddedResourcesMapping: mappedResources.mapping,
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
                  resourcesImporationBehavior:
                    props.resourcesImporationBehavior,
                });

                props.onChooseResources(resources);
              }}
            />
          </Line>
        ),
      };
    }
  ),
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
        automaticallyOpenInput={!!props.automaticallyOpenIfPossible}
      />
    ),
  })),
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
];

export default localResourceSources;
