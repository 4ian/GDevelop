// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import EmptyMessage from '../UI/EmptyMessage';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import { List } from '@material-ui/core';

type Props = {|
  project: gdProject,
  open: boolean,
  onApply: Function,
|};

class ExtensionsPropertiesDialog extends React.Component<Props> {
  _onApply = () => {
    this.props.onApply();
  };

  _mapExtensionValueToPropertyDescriptors(
    properties: gdMapStringPropertyDescriptor,
    extensionName: string,
    project: gdProject
  ) {
    const keys = properties.keys().toJSArray();
    const propertiesManager = project.getExtensionPropertiesManager();
    for (let key of keys) {
      if (propertiesManager.hasProperty(extensionName, key))
        // Leave default value if none has been set yet
        properties
          .get(key)
          .setValue(propertiesManager.getValue(extensionName, key));
    }
    return properties;
  }

  render() {
    const { project } = this.props;
    const allExtensions = project
      .getCurrentPlatform()
      .getAllPlatformExtensions();
    const properties = [];
    for (let i = 0; i < allExtensions.size(); i++) {
      const extension = allExtensions.at(i);
      const propertiesSchema = propertiesMapToSchema(
        extension.getAllProperties(),
        instance =>
          this._mapExtensionValueToPropertyDescriptors(
            extension.getAllProperties(),
            extension.getName(),
            project
          ),
        (instance, propertyName, newValue) =>
          project
            .getExtensionPropertiesManager()
            .setValue(extension.getName(), propertyName, newValue)
      );
      if (
        extension
          .getAllProperties()
          .keys()
          .size() !== 0
      )
        properties.push(
          <ColumnStackLayout key={extension.getName()}>
            <Text size="title">
              <Trans>{extension.getFullName()}</Trans>
            </Text>
            <PropertiesEditor
              schema={propertiesSchema}
              instances={[extension.getAllProperties()]}
            />
          </ColumnStackLayout>
        );
    }

    return (
      <React.Fragment>
        <Dialog
          actions={[
            <FlatButton
              label={<Trans>Apply</Trans>}
              primary={true}
              onClick={this._onApply}
              key="apply"
            />,
          ]}
          title={<Trans>Extension properties</Trans>}
          cannotBeDismissed={true}
          open={this.props.open}
          onRequestClose={this.props.onApply}
        >
          {properties.length ? (
            <List>{properties}</List>
          ) : (
            <EmptyMessage>
              <Trans>No Extension Properties Available.</Trans>
            </EmptyMessage>
          )}
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ExtensionsPropertiesDialog;
