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
    const { behavior, behaviorContent, object } = this.props;
    const properties = behavior.getProperties(behaviorContent.getContent());

    const propertiesSchema = propertiesMapToSchema(
      properties,
      (behaviorContent) => behavior.getProperties(behaviorContent.getContent()),
      (behaviorContent, name, value) => {
        behavior.updateProperty(behaviorContent.getContent(), name, value);
      },
      object
    );

    return (
      <Column expand>
        {propertiesSchema.length ? (
          <PropertiesEditor
            schema={propertiesSchema}
            instances={[behaviorContent]}
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
