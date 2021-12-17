// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column } from '../../UI/Grid';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import { ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { type Schema } from '../..';

type Props = BehaviorEditorProps;

export default class BehaviorPropertiesEditor extends React.Component<Props> {
  render() {
    const { behavior, behaviorContent, object } = this.props;
    const properties = behavior.getProperties(behaviorContent.getContent());

    const groupNames = [];
    const propertyNames = properties.keys();
    for (let i = 0; i < propertyNames.size(); i++) {
      const name = propertyNames.at(i);
      const property = properties.get(name);
      const group = property.getGroup() || '';
      if (!groupNames.includes(group)) {
        groupNames.push(group);
      }
    }
    groupNames.sort((a, b) => a.localeCompare(b));

    let schemaIsEmpty = true;
    const propertiesSchemas: Schema[] = [];
    for (const groupName of groupNames) {
      const propertiesSchema = propertiesMapToSchema(
        properties,
        behaviorContent => behavior.getProperties(behaviorContent.getContent()),
        (behaviorContent, name, value) => {
          behavior.updateProperty(behaviorContent.getContent(), name, value);
        },
        object,
        groupName
      );
      propertiesSchemas.push(propertiesSchema);
      schemaIsEmpty = schemaIsEmpty && !propertiesSchema;
    }

    return (
      <Column expand>
        {!schemaIsEmpty ? (
          <ColumnStackLayout key={behaviorContent.getName()} noMargin>
            {propertiesSchemas.map((propertiesSchema, index) => {
              if (!propertiesSchema) {
                return null;
              }
              if (!groupNames[index]) {
                return (
                  <PropertiesEditor
                    key={groupNames[index]}
                    schema={propertiesSchema}
                    instances={[behaviorContent]}
                  />
                );
              }
              return [
                <Text key={groupNames[index] + 'title'} size="title">
                  {groupNames[index]}
                </Text>,
                <PropertiesEditor
                  key={groupNames[index]}
                  schema={propertiesSchema}
                  instances={[behaviorContent]}
                />,
              ];
            })}
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
  }
}
