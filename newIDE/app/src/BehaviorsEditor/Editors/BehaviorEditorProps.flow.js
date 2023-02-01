// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

/**
 * The props given to any behavior editor
 */
export type BehaviorEditorProps = {|
  behavior: gdBehavior,
  project: gdProject,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onBehaviorUpdated: () => void,
|};
