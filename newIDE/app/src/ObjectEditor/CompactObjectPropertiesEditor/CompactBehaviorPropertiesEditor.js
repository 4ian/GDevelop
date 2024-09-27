// @flow
import * as React from 'react';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import CompactPropertiesEditor from '../../CompactPropertiesEditor';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout } from '../../UI/Layout';
import { Trans } from '@lingui/macro';
import ChevronArrowTop from '../../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';
import { useForceRecompute } from '../../Utils/UseForceUpdate';
import { type Schema, type ActionButton } from '../../CompactPropertiesEditor';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';

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
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
}: {|
  project: gdProject,
  behaviorMetadata: gdBehaviorMetadata,
  behavior: gdBehavior,
  object: gdObject,
  onOpenFullEditor: () => void,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
|}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const fullEditorLabel = behaviorMetadata.getOpenFullEditorLabel();

  const basicPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }

      const schema = propertiesMapToSchema({
        properties: behavior.getProperties(),
        getProperties: behavior => behavior.getProperties(),
        onUpdateProperty: (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        visibility: 'Basic',
      });

      return getSchemaWithOpenFullEditorButton({
        schema,
        fullEditorLabel,
        behavior,
        onOpenFullEditor,
      });
    },
    [
      behavior,
      object,
      schemaRecomputeTrigger,
      fullEditorLabel,
      onOpenFullEditor,
    ]
  );

  const advancedPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }

      return propertiesMapToSchema({
        properties: behavior.getProperties(),
        getProperties: behavior => behavior.getProperties(),
        onUpdateProperty: (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        visibility: 'Advanced',
      });
    },
    [behavior, object, schemaRecomputeTrigger]
  );
  const hasAdvancedProperties = advancedPropertiesSchema.length > 0;
  const hasSomeProperties =
    basicPropertiesSchema.length > 0 || hasAdvancedProperties;

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      {!hasSomeProperties && (
        <Line justifyContent="center" expand>
          <Text size="body2" color="secondary" align="center" noMargin>
            <Trans>Nothing to configure for this behavior.</Trans>
          </Text>
        </Line>
      )}
      {hasSomeProperties && (
        <CompactPropertiesEditor
          project={project}
          schema={basicPropertiesSchema}
          instances={[behavior]}
          onInstancesModified={onBehaviorUpdated}
          resourceManagementProps={resourceManagementProps}
          onRefreshAllFields={forceRecomputeSchema}
        />
      )}
      {!showAdvancedOptions && hasAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowRight />}
          label={<Trans>Show more</Trans>}
          onClick={() => {
            setShowAdvancedOptions(true);
          }}
        />
      )}
      {showAdvancedOptions && hasAdvancedProperties && (
        <CompactPropertiesEditor
          project={project}
          schema={advancedPropertiesSchema}
          instances={[behavior]}
          onInstancesModified={onBehaviorUpdated}
          resourceManagementProps={resourceManagementProps}
          onRefreshAllFields={forceRecomputeSchema}
        />
      )}
      {showAdvancedOptions && hasAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowTop />}
          label={<Trans>Show less</Trans>}
          onClick={() => {
            setShowAdvancedOptions(false);
          }}
        />
      )}
    </ColumnStackLayout>
  );
};
