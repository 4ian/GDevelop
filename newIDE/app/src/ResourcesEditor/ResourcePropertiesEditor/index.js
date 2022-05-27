// @flow
import { Trans } from '@lingui/macro';

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
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource';

const styles = {
  propertiesContainer: {
    padding: 8,
    overflowY: 'scroll',
    overflowX: 'hidden',
    flex: 2,
  },
};

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resources: Array<gdResource>,
  onResourcePathUpdated: () => void,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
|};

export default class ResourcePropertiesEditor extends React.Component<
  Props,
  {}
> {
  schema: Schema = [
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
      onEditButtonClick: () => this._chooseResourcePath(),
    },
  ];

  _renderEmpty() {
    return (
      <EmptyMessage>
        <Trans>
          Resources are automatically added to your project whenever you add an
          image, a font or a video to an object or when you choose an audio file
          in events. Choose a resource to display its properties.
        </Trans>
      </EmptyMessage>
    );
  }

  _chooseResourcePath = () => {
    const {
      resources,
      onResourcePathUpdated,
      onChooseResource,
      resourceSources,
    } = this.props;
    const resource = resources[0];
    const sources = resourceSources.filter(
      source => source.kind === resource.getKind()
    );
    if (!sources.length) return;
    onChooseResource({
      // Should be updated once new sources are introduced in the desktop app.
      // Search for "sources[0]" in the codebase for other places like this.
      initialSourceName: sources[0].name,
      multiSelection: true,
      resourceKind: resource.getKind(),
    }).then(resources => {
      if (!resources.length) return; // No path was chosen by the user.
      resource.setFile(resources[0].getFile());

      // Important, we are responsible for deleting the resources that were given to us.
      // Otherwise we have a memory leak.
      resources.forEach(resource => resource.delete());

      onResourcePathUpdated();
      this.forceUpdate();
    });
  };

  _renderResourcesProperties() {
    const { resources } = this.props;
    //TODO: Multiple resources support
    const properties = resources[0].getProperties();
    const resourceSchema = propertiesMapToSchema(
      properties,
      resource => resource.getProperties(),
      (resource, name, value) => resource.updateProperty(name, value)
    );

    return (
      <div
        style={styles.propertiesContainer}
        key={resources.map(resource => '' + resource.ptr).join(';')}
      >
        <PropertiesEditor
          schema={this.schema.concat(resourceSchema)}
          instances={resources}
        />
      </div>
    );
  }

  _renderPreview() {
    const { resources, project, resourcesLoader } = this.props;
    if (!resources || !resources.length) return;

    return (
      <ResourcePreview
        resourceName={resources[0].getName()}
        resourcesLoader={resourcesLoader}
        project={project}
      />
    );
  }

  render() {
    const { resources } = this.props;

    return (
      <Background maxWidth>
        {this._renderPreview()}
        {!resources || !resources.length
          ? this._renderEmpty()
          : this._renderResourcesProperties()}
      </Background>
    );
  }
}
