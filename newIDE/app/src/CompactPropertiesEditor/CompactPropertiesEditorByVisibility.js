// @flow
import * as React from 'react';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import CompactPropertiesEditor from '.';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import { Trans } from '@lingui/macro';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import Text from '../UI/Text';
import { Line } from '../UI/Grid';
import {
  type Schema,
  type ActionButton,
  type Instances,
  type SectionTitle,
  type Field,
  type FieldVisibility,
} from '.';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { hasSchemaAnyProperty } from '../PropertiesEditor/PropertiesEditorByVisibility';

export const styles = {
  icon: {
    fontSize: 18,
  },
};

const fieldVisibilitiesByPriority: Array<FieldVisibility | ''> = [
  'basic',
  'advanced',
  'deprecated',
  '',
];

const mergeFieldVisibility = (
  visibility: FieldVisibility | '',
  otherVisibility: FieldVisibility | ''
) =>
  fieldVisibilitiesByPriority[
    Math.min(
      fieldVisibilitiesByPriority.indexOf(visibility),
      fieldVisibilitiesByPriority.indexOf(otherVisibility)
    )
  ];

const getFieldVisibility = (field: Field): FieldVisibility | '' => {
  if (field.children) {
    let visibility: FieldVisibility | '' = '';
    for (const child of field.children) {
      visibility = mergeFieldVisibility(visibility, getFieldVisibility(child));
      if (visibility === 'basic') {
        return visibility;
      }
    }
    return visibility;
  } else if (field.visibility) {
    return field.visibility || 'basic';
  }
  return '';
};

const filterSchema = (source: Schema, visibility: FieldVisibility) => {
  const destination: Schema = [];
  let holdingSectionTitle: SectionTitle | null = null;
  for (const field of source) {
    if (field.nonFieldType === 'sectionTitle') {
      holdingSectionTitle = ((field: any): SectionTitle);
    } else {
      if ((getFieldVisibility(field) || 'basic') === visibility) {
        if (holdingSectionTitle) {
          destination.push(holdingSectionTitle);
          holdingSectionTitle = null;
        }
        destination.push(field);
      }
    }
  }
  return destination;
};

const isAnyPropertyModified = (
  schema: Schema,
  instances: Instances
): boolean => {
  for (const field of schema) {
    if (
      !field.getValue ||
      !field.setValue ||
      field.defaultValue === undefined ||
      field.defaultValue === null
    ) {
      continue;
    }
    const getValue = field.getValue;
    const defaultValue = field.defaultValue;
    if (instances.some(instance => getValue(instance) !== defaultValue)) {
      return true;
    }
  }
  return false;
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
  schema,
  placeholder,
  renderExtraDescriptionText,
  unsavedChanges,
  project,
  object,
  resourceManagementProps,
  preventWrap,
  removeSpacers,
  customizeBasicSchema,
  onRefreshAllFields,
}: {|
  onInstancesModified?: Instances => void,
  schema: Schema,
  instances: Instances,
  preventWrap?: boolean,
  removeSpacers?: boolean,
  customizeBasicSchema?: Schema => Schema,
  placeholder: React.Node,
  onRefreshAllFields: () => void,

  // If set, render the "extra" description content from fields
  // (see getExtraDescription).
  renderExtraDescriptionText?: (extraDescription: string) => string,
  unsavedChanges?: ?UnsavedChanges,

  // Optional context:
  project?: ?gdProject,
  object?: ?gdObject,
  resourceManagementProps?: ?ResourceManagementProps,
|}) => {
  const basicPropertiesSchema = React.useMemo(
    () => {
      const basicSchema = filterSchema(schema, 'basic');
      return customizeBasicSchema
        ? customizeBasicSchema(basicSchema)
        : basicSchema;
    },
    [schema, customizeBasicSchema]
  );

  const advancedPropertiesSchema = React.useMemo(
    () => filterSchema(schema, 'advanced'),
    [schema]
  );
  const hasAdvancedProperties = advancedPropertiesSchema.length > 0;

  const hasAnyProperty = React.useMemo(
    () => hasSchemaAnyProperty(basicPropertiesSchema) || hasAdvancedProperties,
    [basicPropertiesSchema, hasAdvancedProperties]
  );

  const areAdvancedPropertiesExpandedByDefault = React.useMemo(
    () => isAnyPropertyModified(advancedPropertiesSchema, instances),
    [instances, advancedPropertiesSchema]
  );

  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(
    areAdvancedPropertiesExpandedByDefault
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
          onRefreshAllFields={onRefreshAllFields}
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
          onRefreshAllFields={onRefreshAllFields}
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
