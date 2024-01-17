// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column, Line } from '../../UI/Grid';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout } from '../../UI/Layout';

type Props = BehaviorEditorProps;

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

  const propertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object
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
        // Deprecated properties
        true
      ),
    [behavior, object]
  );

  return (
    <Column expand>
      {propertiesSchema.length ? (
        <ColumnStackLayout expand noMargin>
          <PropertiesEditor
            project={project}
            schema={propertiesSchema}
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
                  onClick={() => setShouldShowDeprecatedProperties(true)}
                />
              </Line>
            ))}
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
