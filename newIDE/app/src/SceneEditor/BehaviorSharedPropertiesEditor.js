// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../UI/EmptyMessage';
import { Column } from '../UI/Grid';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  behaviorSharedData: gdBehaviorsSharedData,
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
|};

export default class BehaviorSharedPropertiesEditor extends React.Component<Props> {
  render() {
    const { behaviorSharedData } = this.props;

    const propertiesSchema = propertiesMapToSchema({
      properties: behaviorSharedData.getProperties(),
      defaultValueProperties: null,
      getPropertyValue: (behavior, name) =>
        behavior
          .getProperties()
          .get(name)
          .getValue(),
      onUpdateProperty: (behavior, name, value) => {
        behavior.updateProperty(name, value);
      },
    });

    return (
      <Column expand noMargin>
        {propertiesSchema.length ? (
          <PropertiesEditor
            schema={propertiesSchema}
            instances={[behaviorSharedData]}
            project={this.props.project}
            resourceManagementProps={this.props.resourceManagementProps}
            projectScopedContainersAccessor={
              this.props.projectScopedContainersAccessor
            }
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
