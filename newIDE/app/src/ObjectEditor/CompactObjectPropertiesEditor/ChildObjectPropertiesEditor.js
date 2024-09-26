// @flow
import * as React from 'react';
import CompactPropertiesEditor from '../../CompactPropertiesEditor';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { ColumnStackLayout } from '../../UI/Layout';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import { Trans } from '@lingui/macro';
import FlatButton from '../../UI/FlatButton';
import ChevronArrowTop from '../../UI/CustomSvgIcons/ChevronArrowTop';
import Text from '../../UI/Text';
import { getSchemaWithOpenFullEditorButton } from './CompactObjectPropertiesSchema';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  onRefreshAllFields: () => void,
  resourceManagementProps: ResourceManagementProps,
  unsavedChanges?: ?UnsavedChanges,
  eventsBasedObject: gdEventsBasedObject,
  customObjectConfiguration: gdCustomObjectConfiguration,
  childObject: gdObject,
  onEditObject: () => void,
|};

export const ChildObjectPropertiesEditor = ({
  project,
  onRefreshAllFields,
  resourceManagementProps,
  unsavedChanges,
  eventsBasedObject,
  customObjectConfiguration,
  childObject,
  onEditObject,
}: Props) => {
  const [
    showObjectAdvancedOptions,
    setShowObjectAdvancedOptions,
  ] = React.useState(false);

  // Don't use a memo for this because metadata from custom objects are built
  // from event-based object when extensions are refreshed after an extension
  // installation.
  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    childObject.getType()
  );
  const fullEditorLabel = objectMetadata
    ? objectMetadata.getOpenFullEditorLabel()
    : null;

  const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
    childObject.getName()
  );

  const childObjectConfigurationAsGd = gd.castObject(
    childObjectConfiguration,
    gd.ObjectConfiguration
  );

  // Properties:
  const objectBasicPropertiesSchema = React.useMemo(
    () => {
      const properties = childObjectConfigurationAsGd.getProperties();
      const schema = propertiesMapToSchema({
        properties,
        getProperties: ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        onUpdateProperty: ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        visibility: 'Basic',
      });

      return getSchemaWithOpenFullEditorButton({
        schema,
        fullEditorLabel,
        object: childObject,
        onEditObject,
      });
    },
    [childObjectConfigurationAsGd, childObject, fullEditorLabel, onEditObject]
  );

  const objectAdvancedPropertiesSchema = React.useMemo(
    () => {
      const properties = childObjectConfigurationAsGd.getProperties();
      const schema = propertiesMapToSchema({
        properties,
        getProperties: ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        onUpdateProperty: ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        visibility: 'Advanced',
      });

      return schema;
    },
    [childObjectConfigurationAsGd]
  );
  const hasObjectAdvancedProperties = objectAdvancedPropertiesSchema.length > 0;
  const hasSomeObjectProperties =
    objectBasicPropertiesSchema.length > 0 || hasObjectAdvancedProperties;

  return (
    <ColumnStackLayout noMargin noOverflowParent>
      {!hasSomeObjectProperties && (
        <Text size="body2" align="center" color="secondary">
          <Trans>This object has no properties.</Trans>
        </Text>
      )}
      {hasSomeObjectProperties && (
        <CompactPropertiesEditor
          project={project}
          resourceManagementProps={resourceManagementProps}
          unsavedChanges={unsavedChanges}
          schema={objectBasicPropertiesSchema}
          instances={[
            {
              object: childObject,
              objectConfiguration: childObjectConfigurationAsGd,
            },
          ]}
          onInstancesModified={() => {
            // TODO: undo/redo?
          }}
          onRefreshAllFields={onRefreshAllFields}
        />
      )}
      {!showObjectAdvancedOptions && hasObjectAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowRight />}
          label={<Trans>Show more</Trans>}
          onClick={() => {
            setShowObjectAdvancedOptions(true);
          }}
        />
      )}
      {showObjectAdvancedOptions && hasObjectAdvancedProperties && (
        <CompactPropertiesEditor
          project={project}
          resourceManagementProps={resourceManagementProps}
          unsavedChanges={unsavedChanges}
          schema={objectAdvancedPropertiesSchema}
          instances={[
            {
              object: childObject,
              objectConfiguration: childObjectConfigurationAsGd,
            },
          ]}
          onInstancesModified={() => {
            // TODO: undo/redo?
          }}
          onRefreshAllFields={onRefreshAllFields}
        />
      )}
      {showObjectAdvancedOptions && hasObjectAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowTop />}
          label={<Trans>Show less</Trans>}
          onClick={() => {
            setShowObjectAdvancedOptions(false);
          }}
        />
      )}
    </ColumnStackLayout>
  );
};
