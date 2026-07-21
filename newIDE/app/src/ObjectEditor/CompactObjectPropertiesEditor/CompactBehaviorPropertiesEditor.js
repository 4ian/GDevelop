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
import {
  advancedTweenBehaviorType,
  customizeAdvancedTweenBehaviorPropertiesSchema,
} from '../../BehaviorsEditor/Editors/AdvancedTweenBehaviorEditorOptions';

const gd: libGDevelop = global.gd;

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

export const createCompactBehaviorPropertiesSchema = ({
  behaviorMetadata,
  behavior,
  object,
  layersContainer,
}: {|
  behaviorMetadata: gdBehaviorMetadata,
  behavior: gdBehavior,
  object: gdObject | null,
  layersContainer: gdLayersContainer,
|}): Schema => {
  const behaviorMetadataProperties = behaviorMetadata.getProperties();
  const schema = propertiesMapToSchema({
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
    layersContainer,
    visibility: 'All',
    shouldDisabledFieldsWithMixedValues: true,
  });
  return behavior.getTypeName() === advancedTweenBehaviorType
    ? customizeAdvancedTweenBehaviorPropertiesSchema(schema)
    : schema;
};

export const CompactBehaviorPropertiesEditor = ({
  project,
  behaviorTypeName,
  behaviors,
  object,
  layersContainer,
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
  propertiesSchema: providedPropertiesSchema,
  isAdvancedSectionInitiallyUncollapsed,
}: CompactBehaviorPropertiesEditorProps): React.Node => {
  const behavior = behaviors[0];
  // Behavior metadata is owned by the platform extension and is replaced when
  // extensions are refreshed. Do not keep its WebIDL wrapper in React props:
  // a deferred render could otherwise call into a freed WASM object.
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    gd.JsPlatform.get(),
    behaviorTypeName
  );
  const openFullEditorLabel = behaviorMetadata.getOpenFullEditorLabel();

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const computedPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return createCompactBehaviorPropertiesSchema({
        behaviorMetadata,
        behavior,
        object,
        layersContainer,
      });
    },
    [
      schemaRecomputeTrigger,
      behaviorMetadata,
      object,
      layersContainer,
      behavior,
    ]
  );
  const propertiesSchema = providedPropertiesSchema || computedPropertiesSchema;

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
        project={project}
        object={object}
        schema={propertiesSchema}
        instances={behaviors}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        placeholder={<Trans>Nothing to configure for this behavior.</Trans>}
        isAdvancedSectionInitiallyUncollapsed={
          isAdvancedSectionInitiallyUncollapsed
        }
        customizeBasicSchema={
          onOpenFullEditor
            ? schema =>
                getSchemaWithOpenFullEditorButton({
                  schema,
                  fullEditorLabel: openFullEditorLabel,
                  behavior: behaviors[0],
                  onOpenFullEditor,
                })
            : null
        }
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};
