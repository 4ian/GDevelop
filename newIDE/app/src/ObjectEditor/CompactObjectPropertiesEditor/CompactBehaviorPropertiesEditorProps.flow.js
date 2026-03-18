// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

/**
 * The props given to any behavior editor
 */
export type CompactBehaviorPropertiesEditorProps = {|
  project: gdProject,
  behaviorMetadata: gdBehaviorMetadata,
  behavior: gdBehavior,
  object: gdObject,
  behaviorOverriding: gdBehavior | null,
  initialInstance: gdInitialInstance | null,
  onOpenFullEditor?: () => void,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};
