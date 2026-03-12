// @flow
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';

import * as React from 'react';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import ResourcePreview from '../../ResourcesList/ResourcePreview';
import ResourcesLoader from '../../ResourcesLoader';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { type Schema } from '../../PropertiesEditor/PropertiesEditorSchema';

import {
  type ResourceSource,
  type ResourceManagementProps,
  allResourceKindsAndMetadata,
} from '../../ResourcesList/ResourceSource';
import {
  type AssetImportCache,
  type AssetImportSettings,
  ensureResourceImportSettings,
  getImportersForResource,
  setResourceImportSettings,
  applyImportSettingsToResource,
  ensureResourceImportCache,
  runResourceImport,
  getResourceImportCache,
} from '../../ResourcesList/AssetImportPipeline';
import { getResourceGuidFromResource } from '../../ResourcesList/AssetDatabase';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { EmbeddedResourcesMappingTable } from './EmbeddedResourcesMappingTable';
import { Column, Line, Spacer } from '../../UI/Grid';
import ScrollView from '../../UI/ScrollView';
import { ColumnStackLayout } from '../../UI/Layout';
import AlertMessage from '../../UI/AlertMessage';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import { isURL } from '../../ResourcesList/ResourceUtils';
import optionalRequire from '../../Utils/OptionalRequire';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

const path = optionalRequire('path');

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resources: Array<gdResource>,
  onResourcePathUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
|};

export type ResourcePropertiesEditorInterface = {| forceUpdate: () => void |};

const renderEmpty = () => {
  return (
    <EmptyMessage>
      <Trans>
        Resources are automatically added to your project whenever you add an
        image, a font or a video to an object or when you choose an audio file
        in events. Choose a resource to display its properties.
      </Trans>
    </EmptyMessage>
  );
};

const formatBytes = (value: ?number): string => {
  if (value == null || Number.isNaN(value)) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1000 && unitIndex < units.length - 1) {
    size /= 1000;
    unitIndex++;
  }
  const rounded = size >= 10 || unitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${rounded} ${units[unitIndex]}`;
};

const formatDuration = (value: ?number): string => {
  if (value == null || Number.isNaN(value)) return '-';
  if (value >= 60) {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    return `${minutes}m ${seconds}s`;
  }
  return `${Math.round(value * 10) / 10}s`;
};


const ResourcePropertiesEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<ResourcePropertiesEditorInterface>,
}> = React.forwardRef<Props, ResourcePropertiesEditorInterface>(
  (
    {
      project,
      resourcesLoader,
      resources,
      onResourcePathUpdated,
      resourceManagementProps,
    },
    ref
  ) => {
    const forceUpdate = useForceUpdate();
    React.useImperativeHandle(ref, () => ({ forceUpdate }));
    const [importCache, setImportCache] = React.useState<?AssetImportCache>(
      null
    );
    const [isImporting, setIsImporting] = React.useState(false);

    const selectedResource = resources.length ? resources[0] : null;

    const refreshImportCache = React.useCallback(
      async (resource: gdResource, force: boolean) => {
        setIsImporting(true);
        try {
          const cache = await runResourceImport({
            project,
            resource,
            force,
          });
          setImportCache(cache || null);
        } catch (error) {
          console.warn('[AssetImportPipeline] Import failed:', error);
        } finally {
          setIsImporting(false);
        }
      },
      [project]
    );

    const updateImportSettings = React.useCallback(
      (
        resource: gdResource,
        updater: AssetImportSettings => AssetImportSettings
      ) => {
        const currentSettings = ensureResourceImportSettings(resource);
        const nextSettings = updater(currentSettings);
        setResourceImportSettings(resource, nextSettings);
        applyImportSettingsToResource(resource, nextSettings);
        forceUpdate();
        refreshImportCache(resource, true);
      },
      [forceUpdate, refreshImportCache]
    );

    const resourceSources = React.useMemo(
      () => {
        const storageProvider = resourceManagementProps.getStorageProvider();
        return resources.length
          ? resourceManagementProps.resourceSources
              .filter(source => source.kind === resources[0].getKind())
              .filter(
                ({ onlyForStorageProvider }) =>
                  !onlyForStorageProvider ||
                  onlyForStorageProvider === storageProvider.internalName
              )
              .filter(source => !source.hideInResourceEditor)
          : [];
      },
      [resourceManagementProps, resources]
    );

    React.useEffect(
      () => {
        let isMounted = true;
        if (!selectedResource) {
          setImportCache(null);
          setIsImporting(false);
          return () => {};
        }

        setIsImporting(true);
        ensureResourceImportCache({ project, resource: selectedResource })
          .then(cache => {
            if (!isMounted) return;
            setImportCache(cache || null);
            setIsImporting(false);
          })
          .catch(error => {
            if (!isMounted) return;
            console.warn('[AssetImportPipeline] Failed to load cache:', error);
            setIsImporting(false);
          });

        return () => {
          isMounted = false;
        };
      },
      [project, selectedResource]
    );

    const chooseResourcePath = React.useCallback(
      async (initialResourceSource: ResourceSource) => {
        const resource = resources[0];

        const {
          selectedResources,
          selectedSourceName,
        } = await resourceManagementProps.onChooseResource({
          initialSourceName: initialResourceSource.name,
          multiSelection: false,
          resourceKind: resource.getKind(),
        });
        if (!selectedResources.length) return; // No path was chosen by the user.
        const selectedResourceSource = resourceSources.find(
          source => source.name === selectedSourceName
        );
        if (!selectedResourceSource) return;

        resource.setFile(selectedResources[0].getFile());

        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak.
        selectedResources.forEach(resource => resource.delete());

        onResourcePathUpdated();
        forceUpdate();

        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();
        refreshImportCache(resource, true);
      },
      [
        resourceManagementProps,
        resources,
        onResourcePathUpdated,
        forceUpdate,
        resourceSources,
        refreshImportCache,
      ]
    );

    const schema: Schema = React.useMemo(
      () => [
        {
          name: 'Resource name',
          valueType: 'string',
          disabled: () => true,
          getValue: (resource: gdResource) => resource.getName(),
          setValue: (resource: gdResource, newValue: string) =>
            resource.setName(newValue),
        },
        {
          name: 'File',
          valueType: 'string',
          getValue: (resource: gdResource) => resource.getFile(),
          setValue: (resource: gdResource, newValue: string) =>
            resource.setFile(newValue),
          onEditButtonClick: () => {
            const firstResourceSource = resourceSources[0];
            if (firstResourceSource) chooseResourcePath(firstResourceSource);
          },
          onEditButtonBuildMenuTemplate:
            resourceSources.length > 1
              ? (i18n: I18nType) =>
                  resourceSources.map(source => ({
                    label: i18n._(source.displayName),
                    click: () => chooseResourcePath(source),
                  }))
              : undefined,
        },
      ],
      [resourceSources, chooseResourcePath]
    );

    const renderImportCacheInfo = React.useCallback(() => {
      if (!selectedResource) return null;
      const cache =
        importCache || getResourceImportCache(selectedResource) || null;

      return (
        <I18n>
          {({ i18n }) => {
            const cacheRows = [];
            if (cache && cache.importedAt) {
              cacheRows.push({
                label: i18n._(t`Imported`),
                value: new Date(cache.importedAt).toLocaleString(),
              });
            }
            if (cache && cache.data) {
              const data = cache.data;
              if (data.fileSize != null) {
                cacheRows.push({
                  label: i18n._(t`File size`),
                  value: formatBytes(data.fileSize),
                });
              }
              if (data.width != null && data.height != null) {
                cacheRows.push({
                  label: i18n._(t`Dimensions`),
                  value: `${data.width} x ${data.height}`,
                });
              }
              if (data.duration != null) {
                cacheRows.push({
                  label: i18n._(t`Duration`),
                  value: formatDuration(data.duration),
                });
              }
            }

            return (
              <>
                <Text size="block-title">{i18n._(t`Import cache`)}</Text>
                {isImporting ? (
                  <Text size="body" color="secondary" noMargin>
                    {i18n._(t`Importing...`)}
                  </Text>
                ) : cacheRows.length === 0 ? (
                  <Text size="body" color="secondary" noMargin>
                    {i18n._(t`No cached data yet.`)}
                  </Text>
                ) : (
                  cacheRows.map((row, index) => (
                    <Line key={`import-cache-${index}`} noMargin>
                      <Column expand>
                        <Text size="body" color="secondary" noMargin>
                          {row.label}
                        </Text>
                      </Column>
                      <Column>
                        <Text size="body" noMargin>
                          {row.value}
                        </Text>
                      </Column>
                    </Line>
                  ))
                )}
              </>
            );
          }}
        </I18n>
      );
    }, [importCache, isImporting, selectedResource]);

    const renderInspector = React.useCallback(
      () => {
        if (!resources.length) return null;
        const resource = resources[0];
        const cache = importCache || getResourceImportCache(resource) || null;
        const guid = getResourceGuidFromResource(resource);
        const filePath = resource.getFile();
        const kind = resource.getKind();

        const projectFilePath = project.getProjectFile();
        const projectFolderPath =
          projectFilePath && path ? path.dirname(projectFilePath) : null;

        let locationLabel = t`External`;
        let displayPath = filePath || '';
        if (filePath && isURL(filePath)) {
          locationLabel = t`URL`;
        } else if (filePath && projectFolderPath && path) {
          const normalizedPath = filePath.replace(/^file:\/\//, '');
          const absolutePath = path.isAbsolute(normalizedPath)
            ? normalizedPath
            : path.resolve(projectFolderPath, normalizedPath);
          const relativePath = path.relative(projectFolderPath, absolutePath);
          if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
            locationLabel = t`Project`;
            displayPath = relativePath;
          } else {
            locationLabel = t`External`;
            displayPath = absolutePath;
          }
        }

        return (
          <I18n>
            {({ i18n }) => {
              const kindMetadata = allResourceKindsAndMetadata.find(
                item => item.kind === kind
              );
              const kindLabel = kindMetadata
                ? i18n._(kindMetadata.displayName)
                : kind || i18n._(t`Unknown`);

              const resolvedDisplayPath =
                displayPath || i18n._(t`(Not set)`);

              const rows: Array<{
                label: MessageDescriptor,
                value: string,
                tooltip?: string,
                useEllipsis?: boolean,
              }> = [
                { label: t`Name`, value: resource.getName() || '-' },
                { label: t`Type`, value: kindLabel || '-' },
                { label: t`Location`, value: i18n._(locationLabel) },
                {
                  label: t`Path`,
                  value: resolvedDisplayPath,
                  tooltip: resolvedDisplayPath,
                  useEllipsis: true,
                },
              ];

              if (guid) {
                rows.push({
                  label: t`GUID`,
                  value: guid,
                  tooltip: guid,
                  useEllipsis: true,
                });
              }

              if (cache && cache.data) {
                const data = cache.data;
                if (data.fileSize != null) {
                  rows.push({
                    label: t`File size`,
                    value: formatBytes(data.fileSize),
                  });
                }
                if (data.width != null && data.height != null) {
                  rows.push({
                    label: t`Dimensions`,
                    value: `${data.width} x ${data.height}`,
                  });
                }
                if (data.duration != null) {
                  rows.push({
                    label: t`Duration`,
                    value: formatDuration(data.duration),
                  });
                }
              }

              return (
                <>
                  <Text size="block-title">{i18n._(t`Inspector`)}</Text>
                  {rows.map((row, index) => (
                    <Line key={`inspector-${index}`} noMargin>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <Text size="body" color="secondary" noMargin>
                          {i18n._(row.label)}
                        </Text>
                      </div>
                      <div style={{ flex: 2, minWidth: 0 }}>
                        <Text
                          size="body"
                          noMargin
                          tooltip={row.tooltip}
                          style={row.useEllipsis ? textEllipsisStyle : undefined}
                        >
                          {row.value}
                        </Text>
                      </div>
                    </Line>
                  ))}
                </>
              );
            }}
          </I18n>
        );
      },
      [resources, importCache, project]
    );

    const renderImportSettings = React.useCallback(
      () => {
        if (!resources.length) return null;
        const resource = resources[0];
        const importers = getImportersForResource(resource);
        const currentSettings = ensureResourceImportSettings(resource);
        const selectedImporter =
          importers.find(importer => importer.id === currentSettings.importerId) ||
          importers[0];

        return (
          <I18n>
            {({ i18n }) => {
              const importSettingsSchema: Schema = [
                {
                  name: i18n._(t`Importer`),
                  valueType: 'string',
                  getValue: (resource: gdResource) =>
                    ensureResourceImportSettings(resource).importerId,
                  setValue: (resource: gdResource, newValue: string) => {
                    const availableImporters = getImportersForResource(resource);
                    const nextImporter =
                      availableImporters.find(
                        importer => importer.id === newValue
                      ) || availableImporters[0];
                    const nextSettings = {
                      importerId: nextImporter.id,
                      options: nextImporter.getDefaultOptions(resource),
                    };
                    setResourceImportSettings(resource, nextSettings);
                    applyImportSettingsToResource(resource, nextSettings);
                    forceUpdate();
                    refreshImportCache(resource, true);
                  },
                  getChoices: () =>
                    importers.map(importer => ({
                      value: importer.id,
                      label: importer.displayName,
                    })),
                },
              ];

              if (selectedImporter && selectedImporter.id === 'image-basic') {
                importSettingsSchema.push({
                  name: i18n._(t`Smoothing`),
                  valueType: 'boolean',
                  getValue: (resource: gdResource) => {
                    const settings = ensureResourceImportSettings(resource);
                    return !!settings.options.smoothing;
                  },
                  setValue: (resource: gdResource, newValue: boolean) => {
                    updateImportSettings(resource, settings => ({
                      ...settings,
                      options: {
                        ...settings.options,
                        smoothing: newValue,
                      },
                    }));
                  },
                });
              } else if (
                selectedImporter &&
                (selectedImporter.id === 'audio-basic' ||
                  selectedImporter.id === 'video-basic')
              ) {
                importSettingsSchema.push({
                  name: i18n._(t`Streaming`),
                  valueType: 'boolean',
                  getValue: (resource: gdResource) => {
                    const settings = ensureResourceImportSettings(resource);
                    return !!settings.options.streaming;
                  },
                  setValue: (resource: gdResource, newValue: boolean) => {
                    updateImportSettings(resource, settings => ({
                      ...settings,
                      options: {
                        ...settings.options,
                        streaming: newValue,
                      },
                    }));
                  },
                });
              }

              return (
                <>
                  <Text size="block-title">{i18n._(t`Import settings`)}</Text>
                  <PropertiesEditor
                    schema={importSettingsSchema}
                    instances={resources}
                  />
                  <Line noMargin>
                    <Column>
                      <RaisedButton
                        primary
                        label={
                          isImporting
                            ? i18n._(t`Importing...`)
                            : i18n._(t`Reimport`)
                        }
                        onClick={() => refreshImportCache(resource, true)}
                        disabled={isImporting}
                      />
                    </Column>
                  </Line>
                  <Spacer />
                  {renderImportCacheInfo()}
                </>
              );
            }}
          </I18n>
        );
      },
      [
        resources,
        forceUpdate,
        isImporting,
        refreshImportCache,
        renderImportCacheInfo,
        updateImportSettings,
      ]
    );

    const renderResourcesProperties = React.useCallback(
      () => {
        //TODO: Multiple resources support
        const properties = resources[0].getProperties();
        const resourceSchema = propertiesMapToSchema({
          properties,
          defaultValueProperties: null,
          getPropertyValue: (resource, name) =>
            resource
              .getProperties()
              .get(name)
              .getValue(),
          onUpdateProperty: (resource, name, value) => {
            resource.updateProperty(name, value);
            forceUpdate();
          },
        });

        return (
          <PropertiesEditor
            schema={schema.concat(resourceSchema)}
            instances={resources}
          />
        );
      },
      [resources, schema, forceUpdate]
    );

    const renderPreview = () => {
      if (!resources || !resources.length) return;

      return (
        <I18n>
          {({ i18n }) => (
            <>
              <Text size="block-title">{i18n._(t`Preview`)}</Text>
              <ResourcePreview
                resourceName={resources[0].getName()}
                resourcesLoader={resourcesLoader}
                project={project}
              />
            </>
          )}
        </I18n>
      );
    };

    return (
      <Background maxWidth>
        {renderPreview()}
        <Spacer />
        <ScrollView>
          <ColumnStackLayout
            expand
            key={resources.map(resource => '' + resource.ptr).join(';')}
          >
            {!resources || !resources.length
              ? renderEmpty()
              : (
                <>
                  {renderInspector()}
                  <Spacer />
                  {renderResourcesProperties()}
                </>
              )}
            {resources.length > 0 && (
              <>
                <Spacer />
                {renderImportSettings()}
              </>
            )}
            {resources.length > 0 &&
              resources.some(
                // $FlowFixMe[invalid-compare]
                resource => resource.getKind() === 'javascript'
              ) && (
                <AlertMessage kind="info">
                  <Trans>
                    JavaScript files must be imported by an extension - by
                    choosing it the extension properties. Otherwise, it won't be
                    loaded by the game.
                  </Trans>
                </AlertMessage>
              )}
            <EmbeddedResourcesMappingTable resources={resources} />
          </ColumnStackLayout>
        </ScrollView>
      </Background>
    );
  }
);

export default ResourcePropertiesEditor;
