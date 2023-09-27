// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column } from '../../UI/Grid';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';

type Props = BehaviorEditorProps;

export default class BehaviorPropertiesEditor extends React.Component<Props> {
  render() {
    const {
      project,
      behavior,
      object,
      onBehaviorUpdated,
      resourceManagementProps,
    } = this.props;

    const propertiesSchema = propertiesMapToSchema(
      behavior.getProperties(),
      behavior => behavior.getProperties(),
      (behavior, name, value) => {
        behavior.updateProperty(name, value);
      },
      object
    );

    return (
      <Column expand>
        {propertiesSchema.length ? (
          <PropertiesEditor
            project={project}
            schema={propertiesSchema}
            instances={[behavior]}
            onInstancesModified={onBehaviorUpdated}
            resourceManagementProps={resourceManagementProps}
          />
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
  }
}
