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
import { type CompactInstanceBehaviorPropertiesEditorProps } from './CompactInstanceBehaviorPropertiesEditorProps.flow';

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
  initialInstance: gdInitialInstance
): string => {
  const behaviorName = behavior.getName();
  if (
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
  initialInstance: gdInitialInstance
): void => {
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
};

export const CompactInstanceBehaviorPropertiesEditor = ({
  project,
  behaviorMetadata,
  behavior,
  object,
  layersContainer,
  initialInstances,
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
}: CompactInstanceBehaviorPropertiesEditorProps): React.Node => {
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const instancesAndBehaviors = initialInstances.map(initialInstance => ({
    initialInstance,
    behavior,
  }));

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      const behaviorProperties = behavior.getProperties();
      return propertiesMapToSchema({
        properties: behaviorProperties,
        defaultValueProperties: behaviorProperties,
        getPropertyValue: (
          {
            behavior,
            initialInstance,
          }: { behavior: gdBehavior, initialInstance: gdInitialInstance },
          propertyName
        ) => getPropertyValue(behavior, propertyName, initialInstance),
        onUpdateProperty: (
          {
            behavior,
            initialInstance,
          }: { behavior: gdBehavior, initialInstance: gdInitialInstance },
          propertyName,
          value
        ) =>
          updateProperty(
            project,
            behavior,
            propertyName,
            value,
            initialInstance
          ),
        object,
        layersContainer,
        visibility: 'All',
        showcaseNonDefaultValues: true,
        hideResourceProperties: true,
        shouldDisabledFieldsWithMixedValues: false,
      });
    },
    [schemaRecomputeTrigger, object, layersContainer, behavior, project]
  );

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
        project={project}
        object={object}
        schema={propertiesSchema}
        instances={instancesAndBehaviors}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        placeholder={<Trans>Nothing to configure for this behavior.</Trans>}
        customizeBasicSchema={
          onOpenFullEditor
            ? schema =>
                getSchemaWithOpenFullEditorButton({
                  schema,
                  fullEditorLabel: behaviorMetadata.getOpenFullEditorLabel(),
                  behavior: behavior,
                  onOpenFullEditor,
                })
            : null
        }
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};
