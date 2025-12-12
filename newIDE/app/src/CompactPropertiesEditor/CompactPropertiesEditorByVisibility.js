// @flow
import * as React from 'react';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import propertiesMapToSchema from './PropertiesMapToCompactSchema';
import CompactPropertiesEditor from '.';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import { Trans } from '@lingui/macro';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import Text from '../UI/Text';
import { Line } from '../UI/Grid';
import { useForceRecompute } from '../Utils/UseForceUpdate';
import { type Schema, type ActionButton, type Instances } from '.';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import {
  areAdvancedPropertiesModified,
  hasSchemaAnyProperty,
} from '../PropertiesEditor/PropertiesEditorByVisibility';

export const styles = {
  icon: {
    fontSize: 18,
  },
};

export const getSchemaWithOpenFullEditorButton = ({
  schema,
  fullEditorLabel,
  instance,
  onOpenFullEditor,
}: {|
  schema: Schema,
  fullEditorLabel: ?string,
  instance: gdBehavior,
  onOpenFullEditor: () => void,
|}): Schema => {
  if (!fullEditorLabel) return schema;

  const actionButton: ActionButton = {
    label: fullEditorLabel,
    disabled: 'onValuesDifferent',
    nonFieldType: 'button',
    showRightIcon: true,
    getIcon: style => <ShareExternal style={style} />,
    getValue: instance => instance.getName(),
    onClick: instance => onOpenFullEditor(),
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

export const CompactPropertiesEditorByVisibility = ({
  onInstancesModified,
  instances,
  propertiesValues,
  getPropertyDefaultValue,
  placeholder,
  renderExtraDescriptionText,
  unsavedChanges,
  project,
  object,
  resourceManagementProps,
  preventWrap,
  removeSpacers,
  customizeBasicSchema,
}: {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  propertiesValues: gdMapStringPropertyDescriptor,
  getPropertyDefaultValue: (propertyName: string) => string,
  preventWrap?: boolean,
  removeSpacers?: boolean,
  customizeBasicSchema?: Schema => Schema,
  placeholder: React.Node,

  // If set, render the "extra" description content from fields
  // (see getExtraDescription).
  renderExtraDescriptionText?: (extraDescription: string) => string,
  unsavedChanges?: ?UnsavedChanges,

  // Optional context:
  project?: ?gdProject,
  object?: ?gdObject,
  resourceManagementProps?: ?ResourceManagementProps,
|}) => {
  const areAdvancedPropertiesExpandedByDefault = React.useMemo(
    () =>
      areAdvancedPropertiesModified(propertiesValues, getPropertyDefaultValue),
    [getPropertyDefaultValue, propertiesValues]
  );

  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(
    areAdvancedPropertiesExpandedByDefault
  );
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const basicPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }

      const schema = propertiesMapToSchema({
        properties: propertiesValues,
        getProperties: instance => instance.getProperties(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object,
        visibility: 'Basic',
      });

      return customizeBasicSchema ? customizeBasicSchema(schema) : schema;
    },
    [schemaRecomputeTrigger, propertiesValues, object, customizeBasicSchema]
  );

  const advancedPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }

      return propertiesMapToSchema({
        properties: propertiesValues,
        getProperties: instance => instance.getProperties(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object,
        visibility: 'Advanced',
      });
    },
    [object, propertiesValues, schemaRecomputeTrigger]
  );
  const hasAdvancedProperties = advancedPropertiesSchema.length > 0;

  const hasAnyProperty = React.useMemo(
    () => hasSchemaAnyProperty(basicPropertiesSchema) || hasAdvancedProperties,
    [basicPropertiesSchema, hasAdvancedProperties]
  );

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      {!hasAnyProperty && (
        <Line justifyContent="center" expand>
          <Text size="body2" color="secondary" align="center" noMargin>
            {placeholder}
          </Text>
        </Line>
      )}
      {hasAnyProperty && (
        <CompactPropertiesEditor
          project={project}
          schema={basicPropertiesSchema}
          instances={instances}
          onInstancesModified={onInstancesModified}
          resourceManagementProps={resourceManagementProps}
          onRefreshAllFields={forceRecomputeSchema}
          renderExtraDescriptionText={renderExtraDescriptionText}
          unsavedChanges={unsavedChanges}
        />
      )}
      {!showAdvancedOptions && hasAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowRight style={styles.icon} />}
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
          instances={instances}
          onInstancesModified={onInstancesModified}
          resourceManagementProps={resourceManagementProps}
          onRefreshAllFields={forceRecomputeSchema}
          renderExtraDescriptionText={renderExtraDescriptionText}
          unsavedChanges={unsavedChanges}
        />
      )}
      {showAdvancedOptions && hasAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowTop style={styles.icon} />}
          label={<Trans>Show less</Trans>}
          onClick={() => {
            setShowAdvancedOptions(false);
          }}
        />
      )}
    </ColumnStackLayout>
  );
};
