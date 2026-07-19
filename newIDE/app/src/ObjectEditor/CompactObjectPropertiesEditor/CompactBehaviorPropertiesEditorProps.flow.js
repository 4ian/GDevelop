// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type Schema } from '../../PropertiesEditor/PropertiesEditorSchema';

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
  propertiesSchema?: ?Schema,
|};
