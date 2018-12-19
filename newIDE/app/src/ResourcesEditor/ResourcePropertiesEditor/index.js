// @flow
import * as React from 'react';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import ResourcePreview from '../../ResourcesList/ResourcePreview';
import ResourcesLoader from '../../ResourcesLoader';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';

const styles = {
  imagePreview: { flex: 1 },
  propertiesContainer: {
    padding: 10,
    overflowY: 'scroll',
    overflowX: 'hidden',
    flex: 2,
  },
};

type Props = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resources: Array<gdResource>,
|};

export default class ResourcePropertiesEditor extends React.Component<
  Props,
  {}
> {
  schema = [
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
    },
  ];

  _renderEmpty() {
    return (
      <EmptyMessage>
        Resources are automatically added to your project whenever you add an
        image to an object. Choose a resource to display its properties.
      </EmptyMessage>
    );
  }

  _renderResourcesProperties() {
    const { resources, project } = this.props;

    //TODO: Multiple resources support
    const properties = resources[0].getProperties(project);
    const resourceSchema = propertiesMapToSchema(
      properties,
      resource => resource.getProperties(project),
      (resource, name, value) =>
        resource.updateProperty(name, value, project)
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
        style={styles.imagePreview}
        resourceName={resources[0].getName()}
        resourcesLoader={resourcesLoader}
        project={project}
      />
    );
  }

  render() {
    const { resources } = this.props;

    return (
      <Background>
        {this._renderPreview()}
        {!resources || !resources.length
          ? this._renderEmpty()
          : this._renderResourcesProperties()}
      </Background>
    );
  }
}
