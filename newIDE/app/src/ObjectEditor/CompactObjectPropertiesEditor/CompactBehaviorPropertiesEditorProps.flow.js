// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

/**
 * The props given to any behavior editor
 */
export type CompactBehaviorPropertiesEditorProps = {|
  project: gdProject,
  behaviorTypeName: string,
  behaviors: Array<gdBehavior>,
  object: gdObject | null,
  layersContainer: gdLayersContainer,
  onOpenFullEditor?: () => void,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};
