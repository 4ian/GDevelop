// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor, {
  type Schema,
  type Instances,
} from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../UI/EmptyMessage';
import { Column, Line } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import { mapFor } from '../Utils/MapFor';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { ColumnStackLayout } from '../UI/Layout';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

export const areAdvancedPropertiesModified = (
  propertiesValues: gdMapStringPropertyDescriptor,
  getPropertyDefaultValue: (propertyName: string) => string
) => {
  const propertyNames = propertiesValues.keys();
  let hasFoundModifiedAdvancedProperty = false;
  mapFor(0, propertyNames.size(), i => {
    const name = propertyNames.at(i);
    const property = propertiesValues.get(name);
    const currentValue = property.getValue();
    const defaultValue = getPropertyDefaultValue(name);

    // Some boolean properties can be set to an empty string to mean false.
    const hasDefaultValue =
      property.getType().toLowerCase() === 'boolean'
        ? (currentValue === 'true') === (defaultValue === 'true')
        : currentValue === defaultValue;
    if (property.isAdvanced() && !hasDefaultValue) {
      hasFoundModifiedAdvancedProperty = true;
    }
  });
  return hasFoundModifiedAdvancedProperty;
};

const hasSchemaAnyProperty = (propertiesSchema: Schema) =>
  !propertiesSchema.every(
    property =>
      property.isHiddenWhenOnlyOneChoice &&
      property.getChoices &&
      property.getChoices().length <= 1
  );

type Props = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  mode?: 'column' | 'row',
  propertiesValues: gdMapStringPropertyDescriptor,
  getPropertyDefaultValue: (propertyName: string) => string,
  placeholder: React.Node,

  // If set, render the "extra" description content from fields
  // (see getExtraDescription).
  renderExtraDescriptionText?: (extraDescription: string) => string,
  unsavedChanges?: ?UnsavedChanges,

  // Optional context:
  project?: ?gdProject,
  object?: ?gdObject,
  projectScopedContainersAccessor?: ProjectScopedContainersAccessor,
  resourceManagementProps?: ?ResourceManagementProps,
|};

const PropertiesEditorByVisibility = ({
  onInstancesModified,
  instances,
  propertiesValues,
  getPropertyDefaultValue,
  object,
  mode,
  renderExtraDescriptionText,
  unsavedChanges,
  project,
  projectScopedContainersAccessor,
  resourceManagementProps,
  placeholder,
}: Props) => {
  const [
    shouldShowDeprecatedProperties,
    setShouldShowDeprecatedProperties,
  ] = React.useState<boolean>(false);

  const basicPropertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        propertiesValues,
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Basic'
      ),
    [propertiesValues, object]
  );

  const areAdvancedPropertiesExpandedByDefault = React.useMemo(
    () =>
      areAdvancedPropertiesModified(propertiesValues, getPropertyDefaultValue),
    [getPropertyDefaultValue, propertiesValues]
  );

  const advancedPropertiesSchema = React.useMemo<Schema>(
    () =>
      propertiesMapToSchema(
        propertiesValues,
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Advanced'
      ),
    [propertiesValues, object]
  );

  const deprecatedPropertiesSchema = React.useMemo<Schema>(
    () =>
      propertiesMapToSchema(
        propertiesValues,
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Deprecated'
      ),
    [propertiesValues, object]
  );

  const hasAnyProperty = React.useMemo(
    () =>
      hasSchemaAnyProperty(basicPropertiesSchema) ||
      hasSchemaAnyProperty(advancedPropertiesSchema) ||
      deprecatedPropertiesSchema.length > 0,
    [
      basicPropertiesSchema,
      advancedPropertiesSchema,
      deprecatedPropertiesSchema,
    ]
  );

  return hasAnyProperty ? (
    <ColumnStackLayout expand noMargin>
      <PropertiesEditor
        project={project}
        schema={basicPropertiesSchema}
        instances={instances}
        onInstancesModified={onInstancesModified}
        resourceManagementProps={resourceManagementProps}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
      />
      {(advancedPropertiesSchema.length > 0 ||
        deprecatedPropertiesSchema.length > 0) && (
        <Accordion
          defaultExpanded={areAdvancedPropertiesExpandedByDefault}
          noMargin
        >
          <AccordionHeader noMargin>
            <Text size="sub-title">
              <Trans>Advanced properties</Trans>
            </Text>
          </AccordionHeader>
          <AccordionBody disableGutters>
            <Column expand noMargin>
              <PropertiesEditor
                project={project}
                schema={advancedPropertiesSchema}
                instances={instances}
                onInstancesModified={onInstancesModified}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
              {deprecatedPropertiesSchema.length > 0 &&
                (shouldShowDeprecatedProperties ? (
                  <PropertiesEditor
                    project={project}
                    schema={deprecatedPropertiesSchema}
                    instances={instances}
                    onInstancesModified={onInstancesModified}
                    resourceManagementProps={resourceManagementProps}
                    projectScopedContainersAccessor={
                      projectScopedContainersAccessor
                    }
                  />
                ) : (
                  <Line justifyContent="center">
                    <FlatButton
                      key="show-deprecated"
                      label={<Trans>Show deprecated options</Trans>}
                      onClick={() => setShouldShowDeprecatedProperties(true)}
                    />
                  </Line>
                ))}
            </Column>
          </AccordionBody>
        </Accordion>
      )}
    </ColumnStackLayout>
  ) : (
    placeholder && (
      <Column expand>
        <EmptyMessage>{placeholder}</EmptyMessage>
      </Column>
    )
  );
};

export default PropertiesEditorByVisibility;
