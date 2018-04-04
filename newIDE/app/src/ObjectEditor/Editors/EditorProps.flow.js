import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';

/**
 * The props given to any object editor
 */
export type EditorProps = {|
  object: gdObject,
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
|};
