// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import ResourcePreview from '../../ResourcesList/ResourcePreview';
import ResourcesLoader from '../../ResourcesLoader';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import {
  type Schema,
  type Field,
} from '../../PropertiesEditor/PropertiesEditorSchema';

import {
  type ResourceSource,
  type ResourceManagementProps,
} from '../../ResourcesList/ResourceSource';
import { type ResourcePropertyConfig } from '../../Utils/ProjectSettingsReader';
import {
  type CustomPropertyValue,
  getResourceCustomPropertyValue,
  setResourceCustomPropertyValue,
} from '../../ResourcesList/ResourceUtils';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { EmbeddedResourcesMappingTable } from './EmbeddedResourcesMappingTable';
import { Spacer } from '../../UI/Grid';
import ScrollView from '../../UI/ScrollView';
import { ColumnStackLayout } from '../../UI/Layout';
import AlertMessage from '../../UI/AlertMessage';
import { triggerOnResourceExternallyChanged } from '../../MainFrame/ResourcesWatcher';

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resources: Array<gdResource>,
  onResourcePathUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  i18n: I18nType,
|};

export type ResourcePropertiesEditorInterface = {| forceUpdate: () => void |};

const coerceToBoolean = (value: ?CustomPropertyValue): boolean =>
  value === true || value === 'true' || value === 1;

const coerceToNumber = (value: ?CustomPropertyValue): number | null => {
  if (value == null || value === '') return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const coerceToString = (value: ?CustomPropertyValue): string =>
  value == null ? '' : String(value);

const buildCustomPropertyField = (
  config: ResourcePropertyConfig,
  forceUpdate: () => void
): Field => {
  const { name, label, description, default: configDefault } = config;
  const defaultValue = configDefault == null ? null : configDefault;
  const getLabel = () => label;
  const getDescription = () => description || '';
  const readValue = (resource: gdResource): ?CustomPropertyValue =>
    getResourceCustomPropertyValue(resource, name, defaultValue);
  const setValue = (resource: gdResource, newValue: CustomPropertyValue) => {
    setResourceCustomPropertyValue(resource, name, newValue);
    forceUpdate();
  };

  if (config.type === 'number') {
    return {
      name,
      getLabel,
      getDescription,
      valueType: 'number',
      getValue: (resource: gdResource) => coerceToNumber(readValue(resource)),
      setValue,
    };
  }

  if (config.type === 'boolean') {
    return {
      name,
      getLabel,
      getDescription,
      valueType: 'boolean',
      getValue: (resource: gdResource) => coerceToBoolean(readValue(resource)),
      setValue,
    };
  }

  return {
    name,
    getLabel,
    getDescription,
    valueType: 'string',
    getValue: (resource: gdResource) => coerceToString(readValue(resource)),
    setValue,
  };
};

const buildCustomPropertiesSchema = (
  resourcePropertiesSchema: Array<ResourcePropertyConfig>,
  resourceKind: string,
  forceUpdate: () => void
): Schema =>
  resourcePropertiesSchema
    .filter(
      config =>
        !config.resourceKinds ||
        config.resourceKinds.length === 0 ||
        config.resourceKinds.includes(resourceKind)
    )
    .map(config => buildCustomPropertyField(config, forceUpdate));

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
      i18n,
    },
    ref
  ) => {
    const forceUpdate = useForceUpdate();
    React.useImperativeHandle(ref, () => ({ forceUpdate }));

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

        const newResourceFile = selectedResources[0].getFile();
        resource.setFile(newResourceFile);
        triggerOnResourceExternallyChanged({
          identifier: newResourceFile,
        });

        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak.
        selectedResources.forEach(resource => resource.delete());

        onResourcePathUpdated();
        forceUpdate();

        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();
      },
      [
        resourceManagementProps,
        resources,
        onResourcePathUpdated,
        forceUpdate,
        resourceSources,
      ]
    );

    const schema: Schema = React.useMemo(
      () => [
        {
          name: i18n._(t`Resource name`),
          valueType: 'string',
          disabled: () => true,
          getValue: (resource: gdResource) => resource.getName(),
          setValue: (resource: gdResource, newValue: string) =>
            resource.setName(newValue),
        },
        {
          name: i18n._(t`File`),
          valueType: 'string',
          getValue: (resource: gdResource) => resource.getFile(),
          setValue: (resource: gdResource, newValue: string) => {
            resource.setFile(newValue);
            triggerOnResourceExternallyChanged({
              identifier: newValue,
            });
          },
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
      [resourceSources, chooseResourcePath, i18n]
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
          layersContainer: null,
        });

        const resourceKind = resources[0].getKind();
        const customSchema = buildCustomPropertiesSchema(
          resourceManagementProps.resourcePropertiesSchema,
          resourceKind,
          forceUpdate
        );

        return (
          <PropertiesEditor
            schema={schema.concat(resourceSchema).concat(customSchema)}
            instances={resources}
          />
        );
      },
      [resources, schema, forceUpdate, resourceManagementProps]
    );

    const renderPreview = () => {
      if (!resources || !resources.length) return;

      return (
        <ResourcePreview
          resourceName={resources[0].getName()}
          resourcesLoader={resourcesLoader}
          project={project}
        />
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
              : renderResourcesProperties()}
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
