// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

/**
 * The props given to any behavior editor
 */
export type CompactInstanceBehaviorPropertiesEditorProps = {|
  project: gdProject,
  object: gdObject | null,
  layersContainer: gdLayersContainer,
  instancesAndBehaviors: Array<{
    initialInstance: gdInitialInstance,
    behavior: gdBehavior,
  }>,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};
