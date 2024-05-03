// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import ResourcePreview from '../../ResourcesList/ResourcePreview';
import ResourcesLoader from '../../ResourcesLoader';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { type Schema } from '../../PropertiesEditor';

import {
  type ResourceSource,
  type ResourceManagementProps,
} from '../../ResourcesList/ResourceSource';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { EmbeddedResourcesMappingTable } from './EmbeddedResourcesMappingTable';
import { Spacer } from '../../UI/Grid';
import ScrollView from '../../UI/ScrollView';
import { ColumnStackLayout } from '../../UI/Layout';

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

const ResourcePropertiesEditor = React.forwardRef<
  Props,
  ResourcePropertiesEditorInterface
>(
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

    const chooseResourcePath = React.useCallback(
      async (resourceSource: ResourceSource) => {
        const resource = resources[0];

        const newResources = await resourceManagementProps.onChooseResource({
          initialSourceName: resourceSource.name,
          multiSelection: false,
          resourceKind: resource.getKind(),
        });
        if (!newResources.length) return; // No path was chosen by the user.
        resource.setFile(newResources[0].getFile());

        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak.
        newResources.forEach(resource => resource.delete());

        onResourcePathUpdated();
        forceUpdate();

        await resourceManagementProps.onFetchNewlyAddedResources();
      },
      [resourceManagementProps, resources, onResourcePathUpdated, forceUpdate]
    );

    const schema: Schema = React.useMemo(
      () => [
        {
          name: 'Resource name',
          valueType: 'string',
          disabled: true,
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
            const storageProvider = resourceManagementProps.getStorageProvider();
            const resourceSources = resourceManagementProps.resourceSources
              .filter(source => source.kind === resources[0].getKind())
              .filter(
                ({ onlyForStorageProvider }) =>
                  !onlyForStorageProvider ||
                  onlyForStorageProvider === storageProvider.internalName
              );

            const firstResourceSource = resourceSources[0];
            if (firstResourceSource) chooseResourcePath(firstResourceSource);
          },
          onEditButtonBuildMenuTemplate: (i18n: I18nType) => {
            const storageProvider = resourceManagementProps.getStorageProvider();
            return resourceManagementProps.resourceSources
              .filter(source => source.kind === resources[0].getKind())
              .filter(
                ({ onlyForStorageProvider }) =>
                  !onlyForStorageProvider ||
                  onlyForStorageProvider === storageProvider.internalName
              )
              .map(source => ({
                label: i18n._(source.displayName),
                click: () => chooseResourcePath(source),
              }));
          },
        },
      ],
      [resourceManagementProps, resources, chooseResourcePath]
    );

    const renderResourcesProperties = React.useCallback(
      () => {
        //TODO: Multiple resources support
        const properties = resources[0].getProperties();
        const resourceSchema = propertiesMapToSchema(
          properties,
          resource => resource.getProperties(),
          (resource, name, value) => {
            resource.updateProperty(name, value);
            forceUpdate();
          }
        );

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
            <EmbeddedResourcesMappingTable resources={resources} />
          </ColumnStackLayout>
        </ScrollView>
      </Background>
    );
  }
);

export default ResourcePropertiesEditor;
