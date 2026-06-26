// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

/**
 * The props given to any behavior editor
 */
export type CompactInstanceBehaviorPropertiesEditorProps = {|
  project: gdProject,
  behaviorMetadata: gdBehaviorMetadata,
  behavior: gdBehavior,
  object: gdObject | null,
  layersContainer: gdLayersContainer,
  initialInstances: Array<gdInitialInstance>,
  onOpenFullEditor?: () => void,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};
