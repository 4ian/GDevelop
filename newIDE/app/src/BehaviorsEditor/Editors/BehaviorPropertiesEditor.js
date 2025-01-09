// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column, Line } from '../../UI/Grid';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import FlatButton from '../../UI/FlatButton';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
import { Accordion, AccordionHeader, AccordionBody } from '../../UI/Accordion';
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

type Props = BehaviorEditorProps;

const areAdvancedPropertiesModified = (behavior: gdBehavior) => {
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    gd.JsPlatform.get(),
    behavior.getTypeName()
  );
  const propertiesMetadata = behaviorMetadata.getProperties();
  const propertiesValues = behavior.getProperties();
  const propertyNames = propertiesMetadata.keys();
  let hasFoundModifiedAdvancedProperty = false;
  mapFor(0, propertyNames.size(), i => {
    const name = propertyNames.at(i);
    const property = propertiesMetadata.get(name);
    const defaultValue = property.getValue();
    const currentValue = propertiesValues.get(name).getValue();

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

const BehaviorPropertiesEditor = ({
  project,
  behavior,
  object,
  onBehaviorUpdated,
  resourceManagementProps,
}: Props) => {
  const [
    shouldShowDeprecatedProperties,
    setShouldShowDeprecatedProperties,
  ] = React.useState<boolean>(false);

  const basicPropertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Basic'
      ),
    [behavior, object]
  );

  const areAdvancedPropertiesExpandedByDefault = React.useMemo(
    () => areAdvancedPropertiesModified(behavior),
    [behavior]
  );

  const advancedPropertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Advanced'
      ),
    [behavior, object]
  );

  const deprecatedPropertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Deprecated'
      ),
    [behavior, object]
  );

  return (
    <Column expand>
      {basicPropertiesSchema.length > 0 ||
      advancedPropertiesSchema.length > 0 ||
      deprecatedPropertiesSchema.length > 0 ? (
        <ColumnStackLayout expand noMargin>
          <PropertiesEditor
            project={project}
            schema={basicPropertiesSchema}
            instances={[behavior]}
            onInstancesModified={onBehaviorUpdated}
            resourceManagementProps={resourceManagementProps}
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
                    instances={[behavior]}
                    onInstancesModified={onBehaviorUpdated}
                    resourceManagementProps={resourceManagementProps}
                  />
                  {deprecatedPropertiesSchema.length > 0 &&
                    (shouldShowDeprecatedProperties ? (
                      <PropertiesEditor
                        project={project}
                        schema={deprecatedPropertiesSchema}
                        instances={[behavior]}
                        onInstancesModified={onBehaviorUpdated}
                        resourceManagementProps={resourceManagementProps}
                      />
                    ) : (
                      <Line justifyContent="center">
                        <FlatButton
                          key="show-deprecated"
                          label={<Trans>Show deprecated options</Trans>}
                          onClick={() =>
                            setShouldShowDeprecatedProperties(true)
                          }
                        />
                      </Line>
                    ))}
                </Column>
              </AccordionBody>
            </Accordion>
          )}
        </ColumnStackLayout>
      ) : (
        <EmptyMessage>
          <Trans>
            There is nothing to configure for this behavior. You can still use
            events to interact with the object and this behavior.
          </Trans>
        </EmptyMessage>
      )}
    </Column>
  );
};

export default BehaviorPropertiesEditor;
