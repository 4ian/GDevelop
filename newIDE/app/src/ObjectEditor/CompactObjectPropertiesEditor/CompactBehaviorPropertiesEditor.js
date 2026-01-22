// @flow
import * as React from 'react';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ColumnStackLayout } from '../../UI/Layout';
import { Trans } from '@lingui/macro';
import {
  type Schema,
  type ActionButton,
} from '../../PropertiesEditor/PropertiesEditorSchema';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { useForceRecompute } from '../../Utils/UseForceUpdate';

export const styles = {
  icon: {
    fontSize: 18,
  },
};

export const getSchemaWithOpenFullEditorButton = ({
  schema,
  fullEditorLabel,
  behavior,
  onOpenFullEditor,
}: {|
  schema: Schema,
  fullEditorLabel: ?string,
  behavior: gdBehavior,
  onOpenFullEditor: () => void,
|}): Schema => {
  if (!fullEditorLabel) return schema;

  const actionButton: ActionButton = {
    label: fullEditorLabel,
    disabled: 'onValuesDifferent',
    nonFieldType: 'button',
    showRightIcon: true,
    getIcon: style => <ShareExternal style={style} />,
    getValue: behavior => behavior.getName(),
    onClick: behavior => onOpenFullEditor(),
  };

  let added = false;
  schema.forEach(field => {
    if (field.children && field.name === '') {
      field.children.push(actionButton);
      added = true;
    }
  });

  if (!added) schema.push(actionButton);

  return schema;
};

export const CompactBehaviorPropertiesEditor = ({
  project,
  behaviorMetadata,
  behavior,
  object,
  behaviorOverriding,
  initialInstance,
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
}: {|
  project: gdProject,
  behaviorMetadata: gdBehaviorMetadata,
  behavior: gdBehavior,
  object: gdObject,
  behaviorOverriding: gdBehavior | null,
  initialInstance: gdInitialInstance | null,
  onOpenFullEditor: () => void,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
|}) => {
  const fullEditorLabel = behaviorMetadata.getOpenFullEditorLabel();

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      if (initialInstance) {
        return propertiesMapToSchema({
          properties: behavior.getProperties(),
          defaultValueProperties: behavior.getProperties(),
          getProperties: instance => {
            const behaviorName = behavior.getName();
            if (initialInstance.hasBehaviorOverridingNamed(behaviorName)) {
              return initialInstance
                .getBehaviorOverriding(behaviorName)
                .getProperties();
            }
            return behavior.getProperties();
          },
          onUpdateProperty: (instance, name, value) => {
            const behaviorName = behavior.getName();
            const behaviorOverriding = initialInstance.hasBehaviorOverridingNamed(
              behaviorName
            )
              ? initialInstance.getBehaviorOverriding(behaviorName)
              : initialInstance.addNewBehaviorOverriding(
                  project,
                  behavior.getTypeName(),
                  behaviorName
                );
            behaviorOverriding.updateProperty(name, value);
          },
          object,
          visibility: 'All',
        });
      }
      return propertiesMapToSchema({
        properties: behavior.getProperties(),
        defaultValueProperties: behaviorMetadata.getProperties(),
        getProperties: instance => instance.getProperties(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object,
        visibility: 'All',
      });
    },
    [schemaRecomputeTrigger, behavior, behaviorMetadata, object]
  );

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
        project={project}
        object={object}
        schema={propertiesSchema}
        instances={[behavior]}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        placeholder={<Trans>Nothing to configure for this behavior.</Trans>}
        customizeBasicSchema={schema =>
          getSchemaWithOpenFullEditorButton({
            schema,
            fullEditorLabel,
            behavior,
            onOpenFullEditor,
          })
        }
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};
