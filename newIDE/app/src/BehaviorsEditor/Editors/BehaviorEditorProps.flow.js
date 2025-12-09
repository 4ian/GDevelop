// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

/**
 * The props given to any behavior editor
 */
export type BehaviorEditorProps = {|
  behavior: gdBehavior,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onBehaviorUpdated: () => void,
|};
