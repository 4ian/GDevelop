// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { ColumnStackLayout } from '../../UI/Layout';
import { getSchemaWithOpenFullEditorButton } from './CompactObjectPropertiesSchema';
import { useForceRecompute } from '../../Utils/UseForceUpdate';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  unsavedChanges?: ?UnsavedChanges,
  customObjectConfiguration: gdCustomObjectConfiguration,
  childObject: gdObject,
  onEditObject: () => void,
|};

export const ChildObjectPropertiesEditor = ({
  project,
  resourceManagementProps,
  unsavedChanges,
  customObjectConfiguration,
  childObject,
  onEditObject,
}: Props) => {
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

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  // Properties:
  const schema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return propertiesMapToSchema({
        properties: childObjectConfigurationAsGd.getProperties(),
        defaultValueProperties: null,
        getProperties: ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        onUpdateProperty: ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        visibility: 'All',
      });
    },
    [schemaRecomputeTrigger, childObjectConfigurationAsGd]
  );

  return (
    <ColumnStackLayout noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
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
          // TODO: undo/redo?
        }}
        onRefreshAllFields={forceRecomputeSchema}
        placeholder={<Trans>This object has no properties.</Trans>}
        customizeBasicSchema={schema =>
          getSchemaWithOpenFullEditorButton({
            schema,
            fullEditorLabel,
            object: childObject,
            onEditObject,
          })
        }
      />
    </ColumnStackLayout>
  );
};
