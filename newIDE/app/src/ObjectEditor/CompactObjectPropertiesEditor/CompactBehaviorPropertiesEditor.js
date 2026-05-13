// @flow
import * as React from 'react';
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
import { type CompactBehaviorPropertiesEditorProps } from './CompactBehaviorPropertiesEditorProps.flow';

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

export const getPropertyValue = (
  behavior: gdBehavior,
  propertyName: string,
  initialInstance: gdInitialInstance | null
): string => {
  const behaviorName = behavior.getName();
  if (
    initialInstance &&
    initialInstance.hasBehaviorOverridingNamed(behaviorName) &&
    initialInstance
      .getBehaviorOverriding(behaviorName)
      .hasPropertyValue(propertyName)
  ) {
    const behaviorOverriding = initialInstance.getBehaviorOverriding(
      behaviorName
    );
    return behaviorOverriding
      .getProperties()
      .get(propertyName)
      .getValue();
  }
  return behavior
    .getProperties()
    .get(propertyName)
    .getValue();
};

export const updateProperty = (
  project: gdProject,
  behavior: gdBehavior,
  propertyName: string,
  value: string,
  initialInstance: gdInitialInstance | null
): void => {
  if (initialInstance) {
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
    const behaviorProperties = behavior.getProperties();
    const inheritedValue = behaviorProperties.has(propertyName)
      ? behaviorProperties.get(propertyName).getValue()
      : null;
    if (inheritedValue === value) {
      behaviorOverriding.removeProperty(propertyName);
    } else {
      behaviorOverriding.updateProperty(propertyName, value);
    }
  } else {
    behavior.updateProperty(propertyName, value);
  }
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
}: CompactBehaviorPropertiesEditorProps): React.Node => {
  const fullEditorLabel = behaviorMetadata.getOpenFullEditorLabel();

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      if (initialInstance) {
        const behaviorProperties = behavior.getProperties();
        return propertiesMapToSchema({
          properties: behaviorProperties,
          defaultValueProperties: behaviorProperties,
          getPropertyValue: (instance, propertyName) =>
            getPropertyValue(behavior, propertyName, initialInstance),
          onUpdateProperty: (instance, propertyName, value) =>
            updateProperty(
              project,
              behavior,
              propertyName,
              value,
              initialInstance
            ),
          object,
          visibility: 'All',
          showcaseNonDefaultValues: true,
        });
      }
      const behaviorMetadataProperties = behaviorMetadata.getProperties();
      return propertiesMapToSchema({
        properties: behaviorMetadataProperties,
        defaultValueProperties: behaviorMetadataProperties,
        getPropertyValue: (instance, name) =>
          instance
            .getProperties()
            .get(name)
            .getValue(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object,
        visibility: 'All',
      });
    },
    [
      schemaRecomputeTrigger,
      initialInstance,
      behavior,
      behaviorMetadata,
      object,
      project,
    ]
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
        customizeBasicSchema={
          onOpenFullEditor
            ? schema =>
                getSchemaWithOpenFullEditorButton({
                  schema,
                  fullEditorLabel,
                  behavior,
                  onOpenFullEditor,
                })
            : null
        }
        // $FlowFixMe[incompatible-type]
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};
