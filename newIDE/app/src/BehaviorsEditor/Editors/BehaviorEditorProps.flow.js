// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

/**
 * The props given to any behavior editor
 */
export type BehaviorEditorProps = {|
  behaviors: Array<gdBehavior>,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  object: gdObject | null,
  layersContainer: gdLayersContainer,
  resourceManagementProps: ResourceManagementProps,
  onBehaviorUpdated: () => void,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};
