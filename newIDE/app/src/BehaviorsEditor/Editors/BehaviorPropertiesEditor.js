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
    const { behavior, project } = this.props;
    const properties = behavior.getProperties(project);

    const propertiesSchema = propertiesMapToSchema(
      properties,
      behavior => behavior.getProperties(project),
      (behavior, name, value) => behavior.updateProperty(name, value, project)
    );

    return (
      <Column>
        {propertiesSchema.length ? (
          <PropertiesEditor schema={propertiesSchema} instances={[behavior]} />
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
