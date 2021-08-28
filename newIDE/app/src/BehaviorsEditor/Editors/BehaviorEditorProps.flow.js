// @flow
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';

/**
 * The props given to any behavior editor
 */
export type BehaviorEditorProps = {|
  behavior: gdBehavior,
  behaviorContent: gdBehaviorContent,
  project: gdProject,
  object: gdObject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};
