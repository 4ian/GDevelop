// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1 },
};

type Props = {|
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
    const { resources } = this.props;

    return (
      <div
        style={{ padding: 10, overflowY: 'scroll', overflowX: 'hidden' }}
        key={resources.map(resource => '' + resource.ptr).join(';')}
      >
        <PropertiesEditor schema={this.schema} instances={resources} />
      </div>
    );
  }

  render() {
    const { resources } = this.props;

    return (
      <Paper style={styles.container}>
        {!resources || !resources.length
          ? this._renderEmpty()
          : this._renderResourcesProperties()}
      </Paper>
    );
  }
}
