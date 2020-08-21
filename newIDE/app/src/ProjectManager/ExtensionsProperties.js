// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import EmptyMessage from '../UI/EmptyMessage';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import { List } from '@material-ui/core';

type Props = {|
  project: gdProject,
|};

function ExtensionsProperties(props: Props) {
  const { project } = props;
  const allExtensions = project.getCurrentPlatform().getAllPlatformExtensions();
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
      (instance, propertyName, newValue) => {
        if (
          project
            .getExtensionPropertiesManager()
            .getAllExtensionProperties(extension.getName(), project)
            .get(propertyName)
            .getType() === 'boolean'
        ) {
          project
            .getExtensionPropertiesManager()
            .setValue(
              extension.getName(),
              propertyName,
              newValue === '1' ? 'true' : 'false'
            );
        } else {
          project
            .getExtensionPropertiesManager()
            .setValue(extension.getName(), propertyName, newValue);
        }
      }
    );

    propertyList.push(
      <ColumnStackLayout key={extension.getName()} noMargin>
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

  return propertyList.length ? <List>{propertyList}</List> : null;
}

export default ExtensionsProperties;
