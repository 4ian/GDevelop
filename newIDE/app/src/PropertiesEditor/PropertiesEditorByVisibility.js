// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import {
  type Schema,
  type Instances,
} from '../PropertiesEditor/PropertiesEditorSchema';
import PropertiesEditor from '../PropertiesEditor';
import EmptyMessage from '../UI/EmptyMessage';
import { Column, Line } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { ColumnStackLayout } from '../UI/Layout';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import {
  filterSchema,
  isAnyPropertyModified,
} from '../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';

export const hasSchemaAnyProperty = (propertiesSchema: Schema) =>
  !propertiesSchema.every(
    property =>
      property.isHiddenWhenOnlyOneChoice &&
      property.getChoices &&
      property.getChoices().length <= 1
  );

type Props = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  schema: Schema,
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
  schema,
  object,
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
    () => filterSchema(schema, 'basic'),
    [schema]
  );

  const advancedPropertiesSchema = React.useMemo(
    () => filterSchema(schema, 'advanced'),
    [schema]
  );

  const deprecatedPropertiesSchema = React.useMemo(
    () => filterSchema(schema, 'deprecated'),
    [schema]
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

  const areAdvancedPropertiesExpandedByDefault = React.useMemo(
    () => isAnyPropertyModified(advancedPropertiesSchema, instances),
    [instances, advancedPropertiesSchema]
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
        renderExtraDescriptionText={renderExtraDescriptionText}
        unsavedChanges={unsavedChanges}
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
                renderExtraDescriptionText={renderExtraDescriptionText}
                unsavedChanges={unsavedChanges}
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
                    renderExtraDescriptionText={renderExtraDescriptionText}
                    unsavedChanges={unsavedChanges}
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
