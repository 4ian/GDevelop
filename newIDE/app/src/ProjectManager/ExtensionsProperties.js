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

function extensionsProperties(props: Props): JSX.Element {
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
          if (newValue === '1') {
            project
              .getExtensionPropertiesManager()
              .setValue(extension.getName(), propertyName, 'true');
          } else {
            project
              .getExtensionPropertiesManager()
              .setValue(extension.getName(), propertyName, 'false');
          }
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

  return propertyList.length ? (
    <List>{propertyList}</List>
  ) : (
    <EmptyMessage>
      <Trans>No Extension Properties Available.</Trans>
    </EmptyMessage>
  );
}

export default extensionsProperties;
