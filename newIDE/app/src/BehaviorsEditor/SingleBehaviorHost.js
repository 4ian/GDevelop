// @flow
import * as React from 'react';

import CompactBehaviorsEditorService from '../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorsEditorService';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type Schema } from '../PropertiesEditor/PropertiesEditorSchema';

/**
 * The shared, accordion-free host for one behavior configuration.
 *
 * The compact object panel mounts this inside CollapsibleSubPanel while the
 * Object Settings workbench mounts it directly in its Details area. Keeping
 * this boundary shared is what prevents the two surfaces from growing separate
 * behavior editors.
 */
export const SingleBehaviorHost = ({
  project,
  behavior,
  object,
  layersContainer,
  onBehaviorUpdated,
  resourceManagementProps,
  onOpenFullEditor,
  propertiesSchema,
  isAdvancedSectionInitiallyUncollapsed,
}: {|
  project: gdProject,
  behavior: gdBehavior,
  object: gdObject | null,
  layersContainer: gdLayersContainer,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  onOpenFullEditor?: () => void,
  propertiesSchema?: ?Schema,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|}): React.Node => {
  const behaviorTypeName = behavior.getTypeName();
  const BehaviorComponent = CompactBehaviorsEditorService.getEditor(
    behaviorTypeName
  );

  return (
    <BehaviorComponent
      project={project}
      behaviorTypeName={behaviorTypeName}
      behaviors={[behavior]}
      object={object}
      layersContainer={layersContainer}
      onBehaviorUpdated={onBehaviorUpdated}
      resourceManagementProps={resourceManagementProps}
      onOpenFullEditor={onOpenFullEditor}
      propertiesSchema={propertiesSchema}
      isAdvancedSectionInitiallyUncollapsed={
        isAdvancedSectionInitiallyUncollapsed
      }
    />
  );
};

export default SingleBehaviorHost;
