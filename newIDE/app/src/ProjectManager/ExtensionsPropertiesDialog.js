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

  render() {
    const { project } = this.props;
    global.project = project;
    const allExtensions = project
      .getCurrentPlatform()
      .getAllPlatformExtensions();
    const propertyList = [];
    for (let i = 0; i < allExtensions.size(); i++) {
      const extension = allExtensions.at(i);
      const properties = project
        .getExtensionPropertiesManager()
        .getAllExtensionProperties(extension.getName(), project);
      if (properties.keys().size() === 0) continue;
      const propertiesSchema = propertiesMapToSchema(
        properties,
        instance =>
          project
            .getExtensionPropertiesManager()
            .getAllExtensionProperties(extension.getName(), project),
        (instance, propertyName, newValue) =>
          project
            .getExtensionPropertiesManager()
            .setValue(extension.getName(), propertyName, newValue)
      );

      propertyList.push(
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
          title={
            <Text size="title">
              <Trans>Extension properties</Trans>
            </Text>
          }
          cannotBeDismissed={true}
          open={this.props.open}
          onRequestClose={this.props.onApply}
        >
          {propertyList.length ? (
            <List>{propertyList}</List>
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
