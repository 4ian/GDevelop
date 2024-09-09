// @flow
import * as React from 'react';
import CompactPropertiesEditor from '../../CompactPropertiesEditor';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  onRefreshAllFields: () => void,
  resourceManagementProps: ResourceManagementProps,
  unsavedChanges?: ?UnsavedChanges,
  eventsBasedObject: gdEventsBasedObject,
  customObjectConfiguration: gdCustomObjectConfiguration,
  childObject: gdObject,
|};

export const ChildObjectPropertiesEditor = ({
  project,
  onRefreshAllFields,
  resourceManagementProps,
  unsavedChanges,
  eventsBasedObject,
  customObjectConfiguration,
  childObject,
}: Props) => {
  const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
    childObject.getName()
  );

  const childObjectConfigurationAsGd = gd.castObject(
    childObjectConfiguration,
    gd.ObjectConfiguration
  );

  // Properties:
  const schema = React.useMemo(
    () => {
      const properties = childObjectConfigurationAsGd.getProperties();
      const schema = propertiesMapToSchema(
        properties,
        ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value)
      );

      return schema;
    },
    [childObjectConfigurationAsGd]
  );

  return (
    <CompactPropertiesEditor
      project={project}
      resourceManagementProps={resourceManagementProps}
      unsavedChanges={unsavedChanges}
      schema={schema}
      instances={[
        {
          object: childObject,
          objectConfiguration: childObjectConfigurationAsGd,
        },
      ]}
      onInstancesModified={() => {
        /* TODO */
      }}
      onRefreshAllFields={onRefreshAllFields}
    />
  );
};
