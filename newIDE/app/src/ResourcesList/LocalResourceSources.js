// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ChooseResourceProps,
  type ResourceSourceComponentProps,
  type ResourceSourceComponentPrimaryActionProps,
  type ResourceSource,
  type ResourceStoreChooserProps,
  allResourceKindsAndMetadata,
  resourcesKindSupportedByResourceStore,
} from './ResourceSource';
import {} from '../Utils/GDevelopServices/Asset';
import { ResourceStore } from '../AssetStore/ResourceStore';
import {
  DEFAULT_IMPORTED_RESOURCES_FOLDER,
  copyAllToProjectFolder,
} from './ResourceUtils';
import optionalRequire from '../Utils/OptionalRequire';
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
import { DialogPrimaryButton } from '../UI/Dialog';
import ProjectResourcesChooser from './ProjectResources/ProjectResourcesChooser';

const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;
const path = optionalRequire('path');
const fs = optionalRequire('fs');

const ResourceStoreChooser = ({
  options,
  selectedResourceIndex,
  onSelectResource,
}: ResourceStoreChooserProps) => {
  if (!onSelectResource) return null;
  const { resourceKind } = options;
  if (!resourcesKindSupportedByResourceStore.includes(resourceKind)) {
    return null;
  }
  return (
    <ResourceStore
      selectedResourceIndex={selectedResourceIndex}
      onSelectResource={onSelectResource}
      resourceKind={
        // $FlowIgnore - Flow does not understand the check above restricts the resource kind.
        // $FlowFixMe[incompatible-type]
        resourceKind
      }
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
      }: ChooseResourceProps) => {
        if (!dialog)
          throw new Error('Electron dialog not supported in this environment.');

        const properties = ['openFile'];
        if (options.multiSelection) properties.push('multiSelections');

        const projectPath = path.dirname(project.getProjectFile());
        const defaultLocalFileDialogPath = options.defaultLocalFileDialogFolder
          ? path.join(projectPath, options.defaultLocalFileDialogFolder)
          : null;
        if (defaultLocalFileDialogPath && fs) {
          await fs.promises.mkdir(defaultLocalFileDialogPath, {
            recursive: true,
          });
        }
        // $FlowFixMe[incompatible-type]
        const latestPath =
          defaultLocalFileDialogPath ||
          getLastUsedPath(project, kind) ||
          projectPath;

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
        // $FlowFixMe[incompatible-type]
        setLastUsedPath(project, kind, lastUsedPath);

        const importedResourcesFolder =
          options.importedResourcesFolder || DEFAULT_IMPORTED_RESOURCES_FOLDER;

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

            // $FlowFixMe[constant-condition]
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
        // $FlowFixMe[constant-condition]
        if (parseEmbeddedResources) {
          for (const filePath of filePaths) {
            const embeddedResources = await parseEmbeddedResources(
              project,
              filePath
            );

            if (embeddedResources) {
              await recursivelyParseEmbeddedResources(embeddedResources);

              filesWithEmbeddedResources.set(filePath, embeddedResources);
            }
          }
        }

        // Copy files into the project assets folder.
        const newToOldFilePaths = new Map<string, string>();
        let filesWithMappedResources = new Map<string, MappedResources>();
        filePaths = await copyAllToProjectFolder(
          project,
          filePaths,
          newToOldFilePaths,
          importedResourcesFolder
        );

        await copyAllEmbeddedResourcesToProjectFolder(
          project,
          filesWithEmbeddedResources,
          importedResourcesFolder
        );

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
          newResource.setFile(
            path.relative(projectPath, filePath).replace(/\\/g, '/')
          );
          newResource.setName(
            path.relative(projectPath, filePath).replace(/\\/g, '/')
          );

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

      const sourceName = 'local-file-opener-' + kind;

      return {
        name: sourceName,
        displayName: t`File(s) from your device`,
        displayTab: 'import',
        onlyForStorageProvider: 'LocalFile',
        shouldCreateResource: true,
        shouldGuessAnimationsFromName: true,
        // $FlowFixMe[incompatible-type]
        kind,
        // $FlowFixMe[incompatible-type]
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
                const selectedResources = await selectLocalFileResources({
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

                props.onChooseResources({
                  // $FlowFixMe[incompatible-type]
                  selectedResources,
                  selectedSourceName: sourceName,
                });
              }}
            />
          </Line>
        ),
      };
    }
  ),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => {
    const sourceName = `upload-${kind}`;
    // $FlowFixMe[incompatible-type]
    return {
      name: sourceName,
      displayName: t`File(s) from your device`,
      shouldCreateResource: true,
      shouldGuessAnimationsFromName: true,
      displayTab: 'import',
      onlyForStorageProvider: 'Cloud',
      kind,
      renderComponent: (props: ResourceSourceComponentProps) => (
        <FileToCloudProjectResourceUploader
          createNewResource={createNewResource}
          onChooseResources={(resources: Array<gdResource>) =>
            props.onChooseResources({
              selectedResources: resources,
              selectedSourceName: sourceName,
            })
          }
          options={props.options}
          fileMetadata={props.fileMetadata}
          getStorageProvider={props.getStorageProvider}
          key={`url-chooser-${kind}`}
          automaticallyOpenInput={!!props.automaticallyOpenIfPossible}
        />
      ),
    };
  }),
  ...resourcesKindSupportedByResourceStore
    .map(kind => {
      const source = allResourceKindsAndMetadata.find(
        resourceSource => resourceSource.kind === kind
      );
      if (!source) return null;
      const sourceName = 'resource-store-' + kind;
      // $FlowFixMe[incompatible-type]
      return {
        name: sourceName,
        displayName: t`Choose from asset store`,
        displayTab: 'standalone',
        kind,
        shouldCreateResource: true,
        shouldGuessAnimationsFromName: false,
        renderComponent: (props: ResourceSourceComponentProps) => (
          <ResourceStoreChooser
            selectedResourceIndex={props.selectedResourceIndex}
            onSelectResource={props.onSelectResource}
            options={props.options}
            key={`resource-store-${kind}`}
          />
        ),
        renderPrimaryAction: ({
          resource,
          onChooseResources,
        }: ResourceSourceComponentPrimaryActionProps) => (
          <DialogPrimaryButton
            primary
            key="add-resource"
            label={
              kind === 'font' ? (
                <Trans>Install font</Trans>
              ) : (
                <Trans>Add to project</Trans>
              )
            }
            disabled={!resource}
            onClick={() => {
              if (!resource) return;
              const chosenResourceUrl = resource.url;
              const newResource = source.createNewResource();
              newResource.setFile(chosenResourceUrl);
              newResource.setName(path.basename(chosenResourceUrl));
              newResource.setOrigin('gdevelop-asset-store', chosenResourceUrl);

              onChooseResources({
                selectedResources: [newResource],
                selectedSourceName: sourceName,
              });
            }}
          />
        ),
      };
    })
    .filter(Boolean),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => {
    const sourceName = `project-resources-${kind}`;
    // $FlowFixMe[incompatible-type]
    return {
      name: sourceName,
      displayName: t`Project resources`,
      displayTab: 'standalone',
      shouldCreateResource: false,
      shouldGuessAnimationsFromName: false,
      hideInResourceEditor: true,
      kind,
      renderComponent: (props: ResourceSourceComponentProps) => (
        <ProjectResourcesChooser
          project={props.project}
          onResourcesSelected={props.onResourcesSelected}
          // $FlowFixMe[incompatible-type]
          resourceKind={kind}
          key={`project-resources-${kind}`}
          multiSelection={props.options.multiSelection}
          includeProjectAssetsFolder={props.options.includeProjectAssetsFolder}
        />
      ),
      renderPrimaryAction: ({
        selectedResources,
        onChooseResources,
      }: ResourceSourceComponentPrimaryActionProps) => (
        <DialogPrimaryButton
          primary
          key="select-resources"
          label={
            !selectedResources ||
            !selectedResources.length ||
            selectedResources.length === 1 ? (
              <Trans>Select resource</Trans>
            ) : (
              <Trans>Select {selectedResources.length} resources</Trans>
            )
          }
          disabled={!selectedResources || !selectedResources.length}
          onClick={() => {
            if (!selectedResources || !selectedResources.length) return;
            onChooseResources({
              selectedResources,
              selectedSourceName: sourceName,
            });
          }}
        />
      ),
    };
  }),
];

export default localResourceSources;
