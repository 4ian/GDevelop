// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditorByVisibility from '../../PropertiesEditor/PropertiesEditorByVisibility';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import { Column } from '../../UI/Grid';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';

type Props = BehaviorEditorProps;

const BehaviorPropertiesEditor = ({
  project,
  behavior,
  object,
  layersContainer,
  onBehaviorUpdated,
  resourceManagementProps,
  projectScopedContainersAccessor,
  isAdvancedSectionInitiallyUncollapsed,
}: Props): React.Node => {
  const schema = React.useMemo(
    () => {
      const behaviorProperties = behavior.getProperties();
      return propertiesMapToSchema({
        properties: behaviorProperties,
        defaultValueProperties: null,
        getPropertyValue: (instance, name) =>
          instance
            .getProperties()
            .get(name)
            .getValue(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object,
        layersContainer,
        visibility: 'All',
        allowGlobalConfigPlaceholders: project.hasEventsBasedBehavior(
          behavior.getTypeName()
        ),
      });
    },
    [behavior, layersContainer, object, project]
  );

  return (
    <Column expand>
      <PropertiesEditorByVisibility
        project={project}
        object={object}
        schema={schema}
        instances={[behavior]}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        placeholder={
          <Trans>
            There is nothing to configure for this behavior. You can still use
            events to interact with the object and this behavior.
          </Trans>
        }
        isAdvancedSectionInitiallyUncollapsed={
          isAdvancedSectionInitiallyUncollapsed
        }
      />
    </Column>
  );
};

export default BehaviorPropertiesEditor;
