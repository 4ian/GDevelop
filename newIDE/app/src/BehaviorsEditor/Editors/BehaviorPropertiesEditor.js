// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditorByVisibility from '../../PropertiesEditor/PropertiesEditorByVisibility';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import { Column } from '../../UI/Grid';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import {
  advancedTweenBehaviorType,
  customizeAdvancedTweenBehaviorPropertiesSchema,
} from './AdvancedTweenBehaviorEditorOptions';

type Props = BehaviorEditorProps;

const BehaviorPropertiesEditor = ({
  project,
  behaviors,
  object,
  layersContainer,
  onBehaviorUpdated,
  resourceManagementProps,
  projectScopedContainersAccessor,
  isAdvancedSectionInitiallyUncollapsed,
  hideGlobalConfigPlaceholderHints,
}: Props): React.Node => {
  const behavior = behaviors[0];

  const schema = React.useMemo(
    () => {
      const behaviorProperties = behavior.getProperties();
      const schema = propertiesMapToSchema({
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
        shouldDisabledFieldsWithMixedValues: true,
        allowGlobalConfigPlaceholders: project.hasEventsBasedBehavior(
          behavior.getTypeName()
        ),
      });
      if (behavior.getTypeName() === advancedTweenBehaviorType) {
        return customizeAdvancedTweenBehaviorPropertiesSchema(schema);
      }
      return schema;
    },
    [behavior, layersContainer, object, project]
  );

  return (
    <Column expand>
      <PropertiesEditorByVisibility
        project={project}
        object={object}
        schema={schema}
        instances={behaviors}
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
        hideGlobalConfigPlaceholderHints={hideGlobalConfigPlaceholderHints}
      />
    </Column>
  );
};

export default BehaviorPropertiesEditor;
